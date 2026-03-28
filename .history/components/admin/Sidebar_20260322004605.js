'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';

export default function AdminSidebar({ isOpen, onToggle }) {
  const [is_expanded, setIsExpanded] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setIsExpanded(isOpen);
  }, [isOpen]);

  const handleSignOut = () => {
    setShowSignOutModal(true);
  };

  const confirmSignOut = async () => {
    try {
      await signOut(auth);
      
      localStorage.removeItem('userType');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('uid');
      localStorage.removeItem('sessionToken');
      localStorage.removeItem('sessionExpiry');
      localStorage.removeItem('rememberMe');
      
      setShowSignOutModal(false);
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
      
      localStorage.removeItem('userType');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('uid');
      localStorage.removeItem('sessionToken');
      localStorage.removeItem('sessionExpiry');
      localStorage.removeItem('rememberMe');
      
      setShowSignOutModal(false);
      router.push('/login');
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
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => onToggle(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-main z-50 overflow-y-auto transition-all duration-300 flex flex-col shadow-xl ${
          is_expanded ? 'w-sidebar-expanded' : 'w-sidebar-collapsed'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Logo Section */}
        <div className={`p-6 border-b border-accent/20 ${is_expanded ? 'flex justify-start' : 'flex justify-center'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 relative">
              <Image 
                src="/assets/Sea&RiverView.png" 
                alt="SandyFeet Reservation" 
                width={40}
                height={40}
                priority
                className="rounded-full border-2 border-accent object-cover shadow-lg"
              />
            </div>
            {is_expanded && (
              <div className="flex flex-col">
                <p className="font-bold text-base text-textPrimary leading-tight font-playfair m-0">
                  SandyFeet
                </p>
                <p className="font-bold text-xs text-accent leading-tight m-0">
                  Reservation
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 flex-1">
          {/* Menu Items */}
          <div className="flex flex-col gap-2">
            {/* Overview */}
            <Link
              href="/dashboard/admin/overview"
              className={`group flex items-center p-3 rounded-lg transition-all duration-200 w-full ${
                is_expanded ? 'justify-start' : 'justify-center'
              } ${isActive('/dashboard/admin/overview') ? 'bg-accent/20 text-textPrimary shadow-sm' : 'text-textPrimary hover:bg-accent/10'}`}
            >
              <span className={`material-icons text-2xl min-w-6 text-center transition-transform duration-200 group-hover:scale-110 ${
                isActive('/dashboard/admin/overview') ? 'text-accent' : 'text-textPrimary'
              }`}>
                dashboard
              </span>
              {is_expanded && (
                <span className={`ml-4 text-sm font-medium transition-colors duration-200 ${
                  isActive('/dashboard/admin/overview') ? 'text-accent' : 'text-textPrimary'
                }`}>
                  Overview
                </span>
              )}
            </Link>

            {/* Reservations */}
            <Link
              href="/dashboard/admin/reservations"
              className={`group flex items-center p-3 rounded-lg transition-all duration-200 w-full ${
                is_expanded ? 'justify-start' : 'justify-center'
              } ${isActive('/dashboard/admin/reservations') ? 'bg-accent/20 text-textPrimary shadow-sm' : 'text-textPrimary hover:bg-accent/10'}`}
            >
              <span className={`material-icons text-2xl min-w-6 text-center transition-transform duration-200 group-hover:scale-110 ${
                isActive('/dashboard/admin/reservations') ? 'text-accent' : 'text-textPrimary'
              }`}>
                event
              </span>
              {is_expanded && (
                <span className={`ml-4 text-sm font-medium transition-colors duration-200 ${
                  isActive('/dashboard/admin/reservations') ? 'text-accent' : 'text-textPrimary'
                }`}>
                  Reservations
                </span>
              )}
            </Link>

            {/* Rooms */}
            <Link
              href="/dashboard/admin/rooms"
              className={`group flex items-center p-3 rounded-lg transition-all duration-200 w-full ${
                is_expanded ? 'justify-start' : 'justify-center'
              } ${isActive('/dashboard/admin/rooms') ? 'bg-accent/20 text-textPrimary shadow-sm' : 'text-textPrimary hover:bg-accent/10'}`}
            >
              <span className={`material-icons text-2xl min-w-6 text-center transition-transform duration-200 group-hover:scale-110 ${
                isActive('/dashboard/admin/rooms') ? 'text-accent' : 'text-textPrimary'
              }`}>
                hotel
              </span>
              {is_expanded && (
                <span className={`ml-4 text-sm font-medium transition-colors duration-200 ${
                  isActive('/dashboard/admin/rooms') ? 'text-accent' : 'text-textPrimary'
                }`}>
                  Rooms
                </span>
              )}
            </Link>

            {/* Venues */}
            <Link
              href="/dashboard/admin/venues"
              className={`group flex items-center p-3 rounded-lg transition-all duration-200 w-full ${
                is_expanded ? 'justify-start' : 'justify-center'
              } ${isActive('/dashboard/admin/venues') ? 'bg-accent/20 text-textPrimary shadow-sm' : 'text-textPrimary hover:bg-accent/10'}`}
            >
              <span className={`material-icons text-2xl min-w-6 text-center transition-transform duration-200 group-hover:scale-110 ${
                isActive('/dashboard/admin/venues') ? 'text-accent' : 'text-textPrimary'
              }`}>
                location_city
              </span>
              {is_expanded && (
                <span className={`ml-4 text-sm font-medium transition-colors duration-200 ${
                  isActive('/dashboard/admin/venues') ? 'text-accent' : 'text-textPrimary'
                }`}>
                  Venues
                </span>
              )}
            </Link>

            {/* Staff Management */}
            <Link
              href="/dashboard/admin/staff"
              className={`group flex items-center p-3 rounded-lg transition-all duration-200 w-full ${
                is_expanded ? 'justify-start' : 'justify-center'
              } ${isActive('/dashboard/admin/staff') ? 'bg-accent/20 text-textPrimary shadow-sm' : 'text-textPrimary hover:bg-accent/10'}`}
            >
              <span className={`material-icons text-2xl min-w-6 text-center transition-transform duration-200 group-hover:scale-110 ${
                isActive('/dashboard/admin/staff') ? 'text-accent' : 'text-textPrimary'
              }`}>
                badge
              </span>
              {is_expanded && (
                <span className={`ml-4 text-sm font-medium transition-colors duration-200 ${
                  isActive('/dashboard/admin/staff') ? 'text-accent' : 'text-textPrimary'
                }`}>
                  Staff Management
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Sign Out Button */}
        <div className="p-4 border-t border-accent/20">
          <button
            onClick={handleSignOut}
            className={`group flex items-center p-3 rounded-lg transition-all duration-200 w-full ${
              is_expanded ? 'justify-start' : 'justify-center'
            } text-textPrimary hover:bg-accent/10`}
          >
            <span className="material-icons text-2xl min-w-6 text-center transition-transform duration-200 group-hover:scale-110 text-textPrimary">
              logout
            </span>
            {is_expanded && (
              <span className="ml-4 text-sm font-medium text-textPrimary">
                Sign Out
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* Sign Out Modal */}
      {showSignOutModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-100 flex justify-center items-center p-4"
          onClick={cancelSignOut}
        >
          <div
            className="bg-white rounded-[40px] w-full max-w-100 p-6 shadow-xl transform transition-all duration-300 scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-icons text-4xl text-red-600">warning</span>
              </div>
              <h3 className="text-xl font-semibold text-textPrimary font-playfair mb-2">
                Confirm Sign Out
              </h3>
              <p className="text-neutral">Are you sure you want to sign out?</p>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={cancelSignOut}
                className="px-6 py-2 rounded-lg border border-accent text-accent bg-transparent hover:bg-accent hover:text-white transition-all duration-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmSignOut}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#2F6F7E] to-[#5FB3C8] text-white hover:shadow-lg transition-all duration-300 font-medium"
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