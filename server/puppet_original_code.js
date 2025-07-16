const puppeteer = require('puppeteer');
const cron = require('node-cron');

const cronSchedule = '* * * * *';

async function scrapeReutersTechNews() {
  let count = 0;
  const headlines = [];
  const dates = [];
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    await page.goto('https://www.reuters.com/technology/');
    await page.waitForSelector('#onetrust-accept-btn-handler');
    await page.click('#onetrust-accept-btn-handler');
    
    while (count < 1) {

      await page.click('.text__text__1FZLe.text__inherit-color__3208F.text__bold__2-8Kc.text__large__nEccO.text-button__large__3il5G');
      await page.waitForSelector('.text__text__1FZLe.text__inherit-color__3208F.text__bold__2-8Kc.text__large__nEccO.text-button__large__3il5G');

      const divElements = await page.$$('.media-story-card__body__3tRWy');
      const titleSelector='.text__text__1FZLe.text__dark-grey__3Ml43.text__inherit-font__1Y8w3.text__inherit-size__1DZJi.link__underline_on_hover__2zGL4.media-story-card__heading__eqhp9';
      const dateSelector1='date';
      const dateSelector2='.text__text__1FZLe.text__inherit-color__3208F.text__regular__2N1Xr.text__extra_small__1Mw6v.body__base__22dCE.body__extra_small_body__3QTYe.media-story-card__time__2i9EK';

      for (const divElement of divElements) {
        const headline =  await divElement.$eval(titleSelector, (element) => element.textContent.trim());
        let date = '';
    
        try {
          date = await divElement.$eval(dateSelector1, (element) => element.textContent.trim());
        } catch (error) {
        }

        if (!date) {
          try {
            date = await divElement.$eval(dateSelector2, (element) => element.textContent.trim());
          } catch (error) {

          }
        }

        dates.push(date);
        //console.log(date);

        headlines.push(headline);
        //console.log(headline);

      }

      count++;
    }
  } catch (error) {
    //console.log(error);
  }

  console.log(headlines);
  console.log(dates);

  await browser.close();
}

cron.schedule(cronSchedule, () => {
  console.log('Running Puppeteer code...');
  scrapeReutersTechNews()
    .then(() => {
      console.log('Puppeteer code execution completed.');
    })
    .catch((error) => {
      console.error('Error occurred during Puppeteer code execution:', error);
    });
});

scrapeReutersTechNews();






