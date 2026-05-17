import React, { useState, useRef, useEffect } from 'react'
import { navbarStyles as ns } from '../assets/dummyStyles'
import logoImg from '../assets/logoImg.png'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Calendar, Grid, Home, List, Menu, PlusSquare, UserPlus, Users, X } from 'lucide-react'
import { useClerk, useAuth, useUser } from '@clerk/react'

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const navInnerRef = useRef(null);
  const indicatorRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // clerk configuration
  const clerk = useClerk?.();
  const { getToken, isLoaded: authLoaded } = useAuth();
  const { isSignedIn, user, isLoaded: userLoaded } = useUser();

  // Fetch and persist token to localStorage when admin is signed in
  useEffect(() => {
    if (!authLoaded || !userLoaded) return;
    if (isSignedIn) {
      getToken().then((token) => {
        if (token) localStorage.setItem('adminToken', token);
      }).catch((err) => console.error('Failed to fetch token:', err));
    } else {
      localStorage.removeItem('adminToken');
    }
  }, [isSignedIn, authLoaded, userLoaded]);

  const handleSignOut = async () => {
    try {
      await clerk?.signOut();
      navigate('/');
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  const handleOpenSignIn = () => {
    clerk?.openSignIn();
  };

  const navLinks = [
    { to: '/h', label: 'Dashboard', icon: <Home size={16} /> },
    { to: '/add', label: 'Add Doctor', icon: <UserPlus size={16} /> },
    { to: '/list', label: 'List Doctors', icon: <Users size={16} /> },
    { to: '/appointments', label: 'Appointments', icon: <Calendar size={16} /> },
    { to: '/service-dashboard', label: 'Service Dashboard', icon: <Grid size={16} /> },
    { to: '/add-service', label: 'Add Service', icon: <PlusSquare size={16} /> },
    { to: '/list-service', label: 'List Services', icon: <List size={16} /> },
    { to: '/service-appointments', label: 'Service Appointments', icon: <Calendar size={16} /> },
  ];

  return (
    <header className={ns.header}>
      <nav className={ns.navContainer}>
        <div className={ns.flexContainer}>
          {/* Logo */}
          <div className={ns.logoContainer}>
            <img src={logoImg} alt="logo" className={ns.logoImage} />
            <Link to="/">
              <div className={ns.logoLink}>MediCare</div>
              <div className={ns.logoSubtext}>Healthcare solution</div>
            </Link>
          </div>

          {/* Center navigation bar (desktop) */}
          <div className={ns.centerNavContainer}>
            <div className={ns.glowEffect}>
              <div className={ns.centerNavInner}>
                <div
                  ref={navInnerRef}
                  tabIndex={0}
                  className={ns.centerNavScrollContainer}
                  style={{ WebkitOverflowScrolling: 'touch' }}
                >
                  {navLinks.map((link) => (
                    <CenterNavItem
                      key={link.to}
                      to={link.to}
                      label={link.label}
                      icon={link.icon}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className={ns.rightContainer}>
            {/* Mobile menu toggle */}
            <button
              className={ns.mobileMenuButton}
              onClick={() => setOpen((prev) => !prev)}
              aria-label="Toggle menu"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Desktop auth */}
            {isSignedIn ? (
              <button
                onClick={handleSignOut}
                className={`${ns.signOutButton} ${ns.cursorPointer}`}
              >
                Sign Out
              </button>
            ) : (
              <div className="hidden lg:flex items-center gap-2">
                <button
                  onClick={handleOpenSignIn}
                  className={`${ns.loginButton} ${ns.cursorPointer}`}
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu overlay (closes menu on outside click) */}
        {open && (
          <div
            className={ns.mobileOverlay}
            onClick={() => setOpen(false)}
          />
        )}

        {/* Mobile menu */}
        {open && (
          <div className={ns.mobileMenuContainer}>
            <div className={ns.mobileMenuInner}>
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `${ns.mobileItemBase} ${isActive ? ns.mobileItemActive : ns.mobileItemInactive}`
                  }
                >
                  <span>{link.icon}</span>
                  <span className="text-sm font-medium">{link.label}</span>
                </NavLink>
              ))}

              {/* Mobile auth section */}
              <div className={ns.mobileAuthContainer}>
                {isSignedIn ? (
                  <button
                    onClick={() => { setOpen(false); handleSignOut(); }}
                    className={`${ns.mobileSignOutButton} ${ns.cursorPointer}`}
                  >
                    Sign Out
                  </button>
                ) : (
                  <button
                    onClick={() => { setOpen(false); handleOpenSignIn(); }}
                    className={`${ns.mobileLoginButton}`}
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;

function CenterNavItem({ to, label, icon }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `nav-item ${isActive ? 'active' : ''} ${ns.centerNavItemBase} ${
          isActive ? ns.centerNavItemActive : ns.centerNavItemInactive
        }`
      }
    >
      <span>{icon}</span>
      <span className="font-medium">{label}</span>
    </NavLink>
  );
}