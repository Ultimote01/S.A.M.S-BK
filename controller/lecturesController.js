const LecturesModel = require("../models/lecturesmodel");
const catchAsync = require("./catchAsync");



exports.createLecture = catchAsync(async (req, res, next)=> {

    const createdLecture = await LecturesModel.findOne({date: req.body.createdAt});
    console.log(createdLecture);
    
    if (createdLecture?.date !== undefined) {
        createdLecture.classes.push(
            {
            course: req.body.course,
            lecturer: req.user.id,
            mode:req.body.mode,
            startTime: eval(req.body.startTime),
            createdAt: req.body.createdAt,
            endTime: eval(req.body.endTime)
            }
            )

        await createdLecture.save();
        res.status(200).json({
        status: "success",
        lecture: createdLecture,
        message: "Class added"
        })
    }else{
        const lecture = await LecturesModel.create({
            date: req.body.createdAt,
            classes:  {
                course: req.body.course,
                lecturer: req.user.id,
                mode:req.body.mode,
                startTime: eval(req.body.startTime),
                createdAt: req.body.createdAt,
                endTime: eval(req.body.endTime)
            }
            });
        res.status(200).json({
        status: "success",
        lecture,
        message: "Class created"
    })
    }

})


exports.getLectures = catchAsync(async (req, res, next)=> {

    console.log(req);

    res.status(200).json({
        status: "success",
        message: "Lectures Loading"
    })

})

