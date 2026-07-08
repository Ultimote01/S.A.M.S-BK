const mongoose = require("mongoose");


const classSchema = new mongoose.Schema({
    course: {
        type: String,
        required: true,
        unique: true
    },
    lecturer: {
        type: String,
        required: true
    },
    students: [String],
    mode: {
        type: String,
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    createdAt:{
        type: Date,
        required: true
    },
    endTime:{
        type: Date,
        required: true
    }
})



const attendanceSchema = new  mongoose.Schema({
date: {
    type: Date,
    required: true,
    unique: true
},

classes: [classSchema]
}, 

{
toJson: true,
toString: true
})

 


const AttendanceModel = mongoose.model("Attendance", attendanceSchema);


module.exports = AttendanceModel;