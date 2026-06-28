const mongoose = require("mongoose");


const classSchema = new mongoose.Schema({
    course: {
        type: String,
        required: true
    },
    id:{
        type: String,
        required: [true, 'ID is required to initiate attendance list'],
        maxLength: [10, 'ID length must not be greater 10 chars'],
        minLength: [10,'ID length must not be lesser than 10 chars']
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