const puppeteer = require('puppeteer');
const fs        = require('fs');

const url = 'http://www.afip.gov.ar/mercurio/consultapadron/buscarcontribuyente.aspx';

//Get image.
const getDataUrlThroughCanvas = (selector) => {

  return new Promise((resolve,result)=>{

    //Create a new image element with unconstrained size.
    const originalImage = document.querySelector(selector);
    const image         = document.createElement('img');
    image.src           = originalImage.src;

    //Create a canvas and context to draw onto.
    const canvas  = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width  = image.width;
    canvas.height = image.height;

    context.drawImage(image, 0, 0);
    resolve(canvas.toDataURL());

  });

}

const parseDataUrl = (dataUrl) => {

  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);

  if (matches.length !== 3)
    throw new Error('Could not parse data URL.');
  
  return { mime: matches[1], buffer: Buffer.from(matches[2], 'base64') };

};

//Retrieve captcha fropm documnent.
const getCaptcha = (page,imgFile)=>{

  return new Promise((resolve,reject)=>{

    page.evaluate(getDataUrlThroughCanvas, '#imgCaptcha')
      .then((data) => {
            
        let { buffer } = parseDataUrl(data);
        fs.writeFileSync(imgFile, buffer, 'base64');

        resolve({"buffer":data,"img":imgFile});

    })
    .catch((err) => reject(err));

  });

}

const run = ()=>{

  //Paths and urls.
  const pathDownload = './afip.png';

  //Start puppeteer.
  const bot = puppeteer.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox']});

  //When the browser open.
  bot.then((browser)=>{   

    //Create a new page. 
    browser.newPage().then((page)=>{

      //Navigate to github.
      page.goto(url,{waitUntil:'networkidle2'}).then((content)=>{

        console.log('-> Loading: ',url);
 
       //Take a snapshoot.
        page.screenshot({path:pathDownload,type:'png',fullPage:true}).then((result)=>{

          console.log('-> Snapshoot ok, extracting captcha...');

          getCaptcha(page,'img-captcha.png')
            .then((final) => {

              console.log(final);
              process.exit();

            })
            .catch((err)  => console.log(err));          

        });

      }).catch((err)=>console.log('err',err));

    }).catch((err)=>console.log('err',err));

  }).catch((err)=>console.log('err',err));


}

run();