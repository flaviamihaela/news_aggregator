// Import required modules
import express from 'express';
import dotenv from "dotenv";
import mongoose from "mongoose";
import puppeteer from 'puppeteer';
import cron from 'node-cron';
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

// Import data models
import Article from "./models/Article.mjs";
import UserModel from './models/User.mjs';

const cronSchedule = '* * * * *'; // Cron job schedule
const salt = bcrypt.genSaltSync(10); // Salt for hashing passwords
const secret = 'asdfe45we45w345wegw345werjktjwertkj'; // Secret for JWT

// Create an instance of the Express application
const app = express()
const port = 3000

// Load environment variables from .env
dotenv.config();

//Configure
app.use(express.json()); // Parse JSON request bodies
app.use(helmet()); // Set various security headers in responses
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" })); // Configure Cross-Origin Resource Sharing policy
app.use(morgan("common")); // Log HTTP requests using common format
app.use(bodyParser.json()); // Parse JSON request bodies
app.use(bodyParser.urlencoded({ extended: false })); // Parse URL-encoded request bodies
app.use(cors({credentials:true,origin:'http://localhost:3001'})); // Enable CORS with credentials for specified origin
app.use(cookieParser()); // Parse cookies from the request headers

// Connect to MongoDB using Mongoose
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    // Start the Express server
    app.listen(port, () => {
      app.post('/register', async (req,res) => {
  const {username,password} = req.body;
  try{
    const userDoc = await UserModel.create({
      username,
      password:bcrypt.hashSync(password,salt),
    });
    res.json(userDoc);
  } catch(e) {
    console.log(e);
    res.status(400).json(e);
  }
});

app.post('/login', async (req,res) => {
  const {username,password} = req.body;
  const userDoc = await UserModel.findOne({username});
  const passOk = bcrypt.compareSync(password, userDoc.password);
  if (passOk) {
    // logged in
    jwt.sign({username,id:userDoc._id}, secret, {}, (err,token) => {
      if (err) throw err;
      res.cookie('token', token).json({
        id:userDoc._id,
        username,
      });
    });
  } else {
    res.status(400).json('wrong credentials');
  }
});

app.get('/profile', (req,res) => {
  const {token} = req.cookies;
  jwt.verify(token, secret, {}, (err,info) => {
    if (err) throw err;
    res.json(info);
  });
});

app.get('/category/:category', async (req,res) => {
  const category = req.params.category;

  try {
    const found = await Article.find({ category: category }).exec();
    res.send(found);
  } catch (err) {
    console.error('Error retrieving articles:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/categorynames', async (req, res) => {
  try {
      const categories = await Article.distinct('category');
      res.send(categories);
  } catch (err) {
      console.error('Error retrieving category names:', err);
      res.status(500).send('Internal Server Error');
  }
});

app.post('/logout', (req,res) => {
  res.cookie('token', '').json('ok');
});

app.get('/post', async (req,res) => {
  res.json(await Article.find());
});

cron.schedule(cronSchedule, async () => {
  console.log('Running Puppeteer code...');

  try {
      const newArticles = await scrapeReutersTechNews();

      // Update or insert articles one by one
      for (const article of newArticles) {
          // Look for an existing article based on articleName
          const existingArticle = await Article.findOne({ articleName: article.articleName });

          if (existingArticle) {
              // If found, update the date of the article
              await Article.updateOne({ _id: existingArticle._id }, { date: article.date });
          } else {
              // If not found, insert the new article
              await Article.create(article);
          }
      }

      console.log('Puppeteer code execution completed.');

  } catch (error) {
      console.error('Error occurred during Puppeteer code execution:', error);
  }
});
      return console.log(`Express is listening at http://localhost:${port}`)
    })
  })
  .catch((error) => console.log(`${error} did not connect`));


// Puppeteer function
async function scrapeReutersTechNews() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  try {
      await page.setViewport({
        width: 1920,
        height: 1800,
        deviceScaleFactor: 2,
      });
      await page.goto('https://www.reuters.com/technology/', {waitUntil: 'networkidle0'});
      await page.waitForSelector('#onetrust-accept-btn-handler');
      await page.click('#onetrust-accept-btn-handler');
      

      //await page.click('.text__text__1FZLe.text__inherit-color__3208F.text__bold__2-8Kc.text__large__nEccO.text-button__large__3il5G');
      const elementHandle = await page.$('.text__text__1FZLe.text__inherit-color__3208F.text__bold__2-8Kc.text__large__nEccO.text-button__large__3il5G');
      await elementHandle.scrollIntoView({ behavior: 'auto' /*or smooth*/, block: 'center' });
      await new Promise((resolve) => setTimeout(resolve, 2000));
  

      const divElements = await page.$$('.media-story-card__body__3tRWy');
      const titleSelector='.text__text__1FZLe.text__dark-grey__3Ml43.text__inherit-font__1Y8w3.text__inherit-size__1DZJi.link__underline_on_hover__2zGL4.media-story-card__heading__eqhp9';
      const dateSelector1='date';
      const dateSelector2='.text__text__1FZLe.text__inherit-color__3208F.text__regular__2N1Xr.text__extra_small__1Mw6v.label__label__f9Hew.label__small__274ei.media-story-card__time__2i9EK';
      const sectionSelector = '.text__text__1FZLe.text__inherit-color__3208F.text__inherit-font__1Y8w3.text__inherit-size__1DZJi.link__underline_on_hover__2zGL4';
      const imageElements = await page.$$('img');

      let imageSrcs = [];
      for (const imageElement of imageElements) {
        const imageSrc = await imageElement.evaluate((element) => element.srcset.trim());
        const lastSrcFormat = imageSrc.split(',').pop().trim().split(' ')[0];
        imageSrcs.push(lastSrcFormat);
      }
      imageSrcs = imageSrcs.filter(link => link != "")

      let c_img=0; 
      let articles = [];

      for (const divElement of divElements) {
        const headline =  await divElement.$eval(titleSelector, (element) => element.textContent.trim());
        const section = await divElement.$eval(sectionSelector, (element) => element.textContent.trim());
        const trimmedSection = section.slice(0, -8);
        const link = await divElement.$eval(titleSelector, (element) => element.href);
        let date = '';
    
        try {
          date = await divElement.$eval(dateSelector1, (element) => element.textContent.trim());
        } catch (error) {
        }

        if (!date) {
          try {
            date = await divElement.$eval(dateSelector2, (element) => element.textContent.trim());
          } catch (error) {
            console.log(error)
          }
        }
        if (!imageSrcs[c_img]) {
          imageSrcs[c_img]="hmmmmm, unable to find"
        }
        articles.push({
            articleName: headline,
            articleLink: link,
            category: trimmedSection,
            date: date,
            imagesource: imageSrcs[c_img],
            source: "Reuters"
        });
        
        c_img++;
      }
      return articles;
      
  } catch (error) {
    console.log(error);
  }

  await browser.close();
}