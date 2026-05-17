import React, { useState, useEffect, useMemo } from 'react'
import {
  Search, X, AlertCircle, Calendar, Clock, User,
  IndianRupee, CheckCircle, XCircle, Loader2, ChevronDown,
} from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  Completed:  { label: 'Completed',  bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', icon: <CheckCircle size={12} /> },
  Canceled:   { label: 'Cancelled',  bg: 'bg-rose-100',    text: 'text-rose-700',    border: 'border-rose-200',    icon: <XCircle size={12} /> },
  Confirmed:  { label: 'Confirmed',  bg: 'bg-sky-100',     text: 'text-sky-700',     border: 'border-sky-200',     icon: <CheckCircle size={12} /> },
  Pending:    { label: 'Pending',    bg: 'bg-amber-100',   text: 'text-amber-700',   border: 'border-amber-200',   icon: <Clock size={12} /> },
  Rescheduled:{ label: 'Rescheduled',bg: 'bg-violet-100',  text: 'text-violet-700',  border: 'border-violet-200',  icon: <Clock size={12} /> },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', icon: null }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {cfg.icon} {cfg.label}
    </span>
  )
}

// ─── Appointment Row ──────────────────────────────────────────────────────────
function ServiceAppointmentRow({ appt, onStatusUpdate, onCancel, index }) {
  const [updating, setUpdating] = useState(false)
  const isTerminal = appt.status === 'Completed' || appt.status === 'Canceled'
  const timeStr = `${String(appt.hour).padStart(2, '0')}:${String(appt.minute).padStart(2, '0')} ${appt.ampm}`

  const handleComplete = async () => {
    if (isTerminal || updating) return
    setUpdating(true)
    try {
      const token = localStorage.getItem('adminToken') || ''
      const res = await fetch(`${API_BASE}/api/service-appointments/${appt._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ status: 'Completed' }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || 'Update failed')
      onStatusUpdate(appt._id, 'Completed')
    } catch (err) { alert(err.message) } finally { setUpdating(false) }
  }

  const handleCancel = async () => {
    if (isTerminal || updating) return
    setUpdating(true)
    try {
      const token = localStorage.getItem('adminToken') || ''
      const res = await fetch(`${API_BASE}/api/service-appointments/${appt._id}/cancel`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || 'Cancel failed')
      onCancel(appt._id)
    } catch (err) { alert(err.message) } finally { setUpdating(false) }
  }

  return (
    <tr className={`transition-colors hover:bg-emerald-50/40 ${index % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'}`}>
      {/* Service */}
      <td className="px-5 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          {appt.serviceImage?.url ? (
            <img src={appt.serviceImage.url} alt={appt.serviceName}
              className="w-9 h-9 rounded-lg object-cover ring-1 ring-emerald-100 flex-shrink-0"
              onError={(e) => { e.target.style.display = 'none' }} />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-emerald-50 ring-1 ring-emerald-100 flex items-center justify-center flex-shrink-0">
              <IndianRupee size={14} className="text-emerald-400" />
            </div>
          )}
          <span className="text-sm font-medium text-slate-800 max-w-[140px] truncate">{appt.serviceName}</span>
        </div>
      </td>
      {/* Patient */}
      <td className="px-5 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <User size={13} className="text-emerald-600" />
          </div>
          <div>
            <div className="text-sm text-slate-800 font-medium truncate max-w-[120px]">{appt.patientName}</div>
            <div className="text-xs text-slate-400">{appt.mobile}</div>
          </div>
        </div>
      </td>
      {/* Date */}
      <td className="px-5 py-4 whitespace-nowrap">
        <div className="flex items-center gap-1.5 text-sm text-slate-600">
          <Calendar size={13} className="text-emerald-400 flex-shrink-0" />
          {appt.date}
        </div>
      </td>
      {/* Time */}
      <td className="px-5 py-4 whitespace-nowrap">
        <div className="flex items-center gap-1.5 text-sm text-slate-600">
          <Clock size={13} className="text-violet-400 flex-shrink-0" />
          {timeStr}
        </div>
      </td>
      {/* Status */}
      <td className="px-5 py-4 whitespace-nowrap">
        <StatusBadge status={appt.status} />
      </td>
      {/* Fees */}
      <td className="px-5 py-4 whitespace-nowrap text-sm font-semibold text-slate-700">
        ₹{Number(appt.fees ?? appt.payment?.amount ?? 0).toLocaleString('en-IN')}
      </td>
      {/* Actions */}
      <td className="px-5 py-4 whitespace-nowrap">
        {updating ? (
          <Loader2 size={16} className="animate-spin text-emerald-500" />
        ) : isTerminal ? (
          <span className="text-xs text-slate-400 italic">—</span>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={handleComplete}
              className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition cursor-pointer">
              Complete
            </button>
            <button onClick={handleCancel}
              className="px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 transition cursor-pointer">
              Cancel
            </button>
          </div>
        )}
      </td>
    </tr>
  )
}

// ─── Filter pill ──────────────────────────────────────────────────────────────
const pill = (active) =>
  `px-4 py-1.5 rounded-full text-sm font-medium border transition cursor-pointer
   ${active
     ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
     : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300'}`

const STATUS_FILTERS = ['All', 'Pending', 'Confirmed', 'Completed', 'Canceled', 'Rescheduled']

// ─── Main ServiceAppointmentPage Component ────────────────────────────────────
const ServiceAppointmentPage = () => {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState(null)
  const [query, setQuery]               = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true); setError(null)
      try {
        const res = await fetch(`${API_BASE}/api/service-appointments?limit=200`)
        if (!res.ok) throw new Error(`Server responded ${res.status}`)
        const body = await res.json()
        let list = []
        if (Array.isArray(body)) list = body
        else if (Array.isArray(body.appointment)) list = body.appointment
        else if (Array.isArray(body.appointments)) list = body.appointments
        else if (Array.isArray(body.data)) list = body.data
        else { const first = Object.values(body).find(Array.isArray); if (first) list = first }
        if (mounted) setAppointments(list)
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to load appointments')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  // ── Filtered appointments (useMemo) ────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = appointments
    if (statusFilter !== 'All') list = list.filter((a) => a.status === statusFilter)
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter((a) =>
        (a.serviceName || '').toLowerCase().includes(q) ||
        (a.patientName || '').toLowerCase().includes(q) ||
        (a.mobile || '').includes(q)
      )
    }
    return list
  }, [appointments, query, statusFilter])

  // ── Status update handlers ─────────────────────────────────────────────────
  const handleStatusUpdate = (id, newStatus) =>
    setAppointments((p) => p.map((a) => a._id === id ? { ...a, status: newStatus } : a))

  const handleCancel = (id) =>
    setAppointments((p) => p.map((a) => a._id === id ? { ...a, status: 'Canceled' } : a))

  const clearAll = () => { setQuery(''); setStatusFilter('All') }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen font-sans bg-gradient-to-br from-emerald-50 via-white to-green-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800">Service Appointments</h1>
            <p className="text-slate-500 text-sm mt-1">Manage all service bookings</p>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by service or patient…"
                className="pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700
                           placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-200
                           hover:border-emerald-300 transition w-full sm:w-72" />
              {query && (
                <button onClick={() => setQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Status filter dropdown (mobile-friendly) */}
            <div className="relative">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700
                           shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 appearance-none cursor-pointer w-full">
                {STATUS_FILTERS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {(query || statusFilter !== 'All') && (
              <button onClick={clearAll}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium transition">
                <X size={14} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Table card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Meta row */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-50">
            <span className="text-base font-semibold text-slate-800">All Bookings</span>
            <span className="text-sm text-slate-400">
              {loading ? '…' : `${filtered.length} record${filtered.length !== 1 ? 's' : ''}`}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-emerald-50" style={{ tableLayout: 'auto' }}>
              <thead className="bg-emerald-50">
                <tr>
                  {['Service', 'Patient', 'Date', 'Time', 'Status', 'Fees', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-emerald-50">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 bg-slate-100 rounded-full animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
                          <Calendar size={28} className="text-emerald-400" />
                        </div>
                        <p className="text-base font-semibold text-slate-700">No appointments found</p>
                        <p className="text-sm text-slate-400">
                          {query || statusFilter !== 'All'
                            ? 'Try adjusting your search or filters.'
                            : 'No service appointments have been made yet.'}
                        </p>
                        {(query || statusFilter !== 'All') && (
                          <button onClick={clearAll}
                            className="mt-1 px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition">
                            Clear Filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((appt, idx) => (
                    <ServiceAppointmentRow
                      key={appt._id}
                      appt={appt}
                      index={idx}
                      onStatusUpdate={handleStatusUpdate}
                      onCancel={handleCancel}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}

export default ServiceAppointmentPage
