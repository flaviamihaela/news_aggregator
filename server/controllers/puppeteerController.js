import { scrapeSpotify } from '../services/puppeteerService.js';
import Article from '../models/Article.mjs';
import cron from 'node-cron';

export const schedulePuppeteerTask = (cronSchedule) => {
  cron.schedule(cronSchedule, async () => {
    console.log('Running Puppeteer code...');
    try {
      const newArticles = await scrapeSpotify();
      for (const article of newArticles) {
        const existingArticle = await Article.findOne({ articleName: article.articleName });
        if (existingArticle) {
          await Article.updateOne({ _id: existingArticle._id }, { date: article.date });
        } else {
          await Article.create(article);
        }
      }
      console.log('Puppeteer code execution completed.');
    } catch (error) {
      console.error('Error occurred during Puppeteer code execution:', error);
    }
  });
};
