const puppeteer = require('puppeteer');


const run = ()=>{

  //Paths and urls.
  const url          = 'https://github.com';
  const pathDownload = './github.png';

  console.log('> Taking snapshoot of: '+url);

  //Start puppeteer.
  const bot = puppeteer.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox']});

  //When the browser open.
  bot.then((browser)=>{   

    //Create a new page. 
    browser.newPage().then((page)=>{

      //Navigate to github.
      page.goto(url).then((content)=>{

        //Take a snapshoot.
        page.screenshot({path:pathDownload}).then((result)=>{

          console.log('snapshoot ok!');
          process.exit();

        });

      });

    });

  }).catch((err)=>console.log('err',err));

}

run();
