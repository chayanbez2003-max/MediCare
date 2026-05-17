import React, { useState, useRef } from 'react'
import {
  Layers, AlignLeft, FileText, IndianRupee, ToggleLeft,
  Upload, Clock, Plus, Trash2, X, CheckCircle, ChevronDown,
  Calendar, XCircle,
} from 'lucide-react'

const API_BASE = 'http://localhost:4000'

// ─── Input style helper (mirrors AddPage) ─────────────────────────────────────
const inputCls = (err) =>
  `w-full px-4 py-2.5 rounded-xl border text-sm text-slate-700 placeholder-slate-400 outline-none transition
   focus:ring-2 focus:ring-emerald-200 ${err ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white hover:border-emerald-300'}`

// ─── Field wrapper (mirrors AddPage) ──────────────────────────────────────────
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

// ─── Success Toast (mirrors AddPage style) ────────────────────────────────────
function Toast({ name, previewUrl, onClose }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-[slideUp_0.35s_ease]">
      <div className="bg-white rounded-2xl shadow-2xl border border-emerald-100 p-4 flex items-center gap-4 max-w-sm w-full">
        <div className="relative flex-shrink-0">
          {previewUrl ? (
            <img src={previewUrl} alt={name} className="w-14 h-14 rounded-xl object-cover border-2 border-emerald-200" />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Layers size={24} className="text-emerald-500" />
            </div>
          )}
          <span className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5">
            <CheckCircle size={12} className="text-white" />
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide">Service Added!</p>
          <p className="text-sm font-bold text-slate-800 truncate">{name}</p>
        </div>
        <button onClick={onClose} className="flex-shrink-0 p-1 rounded-full hover:bg-slate-100 transition">
          <X size={16} className="text-slate-400" />
        </button>
      </div>
    </div>
  )
}

// ─── Live Preview Card ────────────────────────────────────────────────────────
function PreviewCard({ name, shortDescription, price, available, previewUrl }) {
  const displayName  = name?.trim()             || 'Service Name'
  const displayDesc  = shortDescription?.trim() || 'Short description will appear here…'
  const displayPrice = price !== '' && !isNaN(Number(price)) ? Number(price) : null

  return (
    <div className="bg-white rounded-2xl border border-emerald-100 shadow-lg overflow-hidden">
      {/* Image */}
      <div className="w-full h-40 bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center overflow-hidden relative">
        {previewUrl ? (
          <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-emerald-200">
            <Layers size={38} strokeWidth={1.2} />
            <span className="text-xs">No image</span>
          </div>
        )}
        <span className={`absolute top-2 right-2 inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm ${
          available ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
        }`}>
          {available ? <><CheckCircle size={11} /> Available</> : <><XCircle size={11} /> Unavailable</>}
        </span>
      </div>
      {/* Info */}
      <div className="p-4">
        <h3 className="text-base font-bold text-emerald-800 truncate">{displayName}</h3>
        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{displayDesc}</p>
        <div className="mt-3 flex items-center gap-1 text-emerald-700 font-semibold text-sm">
          <IndianRupee size={14} />
          {displayPrice !== null ? displayPrice.toLocaleString('en-IN') : '—'}
        </div>
      </div>
    </div>
  )
}

// ─── Default blank slot ───────────────────────────────────────────────────────
const emptySlot = () => ({ date: '', hour: '09', minute: '00', ampm: 'AM' })

// ─── Initial form state ───────────────────────────────────────────────────────
const INITIAL = { name: '', shortDescription: '', about: '', price: '', availability: 'available' }

// ─── Main Component ───────────────────────────────────────────────────────────
const AddService = () => {
  const [form, setForm]             = useState(INITIAL)
  const [errors, setErrors]         = useState({})
  const [imageFile, setImageFile]   = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [instructions, setInstructions] = useState([''])
  const [slots, setSlots]           = useState([emptySlot()])
  const [loading, setLoading]       = useState(false)
  const [toast, setToast]           = useState(null)
  const fileRef = useRef(null)

  // ── Field change ─────────────────────────────────────────────────────────
  const set = (k) => (e) => {
    setForm((p) => ({ ...p, [k]: e.target.value }))
    setErrors((p) => ({ ...p, [k]: undefined }))
  }

  // ── Image ─────────────────────────────────────────────────────────────────
  const MAX_IMAGE_MB = 8
  const handleImage = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setErrors((p) => ({ ...p, image: `Image must be smaller than ${MAX_IMAGE_MB} MB (chosen file is ${(file.size / 1024 / 1024).toFixed(1)} MB)` }))
      if (fileRef.current) fileRef.current.value = ''
      return
    }
    setErrors((p) => ({ ...p, image: undefined }))
    setImageFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }
  const removeImage = () => {
    setImageFile(null)
    setPreviewUrl(null)
    setErrors((p) => ({ ...p, image: undefined }))
    if (fileRef.current) fileRef.current.value = ''
  }

  // ── Instructions ──────────────────────────────────────────────────────────
  const addInstruction    = () => setInstructions((p) => [...p, ''])
  const removeInstruction = (i) => setInstructions((p) => p.filter((_, idx) => idx !== i))
  const updateInstruction = (i, v) => setInstructions((p) => p.map((x, idx) => idx === i ? v : x))

  // ── Slots ─────────────────────────────────────────────────────────────────
  const addSlot    = () => setSlots((p) => [...p, emptySlot()])
  const removeSlot = (i) => setSlots((p) => p.filter((_, idx) => idx !== i))
  const updateSlot = (i, k, v) => setSlots((p) => p.map((s, idx) => idx === i ? { ...s, [k]: v } : s))

  // Build slot strings matching normalizeSlotsToMap format: "DD Mon YYYY • HH:MM AM/PM"
  const buildSlotStrings = () =>
    slots.flatMap(({ date, hour, minute, ampm }) => {
      if (!date) return []
      const d = new Date(date + 'T00:00:00')
      if (isNaN(d.getTime())) return []
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
      return [`${String(d.getDate()).padStart(2,'0')} ${months[d.getMonth()]} ${d.getFullYear()} • ${hour}:${minute} ${ampm}`]
    })

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Service name is required'
    if (form.price !== '' && (isNaN(Number(form.price)) || Number(form.price) < 0))
      e.price = 'Price must be a non-negative number'
    return e
  }

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setForm(INITIAL)
    setErrors({})
    setImageFile(null)
    setPreviewUrl(null)
    setInstructions([''])
    setSlots([emptySlot()])
    if (fileRef.current) fileRef.current.value = ''
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('name', form.name.trim())
      fd.append('about', form.about.trim())
      fd.append('shortDescription', form.shortDescription.trim())
      fd.append('price', form.price !== '' ? Number(form.price) : 0)
      fd.append('availability', form.availability)
      fd.append('instruction', JSON.stringify(instructions.filter((s) => s.trim())))
      fd.append('slots', JSON.stringify(buildSlotStrings()))
      if (imageFile) fd.append('image', imageFile)

      const token = localStorage.getItem('adminToken') || ''
      const res = await fetch(`${API_BASE}/api/services`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || 'Failed to add service')

      const savedName = form.name
      const savedUrl  = previewUrl
      handleReset()
      setToast({ name: savedName, previewUrl: savedUrl })
      setTimeout(() => setToast(null), 5000)
    } catch (err) {
      setErrors({ submit: err.message || 'Something went wrong, please try again.' })
    } finally {
      setLoading(false)
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen font-sans bg-gradient-to-br from-emerald-50 via-white to-green-50 py-10 px-4">
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(24px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>

      <div className="max-w-5xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500 shadow-lg mb-4">
            <Layers size={26} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800">Add Service</h1>
          <p className="text-slate-500 mt-1 text-sm">Create and manage medical services</p>
        </div>

        {/* ── Two-column: Form | Preview ── */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ── FORM ── */}
          <div className="w-full lg:flex-1">
            <form onSubmit={handleSubmit} noValidate
              className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-10 space-y-8">

              {/* Section: Image */}
              <section>
                <h2 className="text-base font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <Upload size={16} className="text-emerald-500" /> Service Image
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
                      <Layers size={30} className="text-emerald-300" />
                    )}
                  </div>
                  <div>
                    <button type="button" onClick={() => fileRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition shadow-sm">
                      {previewUrl ? 'Change Image' : 'Upload Image'}
                    </button>
                    <p className="text-xs text-slate-400 mt-2">JPG, PNG or WEBP. Max 8 MB.</p>
                    {errors.image && (
                      <p className="text-xs text-rose-500 mt-1 max-w-[200px]">{errors.image}</p>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
                  </div>
                </div>
              </section>

              <hr className="border-slate-100" />

              {/* Section: Basic Info */}
              <section className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <h2 className="text-base font-semibold text-slate-700 sm:col-span-2 flex items-center gap-2">
                  <Layers size={16} className="text-emerald-500" /> Basic Information
                </h2>

                <Field label="Service Name" icon={<Layers size={14} />} required error={errors.name}>
                  <input value={form.name} onChange={set('name')}
                    placeholder="e.g. Blood Test, X-Ray, ECG…"
                    className={inputCls(errors.name)} />
                </Field>

                <Field label="Short Description" icon={<AlignLeft size={14} />} error={errors.shortDescription}>
                  <input value={form.shortDescription} onChange={set('shortDescription')}
                    placeholder="One-line summary"
                    className={inputCls(errors.shortDescription)} />
                </Field>

                <div className="sm:col-span-2">
                  <Field label="About" icon={<FileText size={14} />} error={errors.about}>
                    <textarea value={form.about} onChange={set('about')} rows={4}
                      placeholder="Detailed description — what it includes, who it's for…"
                      className={`${inputCls(errors.about)} resize-none`} />
                  </Field>
                </div>
              </section>

              <hr className="border-slate-100" />

              {/* Section: Pricing & Availability */}
              <section className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <h2 className="text-base font-semibold text-slate-700 sm:col-span-2 flex items-center gap-2">
                  <IndianRupee size={16} className="text-emerald-500" /> Pricing & Availability
                </h2>

                <Field label="Price (₹)" icon={<IndianRupee size={14} />} error={errors.price}>
                  <input type="number" min="0" value={form.price} onChange={set('price')}
                    placeholder="e.g. 500" className={inputCls(errors.price)} />
                </Field>

                <Field label="Availability" icon={<ToggleLeft size={14} />}>
                  <div className="relative">
                    <select value={form.availability} onChange={set('availability')}
                      className={`${inputCls(false)} appearance-none pr-10`}>
                      <option value="available">✅ Available</option>
                      <option value="unavailable">🔴 Unavailable</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                  </div>
                </Field>
              </section>

              <hr className="border-slate-100" />

              {/* Section: Instructions */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-semibold text-slate-700 flex items-center gap-2">
                    <AlignLeft size={16} className="text-emerald-500" /> Instructions
                  </h2>
                  <button type="button" onClick={addInstruction}
                    className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition">
                    <Plus size={14} /> Add
                  </button>
                </div>
                <p className="text-xs text-slate-400 mb-3">Steps the patient should follow before/after the service.</p>
                <div className="space-y-2">
                  {instructions.map((inst, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-emerald-600 w-5 text-center flex-shrink-0">{i + 1}.</span>
                      <input value={inst} onChange={(e) => updateInstruction(i, e.target.value)}
                        placeholder={`Instruction ${i + 1}`} className={inputCls(false)} />
                      {instructions.length > 1 && (
                        <button type="button" onClick={() => removeInstruction(i)}
                          className="p-2 rounded-lg bg-rose-50 border border-rose-100 text-rose-400 hover:bg-rose-100 transition flex-shrink-0">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <hr className="border-slate-100" />

              {/* Section: Slots */}
              <section>
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-base font-semibold text-slate-700 flex items-center gap-2">
                    <Clock size={16} className="text-emerald-500" /> Appointment Slots
                  </h2>
                  <button type="button" onClick={addSlot}
                    className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition">
                    <Plus size={14} /> Add Slot
                  </button>
                </div>
                <p className="text-xs text-slate-400 mb-4">Set available dates and times for this service.</p>
                <div className="space-y-3">
                  {slots.map((slot, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex flex-wrap items-end gap-3">
                        <div className="flex-1 min-w-[140px]">
                          <label className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Calendar size={11} /> Date</label>
                          <input type="date" value={slot.date} onChange={(e) => updateSlot(i, 'date', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-200 transition" />
                        </div>
                        <div className="w-20">
                          <label className="text-xs text-slate-400 mb-1 block">Hour</label>
                          <select value={slot.hour} onChange={(e) => updateSlot(i, 'hour', e.target.value)}
                            className="w-full px-2 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-200 transition">
                            {Array.from({ length: 12 }, (_, h) => String(h + 1).padStart(2, '0')).map((h) =>
                              <option key={h} value={h}>{h}</option>)}
                          </select>
                        </div>
                        <div className="w-20">
                          <label className="text-xs text-slate-400 mb-1 block">Min</label>
                          <select value={slot.minute} onChange={(e) => updateSlot(i, 'minute', e.target.value)}
                            className="w-full px-2 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-200 transition">
                            {['00','15','30','45'].map((m) => <option key={m} value={m}>{m}</option>)}
                          </select>
                        </div>
                        <div className="w-20">
                          <label className="text-xs text-slate-400 mb-1 block">AM/PM</label>
                          <select value={slot.ampm} onChange={(e) => updateSlot(i, 'ampm', e.target.value)}
                            className="w-full px-2 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-200 transition">
                            <option value="AM">AM</option>
                            <option value="PM">PM</option>
                          </select>
                        </div>
                        {slots.length > 1 && (
                          <button type="button" onClick={() => removeSlot(i)}
                            className="p-2 rounded-lg bg-rose-50 border border-rose-100 text-rose-400 hover:bg-rose-100 transition flex-shrink-0">
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Submit error */}
              {errors.submit && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
                  <X size={16} className="flex-shrink-0" /> {errors.submit}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button type="button" onClick={handleReset}
                  className="sm:w-auto px-6 py-3 rounded-2xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition">
                  Reset Form
                </button>
                <button type="submit" disabled={loading}
                  className={`flex-1 py-3.5 rounded-2xl text-white font-semibold text-base shadow-lg transition-all ${
                    loading
                      ? 'bg-emerald-300 cursor-not-allowed'
                      : 'bg-emerald-500 hover:bg-emerald-600 hover:shadow-emerald-200 hover:shadow-xl active:scale-[0.99]'
                  }`}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Creating Service…
                    </span>
                  ) : 'Add Service'}
                </button>
              </div>

            </form>
          </div>

          {/* ── LIVE PREVIEW ── */}
          <div className="w-full lg:w-72 xl:w-80 flex-shrink-0">
            <div className="lg:sticky lg:top-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Live Preview</p>
              <PreviewCard
                name={form.name}
                shortDescription={form.shortDescription}
                price={form.price}
                available={form.availability === 'available'}
                previewUrl={previewUrl}
              />
              <p className="text-xs text-slate-400 text-center mt-2">Updates as you type</p>
            </div>
          </div>

        </div>
      </div>

      {/* Toast */}
      {toast && <Toast name={toast.name} previewUrl={toast.previewUrl} onClose={() => setToast(null)} />}
    </div>
  )
}

export default AddService