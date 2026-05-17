import express from "express";
import { clerkMiddleware, requireAuth } from "@clerk/express";
import {
  createServiceAppointment,
  confirmServicePayment,
  getAllServiceAppointments,
  getServiceAppointmentById,
  updateServiceAppointment,
  cancelServiceAppointment,
  getServiceAppointmentStats,
  getPatientServiceAppointments,
} from "../controllers/serviceAppointmentController.js";

const serviceAppointmentRouter = express.Router();

// Public routes
serviceAppointmentRouter.get("/", getAllServiceAppointments);
serviceAppointmentRouter.get("/confirm", confirmServicePayment);
serviceAppointmentRouter.get("/stats/summary", getServiceAppointmentStats);
serviceAppointmentRouter.get("/:id", getServiceAppointmentById);

// Authenticated routes
serviceAppointmentRouter.post(
  "/",
  clerkMiddleware(),
  requireAuth(),
  createServiceAppointment
);
serviceAppointmentRouter.get(
  "/me",
  clerkMiddleware(),
  requireAuth(),
  getPatientServiceAppointments
);

// Admin / update routes
serviceAppointmentRouter.put("/:id", updateServiceAppointment);
serviceAppointmentRouter.post("/:id/cancel", cancelServiceAppointment);

export default serviceAppointmentRouter;
