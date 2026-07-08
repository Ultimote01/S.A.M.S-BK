var QRCode = require('qrcode')

const AttendanceModel =require("../models/atttendanceModel");
const UserModel = require("../models/usersModel");
const AppError = require("../utils/appError");
const catchAsync = require("./catchAsync");
const { getEligibleLectures } = require("./lecturesController");
const { setUsersNotifcation } = require("./userController");
const userModel = require('../models/usersModel');



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


function checkLectureValidity(lectures,course){
        
    if (lectures?.length > 0){
        lectures= lectures.filter((el)=> new Date(el.endTime).valueOf() >   Date.now() &&
        Date.now() >  new Date(el.startTime).valueOf() ).
        filter((elem)=> elem.course === course);

        return lectures;
    }

    return [];
}
 function getAttendancelist(date, course) {
        if (!date || !course) return;
 
        return AttendanceModel.aggregate([
  
        {
        $match: {
            date,
             "classes.course": { $eq: course}
            },
        },
        {
            $project: {
                date: 1,
                _id: 1,
            classesPerDay: {
                $filter: {
                input: "$classes",
                as: "subDoc",
                cond: { $in: ["$$subDoc.course", [course]] }
                }
            }
            }
        }
        ]);
 }

 function handleStudentsMarkAttendance(id, subDocId, studentId ) {

        if (!id || !studentId) return;

        return  AttendanceModel.updateOne(
        {
            _id: id,
            "classes._id": {$eq: subDocId}
        },
        {
             $addToSet: { "classes.$.students": String(studentId)  } 
        }
        );
 }

  function handleUpdateAttendance(id, attendance) {

    if (!attendance || !id) return null;

    return  AttendanceModel.updateOne(
        {
            _id: id,
            "classes.course": { $ne: attendance.course}
        },
        {
            $push: {
            classes: attendance
            }
        }
        );
}
 

exports.createAttendanceList = catchAsync( async (req, res, next)=> {

    if (req.user.role.toLowerCase() === 'student') {
            const lectures = await getEligibleLectures(req.user.courses, {date: new Date(getOpenningTime())});
            const lectureActive = checkLectureValidity(lectures[0]?.classesPerDay,req.body.course);
            if (lectureActive?.length < 1) throw new AppError("You can only mark an attendance for an ongoing lecture", 401);

            if (lectureActive[0]?.mode.toLowerCase() === "physical"){
                return res.status(201).json({
                status: 'fail',
                message: 'Class mode is online'
            })
            }

            const existAttendanceList = await getAttendancelist(new Date(getOpenningTime()), req.body.course);
            if (existAttendanceList.length === 0) throw new AppError("You can't mark attendance list because non has been created", 403);

            const attendanceMarked = await handleStudentsMarkAttendance(
                existAttendanceList[0]?._id,
                existAttendanceList[0]?.classesPerDay[0]?._id,
                req.user.id);
          
            if (attendanceMarked?.modifiedCount === 0 || attendanceMarked?.modifiedCount === undefined) {
                return res.status(201).json({
                status: 'fail',
                message: 'Failed to mark attendance. Contact Admin for support'
            })
            }


            return res.status(200).json({
                status: 'success',
                message: 'Attendance list marked sucessfully'
            })
    }

    if (req.user.role.toLowerCase() !==  "lecturer"){
        throw new AppError("Only a lecturer can create an attendance list", 401);
    }
    const lectures = await getEligibleLectures(req.user.courses, {date: new Date(getOpenningTime())});
    const lectureActive = checkLectureValidity(lectures[0]?.classesPerDay,req.body.course);

 
    if (lectureActive?.length < 1) throw new AppError("You can only create attendance list for an ongoing lecture", 401);

    let attendanceList = null;
    const existAttendanceList = await AttendanceModel.findOne({date: new Date(getOpenningTime())});

     
    if (existAttendanceList !== null) {
        attendanceList = await handleUpdateAttendance(existAttendanceList._id
        ,{...lectureActive[0], createdAt: new Date(Date.now()), students: []});
         
    }else if (existAttendanceList === null) {
         attendanceList = await AttendanceModel.create({date: new Date(getOpenningTime()),
         classes: {...lectureActive[0],createdAt: new Date(Date.now()), students: []}
    });
    }
    
   
    if (attendanceList?.date && lectureActive[0]?.mode.toLowerCase() === "online"  ||  attendanceList.modifiedCount > 0  && lectureActive[0]?.mode.toLowerCase() ){
        await setUsersNotifcation({
            message: `Register attendance for ${lectureActive[0].course}`
         })
     }
    
      
  
  
    QRCode.toDataURL(`https://s-a-m-s-8ozz.vercel.app/mark-attendance-offline/${encodeURIComponent(lectureActive[0].course)}`, function (err, url) {

        if (err){
        return  res.status(500).json({
        status:'fail',
        message: "Something occured. Please try again",
        })
        }

        if (lectureActive[0].mode.toLowerCase() === 'online') {
             return  res.status(201).json({
             status: attendanceList?.date || attendanceList.modifiedCount > 0? 'success': "fail",
             message: attendanceList?.date || attendanceList.modifiedCount > 0? "Attendance List online created": "Attendance Already exist",
            });
        }

        return  res.status(201).json({
        status: attendanceList?.date || attendanceList.modifiedCount > 0? 'success': "fail",
        message: attendanceList?.date || attendanceList.modifiedCount > 0? "Attendance List pysical  created": "Attendance Already exist",
        qrCode: attendanceList?.date || attendanceList.modifiedCount > 0? req.user.role === 'lecturer' ? url : undefined: ""
        });

    })


})


exports.markAttendancePhysicalClass = catchAsync(async (req, res, next)=> {

        const user = await userModel.findOne({id: req.body.id});

        if (user === null) throw new AppError('You must be a student to mark an attendance', 401);
        const lectures = await getEligibleLectures(user.courses, {date: new Date(getOpenningTime())});
        const lectureActive = checkLectureValidity(lectures[0]?.classesPerDay,req.body.course);
        if (lectureActive?.length < 1) throw new AppError("You can only mark an attendance for an ongoing lecture", 401);


       

        if (lectureActive[0]?.mode.toLowerCase() === "online"){
                return res.status(204).json({
                status: 'fail',
                message: 'Class mode is physical'
            })
            }

        const existAttendanceList = await getAttendancelist(new Date(getOpenningTime()), req.body.course);

        if (existAttendanceList.length === 0) throw new AppError("You can't mark attendance list because non has been created", 403);
        
       
        if (new Date(lectureActive[0].startTime).valueOf() > new Date( existAttendanceList[0]?.classesPerDay[0].createdAt).valueOf()) 
            throw new AppError('Attendance list was created before the lecture began',403);

     
        const attendanceMarked = await handleStudentsMarkAttendance( 
                existAttendanceList[0]?._id,
                existAttendanceList[0]?.classesPerDay[0]?._id,
                user.id);
          
            if (attendanceMarked?.modifiedCount === 0 || attendanceMarked?.modifiedCount === undefined) {
                return res.status(200).json({
                status: 'fail',
                message: "It's either you already marked attendance or system error. Contact admin "
            })
            }


            return res.status(201).json({
                status: 'success',
                message: 'Attendance list marked sucessfully'
            })

})

exports.getAttendancePerClass = catchAsync( async (req, res, next)=> {

     const existAttendanceList = await getAttendancelist(new Date(getOpenningTime()), req.params.course);

     if (existAttendanceList.length > 0) {
        const concludedClass = existAttendanceList[0].classesPerDay[0];
        return res.status(200).json({
            status: 'success',
            concludedClass
        })
    }
        

    res.status(501).json({
        status: 'success',
        existAttendanceList
     })

})