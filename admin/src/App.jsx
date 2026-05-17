import React from 'react'
import {Route, Routes } from 'react-router-dom'
import Hero from './pages/Hero'
import Home from './pages/Home'
import { useAuth } from '@clerk/react'
import { Link } from 'react-router-dom'
import Add from './pages/Add'
import List from './pages/List'
import Appointment from './pages/Appointment'
import SerDashboard from './pages/SerDashboard'
import AddSerPage from './pages/AddSerPage'
import ListSerPage from './pages/ListSerPage'
import ServiceApptPage from './pages/ServiceApptPage'



function RequireAuth({ children }) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return null;

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-100 via-green-50 to-emerald-200 px-4">
        
        <div className="bg-white shadow-xl rounded-2xl p-8 max-w-sm w-full text-center">
          
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            🔒 Access Restricted
          </h2>

          <p className="text-gray-600 mb-6">
            Please log in to continue and view this page.
          </p>

          <Link
            to="/"
            className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-2 rounded-lg transition duration-200"
          >
            Go to Home
          </Link>

        </div>

      </div>
    );
  }

  return children;
}

const App = () => {
  return (
    <Routes>

      <Route path="/" element={<Hero />} />

      <Route path="/h" element={<RequireAuth>
        <Home/>
      </RequireAuth>} />

      <Route path="/add" element={<RequireAuth>
        <Add/>
      </RequireAuth>} />

      <Route path="/list" element={<RequireAuth>
        <List/>
      </RequireAuth>} />

      <Route path="/appointments" element={<RequireAuth>
        <Appointment/>
      </RequireAuth>} />

      <Route path="/service-dashboard" element={<RequireAuth>
        <SerDashboard/>
      </RequireAuth>} />

      <Route path="/add-service" element={<RequireAuth>
        <AddSerPage/>
      </RequireAuth>} />

      <Route path="/list-service" element={<RequireAuth>
        <ListSerPage/>
      </RequireAuth>} />

      <Route path="/service-appointments" element={<RequireAuth>
        <ServiceApptPage/>
      </RequireAuth>} />

    </Routes>



    
      
  )
}

export default App