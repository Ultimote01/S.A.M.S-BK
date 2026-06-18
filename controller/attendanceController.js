const AttendanceModel =require("../models/atttendanceModel");


const catchAsync = require("./catchAsync");


exports.getAttendances = catchAsync(async (req, res, next)=>{

    const attendanceList = await AttendanceModel.find(
    //Projection part
    { "classes": { $elemMatch: {lecturer: "Mathew Brown"}}},
    )

   

  
    // const modifiedAttendanceList = attendanceList.flatMap((el)=> el.classes).filter((el)=> el.lecturer === "Mathew Brown");

   


    res.status(200).json({
        status: "success",
        attendanceList
    })


})
