const captchaKey  = '6c3a0f455559f969130003ddb74f4a3b';
const anticaptcha = require('./anticaptcha')(captchaKey);

//Get anticaptcha balance.
const getCaptchaBalance = () =>{

  return new Promise((resolve,reject)=>{

    //Chech balance.
    anticaptcha.getBalance((err, balance)=>{

      if (err)
        reject(err);
      else{

        if (balance>0)
          resolve(balance);
        else
          reject({err:"balance 0"});

      }

    });

  });

}

//Retrieve task solution.
const getTaskSolution = (taskId)=>{

  return new Promise((resolve,reject)=>{

    anticaptcha.getTaskSolution(taskId,(err, taskSolution)=>{

      if (err)
        reject(err);
      else
        resolve(taskSolution)

    });

  });

}

//Get img text.
const getImgText = (dataImg)=>{

  return new Promise((resolve,reject)=>{

    let body = {case: true, body: dataImg};

    //Send a image and recive the text.
    anticaptcha.createImageToTextTask(body,(err,taskId)=>{

      if (err)
        reject(err);
      else 
        resolve(taskId);

    });   

  });

}

//Send the captcha request.
const getCaptcha = (dataImg)=>{

  return new Promise((resolve,reject)=>{

    getImgText(dataImg).then((taskId)=>{

      getTaskSolution(taskId)
        .then((result) => resolve(result))
        .catch((err)   => reject(err));

    }).catch((err) => reject(err));

  });

}

module.exports.getCaptcha        = getCaptcha;
module.exports.getImgText        = getImgText;
module.exports.getTaskSolution   = getTaskSolution;
module.exports.getCaptchaBalance = getCaptchaBalance;