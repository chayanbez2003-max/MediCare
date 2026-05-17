import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useDoctorAuth } from '../../context/DoctorContext';
import StatusBadge from '../../components/StatusBadge';

const API_BASE = 'import.meta.env.VITE_API_URL';

const DoctorAppointments = () => {
  const { doctorInfo, doctorToken } = useDoctorAuth();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const STATUSES = ['All', 'Pending', 'Confirmed', 'Completed', 'Canceled'];

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchAppointments = useCallback(async () => {
    if (!doctorInfo?._id && !doctorInfo?.id) return;
    const docId = doctorInfo._id || doctorInfo.id;
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ limit: '100' });
      if (search.trim()) params.set('search', search.trim());
      if (statusFilter !== 'All') params.set('status', statusFilter);

      const { data } = await axios.get(
        `${API_BASE}/api/appointments/doctor/${docId}?${params}`,
        { headers: { Authorization: `Bearer ${doctorToken}` } }
      );

      if (data.success) {
        setAppointments(data.appointments || []);
      } else {
        setError(data.message || 'Failed to load appointments');
      }
    } catch (err) {
      console.error('fetchAppointments error:', err);
      setError('Unable to reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [doctorInfo, doctorToken, search, statusFilter]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Mark appointment as completed
  const handleComplete = async (id) => {
    try {
      setUpdatingId(id);
      const { data } = await axios.put(
        `${API_BASE}/api/appointments/${id}`,
        { status: 'Completed' },
        { headers: { Authorization: `Bearer ${doctorToken}` } }
      );
      if (data.success) {
        setAppointments((prev) =>
          prev.map((a) => (a._id === id ? { ...a, status: 'Completed' } : a))
        );
        showToast('Marked as completed');
      } else {
        showToast(data.message || 'Failed to update', 'error');
      }
    } catch (err) {
      console.error('Complete error:', err);
      showToast('Server error', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  // Cancel appointment
  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      setUpdatingId(id);
      const { data } = await axios.post(
        `${API_BASE}/api/appointments/${id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${doctorToken}` } }
      );
      if (data.success) {
        setAppointments((prev) =>
          prev.map((a) => (a._id === id ? { ...a, status: 'Canceled' } : a))
        );
        showToast('Appointment cancelled');
      } else {
        showToast(data.message || 'Failed to cancel', 'error');
      }
    } catch (err) {
      console.error('Cancel error:', err);
      showToast('Server error', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const isTerminal = (status) => {
    const s = (status || '').toLowerCase();
    return s === 'completed' || s === 'canceled' || s === 'cancelled';
  };

  // Stats
  const total = appointments.length;
  const pending = appointments.filter((a) => a.status?.toLowerCase() === 'pending').length;
  const confirmed = appointments.filter((a) => a.status?.toLowerCase() === 'confirmed').length;
  const completed = appointments.filter((a) => a.status?.toLowerCase() === 'completed').length;
  const cancelled = appointments.filter((a) =>
    a.status?.toLowerCase() === 'canceled' || a.status?.toLowerCase() === 'cancelled'
  ).length;

  return (
    <div className="animate-fade-in space-y-6">
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Manage your patient appointments
          </p>
        </div>
        <button
          onClick={fetchAppointments}
          className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition cursor-pointer shadow-sm"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: total, icon: '📋', bg: 'bg-blue-50', text: 'text-blue-700' },
          { label: 'Pending', value: pending, icon: '⏳', bg: 'bg-amber-50', text: 'text-amber-700' },
          { label: 'Confirmed', value: confirmed, icon: '✅', bg: 'bg-emerald-50', text: 'text-emerald-700' },
          { label: 'Completed', value: completed, icon: '🎯', bg: 'bg-blue-50', text: 'text-blue-700' },
          { label: 'Cancelled', value: cancelled, icon: '❌', bg: 'bg-rose-50', text: 'text-rose-700' },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center gap-3"
          >
            <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center text-sm`}>
              {s.icon}
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">{s.label}</p>
              <p className={`text-lg font-bold ${s.text}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full sm:max-w-sm">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
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
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient name or mobile…"
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-white shadow-sm text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition"
          />
        </div>

        {/* Status pills */}
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition cursor-pointer ${
                statusFilter === s
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-emerald-50'
              }`}
            >
              {s === 'Canceled' ? 'Cancelled' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded-full w-1/4" />
                <div className="h-3 bg-gray-100 rounded-full w-1/3" />
              </div>
              <div className="h-6 w-20 bg-gray-200 rounded-full" />
            </div>
          ))}
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

      {/* Empty state */}
      {!loading && !error && appointments.length === 0 && (
        <div className="bg-white rounded-2xl shadow-md border border-emerald-100 p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Appointments Found</h2>
          <p className="text-gray-500 max-w-md">
            {search || statusFilter !== 'All'
              ? 'No appointments match your filters. Try adjusting your search.'
              : 'You don\'t have any appointments yet. Patients will show up here after booking.'}
          </p>
        </div>
      )}

      {/* Appointment Cards */}
      {!loading && !error && appointments.length > 0 && (
        <div className="space-y-3">
          {appointments.map((appt) => {
            const terminal = isTerminal(appt.status);
            const isUpdating = updatingId === appt._id;

            return (
              <div
                key={appt._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-4 sm:p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Patient avatar */}
                  <div className="w-12 h-12 rounded-full bg-emerald-100 border-2 border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-lg flex-shrink-0">
                    {(appt.patientName || 'P').charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <h3 className="text-base font-semibold text-gray-800">
                          {appt.patientName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {appt.mobile}
                          {appt.age ? ` · ${appt.age}y` : ''}
                          {appt.gender ? ` · ${appt.gender}` : ''}
                        </p>
                      </div>
                      <StatusBadge status={appt.status} size="md" />
                    </div>

                    {/* Details */}
                    <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-gray-600">
                      <span className="inline-flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {appt.date}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {appt.time}
                      </span>
                      <span className="font-semibold text-emerald-700">
                        ₹{appt.fees ?? 0}
                      </span>
                      {appt.payment?.status && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          appt.payment.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-gray-50 text-gray-500'
                        }`}>
                          {appt.payment.method} · {appt.payment.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0 mt-2 sm:mt-0">
                    {isUpdating ? (
                      <span className="inline-flex items-center gap-2 text-xs text-emerald-600 px-3 py-2">
                        <span className="w-3.5 h-3.5 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                        Updating…
                      </span>
                    ) : terminal ? (
                      <span className="text-xs text-gray-400 italic px-3 py-2">
                        {appt.status === 'Completed' ? '✓ Done' : '✕ Cancelled'}
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleComplete(appt._id)}
                          className="px-3 py-2 rounded-xl text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition cursor-pointer flex items-center gap-1.5"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Complete
                        </button>
                        <button
                          onClick={() => handleCancel(appt._id)}
                          className="px-3 py-2 rounded-xl text-xs font-medium bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition cursor-pointer flex items-center gap-1.5"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
