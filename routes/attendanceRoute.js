const express = require('express');

const authController = require("../controller/authController");
const attendanceController = require("../controller/attendanceController");



const router = express().router;



router.get("/",  
    authController.isloggedIn,
    attendanceController.getAllAttendances);

router.post("/create-attendance",authController.isloggedIn,
    attendanceController.createAttendanceList
)

router.post("/mark-attendance-physical", attendanceController.markAttendancePhysicalClass)

router.get("/attendanceListPerClass/:course", attendanceController.getAttendancePerClass)

module.exports = router;