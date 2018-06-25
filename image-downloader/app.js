const fs = require('fs');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.setViewport({ width: 1280, height: 926 });

  console.log('Downloading all images from the website...');

  let counter = 0;
  page.on('response', async (response) => {
    const matches = /.*\.(jpg|png|svg|gif)$/.exec(response.url());
    if (matches && (matches.length === 2)) {
      const extension = matches[1];
      const buffer = await response.buffer();
      fs.writeFileSync(`./images/image-${counter}.${extension}`, buffer, 'base64');
      counter += 1;
    }
  });

  await page.goto('https://intoli.com/blog/saving-images/');  
  await page.waitFor(10000);

  await browser.close();
})();