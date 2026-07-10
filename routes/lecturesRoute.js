const express = require("express");
const { isloggedIn } = require("../controller/authController");
const { 
createLecture, 
editLecture, 
deleteLecture, 
getUpcomingLectures,
getCreatedLectures
 } = require("../controller/lecturesController");



const router = express().router;


router.get("/get-upcomingLectures", isloggedIn, getUpcomingLectures );
router.get("/get-createdLectures", isloggedIn, getCreatedLectures)
router.post("/create-lecture", isloggedIn, createLecture);
router.patch("/edit-lecture", isloggedIn, editLecture);
router.delete("/delete-lecture", isloggedIn, deleteLecture);
 


module.exports = router;