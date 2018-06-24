const puppeteer = require('puppeteer');

const credentials = {
  user  : '',
  email : '',
  passw : ''
};

const htmlKeys = {
  inputUser   : '#login_field',
  inputPassw  : '#password',
  btnLogin    : '#login > form > div.auth-form-body.mt-3 > input.btn.btn-primary.btn-block',
  dashboardId : '#dashboard'
}

const urls = {
  login        : 'https://github.com/login',
  repositories : 'https://github.com/'+credentials.user+'?tab=repositories'
}


//Make click in a input and after fill value.
const fillInput = (page,htmlKey,value) =>{

  return new Promise((resolve,reject)=>{

    page.click(htmlKey).then((stat)=>{

      page.keyboard.type(value)
        .then((stat) => resolve(stat))
        .catch((err) => reject(err));

    }).catch((err)=> reject(err));

  });

}

//Open page for navigate.
const navigatePage = (browser,url)=>{

  return new Promise((resolve,reject)=>{

     browser.newPage().then((page)=>{

        page.goto(url).then((content) => resolve(page))
                      .catch((err)    => reject(err));

     }).catch((err) => reject(err));

  });

}

//Make login.
const loginForm = (browser,htmlKeys,urls,credentials) =>{

  return new Promise((resolve,reject)=>{

    //Open page.
    navigatePage(browser,urls.login).then((page) => {

      //Fill email
      fillInput(page,htmlKeys.inputUser,credentials.email).then((tmp)=>{

        //Fill password
        fillInput(page,htmlKeys.inputPassw,credentials.passw).then((tmp)=>{

          //Click login
          page.click(htmlKeys.btnLogin)
            .then((stat) => resolve(page))
            .catch((err) => reject(err));

        }).catch((err) => reject(err));
        
      }).catch((err) => reject(err));

    }).catch((err) => reject(err));

  });

}

//Run bot.
const run = ()=>{

  //Start puppeteer.
  const bot = puppeteer.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox']});

  //When the browser open.
  bot.then((browser)=>{   

    //Make login.
    loginForm(browser,htmlKeys,urls,credentials).then((page)=>{

      //Wait for page load.
      page.waitForNavigation().then((stat)=>{

        //Analyze is the login is succefull.
        page.$(htmlKeys.dashboardId)
          .then((result) => {

            if (result!=null){
              console.log('-> Login ok!');
              process.exit();
            }
            else{
              console.log('-> Error in login');
              process.exit();              
            }

          })
          .catch((err) => console.log(err));
        
      });

    }).catch((err) => console.log(err));

  }).catch((err)=>console.log('err',err));

}

run();