const User = require("../models/usersModel");
const catchAsync = require("../controller/catchAsync");
const userModel = require("../models/usersModel");
const AppError = require("../utils/appError");

exports.getUser = catchAsync( async (req, res)=> {
    
    const user = await User.findOne({id: req.user.id});

    res.status(200).json({message: "success+", user})

} 
); 


exports.setUsersNotifcation = async (notification)=> {
    
    const users = await User.updateMany({
            role: {$eq: "student"}
        },
         {
            $addToSet: {
            notifications:  notification
            }
        }
    );

}



exports.updateMe = catchAsync( async (req, res, next)=> {

    const updatedQuery = await userModel.updateOne({id: req?.user.id},
        {$set: {fullName: req.body.fullname}})

    if ( updatedQuery.modifiedCount === 0 ) throw new AppError('Please provide a new fullname', 403);

    res.status(200).json({
        status: 'success',
        message: 'Updated request successfully'
    })
})
