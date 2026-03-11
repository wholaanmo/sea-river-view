'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
  --color-primary: #0F172B;
  --color-secondary: #164A6E;
  --color-tertiary: #2C5A6E;
  --color-accent: #00B8DB;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: 'Poppins', Arial, Helvetica, sans-serif;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

/* Custom utility classes */
.h-15 {
  height: 3.75rem; /* 60px */
}

.mt-15 {
  margin-top: 3.75rem; /* 60px */
}

.w-13 {
  width: 3.25rem; /* 52px */
}

.h-13 {
  height: 3.25rem; /* 52px */
}

/* Fix for fixed positioning */
.fixed {
  position: fixed;
}

/* Ensure z-index works properly */
.z-50 {
  z-index: 50;
}

.z-40 {
  z-index: 40;
}

export default function AdminSidebar({ isOpen, onToggle }) {
  const [is_expanded, setIsExpanded] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsExpanded(isOpen);
  }, [isOpen]);

  const handleSignOut = () => {
    setShowSignOutModal(true);
  };

  const confirmSignOut = async () => {
    try {
      await signOut({ 
        redirect: false,
        callbackUrl: '/login'
      });
      setShowSignOutModal(false);
      window.location.href = '/login';
    } catch (error) {
      console.error('Sign out error:', error);
      window.location.href = '/login';
    }
  };

  const cancelSignOut = () => {
    setShowSignOutModal(false);
  };

  const isActive = (path) => {
    return pathname === path;
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{background: 'rgba(211,211,211,0.5)', backdropFilter: 'blur(1px)'}}
          onClick={() => onToggle(false)}
        />
      )}

      <aside
        className={`
          flex flex-col font-['Inter'] h-[calc(100vh-60px)] overflow-y-auto p-4 transition-all duration-300 ease-in-out fixed left-0 top-[60px] z-50
          ${is_expanded ? 'w-[230px] items-start' : 'w-[72px] items-center'}  
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{
          background: 'linear-gradient(145deg, #0F172B 0%, #164A6E 50%, #2C5A6E 100%)',
          color: '#ffffff'
        }}
      >
        {/* Role badge for collapsed view */}
        {!is_expanded && (
          <div className="w-full flex justify-center mb-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
                 style={{background: 'rgba(0, 184, 219, 0.2)', border: '1px solid rgba(0, 184, 219, 0.3)'}}>
              <i className="fas fa-shield-alt text-sm text-[#00B8DB]"></i>
            </div>
          </div>
        )}

        {/* Role badge for expanded view */}
        {is_expanded && (
          <div className="w-full mb-4 px-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
                 style={{background: 'rgba(0, 184, 219, 0.15)', border: '1px solid rgba(0, 184, 219, 0.2)'}}>
              <i className="fas fa-shield-alt text-[#00B8DB]"></i>
              <span className="text-sm font-medium text-white">Administrator</span>
            </div>
          </div>
        )}

        <div
          className={`
            menu w-full m-0 flex flex-col
            ${is_expanded ? 'items-stretch' : 'items-center'}
          `}
        >
          {/* Overview */}
          <Link
            href="/dashboard/admin/overview"
            className={`
              group button flex items-center no-underline p-4 transition-all duration-200 ease-out rounded-lg mb-2
              ${is_expanded ? 'justify-start' : 'justify-center w-full'}
              ${isActive('/dashboard/admin/overview') 
                ? 'bg-white/20' 
                : 'hover:bg-white/10'
              }
            `}
          >
            <span className={`material-icons text-2xl transition-all duration-200 ease-out min-w-8 text-center ${
              isActive('/dashboard/admin/overview') ? 'text-[#00B8DB]' : 'text-white group-hover:text-[#00B8DB]'
            }`}>
              dashboard
            </span>
            <span
              className={`
                transition-all duration-200 ease-out
                ${is_expanded ? 'opacity-100 w-auto pl-4' : 'opacity-0 w-0 overflow-hidden'}
                ${isActive('/dashboard/admin/overview') ? 'text-[#00B8DB]' : 'text-white group-hover:text-[#00B8DB]'}
              `}
            >
              Overview
            </span>
          </Link>

          {/* Reservations */}
          <Link
            href="/dashboard/admin/reservations"
            className={`
              group button flex items-center no-underline p-4 transition-all duration-200 ease-out rounded-lg mb-2
              ${is_expanded ? 'justify-start' : 'justify-center w-full'}
              ${isActive('/dashboard/admin/reservations') 
                ? 'bg-white/20' 
                : 'hover:bg-white/10'
              }
            `}
          >
            <span className={`material-icons text-2xl transition-all duration-200 ease-out min-w-8 text-center ${
              isActive('/dashboard/admin/reservations') ? 'text-[#00B8DB]' : 'text-white group-hover:text-[#00B8DB]'
            }`}>
              event
            </span>
            <span
              className={`
                transition-all duration-200 ease-out
                ${is_expanded ? 'opacity-100 w-auto pl-4' : 'opacity-0 w-0 overflow-hidden'}
                ${isActive('/dashboard/admin/reservations') ? 'text-[#00B8DB]' : 'text-white group-hover:text-[#00B8DB]'}
              `}
            >
              Reservations
            </span>
          </Link>

          {/* Rooms */}
          <Link
            href="/dashboard/admin/rooms"
            className={`
              group button flex items-center no-underline p-4 transition-all duration-200 ease-out rounded-lg mb-2
              ${is_expanded ? 'justify-start' : 'justify-center w-full'}
              ${isActive('/dashboard/admin/rooms') 
                ? 'bg-white/20' 
                : 'hover:bg-white/10'
              }
            `}
          >
            <span className={`material-icons text-2xl transition-all duration-200 ease-out min-w-8 text-center ${
              isActive('/dashboard/admin/rooms') ? 'text-[#00B8DB]' : 'text-white group-hover:text-[#00B8DB]'
            }`}>
              hotel
            </span>
            <span
              className={`
                transition-all duration-200 ease-out
                ${is_expanded ? 'opacity-100 w-auto pl-4' : 'opacity-0 w-0 overflow-hidden'}
                ${isActive('/dashboard/admin/rooms') ? 'text-[#00B8DB]' : 'text-white group-hover:text-[#00B8DB]'}
              `}
            >
              Rooms
            </span>
          </Link>

          {/* Venues */}
          <Link
            href="/dashboard/admin/venues"
            className={`
              group button flex items-center no-underline p-4 transition-all duration-200 ease-out rounded-lg mb-2
              ${is_expanded ? 'justify-start' : 'justify-center w-full'}
              ${isActive('/dashboard/admin/venues') 
                ? 'bg-white/20' 
                : 'hover:bg-white/10'
              }
            `}
          >
            <span className={`material-icons text-2xl transition-all duration-200 ease-out min-w-8 text-center ${
              isActive('/dashboard/admin/venues') ? 'text-[#00B8DB]' : 'text-white group-hover:text-[#00B8DB]'
            }`}>
              location_city
            </span>
            <span
              className={`
                transition-all duration-200 ease-out
                ${is_expanded ? 'opacity-100 w-auto pl-4' : 'opacity-0 w-0 overflow-hidden'}
                ${isActive('/dashboard/admin/venues') ? 'text-[#00B8DB]' : 'text-white group-hover:text-[#00B8DB]'}
              `}
            >
              Venues
            </span>
          </Link>

          {/* Staff Management */}
          <Link
            href="/dashboard/admin/staffs"
            className={`
              group button flex items-center no-underline p-4 transition-all duration-200 ease-out rounded-lg mb-2
              ${is_expanded ? 'justify-start' : 'justify-center w-full'}
              ${isActive('/dashboard/admin/staffs') 
                ? 'bg-white/20' 
                : 'hover:bg-white/10'
              }
            `}
          >
            <span className={`material-icons text-2xl transition-all duration-200 ease-out min-w-8 text-center ${
              isActive('/dashboard/admin/staffs') ? 'text-[#00B8DB]' : 'text-white group-hover:text-[#00B8DB]'
            }`}>
              badge
            </span>
            <span
              className={`
                transition-all duration-200 ease-out
                ${is_expanded ? 'opacity-100 w-auto pl-4' : 'opacity-0 w-0 overflow-hidden'}
                ${isActive('/dashboard/admin/staffs') ? 'text-[#00B8DB]' : 'text-white group-hover:text-[#00B8DB]'}
              `}
            >
              Staff Management
            </span>
          </Link>
        </div>

        {/* Sign Out Button */}
        <div className="menu-bottom flex justify-center w-full mt-auto pt-4 border-t"
             style={{borderColor: 'rgba(0, 184, 219, 0.3)'}}>
          <button
            onClick={handleSignOut}
            className={`
              group sign-out flex items-center no-underline p-4 transition-all duration-200 ease-out rounded-lg hover:bg-white/10 bg-none border-none cursor-pointer
              ${is_expanded ? 'justify-start w-full' : 'justify-center w-full'}
            `}
          >
            <span className="material-icons text-2xl text-white transition-all duration-200 ease-out min-w-8 text-center group-hover:text-[#00B8DB]">
              logout
            </span>
            <span
              className={`
                text-white transition-all duration-200 ease-out text-lg group-hover:text-[#00B8DB]
                ${is_expanded ? 'opacity-100 w-auto pl-4' : 'opacity-0 w-0 overflow-hidden'}
              `}
            >
              Sign Out
            </span>
          </button>
        </div>
      </aside>

      {/* Sign Out Modal */}
      {showSignOutModal && (
        <div
          className="fixed inset-0 z-50 p-4 flex justify-center items-center"
          style={{background: 'rgba(211,211,211,0.5)', backdropFilter: 'blur(1px)'}}
          onClick={cancelSignOut}
        >
          <div
            className="bg-white rounded-xl w-full max-w-md p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
            style={{borderRadius: '40px'}}
          >
            <div className="text-center mb-6">
              <span className="material-icons text-4xl mb-3" style={{color: '#c53030'}}>warning</span>
              <h3 className="text-xl font-semibold mb-2" style={{color: '#0F172B', fontFamily: "'Playfair Display', serif"}}>Confirm Sign Out</h3>
              <p style={{color: '#718096'}}>Are you sure you want to sign out?</p>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={cancelSignOut}
                className="px-6 py-2 rounded-lg transition-colors duration-300"
                style={{
                  border: '1px solid #00B8DB',
                  color: '#00B8DB',
                  background: 'transparent'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmSignOut}
                className="px-6 py-2 text-white rounded-lg transition-colors duration-300"
                style={{
                  background: 'linear-gradient(135deg, #00B8DB, #0095b3)',
                  border: 'none'
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}