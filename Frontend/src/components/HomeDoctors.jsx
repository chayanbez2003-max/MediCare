import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { homeDoctorsStyles } from '../assets/dummyStyles';

const HomeDoctors = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch('/api/doctors');
        const result = await response.json();
        if (result.success) {
          // Take only the top 4 doctors
          setDoctors(result.data.slice(0, 4));
        }
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  return (
    <section className={homeDoctorsStyles.section}>
      <div className={homeDoctorsStyles.container}>
        
        {/* DECORATIVE HEADING WITH SIDE LINES (Applied as requested) */}
        <div className="flex items-center justify-center w-full max-w-5xl mx-auto gap-3 sm:gap-6 mb-3 animate-fade-in">
          <div className="flex-grow h-[2px] max-w-[3rem] sm:max-w-[6rem] md:max-w-[10rem] lg:max-w-[14rem] bg-linear-to-r from-transparent via-blue-300 to-blue-500 rounded-full opacity-80"></div>
          <h2 className="shrink-0 text-3xl sm:text-4xl md:text-5xl font-serif italic font-bold text-gray-900 tracking-tight text-center">
            Top <span className={homeDoctorsStyles.titleSpan}>Doctors</span> to Book
          </h2>
          <div className="flex-grow h-[2px] max-w-[3rem] sm:max-w-[6rem] md:max-w-[10rem] lg:max-w-[14rem] bg-linear-to-l from-transparent via-blue-300 to-blue-500 rounded-full opacity-80"></div>
        </div>
        
        {/* PARAGRAPH (SUBTEXT) WITH SIDE LINES */}
        <div className="flex items-center justify-center w-full max-w-4xl mx-auto gap-2 sm:gap-4 mb-10">
          <div className="flex-grow h-[1px] max-w-[2rem] sm:max-w-[4rem] md:max-w-[6rem] lg:max-w-[8rem] bg-linear-to-r from-transparent via-blue-200 to-blue-400 rounded-full opacity-60"></div>
          <p className="shrink text-sm sm:text-base md:text-lg text-gray-600 text-center font-light tracking-wide px-1">
            Simply browse through our extensive list of trusted doctors.
          </p>
          <div className="flex-grow h-[1px] max-w-[2rem] sm:max-w-[4rem] md:max-w-[6rem] lg:max-w-[8rem] bg-linear-to-l from-transparent via-blue-200 to-blue-400 rounded-full opacity-60"></div>
        </div>

        {/* LOADING SKELETON OR DOCTORS GRID */}
        {loading ? (
          <div className={homeDoctorsStyles.skeletonGrid}>
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className={homeDoctorsStyles.skeletonCard}>
                <div className={homeDoctorsStyles.skeletonImage}></div>
                <div className={homeDoctorsStyles.skeletonText1}></div>
                <div className={homeDoctorsStyles.skeletonText2}></div>
                <div className="mt-4">
                  <div className={homeDoctorsStyles.skeletonButton}></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={homeDoctorsStyles.doctorsGrid}>
            {doctors.map((item, index) => {
              const available = item.availability === 'Available';
              const imgSrc = item.imageUrl || 'https://via.placeholder.com/150';

              return (
                <article 
                  key={item._id || item.id || index}
                  onClick={() => { navigate(`/doctor/${item._id || item.id}`); window.scrollTo(0, 0); }}
                  className={`${homeDoctorsStyles.article} cursor-pointer`}
                >
                  <div className={available ? homeDoctorsStyles.imageContainerAvailable : homeDoctorsStyles.imageContainerUnavailable}>
                    <img className={homeDoctorsStyles.image} src={imgSrc} alt={item.name} />
                    {!available && (
                      <span className={homeDoctorsStyles.unavailableBadge}>Not Available</span>
                    )}
                  </div>
                  
                  <div className={homeDoctorsStyles.cardBody}>
                    <h3 className={homeDoctorsStyles.doctorName}>{item.name}</h3>
                    <p className={homeDoctorsStyles.specialization}>{item.specialization}</p>
                    
                    <div className={homeDoctorsStyles.experienceContainer}>
                      <div className={homeDoctorsStyles.experienceBadge}>
                        <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-semibold text-green-700">{item.experience}</span>
                      </div>
                    </div>

                    <div className={homeDoctorsStyles.buttonContainer}>
                      <button className={available ? homeDoctorsStyles.buttonAvailable : homeDoctorsStyles.buttonUnavailable}>
                        {available ? 'Book Appointment' : 'Unavailable'}
                        {available && (
                          <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
        
        {/* More Doctors Button */}
        <div className="flex justify-center mt-12 mb-4">
          <button 
            onClick={() => { navigate('/doctors'); window.scrollTo(0, 0); }} 
            className="px-8 py-3 bg-white border border-blue-200 text-blue-700 rounded-full font-semibold shadow-md hover:bg-blue-50 transition-all duration-300 transform hover:scale-105"
          >
            More Doctors
          </button>
        </div>

        {/* Inject any additional custom CSS needed by styles */}
        <style>{homeDoctorsStyles.customCSS}</style>
      </div>
    </section>
  );
};

export default HomeDoctors;
