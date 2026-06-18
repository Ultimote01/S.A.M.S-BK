const User = require("../models/usersModel");
const catchAsync = require("../controller/catchAsync");

exports.getUser = catchAsync( async (req, res)=> {
    
    const user = await User.findOne({id: "736212242"});

    res.status(200).json({message: "success+", user})

} 
); 