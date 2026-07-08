module.exports = (fn)=> {
return (req, res, next )=> {
    fn(req, res, next).catch((err)=> {
        console.log(err)

        
        if (err.message.includes("duplicate key error collection")){
           return res.status(403).json({
            status: "fail",
            message: "Document already exist"
        })
        }

        if (err.statusCode === 403){
            return res.status(403).json({
            status: "fail",
            message: err.message
        })
        }

        if (err.statusCode === 401){
            return res.status(401).json({
            status: "fail",
            message: err.message
            })
        }

        if (err.message.includes("jwt expired")){
             return res.status(401).json({
            status: "fail",
            message: "Session expired. Log in and try later. "
            })
        }

        res.status(500).json({
            status: "fail",
            message:"Something went wrong. Please try again.."
        })
    });
}
} 