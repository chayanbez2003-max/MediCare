import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/* ─────────────────────────────────────────────
   ServiceCard Component
───────────────────────────────────────────── */
const ServiceCard = ({ service, onBookNow }) => {
  // Coerce "available" just in case it's boolean or string
  const isAvailable = service.available === true || String(service.available).toLowerCase() === 'true';
  const imgSrc = service.imageUrl || 'https://placehold.co/400x300/e6fffa/047857?text=Service';

  // Format price
  const formattedPrice = service.price 
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(service.price)
    : 'Contact for details';

  return (
    <article className="group relative bg-white/85 backdrop-blur-md rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex flex-col service-card-animate border border-emerald-100">
      {/* Image area */}
      <div className={`relative h-48 sm:h-52 md:h-56 overflow-hidden bg-emerald-50 flex items-center justify-center content-center ${!isAvailable ? 'opacity-80' : ''}`}>
        <img
          src={imgSrc}
          alt={service.name}
          className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = 'https://placehold.co/400x300/e6fffa/047857?text=Service';
          }}
        />
        {/* Availability badge */}
        <span
          className={`absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full shadow-sm ${
            isAvailable
              ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
              : 'bg-red-50 text-red-600 border border-red-200'
          }`}
        >
          {isAvailable ? '● Available' : '● Unavailable'}
        </span>
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-5 font-serif">
        {/* Name */}
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight mb-2 truncate">
          {service.name}
        </h3>

        {/* Short Description */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-4 min-h-[40px]">
          {service.shortDescription || service.about || 'Comprehensive diagnostic service ensuring accuracy and reliability.'}
        </p>

        {/* Price & Spacer */}
        <div className="flex items-center justify-between mb-4 mt-auto">
          <span className="text-emerald-700 font-semibold text-lg">
            {formattedPrice}
          </span>
        </div>

        {/* Book Now button */}
        <button
          onClick={() => onBookNow(service)}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 bg-linear-to-r from-emerald-400 to-teal-500 text-white hover:shadow-lg hover:from-emerald-500 hover:to-teal-600 active:scale-95"
        >
          Book Now
          <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </article>
  );
};

/* ─────────────────────────────────────────────
   ServicePage Component
───────────────────────────────────────────── */
const ServicePage = () => {
  const navigate = useNavigate();
  const [allServices, setAllServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* Fetch all services from backend */
  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/services');
      const result = await response.json();
      if (result.success) {
        setAllServices(result.data);
        setFilteredServices(result.data);
      } else {
        setError('Failed to load services. Please try again.');
      }
    } catch (err) {
      console.error('Failed to fetch services:', err);
      setError('Unable to reach the server. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  /* Real-time search / filter */
  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      setFilteredServices(allServices);
      return;
    }
    const results = allServices.filter(
      (service) =>
        service.name?.toLowerCase().includes(query) ||
        service.shortDescription?.toLowerCase().includes(query)
    );
    setFilteredServices(results);
  }, [searchQuery, allServices]);

  const handleClearSearch = useCallback(() => setSearchQuery(''), []);

  const handleBookNow = useCallback(
    (service) => {
      // Prepared redirection logic for the upcoming details/booking page
      navigate(`/services/${service._id || service.id}`);
      window.scrollTo(0, 0);
    },
    [navigate]
  );

  /* Skeleton loaders */
  const SkeletonCard = () => (
    <div className="animate-pulse bg-white/80 backdrop-blur-md rounded-3xl p-5 shadow-sm border border-emerald-50">
      <div className="w-full h-48 bg-emerald-100/50 rounded-2xl mb-4" />
      <div className="h-6 bg-emerald-100/60 rounded w-3/4 mb-3" />
      <div className="h-4 bg-emerald-100/50 rounded w-full mb-2" />
      <div className="h-4 bg-emerald-100/50 rounded w-5/6 mb-5" />
      <div className="h-6 bg-emerald-100/60 rounded w-1/3 mb-4 mt-auto" />
      <div className="h-10 bg-emerald-100/80 rounded-full w-full" />
    </div>
  );

  return (
    <main className="min-h-screen bg-linear-to-b from-emerald-50/40 via-white to-teal-50/30 py-10 px-4 sm:px-6 relative overflow-hidden font-serif">
      {/* Decorative background blobs (Soft styling) */}
      <div className="absolute -top-40 right-0 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse pointer-events-none" aria-hidden="true" />
      <div className="absolute top-1/3 -left-32 w-80 h-80 bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 pointer-events-none" aria-hidden="true" />

      {/* Keyframe animations injected globally for the page */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(15px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease-out both; }
        .animate-slide-up-fade { animation: slideUpFade 0.6s ease-out both; }
        .service-card-animate { animation: fadeInUp 0.45s ease-out both; }
      `}</style>

      <div className="max-w-7xl mx-auto relative z-10 w-full">
        {/* ── HERO HEADER SECTION ── */}
        <section className="text-center mt-6 mb-10 sm:mb-12 animate-fade-in-up" aria-labelledby="services-heading">
          {/* Accent Line */}
          <p className="text-sm sm:text-base font-semibold tracking-widest uppercase text-emerald-600 mb-3 flex items-center justify-center gap-2">
            <span className="inline-block w-8 h-0.5 bg-emerald-400 rounded-full" />
            Healthcare Excellence
            <span className="inline-block w-8 h-0.5 bg-emerald-400 rounded-full" />
          </p>

          <h1
            id="services-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-linear-to-r from-emerald-800 via-teal-700 to-emerald-600 bg-clip-text text-transparent uppercase tracking-tight leading-tight px-2 mb-4"
          >
            OUR DIAGNOSTIC SERVICES
          </h1>
          <h2 className="text-lg sm:text-xl font-medium text-gray-600 max-w-2xl mx-auto px-4">
            Safe, Accurate and Reliable Testing
          </h2>
        </section>

        {/* ── SEARCH SECTION ── */}
        <section className="flex justify-center mb-10 sm:mb-12 animate-slide-up-fade" aria-label="Search services">
          <div className="relative w-full max-w-2xl px-2 sm:px-0">
            {/* Search Icon */}
            <svg
              className="absolute left-6 top-3.5 sm:top-4 text-emerald-500 w-5 h-5 sm:w-6 sm:h-6 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
            </svg>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services"
              className="w-full py-3.5 sm:py-4 pl-14 pr-12 text-sm sm:text-base rounded-full border border-emerald-200 bg-white shadow-md focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 transition-all hover:shadow-lg text-emerald-900 placeholder-emerald-400 font-medium"
              aria-label="Search diagnostic services"
            />

            {/* Clear Button */}
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-4 top-3.5 sm:top-4 text-emerald-400 hover:text-emerald-700 transition-colors p-1 rounded-full hover:bg-emerald-50 cursor-pointer"
                aria-label="Clear search"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </section>

        {/* ── RESULTS & ERROR HANDLING ── */}
        {!loading && !error && searchQuery && (
          <p className="text-center text-sm font-medium text-emerald-700 mb-8 animate-fade-in-up">
            {filteredServices.length > 0
              ? `Found ${filteredServices.length} match${filteredServices.length !== 1 ? 'es' : ''} for "${searchQuery}"`
              : `No services found matching "${searchQuery}"`}
          </p>
        )}

        {error && (
          <div className="text-center mb-10 p-6 bg-red-50/80 backdrop-blur-sm rounded-2xl border border-red-100 max-w-lg mx-auto" role="alert">
            <svg className="w-10 h-10 mx-auto text-red-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-red-700 font-medium mb-4">{error}</p>
            <button
              onClick={fetchServices}
              className="px-6 py-2 rounded-full cursor-pointer bg-red-100 hover:bg-red-200 text-red-800 font-semibold transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* ── SERVICES GRID ── */}
        <section aria-label="Services list" className="w-full cursor-default">
          {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredServices.length === 0 && !error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in-up" role="status">
              <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xl font-bold text-gray-800 mb-2">No services found</p>
              <p className="text-gray-500 max-w-sm mb-6 pb-12">
                We couldn't find any diagnostic services matching your criteria. Try adjusting your search.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 pb-16">
              {filteredServices.map((service, index) => (
                <div key={service._id || service.id || index} style={{ animationDelay: `${index * 50}ms` }}>
                  <ServiceCard service={service} onBookNow={handleBookNow} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default ServicePage;