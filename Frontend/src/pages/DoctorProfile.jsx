import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser, useClerk, useAuth, SignInButton } from '@clerk/clerk-react';
import Navbar from '../components/Navbar';
import FooterPage from '../components/FooterPage';

/* ─────────────────────────────────────────────────────────────
   SMALL HELPER COMPONENTS
───────────────────────────────────────────────────────────── */

const StatTile = ({ icon, label, value, colorClass }) => (
  <div className="flex flex-col items-center gap-2 p-4 sm:p-5 rounded-2xl bg-white/70 border border-emerald-100 shadow-sm hover:shadow-md transition-shadow duration-300">
    <span className={`text-2xl sm:text-3xl ${colorClass}`}>{icon}</span>
    <p className="text-xl sm:text-2xl font-bold text-gray-800">{value || '—'}</p>
    <p className="text-xs sm:text-sm text-gray-500 font-medium text-center">{label}</p>
  </div>
);

const InfoRow = ({ icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-base">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-0.5">{label}</p>
        <p className="text-sm sm:text-base text-gray-800 font-medium leading-snug">{value}</p>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   DATE HELPERS
───────────────────────────────────────────────────────────── */
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Build next 14 selectable dates starting from today */
function buildUpcomingDates() {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push({
      iso: d.toISOString().split('T')[0],          // "YYYY-MM-DD"
      day: DAY_NAMES[d.getDay()],
      date: d.getDate(),
      month: MONTH_SHORT[d.getMonth()],
      fullDay: DAY_NAMES[d.getDay()],
    });
  }
  return dates;
}

// Fallback mapping: abbreviated day → full day name
const SHORT_TO_FULL = {
  Sun: 'Sunday', Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday',
  Thur: 'Thursday', Fri: 'Friday', Sat: 'Saturday',
};

/** Convert doctor schedule Map to flat time-slot strings for a given day-name */
function getSlotsForDay(schedule, dayName) {
  if (!schedule) return [];
  // Try short key first (canonical), then full name, then lowercase variants
  const daySlots = schedule[dayName]
    || schedule[SHORT_TO_FULL[dayName] || '']
    || schedule[dayName.toLowerCase()]
    || [];
  const result = [];
  daySlots.forEach(({ startTime, endTime }) => {
    if (startTime) result.push(startTime);
    if (endTime && endTime !== startTime) result.push(endTime);
  });
  return result;
}

/* ─────────────────────────────────────────────────────────────
   SECTION TITLE
───────────────────────────────────────────────────────────── */
const SectionTitle = ({ children }) => (
  <h3 className="text-sm font-bold text-gray-600 uppercase tracking-widest mb-3 flex items-center gap-2">
    <span className="w-1 h-4 rounded-full bg-gradient-to-b from-emerald-400 to-teal-500 inline-block" />
    {children}
  </h3>
);

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isSignedIn } = useUser();
  const { openSignIn } = useClerk();
  const { getToken } = useAuth();

  /* ── doctor data ── */
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ── booking state ── */
  const [selectedDate, setSelectedDate] = useState(null);   // { iso, day, date, month }
  const [selectedTime, setSelectedTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [patientDetails, setPatientDetails] = useState({
    fullName: '',
    age: '',
    mobile: '',
    gender: '',
    email: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingError, setBookingError]  = useState(null);

  const upcomingDates = useMemo(() => buildUpcomingDates(), []);

  /* ── fetch doctor ── */
  useEffect(() => {
    if (!id) return;
    window.scrollTo(0, 0);

    const fetchDoctor = async () => {
      try {
        setLoading(true);
        setError(null);
        const res  = await fetch(`http://localhost:4000/api/doctors/${id}`);
        const json = await res.json();

        if (json.success && json.data) {
          setDoctor(json.data);
        } else {
          // fallback: fetch all → find by id
          const fallback = await fetch('http://localhost:4000/api/doctors');
          const all = await fallback.json();
          if (all.success) {
            const found = all.data.find((d) => (d._id || d.id) === id);
            found ? setDoctor(found) : setError('Doctor not found.');
          } else {
            setError('Failed to load doctor profile.');
          }
        }
      } catch (err) {
        console.error(err);
        setError('Unable to reach the server. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  /* ── pre-fill name/email from Clerk user ── */
  useEffect(() => {
    if (isSignedIn && user) {
      setPatientDetails((prev) => ({
        ...prev,
        fullName: prev.fullName || user.fullName || '',
        email:    prev.email    || user.primaryEmailAddress?.emailAddress || '',
      }));
    }
  }, [isSignedIn, user]);

  /* ── derived values ── */
  const isAvailable   = doctor?.availability === 'Available';
  const imgSrc        = doctor?.imageUrl || 'https://placehold.co/400x400/e6fffa/047857?text=Doctor';
  const availableSlots = useMemo(() => {
    if (!selectedDate || !doctor?.schedule) return [];
    return getSlotsForDay(doctor.schedule, selectedDate.fullDay);
  }, [selectedDate, doctor]);

  /* ── form helpers ── */
  const handleInput = (field) => (e) =>
    setPatientDetails((p) => ({ ...p, [field]: e.target.value }));

  const validateForm = () => {
    const errs = {};
    if (!patientDetails.fullName.trim())       errs.fullName = 'Name is required';
    if (!patientDetails.mobile.trim())          errs.mobile = 'Mobile is required';
    else if (!/^\d{10}$/.test(patientDetails.mobile.trim())) errs.mobile = 'Enter a valid 10-digit number';
    if (!patientDetails.age || patientDetails.age < 1)       errs.age = 'Enter a valid age';
    if (!patientDetails.gender)                errs.gender = 'Select a gender';
    if (!selectedDate)                         errs.date = 'Select a date';
    if (!selectedTime)                         errs.time = 'Select a time slot';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ── confirm booking ── */
  const handleConfirmBooking = async (e) => {
    e?.preventDefault?.();
    setBookingError(null);
    setBookingSuccess(null);

    if (!isSignedIn) {
      openSignIn();
      return;
    }

    if (!validateForm()) return;

    setBookingLoading(true);
    try {
      const payload = {
        doctorId:      id,
        patientName:   patientDetails.fullName.trim(),
        mobile:        patientDetails.mobile.trim(),
        age:           Number(patientDetails.age),
        gender:        patientDetails.gender,
        email:         patientDetails.email.trim(),
        date:          selectedDate.iso,
        time:          selectedTime,
        fee:           doctor?.fee ?? 0,
        fees:          doctor?.fee ?? 0,
        paymentMethod,
        doctorName:    doctor?.name,
        speciality:    doctor?.specialization,
        doctorImageUrl: doctor?.imageUrl || '',
      };

      const token  = await getToken();
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res  = await fetch('http://localhost:4000/api/appointments', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (json.success) {
        setBookingSuccess(json);
        // If online payment → redirect to Stripe
        if (json.checkoutUrl) {
          window.location.href = json.checkoutUrl;
        }
      } else {
        setBookingError(json.message || 'Booking failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setBookingError('Network error. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  /* ── is form complete? (for button disable) ── */
  const isFormComplete =
    patientDetails.fullName.trim() &&
    /^\d{10}$/.test(patientDetails.mobile.trim()) &&
    patientDetails.age &&
    patientDetails.gender &&
    selectedDate &&
    selectedTime;

  const handleBack = () => { navigate('/doctors'); window.scrollTo(0, 0); };

  /* ════════ LOADING ════════ */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-10 animate-pulse space-y-6">
          <div className="w-24 h-8 bg-emerald-100 rounded-full" />
          <div className="bg-white rounded-3xl shadow-xl p-8 space-y-5">
            <div className="flex gap-6">
              <div className="w-36 h-36 bg-emerald-100 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-3 pt-2">
                <div className="h-7 bg-emerald-100 rounded w-2/3" />
                <div className="h-5 bg-emerald-100 rounded w-1/3" />
                <div className="h-4 bg-emerald-100 rounded w-1/2" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[1,2,3].map(i => <div key={i} className="h-24 bg-emerald-50 rounded-2xl" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ════════ ERROR ════════ */
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-10 text-center">
          <button onClick={handleBack} className="inline-flex items-center gap-2 mb-8 text-emerald-700 font-semibold">← Back</button>
          <div className="bg-white rounded-3xl shadow-lg p-10">
            <p className="text-lg font-semibold text-gray-700 mb-4">{error}</p>
            <button onClick={handleBack} className="px-6 py-2.5 bg-emerald-600 text-white rounded-full font-semibold hover:bg-emerald-700">
              Go back to Doctors
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ════════ MAIN RENDER ════════ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 relative overflow-hidden">
      {/* Blobs */}
      <div aria-hidden className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-40" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-32 w-96 h-96 bg-teal-100 rounded-full blur-3xl opacity-40" />

      {/* Animation styles */}
      <style>{`
        @keyframes profFadeUp {
          from { opacity:0; transform:translateY(22px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .pa  { animation: profFadeUp 0.5s ease-out both; }
        .pa1 { animation: profFadeUp 0.5s 0.08s ease-out both; }
        .pa2 { animation: profFadeUp 0.5s 0.16s ease-out both; }
        .pa3 { animation: profFadeUp 0.5s 0.24s ease-out both; }
        .slot-btn { transition: all 0.18s ease; }
        .slot-btn:hover:not(:disabled):not(.selected) {
          background: #ecfdf5; border-color: #6ee7b7;
        }
        .date-card { transition: all 0.18s ease; cursor: pointer; }
        .date-card:hover { border-color: #6ee7b7; background: #ecfdf5; }
      `}</style>

      <Navbar />

      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 font-serif">

        {/* Back button */}
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full text-sm font-semibold text-emerald-700 bg-white border border-emerald-200 shadow-sm hover:bg-emerald-50 hover:shadow-md active:scale-95 transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Doctors
        </button>

        {/* ══════════════════════════════════════
            PROFILE CARD
        ══════════════════════════════════════ */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-emerald-100 overflow-hidden pa mb-8">
          <div className="h-2 w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500" />
          <div className="p-6 sm:p-8 md:p-10">

            {/* Top: image + info */}
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-center sm:items-start mb-8">
              <div className="relative flex-shrink-0">
                <img
                  src={imgSrc}
                  alt={doctor?.name}
                  onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x400/e6fffa/047857?text=Doctor'; }}
                  className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full object-cover object-top border-4 border-emerald-200 shadow-lg"
                />
                <span className={`absolute bottom-2 right-2 w-4 h-4 rounded-full border-2 border-white shadow-md ${isAvailable ? 'bg-emerald-500' : 'bg-red-400'}`} />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{doctor?.name}</h1>
                <span className="inline-block text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-0.5 rounded-full mb-4">
                  {doctor?.specialization || 'General Practitioner'}
                </span>
                <div className="space-y-3 mt-1">
                  <InfoRow icon="🎓" label="Qualifications" value={doctor?.qualifications} />
                  <InfoRow icon="📍" label="Location"       value={doctor?.location} />
                  <InfoRow icon="💳" label="Consultant Fee" value={doctor?.fee ? `₹${doctor.fee} per visit` : null} />
                  <InfoRow
                    icon="🗓" label="Availability"
                    value={isAvailable
                      ? `Available${doctor?.schedule && Object.keys(doctor.schedule).length ? ' — ' + Object.keys(doctor.schedule).join(', ') : ''}`
                      : 'Currently Unavailable'}
                  />
                </div>
                <div className="mt-4 flex justify-center sm:justify-start">
                  <span className={`inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-full border ${isAvailable ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-red-50 text-red-600 border-red-200'}`}>
                    <span className={`w-2 h-2 rounded-full animate-pulse ${isAvailable ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    {isAvailable ? 'Available for Consultation' : 'Not Available'}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="border-t border-emerald-100 mb-8" />
            <div className="grid grid-cols-3 gap-3 sm:gap-5 mb-8 pa1">
              <StatTile icon="⭐" label="Success Rate"     value={doctor?.success ? `${doctor.success}%` : doctor?.rating ? `${doctor.rating * 10}%` : '—'} colorClass="text-yellow-500" />
              <StatTile icon="🏥" label="Experience"       value={doctor?.experience || '—'}  colorClass="text-emerald-600" />
              <StatTile icon="👨‍⚕️" label="Patients Treated" value={doctor?.patients ? `${doctor.patients}+` : '—'} colorClass="text-blue-500" />
            </div>

            {/* About */}
            <div className="border-t border-emerald-100 mb-8" />
            <div className="pa2">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-gradient-to-b from-emerald-400 to-teal-500 inline-block" />
                About
              </h2>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                {doctor?.about || `${doctor?.name} is a highly experienced ${doctor?.specialization || 'medical professional'}${doctor?.experience ? ` with ${doctor.experience} of practice` : ''}, dedicated to providing patient-centered care and evidence-based treatment. ${doctor?.qualifications ? `Holding ${doctor.qualifications}, they` : 'They'} bring expertise and compassion to every consultation${doctor?.location ? `, serving patients in ${doctor.location}` : ''}.`}
              </p>
            </div>

          </div>
        </div>

        {/* ══════════════════════════════════════
            BOOKING SECTION
        ══════════════════════════════════════ */}
        {bookingSuccess && !bookingSuccess.checkoutUrl ? (
          /* ── SUCCESS BANNER ── */
          <div className="bg-white rounded-3xl shadow-xl border border-emerald-200 p-8 sm:p-10 text-center pa3 mb-8">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-emerald-700 mb-2">Appointment Booked!</h2>
            <p className="text-gray-600 mb-1">
              <span className="font-semibold">{patientDetails.fullName}</span> — {selectedDate?.day}, {selectedDate?.date} {selectedDate?.month}
            </p>
            <p className="text-gray-600 mb-6">🕐 {selectedTime} &nbsp;|&nbsp; 💳 {paymentMethod}</p>
            <button
              onClick={() => { setBookingSuccess(null); setSelectedDate(null); setSelectedTime(''); setPatientDetails({ fullName: '', age: '', mobile: '', gender: '', email: '' }); }}
              className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              Book Another Appointment
            </button>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-emerald-100 overflow-hidden pa3">
            <div className="h-2 w-full bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-500" />
            <div className="p-6 sm:p-8 md:p-10">

              {/* Section heading */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Book Your Appointment</h2>
                  <p className="text-sm text-gray-500">Fill in the details below to confirm your slot</p>
                </div>
              </div>

              {/* ── 2-column grid ── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* ════ LEFT COLUMN ════ */}
                <div className="space-y-8">

                  {/* 1. Select Date */}
                  <div>
                    <SectionTitle>📅 Select Date</SectionTitle>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                      {upcomingDates.map((d) => {
                        const isSelected = selectedDate?.iso === d.iso;
                        return (
                          <button
                            key={d.iso}
                            onClick={() => { setSelectedDate(d); setSelectedTime(''); setFormErrors((e) => ({ ...e, date: undefined })); }}
                            className={`date-card flex-shrink-0 flex flex-col items-center px-4 py-3 rounded-2xl border-2 text-center min-w-[64px] ${
                              isSelected
                                ? 'bg-gradient-to-br from-emerald-500 to-teal-500 border-emerald-500 text-white shadow-lg scale-105'
                                : 'border-gray-200 bg-white text-gray-700'
                            }`}
                          >
                            <span className={`text-xs font-semibold uppercase tracking-wider ${isSelected ? 'text-emerald-100' : 'text-gray-400'}`}>{d.day}</span>
                            <span className="text-2xl font-bold leading-tight my-0.5">{d.date}</span>
                            <span className={`text-xs font-medium ${isSelected ? 'text-emerald-100' : 'text-gray-400'}`}>{d.month}</span>
                          </button>
                        );
                      })}
                    </div>
                    {formErrors.date && <p className="text-xs text-red-500 mt-1.5">{formErrors.date}</p>}
                  </div>

                  {/* 2. Patient Details */}
                  <div>
                    <SectionTitle>👤 Patient Details</SectionTitle>
                    <div className="space-y-4">

                      {/* Full Name */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Full Name *</label>
                        <input
                          id="patient-fullname"
                          type="text"
                          placeholder="Enter full name"
                          value={patientDetails.fullName}
                          onChange={handleInput('fullName')}
                          className={`w-full px-4 py-3 rounded-xl border text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${formErrors.fullName ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-emerald-200 focus:border-emerald-400'}`}
                        />
                        {formErrors.fullName && <p className="text-xs text-red-500 mt-1">{formErrors.fullName}</p>}
                      </div>

                      {/* Age + Gender */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Age *</label>
                          <input
                            id="patient-age"
                            type="number"
                            min="1"
                            max="120"
                            placeholder="Age"
                            value={patientDetails.age}
                            onChange={handleInput('age')}
                            className={`w-full px-4 py-3 rounded-xl border text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${formErrors.age ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-emerald-200 focus:border-emerald-400'}`}
                          />
                          {formErrors.age && <p className="text-xs text-red-500 mt-1">{formErrors.age}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Gender *</label>
                          <select
                            id="patient-gender"
                            value={patientDetails.gender}
                            onChange={handleInput('gender')}
                            className={`w-full px-4 py-3 rounded-xl border text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${formErrors.gender ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-emerald-200 focus:border-emerald-400'}`}
                          >
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                          {formErrors.gender && <p className="text-xs text-red-500 mt-1">{formErrors.gender}</p>}
                        </div>
                      </div>

                      {/* Mobile */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Mobile Number *</label>
                        <input
                          id="patient-mobile"
                          type="tel"
                          placeholder="10-digit mobile number"
                          maxLength={10}
                          value={patientDetails.mobile}
                          onChange={handleInput('mobile')}
                          className={`w-full px-4 py-3 rounded-xl border text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${formErrors.mobile ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-emerald-200 focus:border-emerald-400'}`}
                        />
                        {formErrors.mobile && <p className="text-xs text-red-500 mt-1">{formErrors.mobile}</p>}
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                        <input
                          id="patient-email"
                          type="email"
                          placeholder="Email address (optional)"
                          value={patientDetails.email}
                          onChange={handleInput('email')}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition-all"
                        />
                      </div>

                    </div>
                  </div>
                </div>

                {/* ════ RIGHT COLUMN ════ */}
                <div className="space-y-8">

                  {/* 3. Time Slots */}
                  <div>
                    <SectionTitle>🕐 Available Time Slots</SectionTitle>
                    {!selectedDate ? (
                      <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-50 border border-dashed border-gray-200 rounded-2xl px-4 py-6 justify-center">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Please select a date first
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <div className="text-sm text-gray-500 bg-gray-50 border border-dashed border-gray-200 rounded-2xl px-4 py-6 text-center">
                        No time slots available for this date.
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {availableSlots.map((slot) => {
                          const isSel = selectedTime === slot;
                          return (
                            <button
                              key={slot}
                              onClick={() => { setSelectedTime(slot); setFormErrors((e) => ({ ...e, time: undefined })); }}
                              className={`slot-btn px-4 py-2 rounded-xl border-2 text-sm font-semibold ${
                                isSel
                                  ? 'selected bg-gradient-to-br from-emerald-500 to-teal-500 border-emerald-500 text-white shadow-md'
                                  : 'border-gray-200 text-gray-700 bg-white'
                              }`}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {formErrors.time && <p className="text-xs text-red-500 mt-1.5">{formErrors.time}</p>}
                  </div>

                  {/* 4. Booking Summary */}
                  <div>
                    <SectionTitle>📋 Booking Summary</SectionTitle>
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-4 space-y-3">
                      {[
                        { label: 'Doctor',         value: doctor?.name },
                        { label: 'Specialization', value: doctor?.specialization || 'General Practitioner' },
                        { label: 'Date',           value: selectedDate ? `${selectedDate.day}, ${selectedDate.date} ${selectedDate.month}` : '—' },
                        { label: 'Time',           value: selectedTime || '—' },
                        { label: 'Fee',            value: doctor?.fee ? `₹${doctor.fee}` : 'Free' },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 font-medium">{label}</span>
                          <span className="font-semibold text-gray-800 text-right max-w-[60%]">{value}</span>
                        </div>
                      ))}
                      <div className="border-t border-emerald-200 pt-3">
                        <div className="flex items-center justify-between text-sm font-bold">
                          <span className="text-gray-700">Total</span>
                          <span className="text-emerald-700 text-base">{doctor?.fee ? `₹${doctor.fee}` : 'Free'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 5. Payment Method */}
                  <div>
                    <SectionTitle>💳 Payment Method</SectionTitle>
                    <div className="flex gap-3">
                      {['Cash', 'Online'].map((method) => {
                        const isSel = paymentMethod === method;
                        return (
                          <button
                            key={method}
                            id={`payment-${method.toLowerCase()}`}
                            onClick={() => setPaymentMethod(method)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${
                              isSel
                                ? 'bg-gradient-to-br from-emerald-500 to-teal-500 border-emerald-500 text-white shadow-md'
                                : 'border-gray-200 text-gray-600 bg-white hover:border-emerald-300 hover:bg-emerald-50'
                            }`}
                          >
                            {method === 'Cash' ? '💵' : '🌐'} {method}
                          </button>
                        );
                      })}
                    </div>
                    {paymentMethod === 'Online' && (
                      <p className="text-xs text-gray-400 mt-2 text-center">You'll be redirected to Stripe to complete payment securely.</p>
                    )}
                  </div>

                  {/* Booking Error Banner */}
                  {bookingError && (
                    <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-700">
                      <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {bookingError}
                    </div>
                  )}

                  {/* 6. Confirm Button */}
                  {isSignedIn ? (
                    <button
                      id="confirm-booking-btn"
                      type="button"
                      onClick={handleConfirmBooking}
                      disabled={!isFormComplete || bookingLoading}
                      className={`w-full py-4 rounded-2xl font-bold text-base shadow-lg transition-all duration-300 flex items-center justify-center gap-3 ${
                        isFormComplete && !bookingLoading
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 hover:shadow-xl active:scale-[0.98]'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {bookingLoading ? (
                        <>
                          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          Processing…
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Confirm Booking
                          {doctor?.fee ? ` — ₹${doctor.fee}` : ''}
                        </>
                      )}
                    </button>
                  ) : (
                    <SignInButton mode="modal">
                      <button
                        id="sign-in-to-book-btn"
                        className="w-full py-4 rounded-2xl font-bold text-base bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-teal-600 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14" />
                        </svg>
                        Sign In to Book Appointment
                      </button>
                    </SignInButton>
                  )}

                </div>{/* end right column */}
              </div>{/* end 2-col grid */}
            </div>
          </div>
        )}

      </main>
      
      <FooterPage />
    </div>
  );
};

export default DoctorProfile;
