import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDoctorAuth } from '../context/DoctorContext';
import logo from '../assets/logo.png';

const DoctorNavs = () => {
  const { doctorInfo, logoutDoctor } = useDoctorAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutDoctor();
    navigate('/doctor-login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/doctor/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Appointments', path: '/doctor/appointments', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { name: 'Edit Profile', path: '/doctor/edit-profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }
  ];

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-white border-b border-emerald-100 flex items-center justify-between p-4 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
          <div>
            <h1 className="text-xl font-bold text-emerald-700 bg-clip-text text-transparent bg-linear-to-r from-emerald-600 to-green-600">MediCare</h1>
          </div>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-emerald-700 p-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Sidebar Navigation */}
      <div className={`${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-64 bg-white border-r border-emerald-100 min-h-screen md:sticky top-0 z-40 fixed md:relative shadow-md`}>
        
        {/* Desktop Logo Area */}
        <div className="hidden md:flex flex-col items-center py-8 border-b border-emerald-50">
          <div className="relative w-20 h-20 mb-3">
            <div className="absolute inset-0 bg-emerald-100 rounded-full animate-pulse opacity-50"></div>
            <img src={logo} alt="Medicare Logo" className="relative z-10 w-full h-full object-contain" />
          </div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-emerald-600 to-green-600 tracking-tight">MediCare</h2>
          <p className="text-xs text-emerald-600/70 font-medium tracking-wide uppercase mt-1">Healthcare Solution</p>
        </div>

        {/* Doctor Info (Optional minimal display) */}
        <div className="px-6 py-4 flex items-center gap-3 border-b border-emerald-50">
          <div className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-emerald-200 flex items-center justify-center text-emerald-700 font-bold overflow-hidden">
             {doctorInfo?.imageUrl ? <img src={doctorInfo.imageUrl} alt="Profile" className="w-full h-full object-cover" /> : doctorInfo?.name?.charAt(0).toUpperCase() || 'D'}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-bold text-gray-800 truncate">{doctorInfo?.name || 'Doctor'}</span>
            <span className="text-xs text-emerald-600 truncate">{doctorInfo?.specialization || 'Dashboard'}</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                  isActive
                    ? 'bg-linear-to-r from-emerald-500 to-green-500 text-white shadow-md shadow-emerald-200/50'
                    : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                }`
              }
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-emerald-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default DoctorNavs;
