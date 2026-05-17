import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.model.js";
import dotenv from 'dotenv'
import Stripe from "../config/stripe.js";
import { getAuth } from "@clerk/express";
import { createClerkClient } from "@clerk/backend"; // replaces deprecated @clerk/clerk-sdk-node
dotenv.config();

// Initialize Clerk client using the secret key from .env
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });


const STRIPE_KEY = process.env.STRIPE_SECRET_KEY
const FRONTEND_URL = process.env.FRONTEND_URL
const MAJOR_ADMIN_ID = process.env.MAJOR_ADMIN_ID || null
const stripe = STRIPE_KEY ? new Stripe(STRIPE_KEY, { apiVersion: "2023-10-16" }) : null;

// Helper Function
// Safely convert a value to a number and return null if it's not a valid number
const safeNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

// this function builds the base url for the frontend 

const buildFrontendBase = (req) => {
  if (FRONTEND_URL) return FRONTEND_URL.replace(/\/$/, "");
  const origin = req.get("origin") || req.get("referer");
  if (origin) return origin.replace(/\/$/, "");
  const host = req.get("host");
  if (host) return `${req.protocol || "http"}://${host}`.replace(/\/$/, "");
  return null;
};

// this function resolves the clerk user id from the request, it checks multiple places to find the user id and returnd it, if it can't find it , it return null
function resolveClerkUserId(req) {
  try {
    const auth = req.auth || {};
    const fromReq = auth?.userId || auth?.user_id || auth?.user?.id || req.user?.id || null;
    if (fromReq) return fromReq;
    try {
      const serverAuth = getAuth ? getAuth(req) : null;
      return serverAuth?.userId || null;
    } catch (e) {
      return null;
    }
  } catch (e) {
    return null;
  }
}

// to get appontment (Admin endpoint to list appointments with filters, search, and pagination)
export const getAppointments = async (req, res) => {
  try {
    const { doctorId, mobile, status, search = "", limit: limitRaw = 50, page: pageRaw = 1, patientClerkId, createdBy } = req.query;
    const limit = Math.min(200, Math.max(1, parseInt(limitRaw, 10) || 50));
    const page = Math.max(1, parseInt(pageRaw, 10) || 1);
    const skip = (page - 1) * limit;

    const filter = {};
    if (doctorId) filter.doctorId = doctorId;
    if (mobile) filter.mobile = mobile;
    if (status) filter.status = status;
    if (patientClerkId) filter.createdBy = patientClerkId;
    if (createdBy) filter.createdBy = createdBy;
    if (search) {
      const re = new RegExp(search, "i");
      filter.$or = [{ patientName: re }, { mobile: re }, { notes: re }];
    }

    const items = await Appointment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("doctorId", "name specialization owner imageUrl image").lean()

    const total = await Appointment.countDocuments(filter);
    return res.json({
      success: true,
      appointments: items,
      meta: { page, limit, total, count: items.length }
    })

  } catch (error) {
    console.error("getAppointments error", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
}

// to get appointments by patient  (Endpoint for patient to list their appointments with filters and search)

export const getAppointmentsByPatient = async (req, res) => {
  try {
    const queryCreatedBy = req.query.createdBy || null;
    const clerkUserId = resolveClerkUserId(req);
    const resolvedCreatedBy = queryCreatedBy || clerkUserId || null;

    console.log("[DEBUG] getAppointmentsByPatient – resolvedCreatedBy:", resolvedCreatedBy);

    if (!resolvedCreatedBy && !req.query.mobile) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const {
      status,
      date,
      mobile,
      search = "", 
      limit: limitRaw = 20,
      page: pageRaw = 1,
    } = req.query; 

    const limit = Math.min(100, Math.max(1, parseInt(limitRaw, 10) || 20)); 
    const page = Math.max(1, parseInt(pageRaw, 10) || 1); 
    const skip = (page - 1) * limit;

     
    const filter = {};
    // FIX: Patient Clerk userId is stored in `createdBy`, NOT `owner`.
    // `owner` holds the admin/doctor-owner who manages the doctor profile.
    if (resolvedCreatedBy) filter.createdBy = resolvedCreatedBy;
    if (mobile) filter.mobile = mobile;
    if (status) filter.status = status;
    if (date) filter.date = date;
    if (search) {
      const re = new RegExp(search, "i");
      filter.$or = [{ patientName: re }, { doctorName: re }, { notes: re }];
    } // regex is used for case insensitive search 

    
    console.log("[DEBUG] getAppointmentsByPatient – filter:", JSON.stringify(filter));

    const [items, total] = await Promise.all([
      Appointment.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("doctorId", "name specialization owner imageUrl image")
        .lean(),
      Appointment.countDocuments(filter),
    ]);

    console.log("[DEBUG] getAppointmentsByPatient – found:", items.length, "of", total);

    return res.json({
      success: true,
      appointments: items, 
      meta: { page, limit, total, count: items.length }, 
    }); 
  } catch (error) {
    console.error("getAppointmentsByPatient error", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// to create an appointment (Endpoint for patient to create an appointment)

export const createAppointment = async (req, res)=>{
  try {
     const {
      doctorId,
      patientName,
      mobile,
      age = "",
      gender = "",
      date,
      time,
      fee,
      fees,
      notes = "",
      email,
      paymentMethod,
      owner: ownerFromBody = null,
      doctorName: doctorNameFromBody,
      speciality: specialityFromBody,
      doctorImageUrl: doctorImageUrlFromBody,
      doctorImagePublicId: doctorImagePublicIdFromBody,
    } = req.body || {};

    const clerkUserId = resolveClerkUserId(req)
    const owner = ownerFromBody || clerkUserId || null;

    if(!owner) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      })
    } 

    if(!doctorId || !patientName || !mobile || !date || !time) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      })
    }

    const numericFee = safeNumber(fee ?? fees ?? 0 )
    if(numericFee === null || numericFee <0){
      return res.status(400).json({
        success: false,
        message: "Invalid fee"
      })
    }

    // Dupicate booking prevention 

    const existingAppointment = await Appointment.findOne({
      doctorId,
      createdBy: owner,
      date: String(date),
      time: String(time),
      status: { $in: ["booked", "confirmed", "visited"] }
    })
    if(existingAppointment){
      return res.status(409).json({
        success: false,
        message: "Appointment already exists"
      })
    }

    let doctor = null 
    try {
      doctor = await Doctor.findById(doctorId).lean()
      
    } catch (error) {
      console.warn("Doctor lookup failed: ", error?.message || error);     
    }
    
    if(!doctor) return res.status(404).json({
      success: false,
      message: "Doctor not found"
    })
    
    // resolve owner , names and image

    let resolvedOwner = ownerFromBody || doctor.owner || null
    if(!resolvedOwner) resolvedOwner = MAJOR_ADMIN_ID || String(doctor._id)

    const doctorName = (doctor.name && String(doctor.name).trim()) || (doctorNameFromBody && String(doctorNameFromBody).trim()) || ""
    const speciality =  (doctor.specialization && String(doctor.specialization).trim()) || 
    (specialityFromBody && String(specialityFromBody).trim()) || 
    (doctor.speciality && String(doctor.speciality).trim()) || ""

     const doctorImageUrl =
      (doctor.imageUrl && String(doctor.imageUrl).trim()) ||
      (doctor.image && String(doctor.image).trim()) ||
      (doctor.avatarUrl && String(doctor.avatarUrl).trim()) ||
      (doctor.profileImage && doctor.profileImage.url && String(doctor.profileImage.url).trim()) ||
      (doctorImageUrlFromBody && String(doctorImageUrlFromBody).trim()) ||
      "";
     
      const doctorImagePublicId =
      (doctor.imagePublicId && String(doctor.imagePublicId).trim()) ||
      (doctor.profileImage && doctor.profileImage.publicId && String(doctor.profileImage.publicId).trim()) ||
      (doctorImagePublicIdFromBody && String(doctorImagePublicIdFromBody).trim()) ||
      "";

      const doctorImage = { url: doctorImageUrl, publicId: doctorImagePublicId };

      const base = {
      doctorId: String(doctor._id || doctorId),
      doctorName,
      speciality,
      doctorImage,
      patientName: String(patientName).trim(),
      mobile: String(mobile).trim(),
      age: age ? Number(age) : undefined,
      gender: gender ? String(gender) : "",
      date: String(date),
      time: String(time),
      fees: numericFee,
      status: "Pending",
      payment: { method: paymentMethod === "Cash" ? "Cash" : "Online", status: "Pending", amount: numericFee },
      notes: notes || "",
      createdBy: owner,
      owner: resolvedOwner,
      sessionId: null,
    };

    // Free appointment
    if(numericFee === 0){
      const created = await Appointment.create({
        ...base,// spread operator copies all properties from base
        status: "Confirmed",
        payment: { method:base.payment.method, status: "Paid", amount: 0},
        paidAt : new Date()
        
      })
      return res.json({
        success: true,
        appointment: created,
        message: "Appointment created successfully"
      })
    }

    // Cash payment

    if(paymentMethod === "Cash"){
      const created = await Appointment.create({
        ...base,
        status:"Pending",
        payment:{ method: "Cash", status: "Pending", amount: numericFee },
      })
      return res.json({
        success: true,
        appointment: created,
        message: "Appointment created successfully"
      })
    }

    // Online : Stripe

    // first I will check if the stripe is configured or not
    if(!stripe){
      return res.status(503).json({
        success: false,
        message: "Payment gateway not configured"
      })
    }

     const frontBase = buildFrontendBase(req);
    if (!frontBase) {
      return res.status(500).json({ success: false, message: "Frontend URL could not be determined. Set FRONTEND_URL or send Origin header." });
    }

    const successUrl = `${frontBase}/appointment/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${frontBase}/appointment/cancel`;
    
    // create a stripe check out session
    let session;
    try {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: email || undefined,
        line_items: [
          {
            price_data: {
              currency: "inr",
              product_data: { name: `Appointment - ${String(patientName).slice(0, 40)}` },
              unit_amount: Math.round(numericFee * 100),
            },
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          doctorId: String(doctorId),
          doctorName: doctorName || "",
          speciality: speciality || "",
          patientName: base.patientName,
          mobile: base.mobile,
          clerkUserId: owner || "",
        },
      });
    } catch (stripeErr) {
      console.error("Stripe create session error:", stripeErr);
      const message = stripeErr?.raw?.message || stripeErr?.message || "Stripe error";
      return res.status(502).json({ success: false, message: `Payment provider error: ${message}` });
    }
    
    try {
      const created = await Appointment.create({
        ...base,
        sessionId: session.id,
        payment: { ...base.payment, providerId: session.payment_intent || session.payment_intent_id || null },
        status: "Pending",
      });
      return res.status(201).json({ success: true, appointment: created, checkoutUrl: session.url || null });
    } catch (dbErr) {
      console.error("DB error saving appointment after stripe session:", dbErr);
      return res.status(500).json({ success: false, message: "Failed to create appointment record" });
    }
    
  } catch (err) {
    console.error("createAppointment unexpected:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// to confirm the online payment and make it paid

export const confirmPayment = async(req, res) =>{
  try {
    const {sessionId} = req.query;
    if(!sessionId){
      return res.status(400).json({
        success: false,
        message: "Session Id is required"
      })
    }

    if(!stripe){
      return res.status(503).json({
        success: false,
        message: "Payment gateway not configured"
      })
    }

    // retrive session from stripe
    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId);
    } catch (stripeErr) {
      console.error("Stripe retrieve session error:", stripeErr);
      const message = stripeErr?.raw?.message || stripeErr?.message || "Stripe error";
      return res.status(502).json({ success: false, message: `Payment provider error: ${message}` });
    }

    // check if the session is paid
    if(session.payment_status !== "paid"){
      return res.status(400).json({
        success: false,
        message: "Payment not completed"
      })
    }

    let appt = await Appointment.findOneAndUpdate(
      { sessionId: sessionId },
      {
        "payment.status": "Paid",
        "payment.providerId": session.payment_intent || session.payment_intent_id || null,
        status: "Confirmed",
        paidAt: new Date(),
      },
      { new: true }
    );

    // fallback: try match via metadata (doctorId + mobile + patientName)
    if (!appt) {
      const meta = session.metadata || {};
      if (meta.doctorId && meta.mobile && meta.patientName) {
        appt = await Appointment.findOneAndUpdate(
          {
            doctorId: meta.doctorId,
            mobile: meta.mobile,
            patientName: meta.patientName,
            fees: Math.round((session.amount_total || 0) / 100) || undefined,
          },
          {
            "payment.status": "Paid",
            "payment.providerId": session.payment_intent || null,
            status: "Confirmed",
            paidAt: new Date(),
            sessionId: sessionId,
          },
          { new: true }
        );
      }
    }

    // last attempt: find appointment created in last 15 minutes with matching amount
    if (!appt) {
      const amount = Math.round((session.amount_total || 0) / 100);
      const fifteenAgo = new Date(Date.now() - 1000 * 60 * 15);
      appt = await Appointment.findOneAndUpdate(
        { fees: amount, createdAt: { $gte: fifteenAgo } },
        {
          "payment.status": "Paid",
          "payment.providerId": session.payment_intent || null,
          status: "Confirmed",
          paidAt: new Date(),
          sessionId: sessionId,
        },
        { new: true }
      );
    }

    if (!appt) {
      return res.status(404).json({ success: false, message: "Appointment not found for this payment session" });
    }

    return res.status(200).json({
      success: true,
      appointment: appt,
      message: "Payment confirmed successfully"
    })



    
  } catch (error) {
    console.error("confirmPayment unexpected:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// to update the appointment status
export const updateAppointment = async(req,res) =>{
  try {
    const {id} = req.params
    const body = req.body || {}
    const appt = await Appointment.findByIdAndUpdate(id,body,{new:true})
    if(!appt){
      return res.status(404).json({success:false,message:"Appointment not found"})
    }
    
    //updateAppointment 
    const terminal = appt.status === "Completed" || appt.status === "Canceled";
    if (terminal && body.status && body.status !== appt.status) {
      return res.status(400).json({ success: false, message: "Cannot change status of a completed/canceled appointment" });
    }

    const update = {};
    if (body.status) update.status = body.status;
    if (body.notes !== undefined) update.notes = body.notes;

    if (body.date && body.time) {
      if (appt.status === "Completed" || appt.status === "Canceled") {
        return res.status(400).json({ success: false, message: "Cannot reschedule completed/canceled appointment" });
      }
      update.date = body.date;
      update.time = body.time;
      update.status = "Rescheduled";
      update.rescheduledTo = { date: body.date, time: body.time };
    }

    const updated = await Appointment.findByIdAndUpdate(id,update,{new:true,runValidators:true}).populate({path:"doctorId",select: "name imageUrl"}).lean();
    return res.status(200).json({
      success:true,
      appointment:updated,
      message:"Appointment updated successfully"
    })
    
    } catch (err) {
      console.error("updateAppointment error:", err);
      return res.status(500).json({success:false,message:"Server error"})
  }
}

// to cancel an appointment

export const cancelAppointment = async(req,res)=>{
  try {
    const {id} = req.params
    const appt = await Appointment.findById(id)
    if(!appt){
      return res.status(404).json({success:false,message:"Appointment not found"})
    }
    
    appt.status = "Canceled"
    await appt.save()
    return res.status(200).json({
      success:true,
      appointment:appt,
      message:"Appointment canceled successfully"
    })

  } catch (err) {
    console.error("cancelAppointment error:", err);
    return res.status(500).json({success:false,message:"Server error"})
  }
}

// to get stats
export const getStats = async(req,res)=>{
  try {
    const total = await Appointment.countDocuments()
    const paidAgg = await Appointment.aggregate([
      {
        $match: {
          "payment.status": "Paid"
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$fees" },
          count: { $sum: 1 }
        }
      }
    ])
    
    const revenue = (paidAgg[0] && paidAgg[0].total) || 0

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recent = await Appointment.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    })

    return res.status(200).json({
      success:true,
      stats:{
        total,
        revenue,
        recentLast7Days:recent}}
      )

    } catch (error) {
      console.error("getStats error:", error);
      return res.status(500).json({success:false,message:"Server error"})
    }
}

export const getAppointmentsByDoctor = async(req,res)=>{
  try {
    const {doctorId} = req.params
    if(!doctorId) return res.status(400).json({success:false,message:"Doctor ID is required"})
    
    const { mobile, status, search = "", limit: limitRaw = 50, page: pageRaw = 1 } = req.query;
    const limit = Math.min(200, Math.max(1, parseInt(limitRaw, 10) || 50));
    const page = Math.max(1, parseInt(pageRaw, 10) || 1);
    const skip = (page - 1) * limit;

    const filter = { doctorId };
    if (mobile) filter.mobile = mobile;
    if (status) filter.status = status;
    if (search) {
      const re = new RegExp(search, "i");
      filter.$or = [{ patientName: re }, { mobile: re }, { notes: re }];
    }

    const items = await Appointment.find(filter).sort({date:1,time:1}).skip(skip).limit(limit).populate(
      "doctorId" , "name specialization owner imageUrl image"
    ).lean()

    const total = await Appointment.countDocuments(filter)

    return res.status(200).json({
      success:true,
      appointments:items,
      pagination:{
        total,
        page,
        limit,
        count:items.length
      }
    })

    
  } catch (err) {
    console.error("getAppointmentsByDoctor error:", err);
    return res.status(500).json({success:false,message:"Server error"})
  }
}

// to get register user count

export const getRegisterUserCount = async(req,res)=>{
  try {
    const totalUsers = await clerkClient.users.getCount()
    return res.status(200).json({
      success:true,
      count:totalUsers
    })
  } catch (error) {
    console.error("getRegisterUserCount error:", error);
    return res.status(500).json({success:false,message:"Server error"})
  }
}

export default {
  createAppointment,
  getAppointments,
  getAppointmentsByPatient,
  confirmPayment,
  updateAppointment,
  cancelAppointment,
  getStats,
  getAppointmentsByDoctor,
  getRegisterUserCount
}

