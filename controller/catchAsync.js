module.exports = (fn)=> {
return (req, res, next )=> {
    fn(req, res, next).catch((err)=> {
        console.log(err.message)

        if (err.message === 'jwt must be provided'){
            return res.status(401).json({
                status: "fail",
                message: "Please login and try again."
            })
        }
        
        if (err.message.includes("duplicate key error collection")){
           return res.status(403).json({
            status: "fail",
            message: "Document already exist"
        })
        }
 
        if (err.message.includes("jwt expired")){
            return res.status(401).json({
            status: "fail",
            message: "Session expired. Log in and try later. "
            })
        }

        if (err.message.includes("getaddrinfo ENOTFOUND")){
            return res.status(501).json({
            status: "fail",
            message: "Connect to the internet and try again "
            })
        }

        let headerSent = false;
        [401,404,403,400, 500,304,204].forEach((el, index, array) => {

            if (err.statusCode === el){
                headerSent = true;
                return res.status(el).json({
                status: "fail",
                message: err.message
            }) 
            
            } else {
                if (index === array.length-1 && !headerSent) {
                     headerSent= true;
                     res.status(500).json({
                        status: "fail",
                        message:"Something went wrong. Please try again.."
                    })
                }
            }
        })
    });
}
} 