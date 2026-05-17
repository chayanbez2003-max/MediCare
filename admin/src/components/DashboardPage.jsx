import React, { useState, useEffect, useMemo } from 'react'
import { dashboardStyles as s } from '../assets/dummyStyles.js'
import {
  Stethoscope,
  UserCheck,
  Calendar,
  IndianRupee,
  CheckCircle,
  XCircle,
  Search,
  X,
} from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL
const PATIENT_COUNT_API = `${API_BASE}/api/appointments/patient/count`

// ─── StatCard Component (inline) ─────────────────────────────────────────────
function StatCard({ icon, label, value, loading, colorClass = 'text-emerald-600', bgClass = 'bg-emerald-50' }) {
  return (
    <div className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm border border-emerald-100 hover:shadow-md transition-all duration-200">
      <div className={`p-3 rounded-xl ${bgClass} flex-shrink-0`}>
        <span className={colorClass}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide truncate">{label}</p>
        <p className="text-2xl font-bold text-slate-800 mt-0.5">
          {loading ? (
            <span className="inline-block w-16 h-6 bg-slate-100 animate-pulse rounded-lg" />
          ) : (
            value
          )}
        </p>
      </div>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const safeNumber = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

function normalizeDoctor(doc) {
  const id = doc._id || doc.id || String(Math.random()).slice(2);
  const name =
    doc.name ||
    doc.fullName ||
    `${doc.firstName || ""} ${doc.lastName || ""}`.trim() ||
    "Unknown";
  const specialization =
    doc.specialization ||
    doc.speciality ||
    (Array.isArray(doc.specializations)
      ? doc.specializations.join(", ")
      : "") ||
    "General";
  const fee = safeNumber(
    doc.fee ?? doc.fees ?? doc.consultationFee ?? doc.consultation_fee ?? 0,
    0
  );
  const image =
    doc.imageUrl ||
    doc.image ||
    doc.avatar ||
    `https://i.pravatar.cc/150?u=${id}`;

  const appointments = {
    total:
      doc.appointments?.total ??
      doc.totalAppointments ??
      doc.appointmentsTotal ??
      0,
    completed:
      doc.appointments?.completed ??
      doc.completedAppointments ??
      doc.appointmentsCompleted ??
      0,
    canceled:
      doc.appointments?.canceled ??
      doc.canceledAppointments ??
      doc.appointmentsCanceled ??
      0,
  };

  let earnings = null;
  if (doc.earnings !== undefined && doc.earnings !== null)
    earnings = safeNumber(doc.earnings, 0);
  else if (doc.revenue !== undefined && doc.revenue !== null)
    earnings = safeNumber(doc.revenue, 0);
  else if (appointments.completed && fee)
    earnings = fee * safeNumber(appointments.completed, 0);
  else earnings = 0;

  return {
    id,
    name,
    specialization,
    fee,
    image,
    appointments,
    earnings,
    raw: doc,
  };
}

// ─── Main Component ───────────────────────────────────────────────────────────
const DashboardPage = () => {
    const [doctors,setDoctors] = useState([]);
    const [loading,setLoading] = useState(false);
    const [error,setError] = useState(null);

    // new patient count 
    const [patientCount , setPatientCount] = useState(0);
    const [patientCountLoading , setPatientCountLoading] = useState(false); 

    const [query, setQuery] = useState("");
    const [showAll, setShowAll] = useState(false);

    // to load doctors from the server side
    useEffect(() => {
    let mounted = true;
    async function loadDoctors() {
      setLoading(true);
      setError(null);
      try {
        const url = `${API_BASE}/api/doctors?limit=200`;
        const res = await fetch(url);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(
            body?.message || `Failed to fetch doctors (${res.status})`
          );
        }
        const body = await res.json();
        let list = [];
        if (Array.isArray(body)) list = body;
        else if (Array.isArray(body.doctors)) list = body.doctors;
        else if (Array.isArray(body.data)) list = body.data;
        else if (Array.isArray(body.items)) list = body.items;
        else {
          const firstArray = Object.values(body).find((v) => Array.isArray(v));
          if (firstArray) list = firstArray;
        }
        const normalized = list.map((d) => normalizeDoctor(d));
        if (mounted) setDoctors(normalized);
      } catch (err) {
        console.error("Failed to load doctors:", err);
        if (mounted) {
          setError(err.message || "Failed to load doctors");
          setDoctors([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadDoctors();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadPatientCount() {
      setPatientCountLoading(true);
      try {
        const res = await fetch(PATIENT_COUNT_API);
        if (!res.ok) {
          console.warn("Patient count fetch failed:", res.status);
          if (mounted) setPatientCount(0);
          return;
        }

        const body = await res.json().catch(() => ({}));
        const count = Number(
          body?.count ?? body?.totalUsers ?? body?.data ?? 0
        );
        if (mounted) setPatientCount(isNaN(count) ? 0 : count);
      } catch (err) {
        console.error("Failed to fetch patient count:", err);
        if (mounted) setPatientCount(0);
      } finally {
        if (mounted) setPatientCountLoading(false);
      }
    }
    loadPatientCount();
    return () => {
      mounted = false;
    };
  }, []);

  const totals = useMemo(() => {
    const totalDoctors = doctors.length;
    const totalAppointments = doctors.reduce(
      (s, d) => s + safeNumber(d.appointments?.total, 0),
      0
    );
    const totalEarnings = doctors.reduce(
      (s, d) => s + safeNumber(d.earnings, 0),
      0
    );
    const completed = doctors.reduce(
      (s, d) => s + safeNumber(d.appointments?.completed, 0),
      0
    );
    const canceled = doctors.reduce(
      (s, d) => s + safeNumber(d.appointments?.canceled, 0),
      0
    );
    const totalLoginPatients =
      doctors.reduce((s, d) => s + (d.raw?.loginPatientsCount ?? 0), 0) || 0;
    return {
      totalDoctors,
      totalAppointments,
      totalEarnings,
      completed,
      canceled,
      totalLoginPatients,
    };
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    if (!query) return doctors;
    const q = query.trim().toLowerCase();
    return doctors.filter((d) => {
      if (d.name.toLowerCase().includes(q)) return true;
      if ((d.specialization || "").toLowerCase().includes(q)) return true;
      return false;
    });
  }, [doctors, query]);

  const INITIAL_COUNT = 8;
  const visibleDoctors = showAll
    ? filteredDoctors
    : filteredDoctors.slice(0, INITIAL_COUNT);
    
  return (
    <div className={s.pageContainer}>
        <div className={s.maxWidthContainer}>
            <div className={s.headerContainer}>
                <div>
                    <h1 className={s.headerTitle}>Dashboard</h1>
                    <p className={s.headerSubtitle}>Overview of doctors and appointments</p>
                </div>
            </div>

            {/*stats cards*/}
            <div className={s.statsGrid}>
              <StatCard
                icon={<Stethoscope size={22} />}
                label="Total Doctors"
                value={totals.totalDoctors}
                loading={loading}
                colorClass="text-emerald-600"
                bgClass="bg-emerald-50"
              />
              <StatCard
                icon={<UserCheck size={22} />}
                label="Registered Users"
                value={patientCount}
                loading={patientCountLoading}
                colorClass="text-sky-600"
                bgClass="bg-sky-50"
              />
              <StatCard
                icon={<Calendar size={22} />}
                label="Total Appointments"
                value={totals.totalAppointments}
                loading={loading}
                colorClass="text-violet-600"
                bgClass="bg-violet-50"
              />
              <StatCard
                icon={<IndianRupee size={22} />}
                label="Total Earnings"
                value={`₹${totals.totalEarnings.toLocaleString('en-IN')}`}
                loading={loading}
                colorClass="text-amber-600"
                bgClass="bg-amber-50"
              />
              <StatCard
                icon={<CheckCircle size={22} />}
                label="Completed"
                value={totals.completed}
                loading={loading}
                colorClass="text-green-600"
                bgClass="bg-green-50"
              />
              <StatCard
                icon={<XCircle size={22} />}
                label="Canceled"
                value={totals.canceled}
                loading={loading}
                colorClass="text-rose-600"
                bgClass="bg-rose-50"
              />
            </div>

            {/* ── Search Bar ── */}
            <div className="mt-8 flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setShowAll(false); }}
                  placeholder="Search doctor by name or specialization…"
                  className="w-full pl-9 pr-4 py-2.5 rounded-full border border-emerald-200 bg-white shadow-sm text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition"
                />
              </div>
              {query && (
                <button
                  onClick={() => { setQuery(""); setShowAll(false); }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium shadow-sm transition cursor-pointer"
                >
                  <X size={14} /> Clear
                </button>
              )}
            </div>

            {/* ── Doctors Table ── */}
            <div className="mt-4 bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
              {/* Table header row */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-50">
                <span className="text-base font-semibold text-slate-800">All Doctors</span>
                <span className="text-sm text-slate-400">{filteredDoctors.length} record{filteredDoctors.length !== 1 ? 's' : ''}</span>
              </div>

              {error && (
                <div className="px-6 py-3 text-sm text-rose-600 bg-rose-50 border-b border-rose-100">{error}</div>
              )}

              {/* Desktop table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-emerald-50">
                  <thead className="bg-emerald-50">
                    <tr>
                      {['Doctor', 'Specialization', 'Fees', 'Total Appts', 'Completed', 'Canceled', 'Earnings'].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-emerald-50">
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}>
                          {Array.from({ length: 7 }).map((_, j) => (
                            <td key={j} className="px-5 py-4">
                              <div className="h-4 bg-slate-100 rounded-full animate-pulse" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : visibleDoctors.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-10 text-center text-slate-400 text-sm">
                          {query ? `No doctors found matching "${query}"` : 'No doctors available.'}
                        </td>
                      </tr>
                    ) : (
                      visibleDoctors.map((doc, idx) => (
                        <tr
                          key={doc.id}
                          className={`hover:bg-emerald-50/50 transition-colors ${idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'}`}
                        >
                          {/* Name + image */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <img
                                src={doc.image}
                                alt={doc.name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-emerald-100 flex-shrink-0"
                                onError={(e) => { e.target.src = `https://i.pravatar.cc/150?u=${doc.id}` }}
                              />
                              <div>
                                <div className="text-sm font-medium text-slate-800">{doc.name}</div>
                                <div className="text-xs text-slate-400">#{doc.id.slice(-6)}</div>
                              </div>
                            </div>
                          </td>
                          {/* Specialization */}
                          <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-600">{doc.specialization}</td>
                          {/* Fees */}
                          <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">
                            ₹{doc.fee.toLocaleString('en-IN')}
                          </td>
                          {/* Total Appointments */}
                          <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-700 text-center">{doc.appointments.total}</td>
                          {/* Completed */}
                          <td className="px-5 py-4 whitespace-nowrap text-sm text-emerald-600 font-medium text-center">{doc.appointments.completed}</td>
                          {/* Canceled */}
                          <td className="px-5 py-4 whitespace-nowrap text-sm text-rose-500 font-medium text-center">{doc.appointments.canceled}</td>
                          {/* Earnings */}
                          <td className="px-5 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">
                            ₹{safeNumber(doc.earnings).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Show more / Show less */}
              {filteredDoctors.length > INITIAL_COUNT && (
                <div className="px-6 py-4 border-t border-emerald-50 flex justify-center">
                  <button
                    onClick={() => setShowAll((prev) => !prev)}
                    className="px-5 py-2 rounded-full bg-white border border-emerald-200 text-sm text-slate-600 shadow-sm hover:bg-emerald-50 transition cursor-pointer"
                  >
                    {showAll ? 'Show less' : `Show all ${filteredDoctors.length} doctors`}
                  </button>
                </div>
              )}
            </div>

        </div>
    </div>
  )
}

export default DashboardPage
