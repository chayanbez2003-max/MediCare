import React, { useState, useRef } from 'react'
import {
  User, Mail, Lock, Eye, EyeOff, MapPin, Briefcase,
  GraduationCap, DollarSign, Star, Percent, Clock,
  Plus, Trash2, CheckCircle, X, Upload, ChevronDown, ToggleLeft,
} from 'lucide-react'

const DAYS = ['Mon','Tue','Wed','Thur','Fri','Sat','Sun']

const API_BASE = 'http://localhost:4000'

// ─── Specialization options ───────────────────────────────────────────────────
const SPECIALIZATIONS = [
  'General Physician', 'Cardiologist', 'Dermatologist', 'Neurologist',
  'Orthopedic', 'Pediatrician', 'Gynecologist', 'Ophthalmologist',
  'ENT Specialist', 'Psychiatrist', 'Urologist', 'Gastroenterologist',
  'Pulmonologist', 'Diabetologist', 'Oncologist', 'Other',
]

// ─── Reusable Field Wrapper ───────────────────────────────────────────────────
function Field({ label, icon, required, children, error }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
        {icon && <span className="text-emerald-500">{icon}</span>}
        {label} {required && <span className="text-rose-400">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-rose-500 mt-0.5">{error}</p>}
    </div>
  )
}

// ─── Input styles ─────────────────────────────────────────────────────────────
const inputCls = (err) =>
  `w-full px-4 py-2.5 rounded-xl border text-sm text-slate-700 placeholder-slate-400 outline-none transition
   focus:ring-2 focus:ring-emerald-200 ${err ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white hover:border-emerald-300'}`

// ─── Toast Component ──────────────────────────────────────────────────────────
function Toast({ doctor, onClose }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-[slideUp_0.35s_ease]">
      <div className="bg-white rounded-2xl shadow-2xl border border-emerald-100 p-4 flex items-center gap-4 max-w-sm w-full">
        <div className="relative flex-shrink-0">
          {doctor.previewUrl ? (
            <img src={doctor.previewUrl} alt={doctor.name} className="w-14 h-14 rounded-full object-cover border-2 border-emerald-200" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
              <User size={24} className="text-emerald-500" />
            </div>
          )}
          <span className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5">
            <CheckCircle size={12} className="text-white" />
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide">Doctor Added!</p>
          <p className="text-sm font-bold text-slate-800 truncate">{doctor.name}</p>
          <p className="text-xs text-slate-500 truncate">{doctor.specialization}</p>
          {doctor.experience && (
            <p className="text-xs text-slate-400">{doctor.experience} yrs experience</p>
          )}
        </div>
        <button onClick={onClose} className="flex-shrink-0 p-1 rounded-full hover:bg-slate-100 transition">
          <X size={16} className="text-slate-400" />
        </button>
      </div>
    </div>
  )
}

// ─── Initial form state ───────────────────────────────────────────────────────
const INITIAL = {
  name: '', specialization: '', location: '', experience: '',
  qualifications: '', fee: '', rating: '', success: '',
  email: '', password: '', availability: 'Available', about: '',
}

// Default empty schedule entry
const emptySchedule = () => ({ day: 'Mon', startTime: '', endTime: '' })

// ─── Main Component ───────────────────────────────────────────────────────────
const AddPage = () => {
  const [form, setForm]         = useState(INITIAL)
  const [errors, setErrors]     = useState({})
  const [showPwd, setShowPwd]   = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  // schedule: array of { day, startTime, endTime }
  const [schedule, setSchedule] = useState([emptySchedule()])
  const [loading, setLoading]   = useState(false)
  const [toast, setToast]       = useState(null)
  const fileRef = useRef(null)

  // ── Handlers ────────────────────────────────────────────────────────────────
  const set = (k) => (e) => {
    setForm((p) => ({ ...p, [k]: e.target.value }))
    setErrors((p) => ({ ...p, [k]: undefined }))
  }

  const handleImage = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setImageFile(null)
    setPreviewUrl(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  // schedule helpers
  const addScheduleRow    = () => setSchedule((p) => [...p, emptySchedule()])
  const removeScheduleRow = (i) => setSchedule((p) => p.filter((_, idx) => idx !== i))
  const updateScheduleRow = (i, k, v) =>
    setSchedule((p) => p.map((s, idx) => idx === i ? { ...s, [k]: v } : s))

  // ── Validation ───────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {}
    if (!form.name.trim())           e.name = 'Name is required'
    if (!form.specialization)        e.specialization = 'Please select a specialization'
    if (!form.email.trim())          e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password)              e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters'
    if (form.fee && isNaN(Number(form.fee)))   e.fee = 'Must be a number'
    if (form.rating && (Number(form.rating) < 1 || Number(form.rating) > 5)) e.rating = 'Rating must be 1–5'
    if (form.success && (Number(form.success) < 0 || Number(form.success) > 100)) e.success = 'Must be 0–100'
    // Validate schedule: endTime must be after startTime
    schedule.forEach((row, i) => {
      if (row.startTime && row.endTime && row.endTime <= row.startTime)
        e[`slot_${i}`] = 'End time must be after start time'
    })
    // If available, require at least one fully-filled slot
    if (form.availability === 'Available') {
      const hasSlot = schedule.some((r) => r.startTime && r.endTime)
      if (!hasSlot) e.schedule = 'Add at least one time slot for an available doctor'
    }
    return e
  }

  // ── Build schedule: { Mon: [{startTime, endTime}], … } ───────────────────
  const buildSchedule = () => {
    const sched = {}
    schedule.forEach(({ day, startTime, endTime }) => {
      if (day && startTime && endTime) {
        if (!sched[day]) sched[day] = []
        sched[day].push({ startTime, endTime })
      }
    })
    return sched
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v) })
      fd.append('schedule', JSON.stringify(buildSchedule()))
      if (imageFile) fd.append('image', imageFile)

      const token = localStorage.getItem('adminToken') || ''
      const res = await fetch(`${API_BASE}/api/doctors`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || 'Failed to add doctor')

      // success
      const toastData = {
        name: form.name,
        specialization: form.specialization,
        experience: form.experience,
        previewUrl,
      }
      setForm(INITIAL)
      setImageFile(null)
      setPreviewUrl(null)
      setSchedule([emptySchedule()])
      setErrors({})
      if (fileRef.current) fileRef.current.value = ''

      setToast(toastData)
      setTimeout(() => setToast(null), 5000)
    } catch (err) {
      setErrors({ submit: err.message || 'Something went wrong, please try again.' })
    } finally {
      setLoading(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen font-sans bg-gradient-to-br from-emerald-50 via-white to-green-50 py-10 px-4">
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(24px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500 shadow-lg mb-4">
            <User size={26} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800">Add New Doctor</h1>
          <p className="text-slate-500 mt-1 text-sm">Fill in the details below to onboard a new doctor</p>
        </div>

        {/* Card */}
        <form onSubmit={handleSubmit} noValidate className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-10 space-y-8">

          {/* ── Section: Profile Image ── */}
          <section>
            <h2 className="text-base font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <Upload size={16} className="text-emerald-500" /> Profile Picture
            </h2>
            <div className="flex items-center gap-5">
              <div className="relative w-24 h-24 rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                {previewUrl ? (
                  <>
                    <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={removeImage}
                      className="absolute top-1 right-1 bg-rose-500 rounded-full p-0.5 hover:bg-rose-600 transition">
                      <X size={12} className="text-white" />
                    </button>
                  </>
                ) : (
                  <User size={32} className="text-emerald-300" />
                )}
              </div>
              <div>
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition shadow-sm">
                  {previewUrl ? 'Change Photo' : 'Upload Photo'}
                </button>
                <p className="text-xs text-slate-400 mt-2">JPG, PNG or WEBP. Max 5MB.</p>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
              </div>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* ── Section: Basic Info ── */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <h2 className="text-base font-semibold text-slate-700 sm:col-span-2 flex items-center gap-2">
              <User size={16} className="text-emerald-500" /> Basic Information
            </h2>

            <Field label="Full Name" icon={<User size={14} />} required error={errors.name}>
              <input value={form.name} onChange={set('name')} placeholder="Dr. Jane Smith"
                className={inputCls(errors.name)} />
            </Field>

            <Field label="Specialization" icon={<Briefcase size={14} />} required error={errors.specialization}>
              <div className="relative">
                <select value={form.specialization} onChange={set('specialization')}
                  className={`${inputCls(errors.specialization)} appearance-none pr-10`}>
                  <option value="">Select specialization…</option>
                  {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
              </div>
            </Field>

            <Field label="Location / Hospital" icon={<MapPin size={14} />} error={errors.location}>
              <input value={form.location} onChange={set('location')} placeholder="City, Hospital name"
                className={inputCls(errors.location)} />
            </Field>

            <Field label="Experience (years)" icon={<Briefcase size={14} />} error={errors.experience}>
              <input type="number" min="0" value={form.experience} onChange={set('experience')}
                placeholder="e.g. 8" className={inputCls(errors.experience)} />
            </Field>

            <Field label="Qualifications" icon={<GraduationCap size={14} />} error={errors.qualifications}>
              <input value={form.qualifications} onChange={set('qualifications')}
                placeholder="MBBS, MD, FRCS…" className={inputCls(errors.qualifications)} />
            </Field>

            <Field label="Consultation Fee (₹)" icon={<DollarSign size={14} />} error={errors.fee}>
              <input type="number" min="0" value={form.fee} onChange={set('fee')}
                placeholder="e.g. 500" className={inputCls(errors.fee)} />
            </Field>

            <Field label="Rating (1–5)" icon={<Star size={14} />} error={errors.rating}>
              <input type="number" min="1" max="5" step="0.1" value={form.rating} onChange={set('rating')}
                placeholder="e.g. 4.5" className={inputCls(errors.rating)} />
            </Field>

            <Field label="Patient Success Rate (%)" icon={<Percent size={14} />} error={errors.success}>
              <input type="number" min="0" max="100" value={form.success} onChange={set('success')}
                placeholder="e.g. 95" className={inputCls(errors.success)} />
            </Field>

            <Field label="Availability" icon={<ToggleLeft size={14} />} error={errors.availability}>
              <div className="relative">
                <select value={form.availability} onChange={set('availability')}
                  className={`${inputCls(errors.availability)} appearance-none pr-10`}>
                  <option value="Available">✅ Available</option>
                  <option value="Unavailable">🔴 Unavailable</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
              </div>
            </Field>
          </section>

          <hr className="border-slate-100" />

          {/* ── Section: Credentials ── */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <h2 className="text-base font-semibold text-slate-700 sm:col-span-2 flex items-center gap-2">
              <Mail size={16} className="text-emerald-500" /> Login Credentials
            </h2>

            <Field label="Doctor Email" icon={<Mail size={14} />} required error={errors.email}>
              <input type="email" value={form.email} onChange={set('email')}
                placeholder="doctor@example.com" className={inputCls(errors.email)} />
            </Field>

            <Field label="Password" icon={<Lock size={14} />} required error={errors.password}>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={set('password')}
                  placeholder="Min. 6 characters" className={`${inputCls(errors.password)} pr-11`} />
                <button type="button" onClick={() => setShowPwd((p) => !p)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-emerald-500 transition">
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </Field>
          </section>

          <hr className="border-slate-100" />

          {/* ── Section: About ── */}
          <section>
            <h2 className="text-base font-semibold text-slate-700 mb-4">About Doctor</h2>
            <textarea value={form.about} onChange={set('about')} rows={4}
              placeholder="A short bio about the doctor — expertise, approach, achievements…"
              className={`${inputCls(false)} resize-none`} />
          </section>

          <hr className="border-slate-100" />

          {/* ── Section: Doctor Schedule ── */}
          <section>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-semibold text-slate-700 flex items-center gap-2">
                <Clock size={16} className="text-emerald-500" /> Doctor Schedule
              </h2>
              <button type="button" onClick={addScheduleRow}
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition">
                <Plus size={14} /> Add Slot
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">Set which days and time windows the doctor is available.</p>

            {errors.schedule && (
              <p className="text-xs text-rose-500 mb-3">{errors.schedule}</p>
            )}

            <div className="space-y-3">
              {schedule.map((row, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex items-center gap-3">
                    {/* Day picker */}
                    <div className="relative flex-1">
                      <select value={row.day}
                        onChange={(e) => updateScheduleRow(i, 'day', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-200 transition appearance-none pr-8">
                        {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-2 top-2.5 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Start time */}
                    <div className="flex-1">
                      <input type="time" value={row.startTime}
                        onChange={(e) => updateScheduleRow(i, 'startTime', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-200 transition" />
                      <p className="text-xs text-slate-400 mt-0.5 pl-1">Start</p>
                    </div>

                    {/* End time */}
                    <div className="flex-1">
                      <input type="time" value={row.endTime}
                        onChange={(e) => updateScheduleRow(i, 'endTime', e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border bg-white text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-200 transition
                          ${errors[`slot_${i}`] ? 'border-rose-300' : 'border-slate-200'}`} />
                      <p className="text-xs text-slate-400 mt-0.5 pl-1">End</p>
                    </div>

                    {/* Remove */}
                    {schedule.length > 1 && (
                      <button type="button" onClick={() => removeScheduleRow(i)}
                        className="p-2 rounded-lg bg-rose-50 border border-rose-100 text-rose-400 hover:bg-rose-100 transition self-start mt-0.5">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                  {errors[`slot_${i}`] && (
                    <p className="text-xs text-rose-500 pl-1">{errors[`slot_${i}`]}</p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ── Submit error ── */}
          {errors.submit && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
              <X size={16} className="flex-shrink-0" /> {errors.submit}
            </div>
          )}

          {/* ── Submit Button ── */}
          <button type="submit" disabled={loading}
            className={`w-full py-3.5 rounded-2xl text-white font-semibold text-base shadow-lg transition-all
              ${loading
                ? 'bg-emerald-300 cursor-not-allowed'
                : 'bg-emerald-500 hover:bg-emerald-600 hover:shadow-emerald-200 hover:shadow-xl active:scale-[0.99]'
              }`}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Adding Doctor…
              </span>
            ) : (
              'Add Doctor to the Team'
            )}
          </button>

        </form>
      </div>

      {/* ── Toast ── */}
      {toast && <Toast doctor={toast} onClose={() => setToast(null)} />}
    </div>
  )
}

export default AddPage