import React from 'react';
import { useState } from "react";
import { 
  Phone, 
  Mail, 
  MapPin, 
  ChevronRight, 
  CheckCircle2, 
  Stethoscope,
  Send
} from 'lucide-react';
import { Link } from 'react-router-dom';

const FooterPage = () => {
  const [email, setEmail] = useState("");
  const handleSubscribe = () => {
  if (!email) {
    alert("Please enter your email");
    return;
  }

  window.location.href =
    `mailto:contact@medicare.com?subject=Newsletter Subscription&body=Please subscribe this email: ${email}`;
};

  return (
    <footer className="bg-emerald-50/70 pt-16 pb-8 border-t border-emerald-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Main Footer Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* 1. Brand / About Section */}
          <div className="flex flex-col space-y-6">
            <div className="flex items-center space-x-2">
              <div className="bg-emerald-600 rounded-full p-2 text-white">
                <Stethoscope size={24} />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-emerald-900">MediCare</span>
                <span className="text-xs font-semibold text-emerald-600 tracking-wide uppercase">Healthcare Solutions</span>
              </div>
            </div>
            
            <p className="text-emerald-800/80 text-sm leading-relaxed pr-4">
              Committed to making healthcare simpler, smarter, and more accessible through trusted service, modern care, and patient-first support.
            </p>
            
            <div className="space-y-4 pt-2">
              <div className="flex items-center space-x-3 group cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm shadow-emerald-100 group-hover:shadow-md group-hover:shadow-emerald-200 transition-all duration-300">
                  <Phone size={18} />
                </div>
                <span className="text-sm font-medium text-emerald-800 group-hover:text-emerald-600 transition-colors">+91-8509796196</span>
              </div>
              
              <div className="flex items-center space-x-3 group cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm shadow-emerald-100 group-hover:shadow-md group-hover:shadow-emerald-200 transition-all duration-300">
                  <Mail size={18} />
                </div>
                <span className="text-sm font-medium text-emerald-800 group-hover:text-emerald-600 transition-colors">contact@medicare.com</span>
              </div>
              
              <div className="flex items-center space-x-3 group cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm shadow-emerald-100 group-hover:shadow-md group-hover:shadow-emerald-200 transition-all duration-300">
                  <MapPin size={18} />
                </div>
                <span className="text-sm font-medium text-emerald-800 group-hover:text-emerald-600 transition-colors">Rajarhat, Kolkata, West Bengal, 700002</span>
              </div>
            </div>
          </div>

          {/* 2. Quick Links Section */}
          <div className="flex flex-col lg:pl-4">
            <h3 className="text-lg font-bold text-emerald-900 mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { name: 'Home', path: '/' },
                { name: 'Doctors', path: '/doctors' },
                { name: 'Services', path: '/services' },
                { name: 'Contact', path: '/contact' },
                { name: 'Appointments', path: '/appointments' },
              ].map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.path} 
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    className="flex items-center text-emerald-800/80 hover:text-emerald-700 transition-all duration-300 group"
                  >
                    <ChevronRight size={16} className="mr-2 text-emerald-400 group-hover:translate-x-1 group-hover:text-emerald-600 transition-all" />
                    <span className="text-sm font-medium">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Services Section */}
          <div className="flex flex-col">
            <h3 className="text-lg font-bold text-emerald-900 mb-6">Our Services</h3>
            <ul className="space-y-3">
              {[
                'Blood Pressure Check',
                'Blood Sugar Test',
                'Full Body Checkup',
                'X-Ray Scan',
                'ECG Test'
              ].map((service, index) => (
                <li key={index}>
                  <Link 
                    to="#" 
                    className="flex items-center text-emerald-800/80 hover:text-emerald-700 transition-all duration-300 group"
                  >
                    <CheckCircle2 size={16} className="mr-2 text-emerald-500 group-hover:scale-110 group-hover:text-emerald-600 transition-all" />
                    <span className="text-sm font-medium">{service}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. Stay Connected Section */}
          <div className="flex flex-col">
            <h3 className="text-lg font-bold text-emerald-900 mb-6">Stay Connected</h3>
            <p className="text-emerald-800/80 text-sm mb-4">
              Subscribe for wellness tips and medical updates delivered directly to your inbox.
            </p>
            
            <div className="flex items-center bg-white rounded-full p-1 shadow-sm shadow-emerald-100 border border-emerald-100 mb-8 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-300 transition-all">
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent outline-none px-4 text-sm text-emerald-900 placeholder-emerald-400"
              />
              <button
                onClick={handleSubscribe}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-2.5 px-4 flex items-center justify-center transition-colors shadow-sm"
              >
                <span className="text-sm font-medium mr-1 md:hidden lg:inline">
                  Subscribe
                </span>
                <Send size={14} />
              </button>
            </div>
            
            <div className="flex items-center space-x-4 mt-auto">
              <a 
                href="https://www.linkedin.com/" 
                className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm shadow-emerald-100 border border-emerald-50 hover:bg-emerald-600 hover:text-white hover:shadow-md hover:shadow-emerald-200 transition-all duration-300"
                aria-label="LinkedIn"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
              <a 
                href="https://www.youtube.com/" 
                className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm shadow-emerald-100 border border-emerald-50 hover:bg-red-600 hover:text-white hover:shadow-md hover:shadow-red-200 transition-all duration-300"
                aria-label="YouTube"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
              </a>
            </div>
          </div>
          
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-emerald-900/10 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-emerald-800/70 font-medium">
            © 2026 MediCare Healthcare.
          </p>
          <p className="text-sm text-emerald-800/70 font-medium">
            Designed by <span className="text-emerald-700 font-semibold hover:text-emerald-900 cursor-pointer transition-colors">Chayan</span>
          </p>
        </div>
        
      </div>
    </footer>
  );
};

export default FooterPage;
