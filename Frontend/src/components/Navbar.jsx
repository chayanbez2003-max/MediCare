import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useUser, useClerk, SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/clerk-react';
import { navbarStyles } from '../assets/dummyStyles';
import logo from '../assets/logo.png';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const { signOut } = useClerk();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Doctor', path: '/doctors' },
    { name: 'Services', path: '/services' },
    { name: 'Appointments', path: '/my-appointments' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <>
      {/* Injecting necessary dummy styles animations */}
      <style>{navbarStyles.animationStyles}</style>

      <nav className={navbarStyles.navbarContainer}>
        <div className={navbarStyles.navbarBorder}></div>
        <div className={navbarStyles.contentWrapper}>
          <div className={navbarStyles.flexContainer}>

            {/* LEFT SECTION (Logo + Branding) */}
            <div
              className={navbarStyles.logoLink}
              onClick={() => navigate('/')}
              style={{ cursor: 'pointer' }}
            >
              <div className={navbarStyles.logoContainer}>
                <div className={navbarStyles.logoImageWrapper}>
                  <img src={logo} alt="Medicare Logo" className={navbarStyles.logoImage} />
                </div>
              </div>
              <div className={navbarStyles.logoTextContainer}>
                <div className={navbarStyles.logoTitle}>MediCare</div>
                <div className={navbarStyles.logoSubtitle}>Healthcare Solution</div>
              </div>
            </div>

            {/* CENTER SECTION (Navigation Links) */}
            <div className={navbarStyles.desktopNav}>
              <div className={navbarStyles.navItemsContainer}>
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <NavLink
                      key={link.name}
                      to={link.path}
                      className={`${navbarStyles.navItem} ${isActive ? navbarStyles.navItemActive : navbarStyles.navItemInactive}`}
                    >
                      {link.name}
                    </NavLink>
                  );
                })}
              </div>
            </div>

            {/* RIGHT SECTION (Authentication UI) */}
            <div className={navbarStyles.rightContainer}>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className={navbarStyles.loginButton}>Login</button>
                </SignInButton>
                <button
                  onClick={() => navigate('/doctor-login')}
                  className={`${navbarStyles.loginButton} ml-2 bg-none !bg-white !text-emerald-600 border border-emerald-600 hover:!bg-emerald-50`}
                >
                  Doctor Dashboard
                </button>
              </SignedOut>

              <SignedIn>
                <div className="hidden lg:flex items-center gap-4">
                  {user?.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt="User Avatar"
                      className="w-10 h-10 md:w-11 md:h-11 rounded-full border-2 border-emerald-200 shadow-sm object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold border-2 border-emerald-200 shadow-sm cursor-default">
                      {user?.primaryEmailAddress?.emailAddress?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <button
                    onClick={handleLogout}
                    className={`${navbarStyles.loginButton} !bg-rose-500 hover:!bg-rose-600 text-white !shadow-none !px-4`}
                  >
                    Logout
                  </button>
                </div>
              </SignedIn>

              {/* Mobile Menu Toggle */}
              <button
                className={navbarStyles.mobileToggle}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                <svg className={navbarStyles.toggleIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu Content */}
          {isMenuOpen && (
            <div className={navbarStyles.mobileMenu}>
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`${navbarStyles.mobileMenuItem} ${isActive ? navbarStyles.mobileMenuItemActive : navbarStyles.mobileMenuItemInactive}`}
                  >
                    {link.name}
                  </NavLink>
                );
              })}

              <div className="pt-4 border-t border-emerald-100 mt-2 pb-2">
                <SignedOut>
                  <div className="flex flex-col gap-3 px-4">
                    <SignInButton mode="modal">
                      <button
                        className={navbarStyles.mobileLoginButton}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Login
                      </button>
                    </SignInButton>
                    <button
                      className={`${navbarStyles.mobileLoginButton} bg-none !bg-white !text-emerald-600 border border-emerald-600 hover:!bg-emerald-50`}
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigate('/doctor-login');
                      }}
                    >
                      Doctor Dashboard
                    </button>
                  </div>
                </SignedOut>
                <SignedIn>
                  <div className="flex flex-col gap-4 px-4">
                    <div className="flex items-center gap-3 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                      {user?.imageUrl ? (
                        <img
                          src={user.imageUrl}
                          alt="User Avatar"
                          className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-800 font-bold border-2 border-white shadow-sm">
                          {user?.primaryEmailAddress?.emailAddress?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-semibold text-gray-800 truncate">
                          {user?.fullName || 'User'}
                        </span>
                        <span className="text-xs text-gray-500 truncate">
                          {user?.primaryEmailAddress?.emailAddress}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className={`${navbarStyles.mobileLoginButton} !bg-rose-500 hover:!bg-rose-600 text-white !shadow-none`}
                    >
                      Logout
                    </button>
                  </div>
                </SignedIn>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
