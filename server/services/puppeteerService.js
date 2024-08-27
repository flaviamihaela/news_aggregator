import puppeteer from 'puppeteer';

export const cronSchedule = '* * * * *';

export const scrapeSpotify = async () => {
  const browser = await puppeteer.launch({
    headless: false, // Disable headless mode
  });
  const page = await browser.newPage();
  try {
    await page.setViewport({
      width: 1920,
      height: 1800,
      deviceScaleFactor: 2,
    });
    await page.goto('https://www.reuters.com/technology/', { waitUntil: 'networkidle0' });
    await page.waitForSelector('YOUR_SLIDER_SELECTOR'); // Replace with the actual selector for the slider
    

    const elementHandle = await page.$('.text__text__1FZLe.text__inherit-color__3208F.text__bold__2-8Kc.text__large__nEccO.text-button__large__3il5G');
    await elementHandle.scrollIntoView({ behavior: 'auto', block: 'center' });
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds

    const divElements = await page.$$('.media-story-card__body__3tRWy');
    const titleSelector = '.text__text__1FZLe.text__dark-grey__3Ml43.text__inherit-font__1Y8w3.text__inherit-size__1DZJi.link__underline_on_hover__2zGL4.media-story-card__heading__eqhp9';
    const dateSelector1 = 'date';
    const dateSelector2 = '.text__text__1FZLe.text__inherit-color__3208F.text__regular__2N1Xr.text__extra_small__1Mw6v.label__label__f9Hew.label__small__274ei.media-story-card__time__2i9EK';
    const sectionSelector = '.text__text__1FZLe.text__inherit-color__3208F.text__inherit-font__1Y8w3.text__inherit-size__1DZJi.link__underline_on_hover__2zGL4';
    const imageElements = await page.$$('img');

    let imageSrcs = [];
    for (const imageElement of imageElements) {
      const imageSrc = await imageElement.evaluate((element) => element.srcset.trim());
      const lastSrcFormat = imageSrc.split(',').pop().trim().split(' ')[0];
      imageSrcs.push(lastSrcFormat);
    }
    imageSrcs = imageSrcs.filter(link => link != "");

    let c_img = 0;
    let articles = [];

    for (const divElement of divElements) {
      const headline = await divElement.$eval(titleSelector, (element) => element.textContent.trim());
      const section = await divElement.$eval(sectionSelector, (element) => element.textContent.trim());
      const trimmedSection = section.slice(0, -8);
      const link = await divElement.$eval(titleSelector, (element) => element.href);
      let date = '';

      try {
        date = await divElement.$eval(dateSelector1, (element) => element.textContent.trim());
      } catch (error) {}

      if (!date) {
        try {
          date = await divElement.$eval(dateSelector2, (element) => element.textContent.trim());
          } catch (error) {
          console.log(error)
        }
      }

      articles.push({
        articleName: headline,
        articleLink: link,
        category: trimmedSection,
        date: date,
        imagesource: imageSrcs[c_img] || "Image not found",
        source: "Reuters"
      });

      c_img++;
    }
    return articles;

  } catch (error) {
    console.log(error);
  }

  await browser.close();
};
