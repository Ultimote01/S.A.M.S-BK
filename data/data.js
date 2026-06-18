const User = require("../models/usersModel");
const AttendanceModel  = require("../models/atttendanceModel");
const { getRandomNumber } = require( "../utils/helperFn");

let  users;

function createAttendanceDb (){
    connectDatabase().then(async ()=> {
        const usersDb = await User.find();
        users = usersDb;
        const attendance= createAttendance()[0];
        
        Promise.all(createAttendance().map(async (attendance)=>{
              const attendanceList = await AttendanceModel.create({
                date: attendance[0].createdAt,
                classes: attendance
            })
        })).catch(err=> console.log(err)).finally(()=> process.exit(0));
    }).catch(err=> console.log(err));
}

createAttendanceDb(); 

async function connectDatabase() {
    const dotEnv = require('dotenv');
    const mongoose = require("mongoose");
   
   
    dotEnv.config({path: "../config.env"});
    const db = process.env.DATABASE.replace("<db_password>", process.env.DB_PASSWORD);
    return mongoose.connect(db);


}


function getUserLecturer(){
    const lecturers = users.filter((el)=> el.role === "lecturer");
    return lecturers[getRandomNumber(0, lecturers.length-1)]
}



function getUserStudents() {
   const  userstudent = users.filter((el)=> el.role === "student");
    const studentExist = []; 
    const students = [];
    const size =  getRandomNumber(2, userstudent.length-1)
   
     for (let x = 0; x <= size ; x++){
        
        while(true) {
            const currentStudent = userstudent[getRandomNumber(0, userstudent.length-1)]
            if (studentExist.indexOf(currentStudent.fullName) > -1){
                break;
            }else {
                studentExist.push(currentStudent.fullName)
                students.push(currentStudent.id);
            }
        }
         
        
    }
     

    return students;
  
    
}

function createAttendance(){
    const attendanceSize = 21;
    const attendanceList = []

    for (let x = attendanceSize; x >= 0; x--) {

            const courseExist = [];
            const todayLectures = [];
            const coursePerday = getRandomNumber(2, 4)  
            const modes = ["Online", "Physical", "Absent"];
            const exceedingTimePerCourse = getRandomNumber(1, Math.floor(9 / (coursePerday)));
            let coursePerdayAd = coursePerday;
            

            
            for (let i = 0; i < coursePerday ; i++){
                const resetTimeHour = Number(( new Date(Date.now())).toLocaleTimeString().split(":")[0]);
                let openingTime=  Date.now()- (resetTimeHour * 60 * 60 * 1000 ) + (9 * 60 * 60 * 1000);
                
                while (true) {
                    
                    const lecturer = getUserLecturer()
                    let courseName = lecturer.courses[getRandomNumber(1, lecturer.courses.length+1)-1];
                    courseName = courseName === undefined ? lecturer.courses[0] : courseName ;

                    if (courseExist.indexOf(courseName) > -1 ){
                        break;
                    }else {
                            
                    if (todayLectures.length < coursePerday){
                        
                         todayLectures.push({
                            course:  courseName,
                            lecturer: lecturer.fullName,
                            students: getUserStudents(),
                            mode: modes[getRandomNumber(0, 2)],
                            startTime: openingTime + ((exceedingTimePerCourse * (coursePerdayAd - 1)) * 60 * 60 * 1000),
                            createdAt: Date.now() - (x * 24 * 60 * 60 * 1000),
                            endTime:  openingTime + ((exceedingTimePerCourse * coursePerdayAd) * 60 * 60 * 1000)
                        }) 
                         
                         coursePerdayAd--;
                          
                        
                    }
                    
                     courseExist.push(courseName);
                }

                }
                
           
            }
            attendanceList.push(todayLectures);
             
      
    }
     
  
    return attendanceList;

}




