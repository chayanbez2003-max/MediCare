import React, { useState, useEffect, useMemo } from 'react'
import { serviceDashboardStyles as s } from '../assets/dummyStyles'
import {
  Search,
  X,
  Layers,
  Calendar,
  IndianRupee,
  CheckCircle,
  XCircle,
  ArrowUpDown,
} from 'lucide-react'

const API_BASE = 'http://localhost:4000'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const safeNumber = (v, fallback = 0) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

/**
 * normalizeService — converts a raw service document from the API
 * into a predictable shape used throughout this component.
 * DO NOT modify this function.
 */
function normalizeService(svc) {
  const id = svc._id || svc.id || String(Math.random()).slice(2)
  const name = (svc.name || '').trim() || 'Unnamed Service'
  const price = safeNumber(svc.price ?? svc.fee ?? svc.fees ?? 0, 0)
  const image = svc.imageUrl || svc.image || svc.avatar || null

  const totalAppointments = safeNumber(
    svc.totalAppointments ?? svc.appointments?.total ?? 0,
    0
  )
  const completed = safeNumber(
    svc.completed ?? svc.appointments?.completed ?? 0,
    0
  )
  const cancelled = safeNumber(
    svc.canceled ?? svc.cancelled ?? svc.appointments?.canceled ?? 0,
    0
  )

  // Earnings = price × completed
  const earnings =
    svc.earnings != null
      ? safeNumber(svc.earnings, 0)
      : price * completed

  return {
    id,
    name,
    price,
    image,
    totalAppointments,
    completed,
    cancelled,
    earnings,
    raw: svc,
  }
}

// ─── StatCard Component ───────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, loading }) => (
  <div className={s.statCard.container}>
    <div className={s.statCard.iconContainer}>{icon}</div>
    <div>
      <p className={s.statCard.label}>{label}</p>
      <p className={s.statCard.value}>
        {loading ? (
          <span className="inline-block w-16 h-5 bg-emerald-100 rounded-full animate-pulse" />
        ) : (
          value
        )}
      </p>
    </div>
  </div>
)

// ─── ServiceRow Component ─────────────────────────────────────────────────────
const ServiceRow = ({ service, index }) => {
  const { name, price, totalAppointments, completed, cancelled, earnings, image } = service
  const isOdd = index % 2 === 1

  return (
    <tr
      className={`${s.table.row} transition-colors duration-150 cursor-default ${
        isOdd ? s.tableRowOdd : s.tableRowEven
      }`}
      style={{ display: 'table-row' }}
    >
      {/* Service */}
      <td className="px-5 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-10 h-10 rounded-lg object-cover ring-1 ring-emerald-100 flex-shrink-0"
              onError={(e) => { e.target.style.display = 'none' }}
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-emerald-50 ring-1 ring-emerald-100 flex items-center justify-center flex-shrink-0">
              <Layers size={18} className="text-emerald-400" />
            </div>
          )}
          <span className={s.table.desktopServiceName}>{name}</span>
        </div>
      </td>

      {/* Price */}
      <td className={`px-5 py-4 whitespace-nowrap ${s.table.tabletCell}`}>
        <span className="text-sm font-medium text-slate-700">
          ₹{price.toLocaleString('en-IN')}
        </span>
      </td>

      {/* Appointments */}
      <td className={`px-5 py-4 whitespace-nowrap text-center`}>
        <span className="text-sm text-slate-600">{totalAppointments}</span>
      </td>

      {/* Completed */}
      <td className="px-5 py-4 whitespace-nowrap text-center">
        <span className="text-sm font-medium text-emerald-600">{completed}</span>
      </td>

      {/* Cancelled */}
      <td className="px-5 py-4 whitespace-nowrap text-center">
        <span className="text-sm font-medium text-rose-500">{cancelled}</span>
      </td>

      {/* Earnings */}
      <td className="px-5 py-4 whitespace-nowrap text-right">
        <span className="text-sm font-semibold text-slate-800">
          ₹{earnings.toLocaleString('en-IN')}
        </span>
      </td>
    </tr>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
const ServiceDashboard = () => {
  const [rawServices, setRawServices] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState(null)   // 'price' | 'earnings' | null
  const [sortDir, setSortDir] = useState('desc') // 'asc' | 'desc'

  // ── Fetch services ──────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true
    const loadServices = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${API_BASE}/api/services`)
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body?.message || `Failed to fetch services (${res.status})`)
        }
        const body = await res.json()
        let list = []
        if (Array.isArray(body)) list = body
        else if (Array.isArray(body.data)) list = body.data
        else if (Array.isArray(body.services)) list = body.services
        else {
          const firstArr = Object.values(body).find(Array.isArray)
          if (firstArr) list = firstArr
        }
        if (mounted) setRawServices(list)
      } catch (err) {
        console.error('Failed to load services:', err)
        if (mounted) {
          setError(err.message || 'Failed to load services')
          setRawServices([])
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadServices()
    return () => { mounted = false }
  }, [])

  // ── Memoised: normalized services ──────────────────────────────────────────
  const services = useMemo(
    () => rawServices.map((svc) => normalizeService(svc)),
    [rawServices]
  )

  // ── Memoised: aggregated stats ──────────────────────────────────────────────
  const stats = useMemo(() => ({
    totalServices: services.length,
    totalAppointments: services.reduce((s, x) => s + x.totalAppointments, 0),
    totalEarnings: services.reduce((s, x) => s + x.earnings, 0),
    completed: services.reduce((s, x) => s + x.completed, 0),
    cancelled: services.reduce((s, x) => s + x.cancelled, 0),
  }), [services])

  // ── Memoised: filtered + sorted services ───────────────────────────────────
  const filteredServices = useMemo(() => {
    const q = query.trim().toLowerCase()
    let result = q
      ? services.filter((svc) => svc.name.toLowerCase().includes(q))
      : services

    if (sortKey) {
      result = [...result].sort((a, b) => {
        const diff = a[sortKey] - b[sortKey]
        return sortDir === 'asc' ? diff : -diff
      })
    }
    return result
  }, [services, query, sortKey, sortDir])

  // ── Sort handler ────────────────────────────────────────────────────────────
  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const SortIcon = ({ column }) => (
    <ArrowUpDown
      size={13}
      className={`inline ml-1 ${
        sortKey === column ? 'text-emerald-600' : 'text-gray-400'
      }`}
    />
  )

  // ── Table header columns ────────────────────────────────────────────────────
  const columns = [
    { label: 'Service', key: null, align: 'text-left' },
    {
      label: 'Price',
      key: 'price',
      align: 'text-left',
      sortable: true,
    },
    { label: 'Appointments', key: null, align: 'text-center' },
    { label: 'Completed', key: null, align: 'text-center' },
    { label: 'Cancelled', key: null, align: 'text-center' },
    {
      label: 'Earnings',
      key: 'earnings',
      align: 'text-right',
      sortable: true,
    },
  ]

  return (
    <div className={s.container}>
      <div className={s.innerContainer}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className={s.header.container}>
          <div>
            <h1 className={s.header.title}>Service Dashboard</h1>
            <p className={s.header.subtitle}>
              Overview of Services, Appointments, and Earnings
            </p>
          </div>
          <div className={s.refresh.container}>
            <span className={s.refresh.countText}>
              {services.length} service{services.length !== 1 ? 's' : ''} total
            </span>
          </div>
        </div>

        {/* ── Stats Cards ─────────────────────────────────────────────────── */}
        <div className={s.statGrid}>
          <StatCard
            icon={<Layers size={22} />}
            label="Total Services"
            value={stats.totalServices}
            loading={loading}
          />
          <StatCard
            icon={<Calendar size={22} />}
            label="Total Appointments"
            value={stats.totalAppointments}
            loading={loading}
          />
          <StatCard
            icon={<IndianRupee size={22} />}
            label="Total Earnings"
            value={`₹${stats.totalEarnings.toLocaleString('en-IN')}`}
            loading={loading}
          />
          <StatCard
            icon={<CheckCircle size={22} />}
            label="Completed"
            value={stats.completed}
            loading={loading}
          />
          <StatCard
            icon={<XCircle size={22} />}
            label="Cancelled"
            value={stats.cancelled}
            loading={loading}
          />
        </div>

        {/* ── Search Bar ───────────────────────────────────────────────────── */}
        <div className={s.search.container}>
          <div className={s.search.inputContainer}>
            <Search size={16} className="text-emerald-400 flex-shrink-0" />
            <input
              id="service-search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search services..."
              className={s.search.input}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition"
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* ── Services Table ───────────────────────────────────────────────── */}
        <div className={s.table.container}>
          {/* Table header meta row */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-50">
            <span className="text-base font-semibold text-slate-800">All Services</span>
            <span className="text-sm text-slate-400">
              {filteredServices.length} record{filteredServices.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Error banner */}
          {error && (
            <div className={s.states.error}>{error}</div>
          )}

          {/* Scrollable table */}
          <div className="overflow-x-auto">
            <table
              className="min-w-full divide-y divide-emerald-50"
              style={{ tableLayout: 'auto' }}
            >
              <thead className="bg-emerald-50">
                <tr>
                  {columns.map(({ label, key, align, sortable }) => (
                    <th
                      key={label}
                      className={`px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap ${align} ${
                        sortable ? 'cursor-pointer select-none hover:text-emerald-700 transition-colors' : ''
                      }`}
                      onClick={sortable ? () => handleSort(key) : undefined}
                    >
                      {label}
                      {sortable && <SortIcon column={key} />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-emerald-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 bg-slate-100 rounded-full animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredServices.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center text-slate-400 text-sm"
                    >
                      {query
                        ? `No services found matching "${query}"`
                        : 'No services available.'}
                    </td>
                  </tr>
                ) : (
                  filteredServices.map((svc, idx) => (
                    <ServiceRow key={svc.id} service={svc} index={idx} />
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

export default ServiceDashboard