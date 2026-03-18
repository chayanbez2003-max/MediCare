import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { clerkMiddleware } from '@clerk/express'
import  urlencoded  from 'body-parser'
import { connectDB } from './config/db.js                                                                           '
import doctorRouter from './routes/doctorRouter.js'
import serviceRouter from './routes/serviceRouter.js'
import appointmentRouter from './routes/appointmentRouter.js'

const app = express()
const port =4000

// Middlewares
app.use(cors())
app.use(clerkMiddleware())
app.use(express.json({limit: "20mb"}))
app.use(express.urlencoded({limit:"20mb", extended:true}))

//DB
connectDB()

//Routes
app.use("/api/doctors", doctorRouter)
app.use("/api/services", serviceRouter)
app.use("/api/appointments", appointmentRouter)

app.get('/',(req,res)=>{
    res.send("API working")
})

app.listen(port, ()=>{
    console.log(`server is running on http://localhost:${port}`);
    
})