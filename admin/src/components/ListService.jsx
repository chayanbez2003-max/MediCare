import React, { useState, useEffect, useMemo } from 'react'
import {
  Search, X, Layers, IndianRupee, CheckCircle, XCircle,
  Trash2, AlertCircle, Calendar,
} from 'lucide-react'

const API_BASE = 'http://localhost:4000'

// ─── normalizeService (DO NOT MODIFY) ────────────────────────────────────────
const safeNum = (v, fb = 0) => { const n = Number(v); return Number.isFinite(n) ? n : fb }

function normalizeService(svc) {
  const id    = svc._id || svc.id || String(Math.random()).slice(2)
  const name  = (svc.name || '').trim() || 'Unnamed Service'
  const price = safeNum(svc.price ?? svc.fee ?? 0, 0)
  const image = svc.imageUrl || svc.image || null
  const totalAppointments = safeNum(svc.totalAppointments ?? 0, 0)
  const completed         = safeNum(svc.completed ?? 0, 0)
  const cancelled         = safeNum(svc.canceled ?? svc.cancelled ?? 0, 0)
  const available         = svc.available !== false
  return { id, name, price, image, totalAppointments, completed, cancelled, available,
    shortDescription: svc.shortDescription || '', raw: svc }
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-pulse">
      <div className="h-44 bg-slate-100" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-slate-100 rounded-full w-3/4" />
        <div className="h-3 bg-slate-100 rounded-full w-1/2" />
        <div className="h-3 bg-slate-100 rounded-full w-2/3" />
      </div>
    </div>
  )
}

// ─── ServiceCard Component ────────────────────────────────────────────────────
function ServiceCard({ svc, onDelete }) {
  const [confirmDel, setConfirmDel] = useState(false)
  const [deleting, setDeleting]     = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const token = localStorage.getItem('adminToken') || ''
      const res = await fetch(`${API_BASE}/api/services/${svc.id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.message || 'Delete failed')
      }
      onDelete(svc.id)
    } catch (err) {
      console.error('Delete service error:', err)
      alert(err.message || 'Failed to delete service')
    } finally {
      setDeleting(false)
      setConfirmDel(false)
    }
  }

  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden
                    hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col">
      {/* Image */}
      <div className="relative h-44 bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center overflow-hidden">
        {svc.image ? (
          <img src={svc.image} alt={svc.name} className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none' }} />
        ) : (
          <Layers size={48} className="text-emerald-200" strokeWidth={1.2} />
        )}

        {/* Availability badge */}
        <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full
          ${svc.available
            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
            : 'bg-rose-100 text-rose-700 border border-rose-200'}`}>
          {svc.available ? '● Available' : '● Unavailable'}
        </span>

        {/* Delete button */}
        <button onClick={() => setConfirmDel(true)}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 backdrop-blur-sm
                     text-rose-400 hover:bg-rose-50 hover:text-rose-600 border border-rose-100
                     opacity-0 group-hover:opacity-100 transition-all duration-150 shadow-sm"
          title="Delete service">
          <Trash2 size={14} />
        </button>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-bold text-slate-800 text-base leading-tight truncate">{svc.name}</h3>
          {svc.shortDescription && (
            <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{svc.shortDescription}</p>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <IndianRupee size={13} className="text-emerald-400 flex-shrink-0" />
            <span>₹{svc.price.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Calendar size={13} className="text-violet-400 flex-shrink-0" />
            <span>{svc.totalAppointments} appts</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600">
            <CheckCircle size={13} className="flex-shrink-0" />
            <span>{svc.completed} done</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-rose-500">
            <XCircle size={13} className="flex-shrink-0" />
            <span>{svc.cancelled} cancelled</span>
          </div>
        </div>
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
                <h4 className="font-semibold text-slate-800 text-sm">Delete Service</h4>
                <p className="text-xs text-slate-500 mt-0.5">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-5">
              Are you sure you want to remove <strong>{svc.name}</strong>?
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

// ─── Filter pill style ────────────────────────────────────────────────────────
const pill = (active) =>
  `px-4 py-1.5 rounded-full text-sm font-medium border transition cursor-pointer
   ${active
     ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
     : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300'}`

// ─── Main ListService Component ───────────────────────────────────────────────
const ListService = () => {
  const [rawServices, setRawServices] = useState([])
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState(null)
  const [query, setQuery]             = useState('')
  const [availFilter, setAvailFilter] = useState('all') // 'all' | 'available' | 'unavailable'

  // ── Fetch services ──────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true); setError(null)
      try {
        const res = await fetch(`${API_BASE}/api/services`)
        if (!res.ok) throw new Error(`Server responded ${res.status}`)
        const body = await res.json()
        let list = []
        if (Array.isArray(body)) list = body
        else if (Array.isArray(body.data)) list = body.data
        else if (Array.isArray(body.services)) list = body.services
        else { const first = Object.values(body).find(Array.isArray); if (first) list = first }
        if (mounted) setRawServices(list)
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to load services')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  // ── Normalized services (useMemo) ───────────────────────────────────────────
  const services = useMemo(() => rawServices.map(normalizeService), [rawServices])

  // ── Filtered services (useMemo) ─────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = services
    if (availFilter === 'available')   list = list.filter((s) => s.available)
    if (availFilter === 'unavailable') list = list.filter((s) => !s.available)
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter((s) => s.name.toLowerCase().includes(q))
    }
    return list
  }, [services, query, availFilter])

  const handleDelete = (id) => setRawServices((p) => p.filter((s) => (s._id || s.id) !== id))
  const clearAll = () => { setQuery(''); setAvailFilter('all') }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen font-sans bg-gradient-to-br from-emerald-50 via-white to-green-50 py-10 px-4">
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:none; } }`}</style>

      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800">All Services</h1>
            <p className="text-slate-500 text-sm mt-1">
              {loading ? 'Loading…' : `${filtered.length} service${filtered.length !== 1 ? 's' : ''} found`}
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Search services…"
                className="pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700
                           placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-200
                           hover:border-emerald-300 transition w-full sm:w-64" />
              {query && (
                <button onClick={() => setQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-2">
              <button onClick={() => setAvailFilter('all')}         className={pill(availFilter === 'all')}>All</button>
              <button onClick={() => setAvailFilter('available')}   className={pill(availFilter === 'available')}>✅ Available</button>
              <button onClick={() => setAvailFilter('unavailable')} className={pill(availFilter === 'unavailable')}>🔴 Unavailable</button>
            </div>

            {(query || availFilter !== 'all') && (
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

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4">
              <Layers size={32} className="text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-1">No services found</h3>
            <p className="text-sm text-slate-400 max-w-xs">
              {query || availFilter !== 'all'
                ? 'Try adjusting your search or clearing the filters.'
                : 'No services have been added yet.'}
            </p>
            {(query || availFilter !== 'all') && (
              <button onClick={clearAll}
                className="mt-4 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition">
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Service grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((svc) => (
              <ServiceCard key={svc.id} svc={svc} onDelete={handleDelete} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default ListService
