import express from 'express'
import multer from 'multer'
 
import {
  createDoctor,
  deleteDoctor,
  doctorLogin, 
  getDoctorById, 
  getDoctors, 
  toggleAvailability, 
  updateDoctor,
  getDoctorDashboardStats,
  updateDoctorSelf
} from '../controllers/doctorController.js'

import doctorAuth from '../middlewares/doctorAuth.js'
import adminAuth  from '../middlewares/adminAuth.js'

const upload = multer({ dest: 'temp' })
const doctorRouter = express.Router();

// ── Public routes ──────────────────────────────────────────────
doctorRouter.get('/', getDoctors)
doctorRouter.post('/login', doctorLogin)

// ── Protected Stats Route ──────────────────────────────────────
doctorRouter.get('/dashboard-stats', doctorAuth, getDoctorDashboardStats);

doctorRouter.get('/:id', getDoctorById)

// ── Create (admin) ─────────────────────────────────────────────
doctorRouter.post('/', upload.single('image'), createDoctor)

// ── Doctor self-update (protected by doctor JWT) ───────────────
doctorRouter.put('/me', doctorAuth, upload.single('image'), updateDoctorSelf);

// ── Update (admin panel → Clerk JWT → adminAuth) ────────────────
doctorRouter.put('/:id', adminAuth, upload.single('image'), updateDoctor)

// ── Toggle availability (doctor self-update with doctor JWT) ───
doctorRouter.post('/:id/toggle-availability', doctorAuth, toggleAvailability)

// ── Delete (admin) ─────────────────────────────────────────────
doctorRouter.delete('/:id', adminAuth, deleteDoctor)

export default doctorRouter;
