import React from 'react';
import { Outlet } from 'react-router-dom';
import DoctorNavs from './DoctorNavs';

const DoctorLayout = () => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F8FAFC]">
      {/* Sidebar - Fixes on the left for desktop, top/hidden on mobile */}
      <DoctorNavs />

      {/* Main Content Area */}
      <div className="flex-1 overflow-x-hidden flex flex-col">
        {/* Dynamic nested routes render here */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DoctorLayout;
