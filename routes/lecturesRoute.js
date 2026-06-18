const express = require("express");
const { isloggedIn } = require("../controller/authController");
const { createLecture, getLectures } = require("../controller/lecturesController");



const router = express().router;


router.get("/get-lectures", isloggedIn, getLectures );
router.post("/create-lecture", isloggedIn, createLecture);
 


module.exports = router;