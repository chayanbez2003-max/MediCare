import React, { useState, useEffect, useMemo } from 'react'
import {
  Search, X, MapPin, Star, Percent, GraduationCap,
  DollarSign, Clock, Trash2, User, ChevronDown, ChevronUp,
  AlertCircle,
} from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL

// ─── Helpers ─────────────────────────────────────────────────────────────────
const isAvailable = (doc) =>
  doc.availability === true ||
  (typeof doc.availability === 'string' && doc.availability.toLowerCase() === 'available')

// Format schedule: { Monday: [{startTime,endTime}] } → readable lines
function formatSchedule(schedule) {
  if (!schedule || typeof schedule !== 'object') return []
  const entries = schedule instanceof Map
    ? Array.from(schedule.entries())
    : Object.entries(schedule)
  return entries
    .filter(([, slots]) => Array.isArray(slots) && slots.length)
    .map(([day, slots]) => ({
      day,
      times: slots.map((s) =>
        typeof s === 'object'
          ? `${s.startTime || '?'} – ${s.endTime || '?'}`
          : String(s)
      ),
    }))
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-pulse">
      <div className="h-40 bg-slate-100" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-slate-100 rounded-full w-3/4" />
        <div className="h-3 bg-slate-100 rounded-full w-1/2" />
        <div className="h-3 bg-slate-100 rounded-full w-2/3" />
        <div className="h-3 bg-slate-100 rounded-full w-1/3" />
      </div>
    </div>
  )
}

// ─── DoctorCard Component ─────────────────────────────────────────────────────
function DoctorCard({ doc, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)

  const available = isAvailable(doc)
  const schedule = formatSchedule(doc.schedule)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const token = localStorage.getItem('adminToken') || ''
      const res = await fetch(`${API_BASE}/api/doctors/${doc.id || doc._id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.message || 'Delete failed')
      }
      onDelete(doc.id || doc._id)
    } catch (err) {
      console.error('Delete doctor error:', err)
      alert(err.message || 'Failed to delete doctor')
    } finally {
      setDeleting(false)
      setConfirmDel(false)
    }
  }

  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden
                    hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col">
      {/* Image */}
      <div className="relative h-44 bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center overflow-hidden">
        {doc.imageUrl ? (
          <img src={doc.imageUrl} alt={doc.name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none' }} />
        ) : (
          <User size={56} className="text-emerald-300" />
        )}

        {/* Availability badge */}
        <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full
          ${available
            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
            : 'bg-rose-100 text-rose-700 border border-rose-200'}`}>
          {available ? '● Available' : '● Unavailable'}
        </span>

        {/* Delete button */}
        <button
          onClick={() => setConfirmDel(true)}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 backdrop-blur-sm
                     text-rose-400 hover:bg-rose-50 hover:text-rose-600 border border-rose-100
                     opacity-0 group-hover:opacity-100 transition-all duration-150 shadow-sm"
          title="Delete doctor"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Name + specialization */}
        <div>
          <h3 className="font-bold text-slate-800 text-base leading-tight truncate">{doc.name}</h3>
          <p className="text-sm text-emerald-600 font-medium mt-0.5 truncate">{doc.specialization || '—'}</p>
        </div>

        {/* Quick stats row */}
        <div className="grid grid-cols-2 gap-2">
          {doc.fee !== undefined && (
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <DollarSign size={13} className="text-emerald-400 flex-shrink-0" />
              <span>₹{Number(doc.fee).toLocaleString('en-IN')}</span>
            </div>
          )}
          {doc.rating !== undefined && Number(doc.rating) > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Star size={13} className="text-amber-400 flex-shrink-0" />
              <span>{doc.rating} / 5</span>
            </div>
          )}
          {doc.location && (
            <div className="flex items-center gap-1.5 text-xs text-slate-600 col-span-2">
              <MapPin size={13} className="text-slateald-400 flex-shrink-0" />
              <span className="truncate">{doc.location}</span>
            </div>
          )}
          {doc.success && (
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Percent size={13} className="text-violet-400 flex-shrink-0" />
              <span>{doc.success}% success</span>
            </div>
          )}
          {doc.qualifications && (
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <GraduationCap size={13} className="text-sky-400 flex-shrink-0" />
              <span className="truncate">{doc.qualifications}</span>
            </div>
          )}
        </div>

        {/* About (truncated) */}
        {doc.about && (
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{doc.about}</p>
        )}

        {/* Expand / Collapse */}
        <button
          onClick={() => setExpanded((p) => !p)}
          className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-800 font-medium transition mt-auto"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {expanded ? 'Show less' : 'Show schedule & more'}
        </button>

        {/* Expanded: Schedule */}
        {expanded && (
          <div className="pt-2 border-t border-slate-100 space-y-2 animate-[fadeIn_0.15s_ease]">
            {schedule.length > 0 ? (
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                  <Clock size={13} className="text-emerald-400" /> Schedule
                </p>
                <div className="space-y-1">
                  {schedule.map(({ day, times }) => (
                    <div key={day} className="flex items-start gap-2 text-xs text-slate-600">
                      <span className="font-medium text-slate-700 w-20 flex-shrink-0">{day}:</span>
                      <div className="flex flex-col gap-0.5">
                        {times.map((t, i) => <span key={i}>{t}</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No schedule added.</p>
            )}

            {doc.experience && (
              <p className="text-xs text-slate-500">
                <span className="font-medium text-slate-600">Experience:</span> {doc.experience} yrs
              </p>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-xs w-full border border-rose-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle size={20} className="text-rose-500" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 text-sm">Delete Doctor</h4>
                <p className="text-xs text-slate-500 mt-0.5">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-5">
              Are you sure you want to remove <strong>{doc.name}</strong>?
            </p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDel(false)} disabled={deleting}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium transition disabled:opacity-60">
                {deleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main ListDoctor Component ────────────────────────────────────────────────
const ListDoctor = () => {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [availFilter, setAvailFilter] = useState('all') // 'all' | 'available' | 'unavailable'

  // ── Fetch doctors ──────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${API_BASE}/api/doctors?limit=200`)
        if (!res.ok) throw new Error(`Server responded ${res.status}`)
        const body = await res.json()
        let list = []
        if (Array.isArray(body)) list = body
        else if (Array.isArray(body.doctors)) list = body.doctors
        else if (Array.isArray(body.data)) list = body.data
        else {
          const first = Object.values(body).find(Array.isArray)
          if (first) list = first
        }
        if (mounted) setDoctors(list)
      } catch (err) {
        console.error('ListDoctor fetch error:', err)
        if (mounted) setError(err.message || 'Failed to load doctors')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  // ── Delete handler ─────────────────────────────────────────────────────────
  const handleDelete = (id) => {
    setDoctors((prev) => prev.filter((d) => (d.id || d._id) !== id))
  }

  // ── Filter + Search ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = doctors
    // availability filter
    if (availFilter === 'available') list = list.filter(isAvailable)
    if (availFilter === 'unavailable') list = list.filter((d) => !isAvailable(d))
    // search
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter((d) =>
        (d.name || '').toLowerCase().includes(q) ||
        (d.specialization || '').toLowerCase().includes(q)
      )
    }
    return list
  }, [doctors, query, availFilter])

  const clearAll = () => { setQuery(''); setAvailFilter('all') }

  // ─── Filter pill style ───────────────────────────────────────────────────
  const pill = (active) =>
    `px-4 py-1.5 rounded-full text-sm font-medium border transition cursor-pointer
     ${active
      ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
      : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300'}`

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen font-sans bg-gradient-to-br from-emerald-50 via-white to-green-50 py-10 px-4">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
      `}</style>

      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800">Find a Doctor</h1>
            <p className="text-slate-500 text-sm mt-1">
              {loading ? 'Loading…' : `${filtered.length} doctor${filtered.length !== 1 ? 's' : ''} found`}
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or specialization…"
                className="pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700
                           placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-200
                           hover:border-emerald-300 transition w-full sm:w-72"
              />
              {query && (
                <button onClick={() => setQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Availability filters */}
            <div className="flex items-center gap-2">
              <button onClick={() => setAvailFilter('all')} className={pill(availFilter === 'all')}>All</button>
              <button onClick={() => setAvailFilter('available')} className={pill(availFilter === 'available')}>✅ Available</button>
              <button onClick={() => setAvailFilter('unavailable')} className={pill(availFilter === 'unavailable')}>🔴 Unavailable</button>
            </div>

            {/* Clear all */}
            {(query || availFilter !== 'all') && (
              <button onClick={clearAll}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200
                           text-slate-600 text-sm font-medium transition">
                <X size={14} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* ── Loading Skeletons ── */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* ── Empty State ── */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4">
              <User size={32} className="text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-1">No doctors found</h3>
            <p className="text-sm text-slate-400 max-w-xs">
              {query || availFilter !== 'all'
                ? 'Try adjusting your search or clearing the filters.'
                : 'No doctors have been added yet.'}
            </p>
            {(query || availFilter !== 'all') && (
              <button onClick={clearAll}
                className="mt-4 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition">
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* ── Doctor Grid ── */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((doc) => (
              <DoctorCard
                key={doc.id || doc._id}
                doc={doc}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default ListDoctor
