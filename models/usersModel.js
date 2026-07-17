const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");


const catchAsync = require("../controller/catchAsync")
const AppError = require("../utils/appError");

const notification = new mongoose.Schema({
   message: {
      type: String,
      maxLength: [20, 'Message must not be loger than 20 chars']
   },
   webhook: {
      type: String,
      maxLength: [20, 'webhook must not be longer than 20 chars']
   }
},{ _id: false })


const userSchema = new  mongoose.Schema({
 fullName: {
    required: true,
    type: String
 },
 id: {
    required: true,
    type: Number,
},
 email: {
    type: String,
    unique: true,
    required: true
 },
 password: {
    required: true,
    type: String,
 },
 role:{
    required: true,
    type: String
 },
 department:{
   required: true,
   type: String
 },
 courses:{
    required: true,
    type:[String],
 },
 dob: {
   required: true,
   type: String
 },
 gender: {
   type: String,
   required: true
 },
 notifications: [notification]
  
},
{
   toString: true,
   toJson: true
    
})

 
userSchema.pre("save", async function () {

   if (this.isNew) {
      const hash = await bcrypt.hash(this.password, 12);
      this.password = hash;

      
      if (this.courses.length === 0)  throw new AppError("User must choose a course", 403)
   }
  
}

)

const userModel =  mongoose.model("User", userSchema);


module.exports = userModel;

