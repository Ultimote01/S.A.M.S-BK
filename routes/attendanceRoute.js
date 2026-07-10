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

// router.patch("edit-attendance",)

// router.delete("delete-attendance")


router.post("/mark-attendance-physical", attendanceController.markAttendancePhysicalClass)

router.get("/attendanceListPerClass/:course", 
authController.isloggedIn,
attendanceController.getAttendancePerClass)

module.exports = router;