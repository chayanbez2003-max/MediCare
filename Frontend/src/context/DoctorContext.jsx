import React, { createContext, useContext, useState, useEffect } from 'react';

const DoctorContext = createContext();

export const DoctorProvider = ({ children }) => {
  const [doctorToken, setDoctorToken] = useState(localStorage.getItem('doctorToken') || null);
  const [doctorInfo, setDoctorInfo] = useState(() => {
    const stored = localStorage.getItem('doctorInfo');
    try {
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  const loginDoctor = (token, info) => {
    setDoctorToken(token);
    setDoctorInfo(info);
    localStorage.setItem('doctorToken', token);
    localStorage.setItem('doctorInfo', JSON.stringify(info));
  };

  const logoutDoctor = () => {
    setDoctorToken(null);
    setDoctorInfo(null);
    localStorage.removeItem('doctorToken');
    localStorage.removeItem('doctorInfo');
  };

  const updateDoctorInfo = (info) => {
    setDoctorInfo(info);
    localStorage.setItem('doctorInfo', JSON.stringify(info));
  };

  return (
    <DoctorContext.Provider value={{ doctorToken, doctorInfo, loginDoctor, logoutDoctor, updateDoctorInfo }}>
      {children}
    </DoctorContext.Provider>
  );
};

export const useDoctorAuth = () => useContext(DoctorContext);
