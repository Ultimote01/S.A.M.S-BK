const User =require("../models/usersModel");

 const getRandomNumber = (min, max)=>{
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor( Math.random() * (max - min + 1)) + min;
  }
 
const createEmail = function(fullname) {
    let email = fullname.replace(" ", "")+"@ymail.com"
    return email;
}



exports.createId = async function (role) {
    const generateDigits = (size)=> {
        let digits = "";

        for (let x = 0; x < size; x++){
            digits+=getRandomNumber(1,9);
        }
       return digits;
    }
    let  id = role === "student"? "73"+generateDigits(7): "95"+generateDigits(5);
    while (true) {
        const user = await User.findOne({id})
        if (!user) {
             break;
        }else if (user) { 
             id = role === "student"? "73"+generateDigits(7): "95"+generateDigits(5);
            break;
        }
    }

 return id;
}


exports.createEmail = createEmail;
exports.getRandomNumber = getRandomNumber;