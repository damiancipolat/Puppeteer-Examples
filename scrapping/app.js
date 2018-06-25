const puppeteer = require('puppeteer');

//Constants
const url = 'https://www.elmejortrato.com.ar/prestamos-personales/Prestamos-Personales-Buscar.aspx';

//Open page for navigate.
const navigatePage = (browser,url)=>{

  return new Promise((resolve,reject)=>{

     browser.newPage().then((page)=>{
        page.goto(url).then((content) => resolve(page))
                      .catch((err)    => reject(err));

     }).catch((err) => reject(err));

  });

}

//Fetch table information.
const fetchData = (page,table)=>{

  return new Promise((resolve,reject)=>{

    page.evaluate(() => {

      let data     = [];
      let elements = document.getElementsByClassName('description');

      for (var element of elements)
          data.push(element.textContent);

      return data;

    })
    .then((result)   => resolve(result))
    .catch((err)     => reject(err));

  });

}

//Run bot.
const run = ()=>{

  //Start puppeteer.
  const bot = puppeteer.launch({headless:false,args:['--no-sandbox','--disable-setuid-sandbox']});

  //When the browser open.
  bot.then((browser)=>{   

    //Open a website.
    navigatePage(browser,url)
      .then((page) => {

          //Retrieve data from the website.
          fetchData(page,'dinamic-cells')
            .then((result) => {
              console.log('-> Fetch result:',result);
            })
            .catch((err)   => console.log('-> Fetch data error:',err));

      })
      .catch((err) => console.log('-> Error in login'));

  }).catch((err) => console.log('err',err));

}

run();