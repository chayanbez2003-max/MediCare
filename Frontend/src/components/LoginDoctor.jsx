import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDoctorAuth } from '../context/DoctorContext';
import { loginPageStyles } from '../assets/dummyStyles';
import logo from '../assets/logo.png'; // Assuming logo exists here

const LoginDoctor = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    const { loginDoctor } = useDoctorAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);

        try {
            // Adjust the URL if your backend runs on a different port/host.
            const response = await axios.post('/api/doctor/login', {
                email,
                password
            });

            if (response.data.success) {
                // Save context
                loginDoctor(response.data.token, response.data.data);
                // Navigate to dashboard
                navigate('/doctor/dashboard');
            } else {
                setErrorMsg(response.data.message || 'Login failed.');
            }
        } catch (error) {
            console.error('Login error:', error);
            setErrorMsg(error.response?.data?.message || 'An error occurred during login. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
       <div className={`${loginPageStyles.mainContainer} !min-h-screen !w-full flex items-center justify-center p-4`}>
           <div className={loginPageStyles.loginCard}>
               <div className={loginPageStyles.logoContainer}>
                   <img src={logo} alt="Medicare Logo" className={loginPageStyles.logo} />
               </div>
               
               <h1 className={loginPageStyles.title}>Doctor Portal</h1>
               <p className={loginPageStyles.subtitle}>Sign in to manage your appointments</p>

               {errorMsg && (
                   <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-sm text-center">
                       {errorMsg}
                   </div>
               )}

               <form onSubmit={handleSubmit} className={loginPageStyles.form}>
                   <div>
                       <input 
                           type="email" 
                           placeholder="Doctor Email"
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           required
                           className={loginPageStyles.input}
                       />
                   </div>
                   <div>
                       <input 
                           type="password" 
                           placeholder="Password"
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           required
                           className={loginPageStyles.input}
                       />
                   </div>
                   <button 
                       type="submit" 
                       disabled={loading}
                       className={`${loginPageStyles.submitButton} flex justify-center items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                   >
                       {loading ? 'Authenticating...' : 'Sign In'}
                   </button>
               </form>

               <div className="mt-6 text-center text-sm text-green-700">
                   <button onClick={() => navigate('/')} className="hover:underline font-medium text-emerald-600">
                       &larr; Back to Main Website
                   </button>
               </div>
           </div>
       </div>
    );
};

export default LoginDoctor;