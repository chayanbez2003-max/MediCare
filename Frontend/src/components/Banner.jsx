import React from 'react';
import { useNavigate } from 'react-router-dom';
import { bannerStyles } from '../assets/dummyStyles';
import BannerImg from '../assets/BannerImg.png';

const StethoscopeIcon = () => (
  <svg className={bannerStyles.stethoscopeIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
);

const StarIcon = () => (
  <svg className={bannerStyles.starIcon} viewBox="0 0 20 20" fill="currentColor">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const FeatureIcon = () => (
  <svg className={bannerStyles.featureIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const Banner = () => {
  const navigate = useNavigate();

  return (
    <div className={bannerStyles.bannerContainer}>
      <div className={bannerStyles.mainContainer}>
        {/* Animated Border Setup */}
        <div className={bannerStyles.outerAnimatedBand}></div>
        <div className={bannerStyles.innerWhiteBorder}></div>
        <div className={bannerStyles.borderOutline}></div>

        <div className={bannerStyles.contentContainer}>
          <div className={bannerStyles.flexContainer}>
            
            {/* Left Section (Branding, Heading, Features) */}
            <div className={bannerStyles.leftContent}>
              
              {/* Branding Section */}
              <div className={bannerStyles.headerBadgeContainer}>
                <div className={bannerStyles.stethoscopeContainer}>
                  <div className={bannerStyles.stethoscopeInner}>
                    <StethoscopeIcon />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                    Medicare Plus
                  </h2>
                  <div className={bannerStyles.starsContainer}>
                    <div className={bannerStyles.starsInner}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon key={star} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Heading */}
              <div className={`${bannerStyles.titleContainer} mb-6 sm:mb-8 mt-4 sm:mt-6`}>
                <h1 className={bannerStyles.title}>
                  Premium Healthcare
                </h1>
                <h1 className={`${bannerStyles.title} ${bannerStyles.titleGradient}`}>
                  at Your Fingertips
                </h1>
              </div>

              {/* 6 Feature Buttons / Tags */}
              <div className={bannerStyles.featuresGrid}>
                {/* 4 Feature Tags */}
                <div className={`${bannerStyles.featureItem} ${bannerStyles.featureBorderGreen}`}>
                  <FeatureIcon />
                  <span className={bannerStyles.featureText}>Certified Specialists</span>
                </div>
                <div className={`${bannerStyles.featureItem} ${bannerStyles.featureBorderBlue}`}>
                  <FeatureIcon />
                  <span className={bannerStyles.featureText}>24x7 Availability</span>
                </div>
                <div className={`${bannerStyles.featureItem} ${bannerStyles.featureBorderEmerald}`}>
                  <FeatureIcon />
                  <span className={bannerStyles.featureText}>Safe & Secure</span>
                </div>
                <div className={`${bannerStyles.featureItem} ${bannerStyles.featureBorderPurple}`}>
                  <FeatureIcon />
                  <span className={bannerStyles.featureText}>500+ Doctors</span>
                </div>
              </div>

              {/* 2 CTA Buttons */}
              <div className={bannerStyles.ctaButtonsContainer}>
                <button 
                  onClick={() => navigate('/doctors')} 
                  className={bannerStyles.bookButton}
                >
                  <div className={bannerStyles.bookButtonOverlay}></div>
                  <div className={bannerStyles.bookButtonContent}>
                    <span>Book Appointment Now</span>
                    <svg className={bannerStyles.bookButtonIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </button>

                <a 
                  href="tel:+911234567890" 
                  className={bannerStyles.emergencyButton}
                >
                  <div className={bannerStyles.emergencyButtonContent}>
                    <svg className={bannerStyles.emergencyButtonIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>Emergency Call</span>
                  </div>
                </a>
              </div>

            </div>

            {/* Right Section (Image) */}
            <div className={bannerStyles.rightImageSection}>
              <div className={bannerStyles.imageContainer}>
                <div className={bannerStyles.imageFrame}>
                  <img src={BannerImg} alt="Healthcare Professional" className={bannerStyles.image} />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;