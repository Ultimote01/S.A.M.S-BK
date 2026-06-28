const AttendanceModel =require("../models/atttendanceModel");
const AppError = require("../utils/appError");


const catchAsync = require("./catchAsync");
const { getEligibleLectures } = require("./lecturesController");


exports.getAttendances = catchAsync(async (req, res, next)=>{

    const attendanceList = await AttendanceModel.aggregate([
  
        {
            $match: {
            "classes": {$elemMatch: {"course": {$in: req.user.courses}}},
            },
        },
        //Redefine the array to ONLY include matching sub-documents
        {
            $project: {
                date: 1,
                _id: 0,
            // Filter the sub-document array
            classesPerDay: {
                $filter: {
                input: "$classes",
                as: "subDoc",
                cond: { $in: ["$$subDoc.course", req.user.courses] }
                }
            }
            }
        }
        ]);

    res.status(200).json({
        status: "success",
        attendanceList
    })


})

function getOpenningTime() {
    const resetTimeHour = new Date(Date.now()).toISOString().split("T")[1].split(":");
    const openingTime=  Date.now()- (Number(resetTimeHour[0]) * 60 * 60 * 1000 )- 
                        (Number(resetTimeHour[1]) * 60 * 1000)-(Number(resetTimeHour[2].split(".")[0])*1000)-
                        (Number(resetTimeHour[2].split(".")[1].replace("Z", "")));
    return openingTime;         
}


function checkLectureValidity(lectures){

    if (lectures.length !== 0){
        lectures = lectures.filter((lecture)=> 
        lecture.classesPerDay.filter((el)=> new Date(el.endTime).valueOf() >   Date.now()).length > 0
        )

        return lectures;
    }
}


exports.createAttendanceList = catchAsync( async (req, res, next)=> {

    if (req.user.role !==  "lecturer"){
        throw new AppError("Only a lecturer can create an attendance list", 401);
    }
     
    const lectures = await getEligibleLectures(req.user.courses, {date: new Date(getOpenningTime())});
        
       console.log(checkLectureValidity(lectures));
       return  res.status(200).json({
        status:'success',
        lectures
    })

})
