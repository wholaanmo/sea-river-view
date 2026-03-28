'dashboard/admin/components/AdminSidebar.js'
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { auth } from '../../../lib/firebase';
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
        className={`fixed left-0 top-15 h-[calc(100vh-3.75rem)] bg-[#ECF9FC] z-50 overflow-y-auto transition-all duration-300 flex flex-col ${
          is_expanded ? 'w-57.5' : 'w-18'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="p-4 flex-1">
          {/* Menu Items */}
          <div className="flex flex-col gap-2">
            {/* Overview */}
            <Link
              href="/dashboard/admin/overview"
              className={`flex items-center p-3 rounded-lg transition-all duration-200 w-full ${
                is_expanded ? 'justify-start' : 'justify-center'
              } ${isActive('/dashboard/admin/overview') ? 'bg-[#5FB3C8]/20 text-[#2F6F7E]' : 'text-[#2F6F7E] hover:bg-[#5FB3C8]/10'}`}
            >
              <span className={`material-icons text-2xl min-w-6 text-center ${
                isActive('/dashboard/admin/overview') ? 'text-[#2F6F7E]' : 'text-[#2F6F7E]'
              }`}>
                dashboard
              </span>
              {is_expanded && (
                <span className={`ml-4 text-sm font-medium ${
                  isActive('/dashboard/admin/overview') ? 'text-[#2F6F7E]' : 'text-[#2F6F7E]'
                }`}>
                  Overview
                </span>
              )}
            </Link>

            {/* Reservations */}
            <Link
              href="/dashboard/admin/reservations"
              className={`flex items-center p-3 rounded-lg transition-all duration-200 w-full ${
                is_expanded ? 'justify-start' : 'justify-center'
              } ${isActive('/dashboard/admin/reservations') ? 'bg-[#5FB3C8]/20 text-[#2F6F7E]' : 'text-[#2F6F7E] hover:bg-[#5FB3C8]/10'}`}
            >
              <span className={`material-icons text-2xl min-w-6 text-center ${
                isActive('/dashboard/admin/reservations') ? 'text-[#2F6F7E]' : 'text-[#2F6F7E]'
              }`}>
                event
              </span>
              {is_expanded && (
                <span className={`ml-4 text-sm font-medium ${
                  isActive('/dashboard/admin/reservations') ? 'text-[#2F6F7E]' : 'text-[#2F6F7E]'
                }`}>
                  Reservations
                </span>
              )}
            </Link>

            {/* Rooms */}
            <Link
              href="/dashboard/admin/rooms"
              className={`flex items-center p-3 rounded-lg transition-all duration-200 w-full ${
                is_expanded ? 'justify-start' : 'justify-center'
              } ${isActive('/dashboard/admin/rooms') ? 'bg-[#5FB3C8]/20 text-[#2F6F7E]' : 'text-[#2F6F7E] hover:bg-[#5FB3C8]/10'}`}
            >
              <span className={`material-icons text-2xl min-w-6 text-center ${
                isActive('/dashboard/admin/rooms') ? 'text-[#2F6F7E]' : 'text-[#2F6F7E]'
              }`}>
                hotel
              </span>
              {is_expanded && (
                <span className={`ml-4 text-sm font-medium ${
                  isActive('/dashboard/admin/rooms') ? 'text-[#2F6F7E]' : 'text-[#2F6F7E]'
                }`}>
                  Rooms
                </span>
              )}
            </Link>

            {/* Venues */}
            <Link
              href="/dashboard/admin/venues"
              className={`flex items-center p-3 rounded-lg transition-all duration-200 w-full ${
                is_expanded ? 'justify-start' : 'justify-center'
              } ${isActive('/dashboard/admin/venues') ? 'bg-[#5FB3C8]/20 text-[#2F6F7E]' : 'text-[#2F6F7E] hover:bg-[#5FB3C8]/10'}`}
            >
              <span className={`material-icons text-2xl min-w-6 text-center ${
                isActive('/dashboard/admin/venues') ? 'text-[#2F6F7E]' : 'text-[#2F6F7E]'
              }`}>
                location_city
              </span>
              {is_expanded && (
                <span className={`ml-4 text-sm font-medium ${
                  isActive('/dashboard/admin/venues') ? 'text-[#2F6F7E]' : 'text-[#2F6F7E]'
                }`}>
                  Venues
                </span>
              )}
            </Link>

            {/* Staff Management */}
            <Link
              href="/dashboard/admin/staff"
              className={`flex items-center p-3 rounded-lg transition-all duration-200 w-full ${
                is_expanded ? 'justify-start' : 'justify-center'
              } ${isActive('/dashboard/admin/staff') ? 'bg-[#5FB3C8]/20 text-[#2F6F7E]' : 'text-[#2F6F7E] hover:bg-[#5FB3C8]/10'}`}
            >
              <span className={`material-icons text-2xl min-w-6 text-center ${
                isActive('/dashboard/admin/staff') ? 'text-[#2F6F7E]' : 'text-[#2F6F7E]'
              }`}>
                badge
              </span>
              {is_expanded && (
                <span className={`ml-4 text-sm font-medium ${
                  isActive('/dashboard/admin/staff') ? 'text-[#2F6F7E]' : 'text-[#2F6F7E]'
                }`}>
                  Staff Management
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Sign Out Button */}
        <div className="p-4 border-t border-[#5FB3C8]/30">
          <button
            onClick={handleSignOut}
            className={`flex items-center p-3 rounded-lg transition-all duration-200 w-full ${
              is_expanded ? 'justify-start' : 'justify-center'
            } text-[#2F6F7E] hover:bg-[#5FB3C8]/10`}
          >
            <span className="material-icons text-2xl min-w-6 text-center text-[#2F6F7E]">
              logout
            </span>
            {is_expanded && (
              <span className="ml-4 text-sm font-medium text-[#2F6F7E]">
                Sign Out
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* Sign Out Modal */}
      {showSignOutModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex justify-center items-center p-4"
          onClick={cancelSignOut}
        >
          <div
            className="bg-white rounded-[40px] w-full max-w-100 p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <span className="material-icons text-5xl text-red-600 mb-3">warning</span>
              <h3 className="text-xl font-semibold text-[#2F6F7E] font-['Playfair_Display'] mb-2">
                Confirm Sign Out
              </h3>
              <p className="text-[#9CA3AF]">Are you sure you want to sign out?</p>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={cancelSignOut}
                className="px-6 py-2 rounded-lg border border-[#5FB3C8] text-[#5FB3C8] bg-transparent hover:bg-[#5FB3C8] hover:text-white transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmSignOut}
                className="px-6 py-2 rounded-lg bg-linear-to-r from-[#2F6F7E] to-[#5FB3C8] text-white hover:opacity-90 transition-all duration-300"
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