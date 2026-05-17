import express from "express";
import { clerkMiddleware, requireAuth } from "@clerk/express";
import { createAppointment, getAppointments, getAppointmentsByPatient, confirmPayment, updateAppointment, cancelAppointment, getStats, getAppointmentsByDoctor, getRegisterUserCount } from "../controllers/appointmentController.js";

const appointmentRouter = express.Router();

appointmentRouter.get("/", getAppointments)
appointmentRouter.get("/confirm-payment", confirmPayment)
appointmentRouter.get("/update-appointment", updateAppointment)
// authenticate routes
appointmentRouter.post('/', clerkMiddleware(),requireAuth(), createAppointment)
appointmentRouter.get('/me', clerkMiddleware(),requireAuth(), getAppointmentsByPatient)

appointmentRouter.get("/doctor/:doctorId", getAppointmentsByDoctor)
appointmentRouter.post("/:id/cancel",cancelAppointment)
appointmentRouter.get('/patient/count', getRegisterUserCount)
appointmentRouter.put("/:id",updateAppointment)

appointmentRouter.get("/stats/summary", getStats)

export default appointmentRouter;
