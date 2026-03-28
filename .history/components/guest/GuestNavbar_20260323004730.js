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

  // Update underline position only for active link (no sliding between pages)
  useEffect(() => {
    const updateUnderline = () => {
      const activeLink = document.querySelector('.nav-link.active');
      if (activeLink && navRef.current) {
        const linkRect = activeLink.getBoundingClientRect();
        const navRect = navRef.current.getBoundingClientRect();
        setUnderlineStyle({
          width: linkRect.width,
          left: linkRect.left - navRect.left,
        });
      } else {
        setUnderlineStyle({ width: 0, left: 0 });
      }
    };

    updateUnderline();
    window.addEventListener('resize', updateUnderline);
    return () => window.removeEventListener('resize', updateUnderline);
  }, [pathname]);

  return (
    <>
      {/* Navbar with dynamic opacity based on scroll - starts at 80% and fades on scroll */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-gradient-to-r from-ocean-deep/95 to-ocean-mid/95 backdrop-blur-md shadow-2xl'
            : 'bg-gradient-to-r from-ocean-deep/80 to-ocean-mid/80 backdrop-blur-sm shadow-lg'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo and Site Name with enhanced hover effect */}
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

            {/* Desktop Navigation Links with underline only for active page */}
            <div className="hidden md:block relative" ref={navRef}>
              <div className="flex items-center gap-6 lg:gap-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`nav-link relative px-2 py-1 text-sm lg:text-base font-medium transition-all duration-300 ${
                      isActive(link.href)
                        ? 'active text-white'
                        : 'text-white/80 hover:text-white hover:scale-105'
                    }`}
                  >
                    <span className="relative inline-block">
                      {link.label}
                      {/* Hover effect - subtle scale on non-active items */}
                      {!isActive(link.href) && (
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white/40 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                      )}
                    </span>
                  </Link>
                ))}
              </div>
              {/* Static underline for active page only - no sliding animation */}
              {underlineStyle.width > 0 && (
                <div
                  className="absolute bottom-0 h-0.5 bg-gradient-to-r from-white via-white/80 to-white rounded-full"
                  style={{
                    width: `${underlineStyle.width}px`,
                    left: `${underlineStyle.left}px`,
                  }}
                />
              )}
            </div>

            {/* Enhanced Mobile Menu Button */}
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

      {/* Overlay for mobile menu - with fade animation */}
      <div
        className={`fixed inset-0 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-md z-40 md:hidden transition-all duration-500 ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={closeMobileMenu}
      />

      {/* Mobile Menu - Slide from left with enhanced design */}
      <div
        className={`fixed top-0 left-0 bottom-0 w-[280px] bg-gradient-to-br from-ocean-deep via-ocean-mid to-ocean-deep shadow-2xl z-50 transform transition-all duration-500 ease-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* No X button - removed as requested */}
        
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
        
        /* Custom scrollbar for mobile menu - matching navbar colors */
        .fixed.top-0.left-0.bottom-0.w-80::-webkit-scrollbar,
        .fixed.top-0.left-0.bottom-0.w-80::-webkit-scrollbar {
          width: 4px;
        }
        
        .fixed.top-0.left-0.bottom-0.w-80::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        
        .fixed.top-0.left-0.bottom-0.w-80::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #4A9B9B, #2C7A7A);
          border-radius: 10px;
          transition: background 0.3s ease;
        }
        
        .fixed.top-0.left-0.bottom-0.w-80::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #6DC5C5, #4A9B9B);
        }
        
        /* Firefox scrollbar styling */
        .fixed.top-0.left-0.bottom-0.w-80 {
          scrollbar-width: thin;
          scrollbar-color: #4A9B9B rgba(255, 255, 255, 0.1);
        }
        
        /* Smooth transition for navbar on scroll */
        nav {
          backdrop-filter: blur(8px);
        }
      `}</style>
    </>
  );
}