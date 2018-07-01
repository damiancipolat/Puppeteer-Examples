const puppeteer   = require('puppeteer');
const fs          = require('fs');
const captcha     = require('./captcha.js');

const url  = 'http://www.afip.gov.ar/mercurio/consultapadron/buscarcontribuyente.aspx';

const htmlKeys = {
  inputCaptcha : '#txtCAPTCHA',
  inputDni     : '#txtDNI',
  btnFind      : '#cmdBuscar',
  btnView      : '#cmdVer0'
}

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

//Convert captured image to base64.
const parseDataUrl = (dataUrl) => {

  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);

  if (matches.length !== 3)
    throw new Error('Could not parse data URL.');
  
  return { mime: matches[1], buffer: Buffer.from(matches[2], 'base64') };

};

//Fill the form.
const fillForm = (page,captchaTxt,docTxt)=>{

  return new Promise((resolve,reject)=>{

    //Make click in the textbox.
    page.click(htmlKeys.inputCaptcha).then((stat)=>{

      //Type the captcha.
      page.keyboard.type(captchaTxt).then((stat) => {

        //Click in document input.
        page.click(htmlKeys.inputDni).then((stat)=>{

          //Type DNI-
          page.keyboard.type('33295515').then((stat) => {

            //Make click in send.            
            page.click(htmlKeys.btnFind).then((stat)=>{

              //Wait for page load.
              page.waitForNavigation().then((stat)=>{

                //Click in view more.
                page.click(htmlKeys.btnFind).then((stat)=>{

                  //Wait page reload and take a snapshoot.
                  page.screenshot({path:'final-result.png',type:'png',fullPage:true})
                    .then((result)=>{

                      console.log('> Snapshoot ok!');
                      resolve(result);
                    
                    });

                });                

              });

            });

          });

        });
        
      });

    });

  });

}

//Retrieve captcha from documnent.
const getCaptcha = (page,captchaFile)=>{

  return new Promise((resolve,reject)=>{

    //Get the control from the document by id.
    page.evaluate(getDataUrlThroughCanvas, '#imgCaptcha')
      .then((data) => {
            
        //Parse img to base64.
        let { buffer } = parseDataUrl(data);
        fs.writeFileSync(captchaFile, buffer, 'base64');

        data = data.replace('data:image/png;base64,','');
        console.log('-> Sending img captcha to anticaptcha.com');

        //Send captacha to anticaptcha.
        captcha.getCaptcha(data).then((result) => {

            console.log('> Received from anticaptcha',result);

            //Fill data in the form.
            fillForm(page,result,'33295515')
              .then((stat) => resolve(stat))
              .catch((err) => reject(err));

          }).catch((err) => reject(err));

      }).catch((err) => reject(err));

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

          //Extract the image from the image tag.
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