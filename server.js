const mongooose = require("mongoose");
const dotEnv = require('dotenv');


dotEnv.config({path: `${__dirname}/config.env`});


const app = require("./app");

const db = process.env.DATABASE.replace("<db_password>", process.env.DB_PASSWORD);


const server = app.listen(process.env.PORT, ()=> {

    mongooose.connect(db).then((res)=>
        {
            console.log("Database connected")
            console.log("Server running on port", process.env.PORT)
        }
        ); 
})


process.on("unhandledRejection", err=>{
    console.log(err.name, err.message);
    console.log("unhandledRejection Shutting down")
    server.close();  
    process.exit(1);
})
 


process.on("uncaughtException", (err)=>{
    console.log(err.name, err.message);
    console.log("uncaughtException Shutting down");
    server.close();  
    process.exit(1);
});  