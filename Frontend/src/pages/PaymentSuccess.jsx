import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FooterPage from '../components/FooterPage';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');

  const [status, setStatus] = useState('loading'); // loading | success | error
  const [appointment, setAppointment] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      setErrorMsg('No payment session found. Please try booking again.');
      return;
    }

    const confirmPayment = async () => {
      try {
        const res = await fetch(
          `http://localhost:4000/api/appointments/confirm-payment?sessionId=${sessionId}`
        );
        const json = await res.json();

        if (json.success) {
          setAppointment(json.appointment);
          setStatus('success');
        } else {
          setStatus('error');
          setErrorMsg(json.message || 'Payment confirmation failed.');
        }
      } catch (err) {
        console.error('Confirm payment error:', err);
        setStatus('error');
        setErrorMsg('Unable to reach the server. Please try again later.');
      }
    };

    confirmPayment();
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 relative overflow-hidden">
      {/* Decorative blobs */}
      <div aria-hidden className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-40" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-32 w-96 h-96 bg-teal-100 rounded-full blur-3xl opacity-40" />

      <style>{`
        @keyframes successPop {
          0%   { transform: scale(0.6); opacity: 0; }
          60%  { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .success-icon { animation: successPop 0.5s ease-out both; }
        .fade-up { animation: fadeUp 0.5s 0.2s ease-out both; }
        .fade-up-2 { animation: fadeUp 0.5s 0.35s ease-out both; }
      `}</style>

      <Navbar />

      <main className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-24 font-serif">

        {/* ── LOADING ── */}
        {status === 'loading' && (
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-emerald-100 p-10 sm:p-14 text-center">
            <div className="w-16 h-16 mx-auto mb-6 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
            <h2 className="text-xl font-bold text-gray-700 mb-2">Confirming your payment…</h2>
            <p className="text-sm text-gray-500">Please wait while we verify with Stripe.</p>
          </div>
        )}

        {/* ── SUCCESS ── */}
        {status === 'success' && (
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-emerald-100 overflow-hidden">
            <div className="h-2 w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500" />
            <div className="p-8 sm:p-12 text-center">
              {/* Checkmark */}
              <div className="success-icon w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h1 className="fade-up text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
              <p className="fade-up text-gray-500 mb-8">Your appointment has been confirmed and payment received.</p>

              {/* Appointment details card */}
              {appointment && (
                <div className="fade-up-2 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-5 sm:p-6 mb-8 text-left space-y-3">
                  {[
                    { label: 'Patient', value: appointment.patientName },
                    { label: 'Doctor', value: appointment.doctorName },
                    { label: 'Specialization', value: appointment.speciality },
                    { label: 'Date', value: appointment.date },
                    { label: 'Time', value: appointment.time },
                    { label: 'Fee Paid', value: appointment.fees != null ? `₹${appointment.fees}` : '—' },
                    { label: 'Status', value: appointment.status },
                  ].map(({ label, value }) =>
                    value ? (
                      <div key={label} className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 font-medium">{label}</span>
                        <span className="font-semibold text-gray-800 text-right max-w-[60%]">{value}</span>
                      </div>
                    ) : null
                  )}
                  <div className="border-t border-emerald-200 pt-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 font-medium">Payment</span>
                      <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Paid
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate('/doctors')}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full font-semibold shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-teal-600 active:scale-95 transition-all"
                >
                  Browse More Doctors
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="px-8 py-3 bg-white border border-emerald-200 text-emerald-700 rounded-full font-semibold shadow-sm hover:bg-emerald-50 hover:shadow-md active:scale-95 transition-all"
                >
                  Go Home
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── ERROR ── */}
        {status === 'error' && (
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-red-100 overflow-hidden">
            <div className="h-2 w-full bg-gradient-to-r from-red-400 via-orange-400 to-red-400" />
            <div className="p-8 sm:p-12 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Confirmation Failed</h2>
              <p className="text-gray-500 mb-8">{errorMsg}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate('/doctors')}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full font-semibold shadow-lg hover:shadow-xl active:scale-95 transition-all"
                >
                  Try Booking Again
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="px-8 py-3 bg-white border border-gray-200 text-gray-700 rounded-full font-semibold shadow-sm hover:bg-gray-50 hover:shadow-md active:scale-95 transition-all"
                >
                  Go Home
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      <FooterPage />
    </div>
  );
};

export default PaymentSuccess;
