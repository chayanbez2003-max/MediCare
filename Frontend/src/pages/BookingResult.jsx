import React, { useEffect, useState, useRef } from "react";
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Clock, 
  CreditCard, 
  Stethoscope, 
  ArrowRight, 
  Home, 
  RefreshCw, 
  AlertCircle 
} from "lucide-react";
import Navbar from "../components/Navbar";
import FooterPage from "../components/FooterPage";

export default function BookingResult() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [searchParams] = useSearchParams();
  const { getToken } = useAuth();

  const queryStatus = searchParams.get("status");
  const sessionId = searchParams.get("session_id");
  const queryServiceId = searchParams.get("service_id");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [details, setDetails] = useState({
    serviceName: "",
    appointmentDate: "",
    timeSlot: "",
    paymentMethod: "",
    status: "",
    errorMessage: "",
    serviceId: ""
  });

  const verifiedRef = useRef(false);

  useEffect(() => {
    // 1. If state exists, use it directly (Cash flow or immediate navigate)
    if (state && typeof state.success === "boolean") {
      setSuccess(state.success);
      setDetails({
        serviceName: state.serviceName || "",
        appointmentDate: state.appointmentDate || "",
        timeSlot: state.timeSlot || "",
        paymentMethod: state.paymentMethod || "Cash",
        status: state.success ? "Pending" : "",
        errorMessage: state.errorMessage || "",
        serviceId: state.serviceId || ""
      });
      return;
    }

    // 2. Stripe Redirect: Success Flow
    if (queryStatus === "success" && sessionId) {
      if (verifiedRef.current) return;
      verifiedRef.current = true;
      
      const verifyPayment = async () => {
        setLoading(true);
        try {
          const token = await getToken().catch(() => null);
          const headers = {
            "Content-Type": "application/json",
            Accept: "application/json",
          };
          if (token) {
            headers["Authorization"] = `Bearer ${token}`;
          }
          
          const res = await fetch(`/api/service-appointments/confirm?session_id=${sessionId}`, {
            method: "GET",
            headers
          });
          const data = await res.json();
          
          if (res.ok && data.success && data.appointment) {
            const appt = data.appointment;
            const formattedTime = `${appt.hour}:${String(appt.minute).padStart(2, "0")} ${appt.ampm}`;
            setSuccess(true);
            setDetails({
              serviceName: appt.serviceName || "Healthcare Service",
              appointmentDate: appt.date || "",
              timeSlot: formattedTime,
              paymentMethod: appt.payment?.method || "Online",
              status: appt.status || "Confirmed",
              errorMessage: "",
              serviceId: appt.serviceId || ""
            });
          } else {
            setSuccess(false);
            setDetails(prev => ({
              ...prev,
              errorMessage: data.message || "We could not verify your payment session.",
              serviceId: queryServiceId || ""
            }));
          }
        } catch (err) {
          console.error("Payment confirmation verification failed:", err);
          setSuccess(false);
          setDetails(prev => ({
            ...prev,
            errorMessage: "An error occurred while confirming your payment with the server.",
            serviceId: queryServiceId || ""
          }));
        } finally {
          setLoading(false);
        }
      };

      verifyPayment();
      return;
    }

    // 3. Stripe Redirect: Cancel Flow
    if (queryStatus === "failed") {
      setSuccess(false);
      setDetails({
        serviceName: "",
        appointmentDate: "",
        timeSlot: "",
        paymentMethod: "Online",
        status: "",
        errorMessage: "Payment canceled by the user.",
        serviceId: queryServiceId || ""
      });
      return;
    }

    // Fallback: If no state or matching query params
    setSuccess(false);
    setDetails({
      serviceName: "",
      appointmentDate: "",
      timeSlot: "",
      paymentMethod: "",
      status: "",
      errorMessage: "No booking details found. Please navigate from the service page.",
      serviceId: ""
    });
  }, [state, queryStatus, sessionId, queryServiceId, getToken]);

  return (
    <div className="min-h-screen font-serif bg-gradient-to-br from-teal-50/50 via-slate-50 to-emerald-50/30 flex flex-col justify-between">
      <Navbar />

      <style>{`
        @keyframes popIn {
          0% { transform: scale(0.85); opacity: 0; }
          70% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-pop {
          animation: popIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .animate-slide-up {
          animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both;
        }
        .animate-slide-up-delayed {
          animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both;
        }
      `}</style>

      <main className="flex-grow flex items-center justify-center py-16 px-4 sm:px-6 relative overflow-hidden">
        {/* Decorative background blur blobs */}
        <div aria-hidden="true" className="pointer-events-none absolute -top-40 -right-40 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -left-40 w-96 h-96 bg-teal-100/50 rounded-full blur-3xl" />

        <div className="max-w-2xl w-full z-10">
          {/* ================= LOADING STATE ================= */}
          {loading && (
            <div className="bg-white/80 backdrop-blur-md rounded-[2rem] shadow-xl border border-emerald-100 p-10 sm:p-14 text-center animate-pop">
              <div className="w-16 h-16 mx-auto mb-6 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
              <h2 className="text-2xl font-bold text-emerald-950 mb-2">Confirming Payment Session...</h2>
              <p className="text-gray-500">Please do not refresh the page while we verify with Stripe.</p>
            </div>
          )}

          {/* ================= SUCCESS STATE ================= */}
          {!loading && success === true && (
            <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-xl border border-emerald-100 overflow-hidden animate-pop">
              {/* Top accent bar */}
              <div className="h-2 w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500" />
              
              <div className="p-8 sm:p-12 text-center">
                {/* Green check icon with micro-animation */}
                <div className="w-20 h-20 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600" strokeWidth={1.5} />
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 mb-2 tracking-tight">
                  Service Booked Successfully
                </h1>
                <p className="text-gray-500 text-sm sm:text-base mb-8">
                  Your appointment has been confirmed.
                </p>

                {/* Appointment details card */}
                <div className="animate-slide-up bg-linear-to-br from-emerald-50/50 to-teal-50/30 border border-emerald-100/80 rounded-2xl p-6 sm:p-8 text-left space-y-4 mb-8">
                  <h3 className="text-emerald-900 font-extrabold flex items-center gap-2 border-b border-emerald-100 pb-3 mb-2">
                    <Stethoscope size={18} className="text-emerald-600" />
                    Appointment Details
                  </h3>

                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-500 font-medium">Service Name</span>
                      <span className="font-semibold text-emerald-950 text-right max-w-[65%]">{details.serviceName}</span>
                    </div>

                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-500 font-medium">Appointment Date</span>
                      <span className="font-semibold text-emerald-950 flex items-center gap-1.5">
                        <Calendar size={14} className="text-emerald-600" />
                        {details.appointmentDate}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-500 font-medium">Time Slot</span>
                      <span className="font-semibold text-emerald-950 flex items-center gap-1.5">
                        <Clock size={14} className="text-emerald-600" />
                        {details.timeSlot}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-500 font-medium">Payment Method</span>
                      <span className="font-semibold text-emerald-950 flex items-center gap-1.5">
                        <CreditCard size={14} className="text-emerald-600" />
                        {details.paymentMethod}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-t border-emerald-100/60 pt-3">
                      <span className="text-gray-500 font-medium">Booking Status</span>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        details.status === "Confirmed" 
                          ? "bg-emerald-100 text-emerald-800" 
                          : "bg-amber-100 text-amber-800"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${details.status === "Confirmed" ? "bg-emerald-500" : "bg-amber-500"}`} />
                        {details.status || "Confirmed"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="animate-slide-up-delayed flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => navigate("/my-appointments")}
                    className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full font-bold text-sm shadow-md hover:shadow-lg hover:from-emerald-700 hover:to-teal-700 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    View My Appointments
                    <ArrowRight size={16} />
                  </button>
                  <button
                    onClick={() => navigate("/services")}
                    className="px-6 py-3.5 bg-white border border-emerald-200 text-emerald-800 rounded-full font-bold text-sm shadow-sm hover:bg-emerald-50 hover:border-emerald-300 active:scale-95 transition-all cursor-pointer"
                  >
                    Book Another Service
                  </button>
                  <button
                    onClick={() => navigate("/")}
                    className="px-6 py-3.5 bg-gray-50 text-gray-700 border border-gray-200 rounded-full font-bold text-sm hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Home size={15} />
                    Back Home
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= FAILURE STATE ================= */}
          {!loading && success === false && (
            <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-xl border border-red-100 overflow-hidden animate-pop">
              {/* Top accent bar */}
              <div className="h-2 w-full bg-gradient-to-r from-rose-500 to-red-500" />

              <div className="p-8 sm:p-12 text-center">
                {/* Red error icon with animation */}
                <div className="w-20 h-20 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <XCircle className="w-12 h-12 text-rose-600" strokeWidth={1.5} />
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
                  Booking Failed
                </h1>
                <p className="text-gray-500 text-sm sm:text-base mb-6">
                  We could not complete your appointment booking.
                </p>

                {/* Error message card */}
                {details.errorMessage && (
                  <div className="animate-slide-up bg-rose-50/50 border border-rose-100 rounded-2xl p-5 mb-8 text-left flex items-start gap-3">
                    <AlertCircle className="text-rose-600 shrink-0 mt-0.5" size={20} />
                    <div>
                      <h4 className="text-rose-950 font-bold text-sm mb-1">Reason for Failure</h4>
                      <p className="text-rose-800/80 text-sm leading-relaxed">{details.errorMessage}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="animate-slide-up-delayed flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => {
                      if (details.serviceId) {
                        navigate(`/services/${details.serviceId}`);
                      } else {
                        navigate("/services");
                      }
                    }}
                    className="px-6 py-3.5 bg-gradient-to-r from-rose-600 to-red-600 text-white rounded-full font-bold text-sm shadow-md hover:shadow-lg hover:from-rose-700 hover:to-red-700 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RefreshCw size={15} />
                    Retry Booking
                  </button>
                  <button
                    onClick={() => navigate("/services")}
                    className="px-6 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-full font-bold text-sm shadow-sm hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
                  >
                    Back to Services
                  </button>
                  <button
                    onClick={() => navigate("/")}
                    className="px-6 py-3.5 bg-gray-50 text-gray-600 border border-gray-100 rounded-full font-bold text-sm hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Home size={15} />
                    Home
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <FooterPage />
    </div>
  );
}
