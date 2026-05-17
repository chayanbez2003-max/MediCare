import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorsPageStyles } from '../assets/dummyStyles';

/* ─────────────────────────────────────────────
   DoctorCard
───────────────────────────────────────────── */
const DoctorCard = ({ doctor, onBookNow }) => {
  const available = doctor.availability === 'Available';
  const imgSrc = doctor.imageUrl || 'https://placehold.co/400x400/e6fffa/047857?text=Doctor';

  return (
    <article className={`group relative bg-white/85 backdrop-blur-md rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex flex-col doctor-card-animate`}>
      {/* Image area */}
      <div className={`relative h-56 sm:h-52 md:h-56 xl:h-60 overflow-hidden ${!available ? 'opacity-80' : ''}`}>
        <img
          src={imgSrc}
          alt={doctor.name}
          className="w-full h-full object-cover object-top transform group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = 'https://placehold.co/400x400/e6fffa/047857?text=Doctor';
          }}
        />
        {/* Availability badge */}
        <span
          className={`absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full shadow-sm ${
            available
              ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
              : 'bg-red-50 text-red-600 border border-red-200'
          }`}
        >
          {available ? '● Available' : '● Unavailable'}
        </span>
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-4 sm:p-5 font-serif">
        {/* Name */}
        <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate leading-tight mb-1">
          {doctor.name}
        </h3>

        {/* Specialization */}
        <p className="text-sm text-emerald-600 font-medium mb-3 truncate">
          {doctor.specialization || 'General Practitioner'}
        </p>

        {/* Experience badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-sm">
            {/* Briefcase icon */}
            <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {doctor.experience ? `${doctor.experience} experience` : 'Experienced'}
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Book Now button */}
        <button
          id={`book-btn-${doctor._id || doctor.id}`}
          onClick={() => onBookNow(doctor)}
          disabled={!available}
          className={`w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 mt-auto ${
            available
              ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white hover:shadow-lg hover:from-emerald-500 hover:to-teal-600 active:scale-95'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {available ? (
            <>
              Book Now
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          ) : (
            'Unavailable'
          )}
        </button>
      </div>
    </article>
  );
};

/* ─────────────────────────────────────────────
   DoctorPage – main page component
───────────────────────────────────────────── */
const DoctorPage = () => {
  const navigate = useNavigate();
  const [allDoctors, setAllDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* Fetch all doctors from backend */
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('http://localhost:4000/api/doctors');
        const result = await response.json();
        if (result.success) {
          setAllDoctors(result.data);
          setFilteredDoctors(result.data);
        } else {
          setError('Failed to load doctors. Please try again.');
        }
      } catch (err) {
        console.error('Failed to fetch doctors:', err);
        setError('Unable to reach the server. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  /* Real-time search / filter */
  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      setFilteredDoctors(allDoctors);
      return;
    }
    const results = allDoctors.filter(
      (doc) =>
        doc.name?.toLowerCase().includes(query) ||
        doc.specialization?.toLowerCase().includes(query)
    );
    setFilteredDoctors(results);
  }, [searchQuery, allDoctors]);

  const handleClearSearch = useCallback(() => setSearchQuery(''), []);

  const handleBookNow = useCallback(
    (doctor) => {
      console.log('Book Now clicked for:', doctor.name);
      navigate(`/doctor/${doctor._id || doctor.id}`);
      window.scrollTo(0, 0);
    },
    [navigate]
  );

  const handleRetry = useCallback(() => {
    setError(null);
    setLoading(true);
    fetch('http://localhost:4000/api/doctors')
      .then((r) => r.json())
      .then((result) => {
        if (result.success) {
          setAllDoctors(result.data);
          setFilteredDoctors(result.data);
        } else {
          setError('Failed to load doctors. Please try again.');
        }
      })
      .catch(() => setError('Unable to reach the server.'))
      .finally(() => setLoading(false));
  }, []);

  /* Skeleton cards shown while loading */
  const SkeletonCard = () => (
    <div className={doctorsPageStyles.skeletonCard}>
      <div className={doctorsPageStyles.skeletonImage} />
      <div className={doctorsPageStyles.skeletonName} />
      <div className={doctorsPageStyles.skeletonSpecialization} />
      <div className={doctorsPageStyles.skeletonButton} />
    </div>
  );

  return (
    <main className={doctorsPageStyles.mainContainer}>
      {/* Decorative background blobs */}
      <div className={doctorsPageStyles.backgroundShape1} aria-hidden="true" />
      <div className={doctorsPageStyles.backgroundShape2} aria-hidden="true" />

      {/* Inject animation keyframes */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in       { animation: fadeIn    0.6s ease-out both; }
        .animate-fade-in-up    { animation: fadeInUp  0.5s ease-out both; }
        .animate-slide-up      { animation: slideUp   0.55s ease-out both; }
        .animation-delay-2000  { animation-delay: 2s; }

        .doctor-card-animate {
          animation: fadeInUp 0.45s ease-out both;
        }
      `}</style>

      <div className={doctorsPageStyles.wrapper}>

        {/* ── HERO SECTION ── */}
        <section className="text-center mt-6 mb-8 sm:mb-10 animate-fade-in" aria-labelledby="doctors-page-heading">
          {/* Small badge heading */}
          <p className="text-sm sm:text-base font-semibold tracking-widest uppercase text-emerald-600 mb-3 flex items-center justify-center gap-2">
            <span className="inline-block w-6 h-0.5 bg-emerald-400 rounded-full" />
            Our Medical Experts
            <span className="inline-block w-6 h-0.5 bg-emerald-400 rounded-full" />
          </p>

          {/* Main H1 */}
          <h1
            id="doctors-page-heading"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-600 bg-clip-text text-transparent tracking-tight leading-tight px-2 mb-4"
          >
            Find your ideal doctor by name
            <br className="hidden sm:block" /> and specialization
          </h1>

          {/* Subtle decorative divider */}
          <div className="flex items-center justify-center gap-3 mx-auto max-w-xs mt-2">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-emerald-300" />
            <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd"/>
            </svg>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-emerald-300" />
          </div>
        </section>

        {/* ── SEARCH SECTION ── */}
        <section className={`${doctorsPageStyles.searchContainer} animate-slide-up`} aria-label="Search doctors">
          <div className={doctorsPageStyles.searchWrapper}>
            {/* Search icon */}
            <svg
              className={doctorsPageStyles.searchIcon}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
            </svg>

            <input
              id="doctor-search-input"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search doctors by name or specialization"
              className={doctorsPageStyles.searchInput}
              aria-label="Search doctors by name or specialization"
              autoComplete="off"
            />

            {/* Clear button – only visible when query is non-empty */}
            {searchQuery && (
              <button
                id="doctor-search-clear"
                onClick={handleClearSearch}
                className={`${doctorsPageStyles.clearButton} flex items-center justify-center w-6 h-6 rounded-full hover:bg-emerald-100 transition`}
                aria-label="Clear search"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </section>

        {/* ── RESULT COUNT ── */}
        {!loading && !error && searchQuery && (
          <p className="text-center text-sm text-emerald-700 mb-6 animate-fade-in">
            {filteredDoctors.length > 0
              ? `Showing ${filteredDoctors.length} result${filteredDoctors.length !== 1 ? 's' : ''} for "${searchQuery}"`
              : `No results found for "${searchQuery}"`}
          </p>
        )}

        {/* ── ERROR STATE ── */}
        {error && (
          <div className={`${doctorsPageStyles.errorContainer} animate-fade-in`} role="alert">
            <p className={doctorsPageStyles.errorText}>{error}</p>
            <button
              id="retry-fetch-doctors"
              onClick={handleRetry}
              className={doctorsPageStyles.retryButton}
            >
              Retry
            </button>
          </div>
        )}

        {/* ── DOCTOR LIST SECTION ── */}
        <section aria-label="Doctors list">
          {loading ? (
            <div className={doctorsPageStyles.skeletonGrid}>
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredDoctors.length === 0 && !error ? (
            <div className={`${doctorsPageStyles.noResults} animate-fade-in`} role="status">
              <svg className="w-14 h-14 mx-auto mb-4 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg font-semibold text-emerald-800 mb-1">No doctors found</p>
              <p className="text-sm text-emerald-600">Try a different name or specialization.</p>
            </div>
          ) : (
            <div className={doctorsPageStyles.doctorsGrid}>
              {filteredDoctors.map((doctor, index) => (
                <DoctorCard
                  key={doctor._id || doctor.id || index}
                  doctor={doctor}
                  onBookNow={handleBookNow}
                />
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
};

export default DoctorPage;