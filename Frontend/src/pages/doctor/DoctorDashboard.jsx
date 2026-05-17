import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useDoctorAuth } from '../../context/DoctorContext';

// ── Shared stat card ─────────────────────────────────────────────
const StatCard = ({ label, value, icon, bg, text, sub }) => (
  <div className={`relative overflow-hidden bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
        <p className={`text-2xl font-bold ${text}`}>{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center text-xl flex-shrink-0`}>
        {icon}
      </div>
    </div>
    {/* Decorative circle */}
    <div className={`absolute -bottom-4 -right-4 w-20 h-20 rounded-full ${bg} opacity-30`} />
  </div>
);

// ── Custom donut tooltip ─────────────────────────────────────────
const DonutTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    const d = payload[0];
    return (
      <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-3 py-2 text-sm">
        <span style={{ color: d.payload.color }} className="font-semibold">{d.name}</span>
        <span className="ml-2 text-gray-700 font-bold">{d.value}</span>
      </div>
    );
  }
  return null;
};

// ── Custom bar/area tooltip ──────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-4 py-3 text-xs space-y-1">
        <p className="font-bold text-gray-700 mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.dataKey} style={{ color: p.color }}>
            {p.name}: <span className="font-bold">{p.dataKey === 'earnings' ? `₹${p.value}` : p.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ── Donut centre label ───────────────────────────────────────────
const DonutLabel = ({ cx, cy, total }) => (
  <>
    <text x={cx} y={cy - 6} textAnchor="middle" className="fill-gray-800" style={{ fontSize: 22, fontWeight: 700 }}>{total}</text>
    <text x={cx} y={cy + 14} textAnchor="middle" className="fill-gray-400" style={{ fontSize: 11 }}>Total</text>
  </>
);

// ── Main dashboard ───────────────────────────────────────────────
const DoctorDashboard = () => {
  const { doctorInfo, doctorToken } = useDoctorAuth();

  const [stats, setStats] = useState({
    totalAppointments: doctorInfo?.appointmentsTotal || 0,
    cancelledAppointments: 0,
    successfulAppointments: doctorInfo?.appointmentsCompleted || 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    earnings: doctorInfo?.earnings || 0,
  });
  const [statusBreakdown, setStatusBreakdown] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!doctorToken) return;
    const fetchStats = async () => {
      try {
        const { data } = await axios.get('http://localhost:4000/api/doctor/dashboard-stats', {
          headers: { Authorization: `Bearer ${doctorToken}` }
        });
        if (data.success) {
          setStats(data.stats);
          setStatusBreakdown(data.statusBreakdown || []);
          setMonthlyTrend(data.monthlyTrend || []);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [doctorToken]);

  const completionRate = stats.totalAppointments
    ? Math.round((stats.successfulAppointments / stats.totalAppointments) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Welcome back, {doctorInfo?.name || 'Doctor'} 👋</p>
        </div>
        <div className="text-xs text-gray-400 bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-sm">
          Last 6 months
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard label="Total Appt." value={stats.totalAppointments} icon="📅" bg="bg-blue-50"   text="text-blue-700" />
        <StatCard label="Completed"   value={stats.successfulAppointments} icon="✅" bg="bg-emerald-50" text="text-emerald-700" sub={`${completionRate}% rate`} />
        <StatCard label="Pending"     value={stats.pendingAppointments}    icon="⏳" bg="bg-amber-50"   text="text-amber-700" />
        <StatCard label="Cancelled"   value={stats.cancelledAppointments}  icon="❌" bg="bg-rose-50"    text="text-rose-700" />
        <StatCard label="Earnings"    value={`₹${stats.earnings.toLocaleString()}`} icon="💰" bg="bg-yellow-50" text="text-yellow-700" />
      </div>

      {/* ── Charts Row 1 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Monthly trend bar chart – wider */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold text-gray-700">Monthly Appointments</h2>
            <span className="text-xs text-gray-400">Last 6 months</span>
          </div>
          {loading ? (
            <div className="h-48 flex items-center justify-center text-gray-300 text-sm">Loading…</div>
          ) : monthlyTrend.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-300 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyTrend} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Bar dataKey="total"     name="Total"     fill="#3b82f6" radius={[4,4,0,0]} />
                <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4,4,0,0]} />
                <Bar dataKey="cancelled" name="Cancelled" fill="#f43f5e" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Donut chart – narrower */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-gray-700 mb-4">Status Breakdown</h2>
          {loading ? (
            <div className="h-48 flex items-center justify-center text-gray-300 text-sm">Loading…</div>
          ) : statusBreakdown.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-300 text-sm">No data yet</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={statusBreakdown}
                    cx="50%" cy="50%"
                    innerRadius={52} outerRadius={78}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusBreakdown.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="none" />
                    ))}
                    <DonutLabel cx="50%" cy="50%" total={stats.totalAppointments} />
                  </Pie>
                  <Tooltip content={<DonutTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
                {statusBreakdown.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs text-gray-600">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                    {d.name} ({d.value})
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Charts Row 2 – Earnings area line ── */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-bold text-gray-700">Earnings Trend (₹)</h2>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            Total ₹{stats.earnings.toLocaleString()}
          </span>
        </div>
        {loading ? (
          <div className="h-40 flex items-center justify-center text-gray-300 text-sm">Loading…</div>
        ) : monthlyTrend.every(m => m.earnings === 0) ? (
          <div className="h-40 flex items-center justify-center text-gray-300 text-sm">No earnings data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={monthlyTrend}>
              <defs>
                <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone" dataKey="earnings" name="Earnings"
                stroke="#10b981" strokeWidth={2.5}
                fill="url(#earningsGrad)" dot={{ r: 4, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#10b981' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Profile summary strip ── */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4 text-white shadow-md">
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/40 bg-emerald-600 flex items-center justify-center text-2xl font-bold flex-shrink-0">
          {doctorInfo?.imageUrl
            ? <img src={doctorInfo.imageUrl} alt="Profile" className="w-full h-full object-cover" />
            : doctorInfo?.name?.charAt(0).toUpperCase() || 'D'}
        </div>
        <div className="text-center sm:text-left">
          <p className="font-bold text-lg">{doctorInfo?.name || 'Doctor'}</p>
          <p className="text-sm text-white/70">{doctorInfo?.specialization || ''} {doctorInfo?.location ? `· ${doctorInfo.location}` : ''}</p>
        </div>
        <div className="sm:ml-auto flex gap-6 text-center">
          <div><p className="text-xl font-bold">{doctorInfo?.rating || '—'}</p><p className="text-xs text-white/70">Rating</p></div>
          <div><p className="text-xl font-bold">{doctorInfo?.patients || '—'}</p><p className="text-xs text-white/70">Patients</p></div>
          <div><p className="text-xl font-bold">{doctorInfo?.experience || '—'}</p><p className="text-xs text-white/70">Exp.</p></div>
        </div>
      </div>

    </div>
  );
};

export default DoctorDashboard;
