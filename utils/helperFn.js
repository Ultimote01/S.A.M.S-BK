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

exports.createStringTitle =  function (string) {
    return String(string).charAt(0).toUpperCase()+String(string).slice(1);
}


exports.convertDateNowToUTC = function(){
    const timeZoneOffSet = String(new Date(Date.now()).getTimezoneOffset());
    const timeZoneOffSetHour = ['+', '-'].indexOf(timeZoneOffSet.slice(0,1)) > -1? 
    timeZoneOffSet.slice(1, -1): timeZoneOffSet;
    const timeZoneOffSetSign = ['+', '-'].indexOf(timeZoneOffSet.slice(0,1)) > -1? 
    timeZoneOffSet.slice(0,1): null;

    if (timeZoneOffSetSign === '-') return (Date.now()-(timeZoneOffSetHour));
    if (timeZoneOffSetSign === '+') return (Date.now()+(timeZoneOffSetHour));

    return Date.now(); 
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


exports.getTimezone = ()=> {
    return new Date(Date.now()).toString().split("GMT")[1].split(' ')[0];
}

exports.createEmail = createEmail;
exports.getRandomNumber = getRandomNumber;