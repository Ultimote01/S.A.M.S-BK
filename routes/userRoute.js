const express = require("express");

const authController = require("../controller/authController");
const userController = require("../controller/userController")

const router = express().router;



router.get('/', authController.isloggedIn,  userController.getUser);

router.post('/register', authController.signUp );

router.post("/login", authController.signIn);

router.post("/logout", authController.logout);



module.exports = router;