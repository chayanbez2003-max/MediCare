import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Doctors from './pages/Doctors'
import DoctorProfile from './pages/DoctorProfile'
import Service from './pages/Service'
import ServiceDetails from './pages/ServiceDetails'
import Contact from './pages/Contact'
import LoginDoc from './pages/LoginDoc'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentCancel from './pages/PaymentCancel'
import MyAppointments from './pages/MyAppointments'
import DoctorProtectedRoute from './doctor/DoctorProtectedRoute'
import DoctorLayout from './doctor/DoctorLayout'
import DoctorDashboard from './pages/doctor/DoctorDashboard'
import DoctorAppointments from './pages/doctor/DoctorAppointments'
import DoctorEditProfile from './pages/doctor/DoctorEditProfile'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/doctors" element={<Doctors/>}/>
      
      <Route path="/doctor/:id" element={<DoctorProfile/>}/>
      <Route path="/services" element={<Service/>}/>
      {/* Placeholder for future Service Booking / Details page */}
      <Route path="/services/:id" element={<ServiceDetails />}/>
      <Route path="/contact" element={<Contact/>}/>
      <Route path="/doctor-login" element={<LoginDoc/>}/>
      <Route path="/appointment/success" element={<PaymentSuccess/>}/>
      <Route path="/appointment/cancel" element={<PaymentCancel/>}/>
      <Route path="/my-appointments" element={<MyAppointments/>}/>
      
      {/* Doctor Dashboard Flow */}
      <Route path="/doctor" element={<DoctorProtectedRoute><DoctorLayout/></DoctorProtectedRoute>}>
        <Route path="dashboard" element={<DoctorDashboard/>}/>
        <Route path="appointments" element={<DoctorAppointments/>}/>
        <Route path="edit-profile" element={<DoctorEditProfile/>}/>
      </Route>
    </Routes>
  )
}

export default App
