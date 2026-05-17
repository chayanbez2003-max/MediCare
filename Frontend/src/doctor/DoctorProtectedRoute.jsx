import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useDoctorAuth } from '../context/DoctorContext';

const DoctorProtectedRoute = ({ children }) => {
  const { doctorToken } = useDoctorAuth();

  if (!doctorToken) {
    return <Navigate to="/doctor-login" replace />;
  }

  // Support both wrapper usage <DoctorProtectedRoute><Component/></DoctorProtectedRoute> and layout usage <DoctorProtectedRoute />
  return children ? children : <Outlet />;
};

export default DoctorProtectedRoute;
