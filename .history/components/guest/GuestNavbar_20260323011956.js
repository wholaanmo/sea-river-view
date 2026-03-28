// components/guest/GuestNavbar.js
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function GuestNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [underlineStyle, setUnderlineStyle] = useState({ width: 0, left: 0 });
  const [hoverStyle, setHoverStyle] = useState({ width: 0, left: 0, active: false });
  const navRef = useRef(null);
  const pathname = usePathname();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/rooms', label: 'Rooms' },
    { href: '/day-tour', label: 'Day Tour' },
    { href: '/reservation-tracker', label: 'Reservation Tracker' },
    { href: '/feedback', label: 'Feedback' },
  ];

  const isActive = (path) => {
    return pathname === path;
  };

  // Handle scroll effect for navbar transparency
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update underline position for active link
  const updateActiveUnderline = () => {
    const activeLink = document.querySelector('.nav-link.active');
    if (activeLink && navRef.current) {
      const linkRect = activeLink.getBoundingClientRect();
      const navRect = navRef.current.getBoundingClientRect();
      setUnderlineStyle({
        width: linkRect.width,
        left: linkRect.left - navRect.left,
      });
    }
  };

  // Update underline position on mount and pathname change
  useEffect(() => {
    updateActiveUnderline();
    window.addEventListener('resize', updateActiveUnderline);
    return () => window.removeEventListener('resize', updateActiveUnderline);
  }, [pathname]);

  // Handle hover effect with smooth transition
  const handleMouseEnter = (e) => {
    const link = e.currentTarget;
    const linkRect = link.getBoundingClientRect();
    const navRect = navRef.current.getBoundingClientRect();
    setHoverStyle({
      width: linkRect.width,
      left: linkRect.left - navRect.left,
      active: true,
    });
  };

  const handleMouseLeave = () => {
    setHoverStyle({ width: 0, left: 0, active: false });
  };

  return (
    <>
      {/* Navbar with dynamic opacity based on scroll */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-gradient-to-r from-ocean-deep/95 to-ocean-mid/95 backdrop-blur-md shadow-2xl'
            : 'bg-gradient-to-r from-ocean-deep/80 to-ocean-mid/80 backdrop-blur-sm shadow-lg'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo and Site Name */}
            <Link 
              href="/" 
              className="flex items-center gap-3 group transition-all duration-500 hover:scale-105" 
              onClick={closeMobileMenu}
            >
              <div className="relative w-10 h-10 md:w-12 md:h-12">
                <div className="absolute inset-0 rounded-full bg-white/20 blur-md group-hover:blur-lg transition-all duration-500"></div>
                <Image
                  src="/assets/Sea&RiverView.png"
                  alt="SandyFeet Reservation"
                  width={48}
                  height={48}
                  className="relative rounded-full border-2 border-white/40 object-cover shadow-lg transition-all duration-500 group-hover:border-white/80 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-playfair font-bold text-white text-lg md:text-xl leading-tight tracking-wide transition-all duration-300 group-hover:tracking-wider">
                  SandyFeet
                </span>
                <span className="text-white/80 text-xs md:text-sm leading-tight transition-all duration-300 group-hover:text-white/90">
                  Reservation
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links with sliding underline effect */}
            <div className="hidden md:block relative" ref={navRef}>
              <div className="flex items-center gap-6 lg:gap-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`nav-link relative px-2 py-1 text-sm lg:text-base font-medium transition-all duration-300 ${
                      isActive(link.href)
                        ? 'active text-white'
                        : 'text-white/80 hover:text-white'
                    }`}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <span className="relative inline-block">
                      {link.label}
                      {/* Subtle glow effect on hover */}
                      <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                        style={{
                          boxShadow: '0 0 12px rgba(255, 255, 255, 0.3)',
                        }}
                      />
                    </span>
                  </Link>
                ))}
              </div>
              
              {/* Sliding underline - smooth transition between items */}
              <div
                className="absolute bottom-0 h-0.5 bg-gradient-to-r from-white via-white/80 to-white rounded-full transition-all duration-400 ease-out"
                style={{
                  width: `${hoverStyle.active ? hoverStyle.width : underlineStyle.width}px`,
                  left: `${hoverStyle.active ? hoverStyle.left : underlineStyle.left}px`,
                  transition: 'all 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1)',
                }}
              />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden relative w-12 h-12 flex items-center justify-center rounded-xl hover:bg-white/10 active:scale-95 transition-all duration-300 focus:outline-none z-50 group"
              aria-label="Toggle menu"
            >
              <div className="relative w-6 h-5">
                <span
                  className={`absolute left-0 w-full h-0.5 bg-white rounded-full transition-all duration-400 ease-out ${
                    isMobileMenuOpen
                      ? 'top-1/2 rotate-45 -translate-y-1/2'
                      : 'top-0 group-hover:top-0.5'
                  }`}
                />
                <span
                  className={`absolute left-0 w-full h-0.5 bg-white rounded-full transition-all duration-400 ease-out top-1/2 -translate-y-1/2 ${
                    isMobileMenuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100 group-hover:scale-110'
                  }`}
                />
                <span
                  className={`absolute left-0 w-full h-0.5 bg-white rounded-full transition-all duration-400 ease-out ${
                    isMobileMenuOpen
                      ? 'top-1/2 -rotate-45 -translate-y-1/2'
                      : 'bottom-0 group-hover:bottom-0.5'
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Overlay for mobile menu */}
      <div
        className={`fixed inset-0 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-md z-40 md:hidden transition-all duration-500 ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={closeMobileMenu}
      />

      {/* Mobile Menu - Slide from left */}
      <div
        className={`fixed top-0 left-0 bottom-0 w-[280px] bg-gradient-to-br from-ocean-deep via-ocean-mid to-ocean-deep shadow-2xl z-50 transform transition-all duration-500 ease-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Menu Header with Logo */}
        <div className="flex flex-col items-center pt-8 pb-6 border-b border-white/20">
          <div className="relative w-20 h-20 mb-3">
            <div className="absolute inset-0 rounded-full bg-white/20 blur-xl animate-pulse"></div>
            <Image
              src="/assets/Sea&RiverView.png"
              alt="SandyFeet Reservation"
              width={80}
              height={80}
              className="relative rounded-full border-3 border-white/60 object-cover shadow-2xl"
            />
          </div>
          <h2 className="font-playfair font-bold text-white text-xl tracking-wide">
            SandyFeet
          </h2>
          <p className="text-white/70 text-sm">Reservation System</p>
        </div>

        {/* Mobile Menu Links with staggered animation */}
        <div className="px-5 py-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
          {navLinks.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMobileMenu}
              className={`block px-4 py-3 mb-2 rounded-xl text-base font-medium transition-all duration-300 transform ${
                isMobileMenuOpen 
                  ? 'translate-x-0 opacity-100' 
                  : '-translate-x-4 opacity-0'
              } ${
                isActive(link.href)
                  ? 'bg-gradient-to-r from-white/20 to-white/10 text-white shadow-lg'
                  : 'text-white/80 hover:bg-white/10 hover:text-white hover:translate-x-1'
              }`}
              style={{
                transitionDelay: isMobileMenuOpen ? `${index * 50}ms` : '0ms'
              }}
            >
              <span className="flex items-center gap-3">
                {isActive(link.href) && (
                  <span className="w-1 h-5 bg-white rounded-full animate-slideIn"></span>
                )}
                {link.label}
              </span>
            </Link>
          ))}
        </div>

        {/* Menu Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-5 border-t border-white/20 bg-gradient-to-t from-black/20 to-transparent">
          <p className="text-white/50 text-xs text-center">
            <i className="fas fa-umbrella-beach mr-1"></i>
            © 2026 SandyFeet Reservation
          </p>
        </div>
      </div>

      {/* Spacer to prevent content from hiding under fixed navbar */}
      <div className="h-16 md:h-20" />

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: scaleY(0);
            opacity: 0;
          }
          to {
            transform: scaleY(1);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.2s ease-out forwards;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1);
          }
        }
        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
        
        /* Custom scrollbar for mobile menu - matching navbar background color */
        .fixed.top-0.left-0.bottom-0.w-80::-webkit-scrollbar,
        .fixed.top-0.left-0.bottom-0.w-80::-webkit-scrollbar {
          width: 4px;
        }
        
        .fixed.top-0.left-0.bottom-0.w-80::-webkit-scrollbar-track {
          background: rgba(27, 94, 107, 0.3);
          border-radius: 10px;
        }
        
        .fixed.top-0.left-0.bottom-0.w-80::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #2C7A7A, #1B5E6B);
          border-radius: 10px;
          transition: background 0.3s ease;
        }
        
        .fixed.top-0.left-0.bottom-0.w-80::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #4A9B9B, #2C7A7A);
        }
        
        /* Firefox scrollbar styling - matching navbar background */
        .fixed.top-0.left-0.bottom-0.w-80 {
          scrollbar-width: thin;
          scrollbar-color: #2C7A7A rgba(27, 94, 107, 0.3);
        }
        
        /* Global scrollbar matching navbar background */
        ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(27, 94, 107, 0.2);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #2C7A7A, #1B5E6B);
          border-radius: 10px;
          transition: background 0.3s ease;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #4A9B9B, #2C7A7A);
        }
        
        /* Firefox global scrollbar */
        * {
          scrollbar-width: thin;
          scrollbar-color: #2C7A7A rgba(27, 94, 107, 0.2);
        }
        
        /* Smooth transition for navbar on scroll */
        nav {
          backdrop-filter: blur(8px);
        }
        
        /* Glow effect on hover - subtle and elegant */
        .nav-link:hover span {
          text-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </>
  );
}