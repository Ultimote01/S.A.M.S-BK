 const { getRandomNumber } = require( "../utils/helperFn");
 const User = require("../models/usersModel");
 const {createEmail, createId} = require("../utils/helperFn");
 
 
 
 

 const getUsers = function(){
  return [
     {
         fullName: "Ayanfe Bash",
         email: createEmail("ayanfe bash"),
         id: createId("lecturer"),
         password: "test1234",
         role: "lecturer",
         department: "physical science",
         courses: ["English","Math II"]
     },
     {
         fullName: "Mathew Brown",
         email: createEmail("mathew brown"),
         id: createId("lecturer"),
         password: "test1234",
         role: "lecturer",
         department: "physical science",
         courses: ["Calculus"]
     },
     {
         fullName: "Ahmed Musa",
         email: createEmail("ahmed musa"),
         id: createId("lecturer"),
         password: "test1234",
         role: "lecturer",
         department: "physical science",
         courses: [ "System Administration"]
     },
     {
         fullName: "Fred Omoh",
         email: createEmail("fred omoh"),
         id: createId("lecturer"),
         password: "test1234",
         role: "lecturer",
         department: "physical science",
         courses: [ "Computer Networking"]
     },
     {
         fullName: "Papa Apex",
         email: createEmail("papa apex"),
         id: createId("lecturer"),
         password: "test1234",
         role: "lecturer",
         department: "physical science",
         courses: [ "Logic Design"]
     },
     {
         fullName: "Awele Asielue",
         email: createEmail("ahmed musa"),
         id: createId("lecturer"),
         password: "test1234",
         role: "lecturer",
         department: "physical science",
         courses: [ "Cyber Security"]
     },
     {
         fullName: "Uchenna Nwanne",
         email: createEmail("uchenna nwanne"),
         id: createId("lecturer"),
         password: "test1234",
         role: "lecturer",
         department: "physical science",
         courses: [ "Operating System"]
     },
      {
         fullName: "Micheal Obiora",
         email: createEmail("micheal obiora"),
         id: createId("lecturer"),
         password: "test1234",
         role: "lecturer",
         department: "physical science",
         courses: ["DSA", "Artificial Intelligence"]
     },
      {
         fullName: "Kemi Jhonson",
         email: createEmail("kemi jhonson"),
         id: createId("student"),
         password: "test1234",
         role: "student",
         department: "physical science",
         courses: ["English","Math II", "Artificial Intelligence","System Administration",
             "Computer Networking","Logic Design","Operating System", "Cyber Security"
         ]
     },
      {
         fullName: "Martins White",
         email: createEmail("martins white"),
         id: createId("student"),
         password: "test1234",
         role: "student",
         department: "physical science",
        courses: ["English","Math II", "Artificial Intelligence","System Administration",
             "Computer Networking","Logic Design","Operating System", "Cyber Security"
         ]
     },
      {
         fullName: "kennedy Micheal",
         email: createEmail("kennedy micheal"),
         id: createId("student"),
         password: "test1234",
         role: "student",
         department: "physical science",
         courses: ["English","Math II", "Artificial Intelligence","System Administration",
             "Computer Networking","Logic Design","Operating System", "Cyber Security"
         ]
     },
      {
         fullName: "James Nwachukwu",
         email: createEmail("james nwachukwu"),
         id: createId("student"),
         password: "test1234",
         role: "student",
         department: "physical science",
          courses: ["English","Math II", "Artificial Intelligence","System Administration",
             "Computer Networking","Logic Design","Operating System", "Cyber Security"
         ]
     }, 
     {
         fullName: "Tosin Adebayo",
         email: createEmail("tosin adebayo"),
         id: createId("student"),
         password: "test1234",
         role: "student",
         department: "physical science",
          courses: ["English","Math II", "Artificial Intelligence","System Administration",
             "Computer Networking","Logic Design","Operating System", "Cyber Security"
         ]
     }, 
     {
         fullName: "Kelvin Lawrence",
         email: createEmail("kelvin lawrence"),
         id: createId("student"),
         password: "test1234",
         role: "student",
         department: "physical science",
         courses: ["English","Math II", "Artificial Intelligence","System Administration",
             "Computer Networking","Logic Design","Operating System", "Cyber Security"
         ]
     },
      {
         fullName: "Ahmed Garba",
         email: createEmail("Ahmed Garba"),
         id: createId("student"),
         password: "test1234",
         role: "student",
         department: "physical science",
         courses: ["English","Math II", "Artificial Intelligence","System Administration",
             "Computer Networking","Logic Design","Operating System", "Cyber Security"
         ]
     }, 
     {
         fullName: "Uchenna Okoye",
         email: createEmail("uchenna okoye"),
         id: createId("student"),
         password: "test1234",
         role: "student",
         department: "physical science",
         courses: ["English","Math II", "Artificial Intelligence","System Administration",
             "Computer Networking","Logic Design","Operating System", "Cyber Security"
         ]
     },
     {
         fullName: "Marvelous  Jhonson",
         email: createEmail("marvelous jhonson"),
         id: createId("student"),
         password: "test1234",
         role: "student",
         department: "physical science",
         courses: ["English","Math II", "Artificial Intelligence","System Administration",
             "Computer Networking","Logic Design","Operating System", "Cyber Security"
         ]
     },
     {
         fullName: "Taiwo Ojo",
         email: createEmail("taiwo ojo"),
         id: createId("student"),
         password: "test1234",
         role: "student",
         department: "physical science",
          courses: ["English","Math II", "Artificial Intelligence","System Administration",
             "Computer Networking","Logic Design","Operating System", "Cyber Security"
         ]
     },
      {
         fullName: "Adeboye Mathew",
         email: createEmail("adeboye mathew"),
         id: createId("student"),
         password: "test1234",
         role: "student",
         department: "physical science",
          courses: ["English","Math II", "Artificial Intelligence","System Administration",
             "Computer Networking", "Cyber Security"
         ]
     },
     {
         fullName: "Martha James",
         email: createEmail("martha james"),
         id: createId("student"),
         password: "test1234",
         role: "student",
         department: "physical science",
          courses: ["English","Math II", "Artificial Intelligence","System Administration",
             "Computer Networking"
         ]
     },
     {
         fullName:"Enyeama Darlington",
         email: createEmail("Enyeama Darlington"),
         id: createId("student"),
         password: "test1234",
         role: "student",
         department: "physical science",
          courses: ["English","Math II", "Artificial Intelligence","System Administration","Logic Design"
         ]
     },
     
  ]
 }
 
 const createUsers =    function (){

    connectDatabase().then( async ()=> {
        const users = getUsers();
        await User.deleteMany();
        Promise.all( users.map(  async (user, index)=> {
        delete user.email;
        delete user.id;
        const id = await createId(user?.role);
        const email = createEmail(user?.fullName).toLowerCase();
        const reqObject = {fullName: user?.fullName,email,id, role:user?.role,
            password: user.password,
            department: user?.department,
           courses: user?.courses};
   
        const userObject = await User.create(reqObject);

       
   })).then(()=> process.exit(0))
   
    }).catch(err=> console.log(err))
    
     

 }

 createUsers();

async function getUser() {

    connectDatabase().then(async ()=>{
        const user = await User.findOne({email: "ayanfebash@ymail.com"}) 
        console.log(user);
        process.exit(0);
    }).catch(err=> console.log(err))
     
}



async function connectDatabase() {
    const dotEnv = require('dotenv');
    const mongoose = require("mongoose");
   
   
    dotEnv.config({path: "../config.env"});
    const db = process.env.DATABASE.replace("<db_password>", process.env.DB_PASSWORD);
    return mongoose.connect(db);


}

 module.exports = getUsers;