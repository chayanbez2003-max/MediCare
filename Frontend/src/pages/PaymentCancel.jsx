import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FooterPage from '../components/FooterPage';

const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 relative overflow-hidden">
      {/* Decorative blobs */}
      <div aria-hidden className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-40" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-32 w-96 h-96 bg-teal-100 rounded-full blur-3xl opacity-40" />

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeUp 0.5s ease-out both; }
      `}</style>

      <Navbar />

      <main className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-24 font-serif">
        <div className="fade-in bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-amber-100 overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400" />
          <div className="p-8 sm:p-12 text-center">
            {/* Icon */}
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
            <p className="text-gray-500 mb-3">
              Your payment was not completed. No charges have been made.
            </p>
            <p className="text-sm text-gray-400 mb-8">
              Your appointment slot has not been confirmed. You can try booking again anytime.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/doctors')}
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full font-semibold shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-teal-600 active:scale-95 transition-all"
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
      </main>

      <FooterPage />
    </div>
  );
};

export default PaymentCancel;
