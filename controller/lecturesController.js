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
            lecturer: req.user.fullName,
            mode:req.body.mode,
            startTime: req.body.startTime,
            createdAt: req.body.createdAt,
            endTime: req.body.endTime 
            }
            )

        await createdLecture.save();
        createdLecture.classes =  createdLecture.classes.slice(-1);
        res.status(201).json({
        status: "success",
        lecture: createdLecture,
        message: "Class added"
        })
        }
        
    }else{
        const lecture = await LectureModel.create({
            date: req.body.startTime.split("T")[0],
            classes:  {
                course: req.body.course,
                lecturer: req.user.fullName,
                mode:req.body.mode,
                startTime: req.body.startTime,
                createdAt: req.body.createdAt,
                endTime: req.body.endTime
            }
            });
        res.status(201).json({
        status: "success",
        lecture: lecture,
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


exports.getLectures = catchAsync(async (req, res, next)=> {

    
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
            ).valueOf() >  Date.now())
            
        })
    }


    res.status(200).json({
        status: "success",
        lectures
    })

})


exports.getEligibleLectures = getEligibleLectures;