import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import Navbar from '../components/Navbar';
import FooterPage from '../components/FooterPage';
import StatusBadge from '../components/StatusBadge';

const API_BASE = 'http://localhost:4000';

const MyAppointments = () => {
  const { getToken, isSignedIn, isLoaded } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [toast, setToast] = useState(null);

  // Fetch patient appointments
  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/appointments/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
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
  }, [getToken]);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchAppointments();
    } else if (isLoaded && !isSignedIn) {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, fetchAppointments]);

  // Cancel appointment
  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      setCancellingId(id);
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/appointments/${id}/cancel`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (data.success) {
        setAppointments((prev) =>
          prev.map((a) => (a._id === id ? { ...a, status: 'Canceled' } : a))
        );
        showToast('Appointment cancelled successfully', 'success');
      } else {
        showToast(data.message || 'Failed to cancel', 'error');
      }
    } catch (err) {
      console.error('Cancel error:', err);
      showToast('Server error. Please try again.', 'error');
    } finally {
      setCancellingId(null);
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const isTerminal = (status) => {
    const s = (status || '').toLowerCase();
    return s === 'completed' || s === 'canceled' || s === 'cancelled';
  };

  const getDoctorImage = (appt) => {
    return appt.doctorImage?.url ||
      (appt.doctorId && typeof appt.doctorId === 'object' ? appt.doctorId.imageUrl || appt.doctorId.image : null) ||
      null;
  };

  // ── Not signed in state ──
  if (isLoaded && !isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-24 text-center font-serif">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-emerald-100 p-10">
            <div className="w-20 h-20 mx-auto mb-6 bg-amber-50 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Sign In Required</h2>
            <p className="text-gray-500">Please sign in to view your appointments.</p>
          </div>
        </div>
        <FooterPage />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 relative">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl border text-sm font-medium transition-all duration-300 ${
          toast.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : 'bg-rose-50 border-rose-200 text-rose-700'
        }`}>
          {toast.message}
        </div>
      )}

      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 font-serif">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            My Appointments
          </h1>
          <p className="text-gray-500 mt-2 text-sm">View and manage all your booked appointments</p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-emerald-100 p-6 shadow-sm animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-200 rounded-full w-1/3" />
                    <div className="h-3 bg-gray-100 rounded-full w-1/4" />
                    <div className="h-3 bg-gray-100 rounded-full w-1/2" />
                  </div>
                </div>
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
              className="mt-3 px-5 py-2 bg-rose-100 text-rose-700 rounded-full text-sm font-medium hover:bg-rose-200 transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && appointments.length === 0 && (
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-md border border-emerald-100 p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-5 bg-emerald-50 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">No Appointments Yet</h2>
            <p className="text-gray-500 max-w-md mx-auto">
              You haven't booked any appointments. Browse our doctors to schedule your first consultation.
            </p>
          </div>
        )}

        {/* Appointment List */}
        {!loading && !error && appointments.length > 0 && (
          <div className="space-y-4">
            {appointments.map((appt) => {
              const docImg = getDoctorImage(appt);
              const docName = appt.doctorName || (appt.doctorId?.name) || 'Doctor';
              const docSpec = appt.speciality || (appt.doctorId?.specialization) || '';
              const terminal = isTerminal(appt.status);

              return (
                <article
                  key={appt._id}
                  className="bg-white rounded-2xl border border-emerald-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      {/* Doctor image */}
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-emerald-100 border-2 border-emerald-200 flex-shrink-0 mx-auto sm:mx-0">
                        {docImg ? (
                          <img src={docImg} alt={docName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-emerald-600 font-bold text-xl">
                            {docName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 text-center sm:text-left">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">{docName}</h3>
                            {docSpec && <p className="text-sm text-emerald-600">{docSpec}</p>}
                          </div>
                          <StatusBadge status={appt.status} size="md" />
                        </div>

                        {/* Details row */}
                        <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-x-5 gap-y-2 text-sm text-gray-600">
                          <span className="inline-flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {appt.date}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {appt.time}
                          </span>
                          <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                            ₹{appt.fees ?? 0}
                          </span>
                          {appt.payment?.status && (
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                              appt.payment.status === 'Paid'
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-gray-50 text-gray-500'
                            }`}>
                              {appt.payment.method} · {appt.payment.status}
                            </span>
                          )}
                        </div>

                        {/* Patient info */}
                        <div className="mt-2 text-xs text-gray-400">
                          Patient: {appt.patientName} · {appt.mobile}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {!terminal && (
                      <div className="mt-4 pt-4 border-t border-emerald-50 flex justify-end">
                        <button
                          onClick={() => handleCancel(appt._id)}
                          disabled={cancellingId === appt._id}
                          className="px-4 py-2 rounded-full text-sm font-medium bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                        >
                          {cancellingId === appt._id ? (
                            <>
                              <span className="w-3.5 h-3.5 border-2 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
                              Cancelling…
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Cancel Appointment
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <FooterPage />
    </div>
  );
};

export default MyAppointments;
