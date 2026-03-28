// components/guest/GuestNavbar.js
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function GuestNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const mobileMenuRef = useRef(null);
  const menuButtonRef = useRef(null);

  // Handle scroll effect for navbar transparency
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !menuButtonRef.current?.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

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

  return (
    <>
      <nav 
        className={`sticky top-0 z-50 transition-all duration-500 backdrop-blur-md ${
          isScrolled 
            ? 'bg-gradient-to-r from-ocean-deep/90 to-ocean-mid/90 shadow-xl' 
            : 'bg-gradient-to-r from-ocean-deep/85 to-ocean-mid/85 shadow-lg'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo and Site Name */}
            <Link 
              href="/" 
              className="flex items-center gap-3 group relative"
              onClick={closeMobileMenu}
            >
              <div className="relative w-10 h-10 md:w-12 md:h-12">
                <Image
                  src="/assets/Sea&RiverView.png"
                  alt="SandyFeet Reservation"
                  width={48}
                  height={48}
                  className="rounded-full border-2 border-white/40 object-cover shadow-lg group-hover:scale-105 transition-all duration-300"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-playfair font-bold text-white text-lg md:text-xl leading-tight tracking-wide">
                  SandyFeet
                </span>
                <span className="text-white/80 text-xs md:text-sm leading-tight">
                  Reservation
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links with sliding effect */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              {navLinks.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-2 py-1 text-sm lg:text-base font-medium transition-all duration-300 hover:text-white/90 group ${
                    isActive(link.href)
                      ? 'text-white'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  <span className="relative inline-block">
                    {link.label}
                    <span 
                      className={`absolute bottom-0 left-0 w-full h-0.5 bg-white rounded-full transition-transform duration-300 ease-out origin-left ${
                        isActive(link.href) 
                          ? 'scale-x-100' 
                          : 'scale-x-0 group-hover:scale-x-100'
                      }`}
                    />
                  </span>
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              ref={menuButtonRef}
              onClick={toggleMobileMenu}
              className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-all duration-300 focus:outline-none z-20"
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
                    isMobileMenuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
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

        {/* Mobile Menu - Slide in from left with overlay */}
        <div
          className={`fixed inset-0 z-40 transition-all duration-500 ease-in-out ${
            isMobileMenuOpen ? 'visible' : 'invisible'
          }`}
        >
          {/* Backdrop overlay */}
          <div
            className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-500 ${
              isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={closeMobileMenu}
          />
          
          {/* Menu panel - slides in from left */}
          <div
            ref={mobileMenuRef}
            className={`absolute top-0 left-0 bottom-0 w-72 bg-gradient-to-b from-ocean-deep to-ocean-mid shadow-2xl transition-transform duration-500 ease-out transform ${
              isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="flex flex-col h-full">
              {/* Menu header */}
              <div className="flex items-center justify-between p-6 border-b border-white/20">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10">
                    <Image
                      src="/assets/Sea&RiverView.png"
                      alt="SandyFeet Reservation"
                      width={40}
                      height={40}
                      className="rounded-full border-2 border-white/40 object-cover"
                    />
                  </div>
                  <div>
                    <span className="font-playfair font-bold text-white text-base">
                      SandyFeet
                    </span>
                    <span className="block text-white/70 text-xs">
                      Reservation
                    </span>
                  </div>
                </div>
                <button
                  onClick={closeMobileMenu}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300"
                >
                  <i className="fas fa-times text-white text-sm"></i>
                </button>
              </div>

              {/* Navigation links with sliding animation */}
              <div className="flex-1 py-6 px-4">
                {navLinks.map((link, index) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMobileMenu}
                    className={`block px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 mb-2 transform ${
                      isMobileMenuOpen 
                        ? 'translate-x-0 opacity-100' 
                        : '-translate-x-8 opacity-0'
                    }`}
                    style={{
                      transitionDelay: isMobileMenuOpen ? `${index * 50}ms` : '0ms'
                    }}
                  >
                    <span className={`relative inline-block w-full ${
                      isActive(link.href)
                        ? 'text-white font-semibold'
                        : 'text-white/80 hover:text-white'
                    }`}>
                      {link.label}
                      {isActive(link.href) && (
                        <span className="absolute left-0 bottom-0 w-full h-0.5 bg-white rounded-full animate-slideIn" />
                      )}
                    </span>
                  </Link>
                ))}
              </div>

              {/* Menu footer */}
              <div className="p-6 border-t border-white/20">
                <p className="text-white/50 text-xs text-center">
                  © 2026 SandyFeet Reservation
                </p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scaleX(0);
          }
          to {
            opacity: 1;
            transform: scaleX(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        @keyframes slideIn {
          from {
            transform: scaleX(0);
            opacity: 0;
          }
          to {
            transform: scaleX(1);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }
        
        @keyframes slideInFromLeft {
          from {
            transform: translateX(-20px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}