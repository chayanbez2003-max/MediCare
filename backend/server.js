import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { clerkMiddleware } from '@clerk/express'
import  urlencoded  from 'body-parser'
import { connectDB } from './config/db.js'
import doctorRouter from './routes/doctorRouter.js'
import serviceRouter from './routes/serviceRouter.js'
import appointmentRouter from './routes/appointmentRouter.js'
import serviceAppointmentRouter from './routes/serviceAppointmentRouter.js'

const app = express()
const port = process.env.PORT || 4000
// Always include localhost dev origins as fallback so CORS works without .env
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:3000',
].filter(Boolean)

const corsOptions = {
    origin: function(origin, callback){
        if(!origin) return callback(null,true)
        if(allowedOrigins.includes(origin)){
             return callback(null,true)
        }else{
            return callback(new Error("Not allowed by CORS"))
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Origin",
  "Accept",
  "X-Requested-With"],
}

// Middlewares
// ⚠️  Handle ALL OPTIONS preflight requests FIRST — before Clerk middleware touches them
app.options('*path', cors(corsOptions))
app.use(cors(corsOptions))

// JSON parsing before Clerk so body is available in controllers
app.use(express.json({limit: "20mb"}))
app.use(express.urlencoded({limit:"20mb", extended:true}))

// Function to determine if a route should skip Clerk middleware verification
// This prevents Clerk from crashing on 'jwk-kid-mismatch' when evaluating the 
// doctor's custom backend JWT.
const shouldSkipClerk = (req) => {
  const p = req.path;
  if (p === '/api/doctor/me' || p === '/api/doctors/me') return true;
  if (p === '/api/doctor/dashboard-stats' || p === '/api/doctors/dashboard-stats') return true;
  if (p.match(/^\/api\/doctors?\/.+\/toggle-availability$/)) return true;
  if (p.match(/^\/api\/appointments\/doctor\/.+$/)) return true;
  return false;
};

// Clerk middleware after CORS is already resolved
const clerkHandler = clerkMiddleware();
app.use((req, res, next) => {
  if (shouldSkipClerk(req)) {
    return next();
  }
  return clerkHandler(req, res, next);
});

//DB
connectDB()

//Routes
app.use("/api/doctors", doctorRouter)
app.use("/api/doctor", doctorRouter)
app.use("/api/services", serviceRouter)
app.use("/api/appointments", appointmentRouter)
app.use("/api/service-appointments", serviceAppointmentRouter)

app.get('/',(req,res)=>{
    res.json({
  message: "API working"
})
})

app.listen(port, ()=>{
    console.log(`server is running on http://localhost:${port}`);
    
})