import React from 'react';
import { certificationStyles } from '../assets/dummyStyles';

import C1 from '../assets/C1.png';
import C2 from '../assets/C2.png';
import C3 from '../assets/C3.png';
import C4 from '../assets/C4.svg';
import C5 from '../assets/C5.png';
import C6 from '../assets/C6.png';

const CertificationCard = ({ image, label }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-5 transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-white rounded-2xl bg-white/60 border border-green-100 shadow-sm cursor-default">
      <img src={image} alt={label} className="w-16 h-16 sm:w-20 sm:h-20 object-contain mb-3 sm:mb-4 drop-shadow-sm transition-transform duration-300 group-hover:scale-110" />
      <span className="text-xs sm:text-sm font-semibold text-gray-800 text-center leading-tight mx-auto">{label}</span>
    </div>
  );
};

const Certification = () => {
  const certifications = [
    { image: C1, label: "Government Approved" },
    { image: C2, label: "NABH Accredited" },
    { image: C3, label: "Medical Council" },
    { image: C4, label: "Quality Healthcare" },
    { image: C5, label: "Paramedical Council" },
    { image: C6, label: "Ministry of Health" },
  ];

  return (
    <section className="relative py-12 lg:py-16 bg-linear-to-br from-emerald-50 via-green-50 to-teal-50 overflow-hidden">
      
      {/* 1. SECTION SEPARATOR (Top Divider) */}
      <div className={certificationStyles.topLine}></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER AREA */}
        <div className="text-center mb-10 flex flex-col items-center">
          
          {/* 2. SECTION HEADER */}
          <div className="flex items-center justify-center w-full max-w-5xl mx-auto gap-3 sm:gap-6 mb-3 animate-fade-in">
            <div className="flex-grow h-[2px] max-w-[3rem] sm:max-w-[6rem] md:max-w-[10rem] lg:max-w-[14rem] bg-linear-to-r from-transparent via-green-300 to-green-500 rounded-full opacity-80"></div>
            <h2 className="shrink-0 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-gray-900 tracking-tight text-center">
              <span className="bg-linear-to-br from-green-700 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
                Certified & Excellence
              </span>
            </h2>
            <div className="flex-grow h-[2px] max-w-[3rem] sm:max-w-[6rem] md:max-w-[10rem] lg:max-w-[14rem] bg-linear-to-l from-transparent via-green-300 to-green-500 rounded-full opacity-80"></div>
          </div>
          
          {/* 3. SUBTEXT */}
          <div className="flex items-center justify-center w-full max-w-4xl mx-auto gap-2 sm:gap-4 mb-6">
            <div className="flex-grow h-[1px] max-w-[2rem] sm:max-w-[4rem] md:max-w-[6rem] lg:max-w-[8rem] bg-linear-to-r from-transparent via-green-200 to-green-400 rounded-full opacity-60"></div>
            <p className="shrink text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 text-center font-light tracking-wide px-1">
              Government recognized and internationally accredited healthcare standards
            </p>
            <div className="flex-grow h-[1px] max-w-[2rem] sm:max-w-[4rem] md:max-w-[6rem] lg:max-w-[8rem] bg-linear-to-l from-transparent via-green-200 to-green-400 rounded-full opacity-60"></div>
          </div>

          {/* 4. BADGE / TAG */}
          <div className="inline-flex items-center px-5 py-2.5 bg-green-500/10 border border-green-400/30 rounded-full shadow-sm">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse mr-2.5"></div>
            <span className="text-green-800 font-bold tracking-wider text-xs sm:text-sm uppercase">Officially Certified</span>
          </div>
          
        </div>

        {/* 5. & 6. CERTIFICATION ICONS GRID */}
        {/* Responsive Grid: 2 cols on mobile, 3 on tablet, 6 on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto mt-8">
          {certifications.map((cert, index) => (
            <CertificationCard key={index} image={cert.image} label={cert.label} />
          ))}
        </div>

      </div>
    </section>
  );
};

export default Certification;