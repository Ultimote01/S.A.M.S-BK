const mongoose = require("mongoose");


const AppError = require("../utils/appError")

const classes = new mongoose.Schema({
   
    course: {
        type: String,
        required: true,
    },
    lecturer: {
        //  Child  Referencing
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
      },
    mode: {
        type: String,
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    }
})


const lectureSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    classes: [classes]

})


lectureSchema.pre("validate", function(){
    const uniqueItems = new Set();

    this.classes.forEach((el)=> uniqueItems.add(el.course))
    if (uniqueItems.size !== this.classes.length) throw new AppError("Duplicate found", 403);
})

 

const LectureModel = mongoose.model("Lectures", lectureSchema);

module.exports =  LectureModel;



