const express = require('express');


const attendanceController = require("../controller/attendanceController");



const router = express().router;



router.get("/", attendanceController.getAttendances);



module.exports = router;