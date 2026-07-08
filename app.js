const express  = require("express");
const cors = require("cors");


const userRoute  = require("./routes/userRoute");
const attendanceRoute = require("./routes/attendanceRoute");
const lectureRoute = require("./routes/lecturesRoute");

const app = express();

 
const allowedOrigins = ["http://localhost:5173", "https://s-a-m-s-8ozz.vercel.app"]
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new AppError(msg, 401), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS','PATCH'], 
  allowedHeaders: ['Content-Type', 'Authorization',"X-CSRF-Token", 
    'X-Custom-Header'],
  
  credentials: true // cookies or sessions
}));

// Handle OPTIONS requests explicitly if needed (browsers send these as preflights)
// app.options('*', cors());
 

app.use(express.json());
 

app.use((req, res, next)=> {
    console.log("Middleware called");

    next();
})


app.use("/api/v1/users", userRoute);
app.use("/api/v1/attendance-list", attendanceRoute )
app.use("/api/v1/lectures", lectureRoute);













module.exports = app;