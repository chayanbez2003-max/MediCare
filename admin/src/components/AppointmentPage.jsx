import React, { useState, useEffect, useCallback } from 'react'
import { pageStyles, statusClasses, keyframesStyles } from '../assets/dummyStyles'
import StatusBadge from './StatusBadge'

const API_BASE = import.meta.env.VITE_API_URL

const STATUSES = ['All', 'Pending', 'Confirmed', 'Completed', 'Canceled']

const AppointmentPage = () => {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [updatingId, setUpdatingId] = useState(null)
  const [toast, setToast] = useState(null)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const LIMIT = 20

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams({ limit: LIMIT, page })
      if (search.trim()) params.set('search', search.trim())
      if (statusFilter !== 'All') params.set('status', statusFilter)

      const res = await fetch(`${API_BASE}/api/appointments?${params}`)
      const data = await res.json()

      if (data.success) {
        setAppointments(data.appointments || [])
        setTotalCount(data.meta?.total || data.appointments?.length || 0)
      } else {
        setError(data.message || 'Failed to load appointments')
      }
    } catch (err) {
      console.error('fetchAppointments error:', err)
      setError('Unable to reach the server.')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, page])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  // Update appointment status
  const handleStatusChange = async (id, newStatus) => {
    try {
      setUpdatingId(id)
      const res = await fetch(`${API_BASE}/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (data.success) {
        setAppointments((prev) =>
          prev.map((a) => (a._id === id ? { ...a, status: newStatus } : a))
        )
        showToast(`Status updated to ${newStatus}`, 'success')
      } else {
        showToast(data.message || 'Failed to update status', 'error')
      }
    } catch (err) {
      console.error('Status update error:', err)
      showToast('Server error. Please try again.', 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  // Cancel appointment
  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return
    try {
      setUpdatingId(id)
      const res = await fetch(`${API_BASE}/api/appointments/${id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      if (data.success) {
        setAppointments((prev) =>
          prev.map((a) => (a._id === id ? { ...a, status: 'Canceled' } : a))
        )
        showToast('Appointment cancelled', 'success')
      } else {
        showToast(data.message || 'Failed to cancel', 'error')
      }
    } catch (err) {
      console.error('Cancel error:', err)
      showToast('Server error', 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  const isTerminal = (status) => {
    const s = (status || '').toLowerCase()
    return s === 'completed' || s === 'canceled' || s === 'cancelled'
  }

  const totalPages = Math.ceil(totalCount / LIMIT)

  return (
    <div className={pageStyles.container}>
      <style>{keyframesStyles}</style>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl border text-sm font-medium transition-all duration-300 ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className={pageStyles.maxWidthContainer}>
        {/* Header */}
        <div className={pageStyles.headerContainer}>
          <div className={pageStyles.headerTitleSection}>
            <h1 className={pageStyles.headerTitle}>Appointments</h1>
            <p className={pageStyles.headerSubtitle}>
              Manage and track all patient appointments
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1 w-full md:max-w-sm">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by patient name or mobile…"
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-emerald-200 bg-white shadow-sm text-sm placeholder-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition"
            />
          </div>

          {/* Status filter */}
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition cursor-pointer ${
                  statusFilter === s
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                {s === 'Canceled' ? 'Cancelled' : s}
              </button>
            ))}
          </div>

          {/* Refresh */}
          <button
            onClick={fetchAppointments}
            className="px-3 py-2 rounded-full bg-emerald-500 text-white text-sm shadow-sm hover:bg-emerald-600 transition cursor-pointer"
          >
            ↻ Refresh
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
            <div className="p-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 py-4 border-b border-emerald-50 last:border-b-0 animate-pulse">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded-full w-1/3" />
                    <div className="h-3 bg-gray-100 rounded-full w-1/2" />
                  </div>
                  <div className="h-6 w-20 bg-gray-200 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center">
            <p className="text-rose-700 font-medium">{error}</p>
            <button
              onClick={fetchAppointments}
              className="mt-3 px-5 py-2 bg-rose-100 text-rose-700 rounded-full text-sm font-medium hover:bg-rose-200 transition cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && appointments.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-emerald-50 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">
              {search || statusFilter !== 'All' ? 'No appointments match your filters.' : 'No appointments yet.'}
            </p>
          </div>
        )}

        {/* Appointments Table */}
        {!loading && !error && appointments.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-50">
              <span className="text-base font-semibold text-slate-800">
                All Appointments
              </span>
              <span className="text-sm text-slate-400">
                {totalCount} total · Page {page} of {totalPages || 1}
              </span>
            </div>

            {/* Desktop table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-emerald-50">
                <thead className="bg-emerald-50">
                  <tr>
                    {['Patient', 'Mobile', 'Doctor', 'Date & Time', 'Fees', 'Status', 'Actions'].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-emerald-50">
                  {appointments.map((appt, idx) => {
                    const terminal = isTerminal(appt.status)
                    const isUpdating = updatingId === appt._id

                    return (
                      <tr
                        key={appt._id}
                        className={`hover:bg-emerald-50/50 transition-colors ${
                          idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'
                        }`}
                        style={{ animation: `fadeUp 0.3s ${idx * 0.03}s ease both` }}
                      >
                        {/* Patient */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-slate-800">{appt.patientName}</div>
                          {appt.age && (
                            <div className="text-xs text-slate-400">
                              {appt.age}y {appt.gender && `· ${appt.gender}`}
                            </div>
                          )}
                        </td>

                        {/* Mobile */}
                        <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-600">
                          {appt.mobile}
                        </td>

                        {/* Doctor */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-slate-700">
                            {appt.doctorName || 'N/A'}
                          </div>
                          <div className="text-xs text-emerald-600">{appt.speciality || ''}</div>
                        </td>

                        {/* Date & Time */}
                        <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-600">
                          <div>{appt.date}</div>
                          <div className="text-xs text-slate-400">{appt.time}</div>
                        </td>

                        {/* Fees */}
                        <td className="px-5 py-4 whitespace-nowrap text-sm font-semibold text-slate-700">
                          ₹{appt.fees ?? 0}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <StatusBadge status={appt.status} />
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          {terminal ? (
                            <span className="text-xs text-gray-400 italic">No actions</span>
                          ) : isUpdating ? (
                            <span className="inline-flex items-center gap-2 text-xs text-emerald-600">
                              <span className="w-3.5 h-3.5 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                              Updating…
                            </span>
                          ) : (
                            <select
                              value={appt.status}
                              onChange={(e) => {
                                const val = e.target.value
                                if (val === 'Canceled') {
                                  handleCancel(appt._id)
                                } else {
                                  handleStatusChange(appt._id, val)
                                }
                              }}
                              className="text-xs px-2 py-1.5 rounded-lg border border-emerald-200 bg-white focus:ring-2 focus:ring-emerald-200 focus:outline-none cursor-pointer"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Completed">Completed</option>
                              <option value="Canceled">Cancelled</option>
                            </select>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards (hidden on desktop) */}
            <div className="md:hidden px-4 py-4 space-y-3">
              {appointments.map((appt) => {
                const terminal = isTerminal(appt.status)
                const isUpdating = updatingId === appt._id

                return (
                  <div
                    key={appt._id}
                    className="bg-white rounded-xl shadow-sm border border-emerald-100 p-4"
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <div className="font-semibold text-slate-800">{appt.patientName}</div>
                        <div className="text-xs text-slate-500">{appt.mobile}</div>
                      </div>
                      <StatusBadge status={appt.status} />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 mb-3">
                      <div>
                        <span className="text-xs text-slate-400 block">Doctor</span>
                        {appt.doctorName || 'N/A'}
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block">Fees</span>
                        ₹{appt.fees ?? 0}
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block">Date</span>
                        {appt.date}
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block">Time</span>
                        {appt.time}
                      </div>
                    </div>

                    {!terminal && !isUpdating && (
                      <select
                        value={appt.status}
                        onChange={(e) => {
                          const val = e.target.value
                          if (val === 'Canceled') {
                            handleCancel(appt._id)
                          } else {
                            handleStatusChange(appt._id, val)
                          }
                        }}
                        className="w-full text-sm px-3 py-2 rounded-lg border border-emerald-200 bg-white focus:ring-2 focus:ring-emerald-200 focus:outline-none cursor-pointer"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                        <option value="Canceled">Cancelled</option>
                      </select>
                    )}
                    {isUpdating && (
                      <div className="text-center text-xs text-emerald-600 py-2">
                        <span className="inline-block w-3.5 h-3.5 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mr-2" />
                        Updating…
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-emerald-50 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 rounded-full border border-emerald-200 text-sm bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-50 transition cursor-pointer"
                >
                  ← Prev
                </button>
                <span className="text-sm text-slate-500">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 rounded-full border border-emerald-200 text-sm bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-50 transition cursor-pointer"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AppointmentPage
