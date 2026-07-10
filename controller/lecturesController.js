const LectureModel = require("../models/lecturemodel");
const AppError = require("../utils/appError");
const { getTimezone } = require("../utils/helperFn");
const catchAsync = require("./catchAsync");



exports.createLecture = catchAsync(async (req, res, next)=> {


    if (req.user.role.toLowerCase() === "student") throw new AppError("You don't have the permission to perform this task", 401);

    const isUserCourse = req.user.courses.some((course)=> course === req.body.course) ;
    
    if (!isUserCourse) throw new AppError("You can only create a course that you teach", 403);

   

    const createdLecture = await LectureModel.findOne({date: new Date(req.body.startTime.split("T")[0])});
   
    
    if (createdLecture?.date !== undefined) {

        if (req.body.startTime.split("T")[0] === createdLecture.date.toISOString().split("T")[0] ){

            createdLecture.classes.push(
            {
            course: req.body.course,
            lecturer: req.user._id,
            mode:req.body.mode,
            startTime: req.body.startTime,
            createdAt: req.body.createdAt,
            endTime: req.body.endTime 
            }
            )

        await createdLecture.save();
         const lectureObj = {date: createdLecture.date, _id: createdLecture._id, classes: createdLecture.classes} 
        const qk = lectureObj.classes.slice(-1)[0];
        lectureObj.classes= [{course: qk.course,lecturer: req.user.fullName,mode: qk.mode,
        startTime: qk.startTime,createdAt: qk.created, endTime: qk.endTime}];

        res.status(201).json({
        status: "success",
        lecture: lectureObj,
        message: "Class added"
        })
        }
        
    }else{
        const lecture = await LectureModel.create({
            date: req.body.startTime.split("T")[0],
            classes:  {
                course: req.body.course,
                lecturer: req.user._id,
                mode:req.body.mode,
                startTime: req.body.startTime,
                createdAt: req.body.createdAt,
                endTime: req.body.endTime
            }
            });
    
        const lectureObj = {date: lecture.date, _id: lecture._id, classes: lecture.classes} 
        const qk = lectureObj.classes.slice(-1)[0];
        lectureObj.classes= [{course: qk.course,lecturer: req.user.fullName,mode: qk.mode,
        startTime: qk.startTime,createdAt: qk.created, endTime: qk.endTime}];

        res.status(201).json({
        status: "success",
        lecture:lectureObj,
        message: "Class created"
    })
    }

})


const getEligibleLectures = async function(courses, today) {
   
    const lectures = LectureModel.aggregate([
  
        {
        $match: {
            ...today,
            "classes": {$elemMatch: {"course": {$in: courses}}},
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
                cond: { $in: ["$$subDoc.course", courses] }
                }
            }
            }
        }
        ]);
    return lectures;
}


exports.getUpcomingLectures = catchAsync(async (req, res, next)=> {

    let lectures = [];
    const resetTimeHour = new Date(Date.now()).toISOString().split("T")[1].split(":");
    const openingTime=  Date.now()- (Number(resetTimeHour[0]) * 60 * 60 * 1000 )- 
                        (Number(resetTimeHour[1]) * 60 * 1000)-(Number(resetTimeHour[2].split(".")[0])*1000)-
                        (Number(resetTimeHour[2].split(".")[1].replace("Z", "")));
  

    if (req.query.day ==="today"){
        lectures = await getEligibleLectures(req.user.courses, {date: new Date(openingTime)});
    }else{
         lectures = await getEligibleLectures(req.user.courses);
    }
    
    if (lectures.length !== 0){
        lectures.forEach((lecture)=>{
            lecture.classesPerDay = lecture.classesPerDay.filter((el)=> new Date(
                req.query.day ==="today"? el.endTime : el.startTime
            ).valueOf() >  Date.now());
            lecture.classesPerDay.map((el)=>{
                el.lecturer= req.user.fullName;
                return el;
            })
            
        })
    }

    res.status(200).json({
        status: "success",
        lectures
    })

})


exports.getCreatedLectures = catchAsync( async (req, res, next)=> {
  
    const lectures = await getEligibleLectures(req.user.courses);

    res.status(200).json(
        {
            status: 'success',
            lectures: lectures?? []
        }
    )
    
})

exports.editLecture = catchAsync( async (req, res, next)=>{
    const modifiedRequestBody = {};

    if (req.user.role !== "lecturer") throw new AppError("Only a lecturer can edit a lecture", 403)
   

    const lectureQuery = await LectureModel.findOne(
        {
            date: req.body.modifiedLectureCreatedAt,
            "classes._id": {$eq: req.body._id}
        },
         {
             "classes.$": 1,
        }
       );

    const lecture =lectureQuery?.classes[0]?? {};
  

    if (!lecture) throw new AppError("You can only edit an avaiable lecture", 403);

    if (!req.user.courses.some((course)=> course === lecture.course)) 
        throw new AppError("You are not eligible to create this course", 403);

    if (!req.user.courses.some((course)=> course === lecture.course))
        throw new AppError("You are not eligible to eidit this course", 403);

    console.log(new Date( req.body['endTime']), req.body);
    Object.keys(req.body).forEach((key)=>{
       
         if (!req.body[key]) throw new AppError(`${req.body[key]} must not be empty value`,403);

        if(!req.body.createdAt) throw new AppError("You can't edit lecture without current time", 403)

        if (key === "course") modifiedRequestBody[key]= req.body[key];

        if (key === 'mode' && req.body[key]){
           if (["physical",'online'].indexOf(req.body.mode.toLowerCase()) > -1){
             modifiedRequestBody[key]= req.body[key];
           } else throw new AppError(`${req.body[key]} is not a valid mode.`, 403);
        }

        if (key === "startTime"){
            if (isNaN(new Date(req.body.startTime).valueOf())){
                throw new AppError("Start time is an invalid date format", 403);
            }
            else if (new Date(req.body.startTime).valueOf() < (Date.now() + (5 * 60 * 1000))) {
                  throw new AppError(`Start time must be atleast 5 minutes ahead of your current time`, 403);
            }
            else if (new Date(req.body.startTime).valueOf() >  new Date( req.body['endTime'] ?? lecture.endTime).valueOf()) {
                    throw new AppError(`Start time must be earlier than end time`, 403);

            }else   modifiedRequestBody[key]= req.body[key];
        }

        if (key === "createdAt"){
            if(isNaN(new Date(req.body.createdAt).valueOf())){
                throw new AppError("Lecture created  with an invalid date format", 403);
            }
            else if (new Date(req.body.createdAt).valueOf() < Date.now()){
                    throw new AppError(`Lecture must be created before event`, 403);

            }else if(new Date(req.body.createdAt).valueOf() >=  new Date( req.body['startTime'] ?? lecture.startTime).valueOf()){
                throw new AppError(`Lecture must be created before startTime`, 403);
            }
            else  modifiedRequestBody[key]= req.body[key];
        }

        if (key === "endTime"){
            if(isNaN(new Date(req.body.endTime).valueOf())){
                throw new AppError("End time is an invalid date format", 403);
            } else if (new Date(req.body.endTime).valueOf() < (Date.now()+ (2 * 60 * 1000))){
                throw new AppError("End time must be atleast 2 minutes ahead of your current time", 403);
            }else if (new Date(req.body.endTime).valueOf() <= new Date( req.body['startTime'] ?? lecture.startTime).valueOf()){
                throw new AppError('End time must be greater than start time', 403);
            }else  modifiedRequestBody[key]= req.body[key];
        }
    })  
    
    console.log(modifiedRequestBody, {...lecture,...modifiedRequestBody});

     const setFields = Object.fromEntries(
        Object.entries(modifiedRequestBody).map(([key, value]) => [
            `subdocs.$.${key}`,
            value,
        ])
    );

    const updatedLecture = await LectureModel.updateOne(
        {
            date: req.body.modifiedLectureCreatedAt,
            "classes._id": {$eq: req.body._id},
            classes: {
            $not: {
                $elemMatch: {
                _id: { $ne: req.body._id },
                name: req.body.course,
                },
            },
            },
        },
        {
            $set:{
                    "classes.$.start": modifiedRequestBody.course
            }
        }
    )
    if(updatedLecture.modifiedCount === 0){
        throw new AppError('Update was unsuccessful. Check values and try again',403)
    }


    res.status(200).json(
        {
            status: 'success',
            updatedLecture
        }
    )

})

exports.deleteLecture = catchAsync(async (req, res, next)=>{


    const delResponse =  await LectureModel.findOneAndUpdate(
        { date: 'time'},
        {
            $pull: {
            subdocs: { _id: subdocId },
            },
        },
        { new: true }
        );
})


exports.getEligibleLectures = getEligibleLectures;