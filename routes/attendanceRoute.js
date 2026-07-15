const express = require('express');

const authController = require("../controller/authController");
const attendanceController = require("../controller/attendanceController");



const router = express().router;



router.get("/",  
    authController.isloggedIn,
    attendanceController.getAllAttendances);

router.get("/attendanceListPerClass/:course", 
authController.isloggedIn,
attendanceController.getAttendancePerClass);

router.get("/getAttendanceByCourses", 
    authController.isloggedIn,
    attendanceController.getAttendancesByCourses
)


router.post("/create-attendance",authController.isloggedIn,
    attendanceController.createAttendanceList
);



router.post("/mark-attendance-online",
authController.isloggedIn,
attendanceController.markAttendanceOnlineClass);

router.post("/mark-attendance-physical", attendanceController.markAttendancePhysicalClass);

 

module.exports = router;