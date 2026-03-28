/// components/guest/GuestNavbar.js
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function GuestNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  // Update underline position when pathname changes
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

  // Handle hover underline effect
  const handleMouseEnter = (e) => {
    const link = e.currentTarget;
    const linkRect = link.getBoundingClientRect();
    const navRect = navRef.current.getBoundingClientRect();
    setUnderlineStyle({
      width: linkRect.width,
      left: linkRect.left - navRect.left,
    });
  };

  const handleMouseLeave = () => {
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

  return (
    <>
      {/* Navbar with 50% opacity */}
      <nav className="fixed top-0 left-0 right-0 bg-gradient-to-r from-ocean-deep/50 to-ocean-mid/50 backdrop-blur-md shadow-lg z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo and Site Name */}
            <Link 
              href="/" 
              className="flex items-center gap-3 group transition-transform duration-300 hover:scale-105" 
              onClick={closeMobileMenu}
            >
              <div className="relative w-10 h-10 md:w-12 md:h-12">
                <Image
                  src="/assets/Sea&RiverView.png"
                  alt="SandyFeet Reservation"
                  width={48}
                  height={48}
                  className="rounded-full border-2 border-white/40 object-cover shadow-lg transition-all duration-300 group-hover:border-white/60"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-playfair font-bold text-white text-lg md:text-xl leading-tight">
                  SandyFeet
                </span>
                <span className="text-white/80 text-xs md:text-sm leading-tight">
                  Reservation
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links with sliding underline */}
            <div className="hidden md:block relative" ref={navRef}>
              <div className="flex items-center gap-6 lg:gap-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`nav-link relative px-2 py-1 text-sm lg:text-base font-medium transition-all duration-300 hover:text-white ${
                      isActive(link.href)
                        ? 'active text-white'
                        : 'text-white/80 hover:text-white'
                    }`}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              {/* Sliding underline */}
              <div
                className="absolute bottom-0 h-0.5 bg-white rounded-full transition-all duration-300 ease-out"
                style={{
                  width: `${underlineStyle.width}px`,
                  left: `${underlineStyle.left}px`,
                }}
              />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-all duration-300 focus:outline-none z-50"
              aria-label="Toggle menu"
            >
              <div className="relative w-6 h-5">
                <span
                  className={`absolute left-0 w-full h-0.5 bg-white rounded-full transition-all duration-300 ease-in-out ${
                    isMobileMenuOpen
                      ? 'top-1/2 rotate-45 -translate-y-1/2'
                      : 'top-0'
                  }`}
                />
                <span
                  className={`absolute left-0 w-full h-0.5 bg-white rounded-full transition-all duration-300 ease-in-out top-1/2 -translate-y-1/2 ${
                    isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
                  }`}
                />
                <span
                  className={`absolute left-0 w-full h-0.5 bg-white rounded-full transition-all duration-300 ease-in-out ${
                    isMobileMenuOpen
                      ? 'top-1/2 -rotate-45 -translate-y-1/2'
                      : 'bottom-0'
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-all duration-300"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Menu - Slide from left */}
      <div
        className={`fixed top-0 left-0 bottom-0 w-80 bg-gradient-to-b from-ocean-deep to-ocean-mid shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close button */}
        <div className="flex justify-end p-4">
          <button
            onClick={closeMobileMenu}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-all duration-300"
            aria-label="Close menu"
          >
            <i className="fas fa-times text-white text-xl"></i>
          </button>
        </div>

        {/* Mobile Menu Links */}
        <div className="px-6 py-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 80px)' }}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMobileMenu}
              className={`block px-4 py-3 mb-2 rounded-xl text-base font-medium transition-all duration-300 ${
                isActive(link.href)
                  ? 'bg-white/20 text-white'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Spacer to prevent content from hiding under fixed navbar */}
      <div className="h-16 md:h-20" />

      <style jsx>{`
        /* Custom scrollbar for mobile menu */
        .fixed.top-0.left-0.bottom-0.w-80::-webkit-scrollbar {
          width: 6px;
        }
        
        .fixed.top-0.left-0.bottom-0.w-80::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        
        .fixed.top-0.left-0.bottom-0.w-80::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.4);
          border-radius: 10px;
          transition: background 0.3s ease;
        }
        
        .fixed.top-0.left-0.bottom-0.w-80::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.6);
        }
        
        /* Firefox scrollbar styling */
        .fixed.top-0.left-0.bottom-0.w-80 {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.4) rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </>
  );
}