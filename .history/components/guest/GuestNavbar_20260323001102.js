// components/guest/GuestNavbar.js
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function GuestNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { href: '/', label: 'Home' },  // Root page
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
      <nav className="bg-gradient-to-r from-ocean-deep to-ocean-mid shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo and Site Name */}
            <Link href="/" className="flex items-center gap-3 group" onClick={closeMobileMenu}>
              <div className="relative w-10 h-10 md:w-12 md:h-12">
                <Image
                  src="/assets/Sea&RiverView.png"
                  alt="SandyFeet Reservation"
                  width={48}
                  height={48}
                  className="rounded-full border-2 border-white/30 object-cover shadow-lg group-hover:scale-105 transition-transform duration-300"
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

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-2 py-1 text-sm lg:text-base font-medium transition-all duration-300 hover:text-white/90 ${
                    isActive(link.href)
                      ? 'text-white'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white rounded-full animate-fadeIn" />
                  )}
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-all duration-300 focus:outline-none"
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

        {/* Mobile Menu Dropdown */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-4 py-3 bg-gradient-to-b from-ocean-mid to-ocean-deep border-t border-white/10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobileMenu}
                className={`block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
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
      `}</style>
    </>
  );
}