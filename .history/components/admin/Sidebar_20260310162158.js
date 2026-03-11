'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

export default function AdminSidebar({ isOpen, onToggle }) {
  const [is_expanded, setIsExpanded] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsExpanded(isOpen);
  }, [isOpen]);

  const handleSignOut = () => {
    setShowSignOutModal(true);
  };

  const confirmSignOut = async () => {
    try {
      console.log('Signing out...');
      await signOut(auth);
      setShowSignOutModal(false);
      // Clear localStorage
      localStorage.removeItem('userType');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('uid');
      localStorage.removeItem('rememberMe');
      // Redirect to login
      window.location.href = '/login';
    } catch (error) {
      console.error('Sign out error:', error);
      window.location.href = '/login';
    }
  };

  const cancelSignOut = () => {
    setShowSignOutModal(false);
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
          ${is_expanded ? 'w-57.5 items-start' : 'w-18 items-center'}  
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
              group button flex items-center no-underline p-4 transition-all duration-200 ease-out rounded-lg mb-2 hover:bg-white
              ${is_expanded ? 'justify-start' : 'justify-center w-full'}
            `}
          >
            <span className="material-icons text-2xl text-white transition-all duration-200 ease-out min-w-8 text-center group-hover:text-[#0F172B]">
              dashboard
            </span>
            <span
              className={`
                text-white transition-all duration-200 ease-out group-hover:text-[#0F172B]
                ${is_expanded ? 'opacity-100 w-auto pl-4' : 'opacity-0 w-0 overflow-hidden'}
              `}
            >
              Overview
            </span>
          </Link>

          {/* Reservations */}
          <Link
            href="/dashboard/admin/reservations"
            className={`
              group button flex items-center no-underline p-4 transition-all duration-200 ease-out rounded-lg mb-2 hover:bg-white
              ${is_expanded ? 'justify-start' : 'justify-center w-full'}
            `}
          >
            <span className="material-icons text-2xl text-white transition-all duration-200 ease-out min-w-8 text-center group-hover:text-[#0F172B]">
              event
            </span>
            <span
              className={`
                text-white transition-all duration-200 ease-out group-hover:text-[#0F172B]
                ${is_expanded ? 'opacity-100 w-auto pl-4' : 'opacity-0 w-0 overflow-hidden'}
              `}
            >
              Reservations
            </span>
          </Link>

          {/* Rooms */}
          <Link
            href="/dashboard/admin/rooms"
            className={`
              group button flex items-center no-underline p-4 transition-all duration-200 ease-out rounded-lg mb-2 hover:bg-white
              ${is_expanded ? 'justify-start' : 'justify-center w-full'}
            `}
          >
            <span className="material-icons text-2xl text-white transition-all duration-200 ease-out min-w-8 text-center group-hover:text-[#0F172B]">
              hotel
            </span>
            <span
              className={`
                text-white transition-all duration-200 ease-out group-hover:text-[#0F172B]
                ${is_expanded ? 'opacity-100 w-auto pl-4' : 'opacity-0 w-0 overflow-hidden'}
              `}
            >
              Rooms
            </span>
          </Link>

          {/* Venues */}
          <Link
            href="/dashboard/admin/venues"
            className={`
              group button flex items-center no-underline p-4 transition-all duration-200 ease-out rounded-lg mb-2 hover:bg-white
              ${is_expanded ? 'justify-start' : 'justify-center w-full'}
            `}
          >
            <span className="material-icons text-2xl text-white transition-all duration-200 ease-out min-w-8 text-center group-hover:text-[#0F172B]">
              location_city
            </span>
            <span
              className={`
                text-white transition-all duration-200 ease-out group-hover:text-[#0F172B]
                ${is_expanded ? 'opacity-100 w-auto pl-4' : 'opacity-0 w-0 overflow-hidden'}
              `}
            >
              Venues
            </span>
          </Link>

          {/* Staff Management */}
          <Link
            href="/dashboard/admin/staffs"
            className={`
              group button flex items-center no-underline p-4 transition-all duration-200 ease-out rounded-lg mb-2 hover:bg-white
              ${is_expanded ? 'justify-start' : 'justify-center w-full'}
            `}
          >
            <span className="material-icons text-2xl text-white transition-all duration-200 ease-out min-w-8 text-center group-hover:text-[#0F172B]">
              badge
            </span>
            <span
              className={`
                text-white transition-all duration-200 ease-out group-hover:text-[#0F172B]
                ${is_expanded ? 'opacity-100 w-auto pl-4' : 'opacity-0 w-0 overflow-hidden'}
              `}
            >
              Staff Management
            </span>
          </Link>

          {/* Reports */}
          <Link
            href="/dashboard/admin/reports"
            className={`
              group button flex items-center no-underline p-4 transition-all duration-200 ease-out rounded-lg mb-2 hover:bg-white
              ${is_expanded ? 'justify-start' : 'justify-center w-full'}
            `}
          >
            <span className="material-icons text-2xl text-white transition-all duration-200 ease-out min-w-8 text-center group-hover:text-[#0F172B]">
              assessment
            </span>
            <span
              className={`
                text-white transition-all duration-200 ease-out group-hover:text-[#0F172B]
                ${is_expanded ? 'opacity-100 w-auto pl-4' : 'opacity-0 w-0 overflow-hidden'}
              `}
            >
              Reports
            </span>
          </Link>

          {/* Feedback */}
          <Link
            href="/dashboard/admin/feedback"
            className={`
              group button flex items-center no-underline p-4 transition-all duration-200 ease-out rounded-lg mb-2 hover:bg-white
              ${is_expanded ? 'justify-start' : 'justify-center w-full'}
            `}
          >
            <span className="material-icons text-2xl text-white transition-all duration-200 ease-out min-w-8 text-center group-hover:text-[#0F172B]">
              feedback
            </span>
            <span
              className={`
                text-white transition-all duration-200 ease-out group-hover:text-[#0F172B]
                ${is_expanded ? 'opacity-100 w-auto pl-4' : 'opacity-0 w-0 overflow-hidden'}
              `}
            >
              Guest Feedback
            </span>
          </Link>
        </div>

        {/* Decorative wave */}
        {is_expanded && (
          <div className="relative w-full h-12 my-2 opacity-30">
            <div className="absolute bottom-0 left-0 w-full h-full"
                 style={{background: 'linear-gradient(transparent 0%, rgba(0, 184, 219, 0.2) 50%, transparent 100%)'}}></div>
          </div>
        )}

        <div className="menu-bottom flex justify-center w-full mt-auto pt-4 border-t"
             style={{borderColor: 'rgba(0, 184, 219, 0.3)'}}>
          <button
            onClick={handleSignOut}
            className={`
              group sign-out flex items-center no-underline p-4 transition-all duration-200 ease-out rounded-lg hover:bg-white bg-none border-none cursor-pointer
              ${is_expanded ? 'justify-start w-full' : 'justify-center w-full'}
            `}
          >
            <span className="material-icons text-2xl text-white transition-all duration-200 ease-out min-w-8 text-center group-hover:text-[#0F172B]">
              logout
            </span>
            <span
              className={`
                text-white transition-all duration-200 ease-out text-lg group-hover:text-[#0F172B]
                ${is_expanded ? 'opacity-100 w-auto pl-4' : 'opacity-0 w-0 overflow-hidden'}
              `}
            >
              Sign Out
            </span>
          </button>
        </div>
      </aside>

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