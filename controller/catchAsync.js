module.exports = (fn)=> {
return (req, res, next )=> {
    fn(req, res, next).catch((err)=> {
        console.log(err.message)

        
        if (err.message.includes("duplicate key error collection")){
           return res.status(403).json({
            status: "fail",
            message: "User already exist"
        })
        }

        if (err.statusCode === 403){
             return res.status(403).json({
            status: "fail",
            message: err.message
        })
        }

        res.status(500).json({
            status: "fail",
            message:"Something went wrong. Please try again.."
        })
    });
}
} 