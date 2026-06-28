const express = require('express');

const authController = require("../controller/authController");
const attendanceController = require("../controller/attendanceController");



const router = express().router;



router.get("/",  
    authController.isloggedIn,
    attendanceController.getAttendances);

router.post("/create-attendance",authController.isloggedIn,
    attendanceController.createAttendanceList
)



module.exports = router;