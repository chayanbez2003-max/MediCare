import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Clock,
  FileText,
  IndianRupee,
  Send,
  Phone,
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import toast, { Toaster } from "react-hot-toast";

const DEFAULT_HOST = "import.meta.env.VITE_API_URL".replace(/\/$/, "");

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { isSignedIn, getToken } = useAuth();

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");

  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Online");

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const isValidMobile = (m) => /^\d{10}$/.test(m);

  const isValidAge = (a) => {
    if (a === "" || a === null || a === undefined) return false;
    const n = Number(a);
    return Number.isInteger(n) && n > 0 && n < 150;
  };

  function getClientMissingFields() {
    const missing = [];
    if (!customerName || !customerName.trim()) missing.push("Name");
    if (!mobile || !isValidMobile(mobile)) missing.push("Mobile");
    if (!selectedDate) missing.push("Date");
    if (!selectedTime) missing.push("Time");

    if (!isValidAge(age)) missing.push("Age");
    if (!gender || !String(gender).trim()) missing.push("Gender");
    return missing;
  }

  const isFormValid = () => getClientMissingFields().length === 0;

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const endpoints = [
      `${DEFAULT_HOST}/api/services/${encodeURIComponent(id)}`,
    ];

    async function tryFetch() {
      setLoading(true);
      setFetchError(null);

      let lastError = null;
      for (const url of endpoints) {
        try {
          const res = await fetch(url, {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            signal: controller.signal,
          });

          if (res.status === 404) {
            lastError = new Error(`404 ${url}`);
            continue;
          }

          const contentType = res.headers.get("content-type") || "";
          if (!res.ok || !contentType.includes("application/json")) {
            const txt = await res.text().catch(() => "");
            lastError = new Error(
              `Bad response ${res.status} at ${url}: ${String(txt).slice(0, 200)}`,
            );
            continue;
          }

          const json = await res.json().catch(() => null);
          const doc = json?.data ?? json?.service ?? json;

          if (!doc) {
            lastError = new Error(`No service data at ${url}`);
            continue;
          }

          const transformed = transformServiceShape(doc);

          if (!mounted) return;
          setService(transformed);
          if (transformed.dates && transformed.dates.length > 0) {
            setSelectedDate(transformed.dates[0]);
            setSelectedTime("");
          }
          setLoading(false);
          return;
        } catch (err) {
          if (err.name === "AbortError") return;
          lastError = err;
          continue;
        }
      }

      if (!mounted) return;
      setFetchError("Unable to fetch service details from server.");
      setLoading(false);
    }

    tryFetch();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [id]);

  function normalizeToDateString(d) {
    const dt = new Date(d);
    if (isNaN(dt)) return null;
    return dt.toISOString().split("T")[0];
  }

  function sortServiceDates(datesArr) {
    if (!Array.isArray(datesArr)) return [];

    const uniq = Array.from(
      new Set(datesArr.map(normalizeToDateString).filter(Boolean)),
    );

    const parsed = uniq.map((ds) => ({ ds, date: new Date(ds) }));
    const dateVal = (d) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());

    const today = new Date();
    const todayVal = dateVal(today);

    const past = parsed
      .filter((p) => dateVal(p.date) < todayVal)
      .sort((a, b) => dateVal(b.date) - dateVal(a.date)); 

    const future = parsed
      .filter((p) => dateVal(p.date) >= todayVal)
      .sort((a, b) => dateVal(a.date) - dateVal(b.date)); 

    return [...past, ...future].map((p) => p.ds);
  }

  function transformServiceShape(doc) {
    const out = {};
    out.id = doc._id ?? doc.id ?? doc.slug ?? String(doc.name).replace(/\s+/g, "-").toLowerCase();
    out.name = doc.name ?? doc.title ?? "Service";
    out.image = doc.image || doc.imageUrl || doc.imageURL || doc.image_path || null;
    out.price = typeof doc.price === "number" ? doc.price : Number(doc.price) || 0;
    out.about = doc.about ?? doc.description ?? doc.shortDescription ?? "No additional information provided.";
    out.instructions = Array.isArray(doc.instructions) && doc.instructions.length > 0 ? doc.instructions : ["No specific instructions required."];

    let dates = Array.isArray(doc.dates) ? doc.dates.slice() : [];
    let slotsMap = {};
    
    if (doc.slots && !Array.isArray(doc.slots) && typeof doc.slots === "object") {
      slotsMap = { ...doc.slots };
      if (dates.length === 0) dates = Object.keys(slotsMap);
    } else if (Array.isArray(doc.slots)) {
      const arr = doc.slots.slice();
      if (dates.length > 0) {
        dates.forEach((d) => (slotsMap[d] = arr.slice()));
      } else {
        const today = new Date().toISOString().split("T")[0];
        slotsMap[today] = arr.slice();
        dates = [today];
      }
    } else {
      if (dates.length > 0) {
        dates.forEach((d) => (slotsMap[d] = []));
      } else {
        const today = new Date().toISOString().split("T")[0];
        dates = [today];
        slotsMap[today] = [];
      }
    }

    out.dates = sortServiceDates(dates);
    out.slots = slotsMap;
    // ensure even empty dates have empty arrays for mapping avoiding crash
    out.dates.forEach(d => { if(!out.slots[d]) out.slots[d] = []; })
    
    out.imageAlt = doc.imageAlt ?? doc.alt ?? out.name;
    out.raw = doc;
    return out;
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setSubmitError(null);

    const missing = getClientMissingFields();
    if (missing.length > 0) {
      setSubmitError(
        `${missing.join(", ")} ${missing.length > 1 ? "are" : "is"} required`,
      );
      toast.error("Please fill all required fields");
      return;
    }

    if (!service) {
      setSubmitError("Service details not loaded");
      return;
    }

    if (!isSignedIn) {
      toast.error("Please sign in to create a booking.");
      return;
    }

    setSubmitting(true);
    try {
      const token = await getToken().catch(() => null);

      const payload = {
        serviceId: (service?.raw && (service.raw._id || service.raw.id)) || service?.id,
        serviceName: service?.name || "",
        serviceImageUrl: (service?.raw && (service.raw.imageUrl || service.raw.image || service.raw.imageURL || "")) || service?.image || "",
        serviceImagePublicId: (service?.raw && (service.raw.imagePublicId || (service.raw.image && service.raw.image.publicId) || "")) || "",
        patientName: customerName.trim(),
        mobile: mobile.trim(),
        age: age ? Number(age) : undefined,
        gender: gender || "",
        date: selectedDate,
        time: selectedTime,
        fee: service?.price ?? 0,
        fees: service?.price ?? 0,
        paymentMethod: paymentMethod === "Cash" ? "Cash" : "Online",
        email: email || undefined,
        meta: {
          client: "frontend",
          serviceName: service?.name,
        },
      };

      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      } else {
        toast.error("Authentication token not available. Please sign in again.");
        setSubmitting(false);
        return;
      }

      const res = await fetch(`${DEFAULT_HOST}/api/service-appointments`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let json = null;
      try {
        json = JSON.parse(text);
      } catch {
        json = { rawText: text };
      }

      if (!res.ok) {
        const msg = (json && (json.message || json.error || json.rawText)) || `Server returned ${res.status}`;
        setSubmitError(String(msg));
        setSubmitting(false);
        return;
      }

      const { checkoutUrl } = json || {};

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
        return;
      }

      toast.success("Booking created successfully. Redirecting...");
      setTimeout(() => {
        navigate("/appointments", { replace: true });
      }, 700);

    } catch (err) {
      console.error("Booking submit error:", err);
      setSubmitError("Network error while creating booking.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-emerald-50/30 to-white flex items-center justify-center font-serif">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-16 w-16 border-4 border-emerald-300 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
          <h2 className="text-xl text-emerald-800 font-semibold">Loading service details...</h2>
        </div>
      </div>
    );
  }

  if (fetchError || !service) {
    return (
      <div className="min-h-screen bg-linear-to-b from-emerald-50/30 to-white flex items-center justify-center font-serif p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Service Not Found</h2>
          <p className="text-gray-600 mb-6">{fetchError || "We couldn't locate this service."}</p>
          <Link to="/services" className="inline-block px-6 py-3 bg-emerald-600 text-white font-medium rounded-full hover:bg-emerald-700 transition">
            Back to Services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-serif bg-linear-to-br from-teal-50/60 via-slate-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <Toaster />
      <div className="max-w-6xl mx-auto">
        
        {/* Top Navbar */}
        <div className="mb-6">
          <button 
            onClick={() => navigate(-1)} 
            className="inline-flex items-center gap-2 bg-white px-5 py-2.5 rounded-full border border-emerald-100 shadow-sm text-emerald-800 font-medium hover:bg-emerald-50 transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
            Back
          </button>
        </div>

        {/* Main Dual-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ================ LEFT COLUMN ================ */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Service Image Card */}
            <div className="bg-white rounded-[2rem] shadow-sm p-4 border border-emerald-50 overflow-hidden">
              <img
                src={service.image || "https://placehold.co/600x400/e6fffa/047857?text=Service"}
                alt={service.imageAlt}
                className="w-full h-[22rem] lg:h-[26rem] object-cover rounded-[1.5rem]"
              />
            </div>

            {/* Your Details Form Card */}
            <div className="bg-white rounded-[2rem] shadow-sm p-6 sm:p-8 border border-emerald-50">
              <h3 className="text-xl font-bold text-emerald-900 flex items-center gap-2 mb-6">
                <Phone size={22} className="text-emerald-600" />
                Your Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <input
                  required
                  type="text"
                  placeholder="Full Name *"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-2xl border border-emerald-100 bg-emerald-50/30 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition placeholder:text-gray-400"
                />
                
                <input
                  required
                  type="text"
                  placeholder="Mobile (10 digits) *"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                  className={`w-full rounded-2xl border px-4 py-3 focus:outline-none focus:ring-2 transition placeholder:text-gray-400 bg-emerald-50/30 ${
                    mobile && !isValidMobile(mobile) ? "border-red-300 focus:ring-red-300" : "border-emerald-100 focus:ring-emerald-300 focus:border-emerald-400"
                  }`}
                />

                <input
                  required
                  type="number"
                  placeholder="Age *"
                  value={age}
                  min="1"
                  max="150"
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full rounded-2xl border border-emerald-100 bg-emerald-50/30 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition placeholder:text-gray-400"
                />

                <select
                  required
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full rounded-2xl border border-emerald-100 bg-emerald-50/30 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 text-gray-700 transition"
                >
                  <option value="" disabled>Select Gender *</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>

                <input
                  type="email"
                  placeholder="Email (Optional)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full sm:col-span-2 rounded-2xl border border-emerald-100 bg-emerald-50/30 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition placeholder:text-gray-400"
                />
              </div>

              {/* Date Selection */}
              <div className="mb-6">
                <label className="block text-emerald-900 font-bold mb-3">Select Date *</label>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {service.dates.map((d) => (
                    <button
                      key={d}
                      onClick={() => { setSelectedDate(d); setSelectedTime(""); }}
                      className={`shrink-0 px-5 py-2.5 rounded-full border transition font-medium ${
                        selectedDate === d
                          ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-200"
                          : "bg-white border-emerald-200 text-emerald-800 hover:bg-emerald-50"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                  {service.dates.length === 0 && <span className="text-gray-500 italic text-sm">No dates available</span>}
                </div>
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div className="mb-6 animate-fadeIn">
                  <label className="block text-emerald-900 font-bold mb-3">Select Time *</label>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {(service.slots[selectedDate] || []).map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`shrink-0 px-5 py-2.5 rounded-full border transition flex items-center gap-2 font-medium ${
                          selectedTime === time
                            ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-200"
                            : "bg-white border-emerald-200 text-emerald-800 hover:bg-emerald-50"
                        }`}
                      >
                        <Clock size={16} />
                        {time}
                      </button>
                    ))}
                    {(!service.slots[selectedDate] || service.slots[selectedDate].length === 0) && (
                      <span className="text-gray-500 italic text-sm">No time slots available for this date</span>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Method */}
              <div className="mb-8">
                <label className="block text-emerald-900 font-bold mb-3">Payment Method *</label>
                <div className="flex gap-4">
                  <label className={`flex-1 flex justify-center items-center gap-2 py-3 border rounded-2xl cursor-pointer transition select-none ${paymentMethod === 'Cash' ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-500 font-semibold' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    <input type="radio" className="sr-only" checked={paymentMethod === 'Cash'} onChange={() => setPaymentMethod('Cash')} />
                    Cash
                  </label>
                  <label className={`flex-1 flex justify-center items-center gap-2 py-3 border rounded-2xl cursor-pointer transition select-none ${paymentMethod === 'Online' ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-500 font-semibold' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    <input type="radio" className="sr-only" checked={paymentMethod === 'Online'} onChange={() => setPaymentMethod('Online')} />
                    Online
                  </label>
                </div>
              </div>

              {/* Error Message */}
              {submitError && (
                <div className="mb-4 bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-100 text-sm">
                  {submitError}
                </div>
              )}

              {/* Submit Button */}
              <button
                disabled={!isFormValid() || submitting}
                onClick={handleSubmit}
                className={`w-full flex items-center justify-center gap-2 py-4 rounded-full font-bold text-lg shadow-lg transition-all duration-300 ${
                  isFormValid() && !submitting
                    ? "bg-gradient-to-r cursor-pointer from-emerald-500 to-teal-600 text-white hover:shadow-xl hover:from-emerald-600 hover:to-teal-700 active:scale-95"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                }`}
              >
                <Send size={20} />
                {submitting ? "Processing..." : `Book Now • ₹${service.price}`}
              </button>
            </div>
          </div>


          {/* ================ RIGHT COLUMN ================ */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[2rem] shadow-sm p-6 sm:p-10 border border-emerald-50 h-full">
              
              {/* Service Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-emerald-900 mb-8 tracking-tight">
                {service.name}
              </h1>

              {/* About Box */}
              <div className="bg-emerald-50/50 rounded-2xl p-6 sm:p-8 mb-6 border border-emerald-100/60 shadow-inner">
                <h2 className="text-lg font-bold text-emerald-900 flex items-center gap-2 mb-3">
                  <FileText size={20} className="text-emerald-700" /> 
                  About This Service
                </h2>
                <p className="text-emerald-900/80 leading-relaxed">
                  {service.about}
                </p>
              </div>

              {/* Price Pill */}
              <div className="mb-8">
                 <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-900 font-extrabold text-xl px-6 py-2.5 rounded-full border border-emerald-100">
                    <IndianRupee size={22} className="text-emerald-600" strokeWidth={2.5}/>
                    {service.price}
                 </div>
              </div>

              {/* Instructions */}
              <div className="mb-8 pl-1">
                <h3 className="text-lg font-extrabold text-emerald-900 mb-4">
                  Pre-Test Instructions
                </h3>
                <ul className="space-y-2">
                  {service.instructions.map((inst, index) => (
                    <li key={index} className="flex items-start text-emerald-800/80">
                      <span className="text-emerald-500 mr-3 mt-1 text-xl leading-none">•</span>
                      <span>{inst}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Booking Summary */}
              <div className="bg-emerald-50/60 rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-sm mt-10">
                <h3 className="text-xl font-extrabold text-emerald-900 mb-5">
                  Booking Summary
                </h3>
                
                <div className="space-y-4 text-emerald-900/80">
                  <div className="flex items-center">
                    <span className="w-24 font-bold text-emerald-900">Name:</span>
                    <span className={customerName ? "font-medium" : "text-emerald-800/50"}>{customerName || "Not filled"}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-24 font-bold text-emerald-900">Mobile:</span>
                    <span className={mobile ? "font-medium" : "text-emerald-800/50"}>{mobile || "Not filled"}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-24 font-bold text-emerald-900">Age:</span>
                    <span className={age ? "font-medium" : "text-emerald-800/50"}>{age ? `${age} years` : "Not filled"}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-24 font-bold text-emerald-900">Gender:</span>
                    <span className={gender ? "font-medium" : "text-emerald-800/50"}>{gender || "Not filled"}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-24 font-bold text-emerald-900">Date:</span>
                    <span className={selectedDate ? "font-medium" : "text-emerald-800/50"}>{selectedDate || "Not selected"}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-24 font-bold text-emerald-900">Time:</span>
                    <span className={selectedTime ? "font-medium" : "text-emerald-800/50"}>{selectedTime || "Not selected"}</span>
                  </div>
                  <div className="flex items-center mt-2 border-t border-emerald-100/60 pt-4">
                    <span className="w-24 font-bold text-emerald-900">Payment:</span>
                    <span className="font-medium bg-white px-3 py-1 rounded border border-emerald-100 shadow-sm text-sm">{paymentMethod}</span>
                  </div>
                  <div className="flex items-center pt-1">
                    <span className="w-24 font-bold text-emerald-900">Price:</span>
                    <span className="font-bold text-lg text-emerald-700">₹{service.price}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
