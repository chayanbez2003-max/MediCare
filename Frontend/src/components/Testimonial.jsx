import React, { useState, useEffect, useRef, useCallback } from 'react';

/* ─────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────── */
const TESTIMONIALS = [
  {
    id: 1,
    name: 'Priya Sharma',
    location: 'New Delhi, India',
    review:
      'MediCare has completely changed how I approach healthcare. The doctors are exceptionally knowledgeable and took time to explain every detail of my treatment plan. From the first consultation to the follow-up calls, I felt genuinely cared for. I especially appreciate how they handled my chronic condition with so much patience. Truly a world-class experience right here in India!',
    rating: 5,
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    tag: 'Cardiology',
  },
  {
    id: 2,
    name: 'Raj Patel',
    location: 'Mumbai, India',
    review:
      'Booking an appointment online was seamless and the reminders were helpful. The medical team is warm, professional and highly skilled. My surgery went smoothly and the post-operative care exceeded my expectations. I recommend MediCare to all my family and friends without hesitation.',
    rating: 5,
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    tag: 'Orthopaedics',
  },
  {
    id: 3,
    name: 'Emily Davis',
    location: 'Bengaluru, India',
    review:
      'State-of-the-art facilities and a warm, welcoming environment. The doctors took their time to explain everything clearly and answered all my questions patiently. The diagnostic tools are modern and the reports were delivered on time. I am so grateful I chose MediCare for my treatment.',
    rating: 4,
    image: 'https://randomuser.me/api/portraits/women/68.jpg',
    tag: 'Diagnostics',
  },
  {
    id: 4,
    name: 'Arjun Mehra',
    location: 'Hyderabad, India',
    review:
      'As someone who was always anxious about hospital visits, MediCare made me feel completely at ease. The staff is courteous and the doctors are thorough. My diabetes management has improved significantly since I started treatment here. The digital health records and easy prescription refills are a huge convenience.',
    rating: 5,
    image: 'https://randomuser.me/api/portraits/men/46.jpg',
    tag: 'Diabetology',
  },
  {
    id: 5,
    name: 'Sunita Reddy',
    location: 'Chennai, India',
    review:
      'Outstanding service from start to finish. I brought my elderly mother here for a complex procedure and the entire team was compassionate and efficient. The nursing staff was incredibly gentle with her. The hospital is clean, well-organised and the meal service for inpatients is surprisingly good. Five stars!',
    rating: 5,
    image: 'https://randomuser.me/api/portraits/women/90.jpg',
    tag: 'General Surgery',
  },
  {
    id: 6,
    name: 'Vikram Nair',
    location: 'Pune, India',
    review:
      'I had an emergency late at night and the MediCare team responded swiftly. The ER staff was calm and efficient, which helped reduce my panic. The treatment was spot-on and I was discharged in good health within a couple of days. The billing process was transparent with no hidden charges — a rare find!',
    rating: 5,
    image: 'https://randomuser.me/api/portraits/men/65.jpg',
    tag: 'Emergency Care',
  },
  {
    id: 7,
    name: 'Sarah Johnson',
    location: 'Kolkata, India',
    review:
      'The paediatric team at MediCare is absolutely wonderful. My daughter had recurring ear infections and the specialists here identified the root cause quickly. Their child-friendly approach and patience made my daughter feel safe during all her visits. The doctors even followed up via the app to check on her recovery.',
    rating: 5,
    image: 'https://randomuser.me/api/portraits/women/55.jpg',
    tag: 'Paediatrics',
  },
  {
    id: 8,
    name: 'Ananya Iyer',
    location: 'Jaipur, India',
    review:
      'I consulted the dermatology department for a persistent skin condition that other clinics failed to diagnose correctly. The MediCare dermatologist identified the issue in the very first session and put together an effective treatment plan. Within six weeks my skin has improved dramatically. Extremely satisfied!',
    rating: 4,
    image: 'https://randomuser.me/api/portraits/women/78.jpg',
    tag: 'Dermatology',
  },
];

/* ─────────────────────────────────────────────────────────────
   STAR RATING
───────────────────────────────────────────────────────────── */
const StarRating = ({ rating, size = 'sm' }) => {
  const sizeClass = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`${sizeClass} ${i < rating ? 'text-yellow-400' : 'text-gray-200'} fill-current`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   TESTIMONIAL CARD
───────────────────────────────────────────────────────────── */
const TestimonialCard = ({ testimonial, onClick }) => {
  const preview =
    testimonial.review.length > 120
      ? testimonial.review.slice(0, 120) + '…'
      : testimonial.review;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Read full review by ${testimonial.name}`}
      onClick={() => onClick(testimonial)}
      onKeyDown={(e) => e.key === 'Enter' && onClick(testimonial)}
      className="testimonial-card cursor-pointer bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex-shrink-0 w-[82vw] sm:w-80 md:w-96 border border-green-50 group select-none"
    >
      {/* Tag */}
      <span className="inline-block mb-4 text-xs font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-100">
        {testimonial.tag}
      </span>

      {/* Quote icon */}
      <svg
        className="w-8 h-8 text-green-100 mb-3"
        fill="currentColor"
        viewBox="0 0 32 32"
      >
        <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
      </svg>

      {/* Preview text */}
      <p className="text-gray-600 italic text-sm leading-relaxed mb-5">
        {preview}
      </p>

      {/* Read more hint */}
      <p className="text-xs text-green-500 font-medium mb-5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        Tap to read full review
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </p>

      {/* Avatar + info */}
      <div className="flex items-center gap-3 border-t border-gray-50 pt-4">
        <div className="relative flex-shrink-0">
          <img
            src={testimonial.image}
            alt={testimonial.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-green-200 group-hover:border-green-400 transition-colors duration-300"
            onError={(e) => {
              e.target.src =
                'https://ui-avatars.com/api/?name=' +
                encodeURIComponent(testimonial.name) +
                '&background=d1fae5&color=065f46';
            }}
          />
          <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 border-2 border-white">
            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        <div>
          <h3 className="font-bold text-gray-800 text-sm">{testimonial.name}</h3>
          <p className="text-xs text-gray-400">{testimonial.location}</p>
          <StarRating rating={testimonial.rating} />
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   MODAL
───────────────────────────────────────────────────────────── */
const ReviewModal = ({ testimonial, onClose }) => {
  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!testimonial) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Card */}
      <div
        className="relative z-10 bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Tag */}
        <span className="inline-block mb-5 text-xs font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-100">
          {testimonial.tag}
        </span>

        {/* Stars */}
        <StarRating rating={testimonial.rating} size="lg" />

        {/* Full review */}
        <div className="my-5 relative">
          <svg className="w-8 h-8 text-green-100 mb-2" fill="currentColor" viewBox="0 0 32 32">
            <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
          </svg>
          <p
            id="modal-title"
            className="text-gray-700 italic leading-relaxed text-base"
          >
            {testimonial.review}
          </p>
        </div>

        {/* Author */}
        <div className="flex items-center gap-4 border-t border-gray-100 pt-5">
          <img
            src={testimonial.image}
            alt={testimonial.name}
            className="w-14 h-14 rounded-full object-cover border-2 border-green-200"
            onError={(e) => {
              e.target.src =
                'https://ui-avatars.com/api/?name=' +
                encodeURIComponent(testimonial.name) +
                '&background=d1fae5&color=065f46';
            }}
          />
          <div>
            <p className="font-bold text-gray-800">{testimonial.name}</p>
            <p className="text-sm text-gray-400">{testimonial.location}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
const Testimonial = () => {
  const [selected, setSelected] = useState(null);
  const trackRef = useRef(null);
  const animRef = useRef(null);
  const posRef = useRef(0);
  const pausedRef = useRef(false);
  const SPEED = 0.6; // px per frame

  // Double the list for seamless infinite loop
  const doubled = [...TESTIMONIALS, ...TESTIMONIALS];

  const animate = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    if (!pausedRef.current) {
      posRef.current += SPEED;
      // Reset when first copy has scrolled fully
      const halfWidth = track.scrollWidth / 2;
      if (posRef.current >= halfWidth) {
        posRef.current = 0;
      }
      track.style.transform = `translateX(-${posRef.current}px)`;
    }
    animRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [animate]);

  const pause = () => { pausedRef.current = true; };
  const resume = () => { pausedRef.current = false; };

  const openModal = (t) => {
    pause();
    setSelected(t);
  };

  const closeModal = () => {
    setSelected(null);
    resume();
  };

  return (
    <>
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
        .animate-modal-in { animation: modalIn 0.25s ease forwards; }
      `}</style>

      <section className="relative py-14 lg:py-20 bg-gradient-to-b from-gray-50/50 to-emerald-50/30 overflow-hidden font-serif">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ── Section Header ── */}
          <div className="text-center mb-12 flex flex-col items-center">
            <div className="flex items-center justify-center w-full max-w-5xl mx-auto gap-3 sm:gap-6 mb-3">
              <div className="flex-grow h-[2px] max-w-[14rem] bg-gradient-to-r from-transparent via-green-300 to-green-500 rounded-full opacity-80" />
              <h2 className="shrink-0 text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
                What Our{' '}
                <span className="bg-gradient-to-br from-green-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
                  Patients
                </span>{' '}
                Say
              </h2>
              <div className="flex-grow h-[2px] max-w-[14rem] bg-gradient-to-l from-transparent via-green-300 to-green-500 rounded-full opacity-80" />
            </div>
            <p className="text-sm sm:text-base md:text-lg text-gray-500 font-light tracking-wide">
              Real experiences from our trusted patients — tap any card to read the full review
            </p>
          </div>

          {/* ── Marquee Track ── */}
          <div
            className="overflow-hidden pb-4"
            onMouseEnter={pause}
            onMouseLeave={() => { if (!selected) resume(); }}
            onTouchStart={pause}
            onTouchEnd={() => { if (!selected) resume(); }}
          >
            {/* Fade edges */}
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 z-10 bg-gradient-to-r from-gray-50/80 to-transparent pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 z-10 bg-gradient-to-l from-emerald-50/80 to-transparent pointer-events-none" />

              <div
                ref={trackRef}
                className="flex gap-6 will-change-transform"
                style={{ width: 'max-content' }}
              >
                {doubled.map((t, idx) => (
                  <TestimonialCard
                    key={`${t.id}-${idx}`}
                    testimonial={t}
                    onClick={openModal}
                  />
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Background decorations */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-green-200/20 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-teal-200/20 rounded-full blur-3xl -z-10 pointer-events-none" />
      </section>

      {/* ── Modal ── */}
      {selected && <ReviewModal testimonial={selected} onClose={closeModal} />}
    </>
  );
};

export default Testimonial;