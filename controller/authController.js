const {promisify} = require("util");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");

const User = require("../models/usersModel");
const AttendanceModel = require("../models/atttendanceModel");
const AppError = require("../utils/appError");
const { createId, createEmail, convertDateNowToUTC} = require("../utils/helperFn");
const catchAsync = require("./catchAsync");
const userModel = require("../models/usersModel");
 
 


function createToken (id){

    return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPRIES_IN
  });

}


function createSession(res, token){

 
    return res.cookie("jwt",token,{
      expires: new Date(
     convertDateNowToUTC() + process.env.JWT_COOKIE_EXPRIES_IN * 24 * 60 * 60 * 1000),
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.mode === "prod"? true : false
    }
)
}



exports.signIn = catchAsync( async (req, res, next)=>{

    const user = await User.findOne({email: req.body.email});

    if (!user) return res.status(200).json({
        status: "fail",
        message: "User Not Found "
    });

 
    const passwordCorrect = await promisify(bcryptjs.compare)(req.body.password, user.password);
    
    if (!passwordCorrect) throw new AppError("Incorrect Password || Email", 401);


    
    const token = createToken(user.id);

    const attendanceList = await AttendanceModel.find();
    
    const modifiedAttendanceList = attendanceList.map((el)=> {
            return el.classes
        }).flatMap((el)=> el).sort((a,b)=>{
            if (a.createdAt < b.createdAt) {
                return -1;
            } else if (a.createdAt > b.createdAt){
                return 1;
            }
        });

    const registeredStudents  = await User.find({
        "role": {$eq: "student"}
    });

    user.password = undefined;
    user._id = undefined;
     
  
    
    createSession(res, token).status(200).json({
        status: "success",
        token,
        user,
        attendanceList: modifiedAttendanceList,
        registeredStudents: registeredStudents.length
    })
});




exports.signUp = catchAsync(async (req, res, next )=>{
   
    const id = req.body?.sudo? await createId(req.body?.role) : req.body.id;
    const email = req.body?.sudo? createEmail(req.body?.fullName).toLowerCase() : req.body.email;
    const fullName = req.body?.fullName?? `${req.body.firstname} ${req.body.lastname}`
    const reqObject = {fullName,email,id, role:req.body?.role,
        password: req.body.password,
        department: req.body?.department,
        courses: req.body?.courses};

    const userExist = await User.findOne({id: req.body.id});

    if (userExist) throw new AppError("User with this id already exist", 403);
    
    const userLecturers = await User.find({"role": {"$eq": "lecturer"}});
    const lecturersCourses = userLecturers.map((lecturer)=> lecturer.courses).flatMap((course)=> course);

    if (req.body.role === "lecturer"){
        req.body.courses.forEach(course => {
        if (lecturersCourses.indexOf(course) > -1)  throw new AppError("Sorry, position isn't vacant.", 403)
    });
    }
     

    const user = await User.create(reqObject);
     

    if (!user) throw new AppError("Can't create account right now. Try again later", 500);
    
    
    const attendanceList = await AttendanceModel.find();
    
    const modifiedAttendanceList = attendanceList.map((el)=> {
            return el.classes
        }).flatMap((el)=> el).sort((a,b)=>{
            if (a.createdAt < b.createdAt) {
                return -1;
            } else if (a.createdAt > b.createdAt){
                return 1;
            }
        });

    const registeredStudents  = await User.find({
        "role": {$eq: "student"}
    });

    user.password = undefined;
    user._id = undefined;

    const token = createToken(user.id);

    createSession(res, token).status(200).json({
        status: "success",
        token,
        user,
        attendanceList: modifiedAttendanceList,
        registeredStudents: registeredStudents.length
    })



})


exports.isloggedIn = catchAsync( async (req, res, next)=> {
    const cookie = req.cookie?.jwt;
    const bearerToken = req.headers.authorization? req.headers.authorization.split(" ")[1] : "";
    
    const isTokenValid = jwt.verify(cookie?? bearerToken, process.env.JWT_SECRET)
    
    const user = await User.findOne({id: isTokenValid.id});

    if (!user) throw new AppError("User not found. Please create a new account", 401);

    req.user = user;

 next();
} )


exports.updatePassword = catchAsync(async (req, res, next)=> {
    
    if (!req.body?.password) throw new  AppError('Please provide a password', 403);

    const user = await userModel.findById(req.user._id);
    const passwordCorrect = await promisify(bcryptjs.compare)(req.body.password, user.password);

    if (passwordCorrect) throw new AppError('Please provide a new password', 403);
 

    const hash = await bcryptjs.hash(req.body.password, 12);
    const updatedQuery = await User.updateOne(
        {
        id: req.user.id
        },
        {
            $set:{password: hash }
        }
    )

    if (updatedQuery.modified === 0) throw new AppError('', 500);

    res.status(200).json({
        status: 'success',
        message: 'password updated successfully'
    })
})



exports.logout = catchAsync( async (req, res, next)=> {

    res.cookie("jwt", undefined,{
        expires: new Date(
      convertDateNowToUTC() - process.env.JWT_COOKIE_EXPRIES_IN * 24 * 60 * 60 * 1000),
    }).status(200).json({
        status: "success"
    })
});
 
