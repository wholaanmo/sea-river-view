'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';

export default function StaffSidebar({ isOpen, onToggle }) {
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
        className={`fixed left-0 top-15 h-[calc(100vh-3.75rem)] z-50 overflow-y-auto transition-all duration-300 flex flex-col ${
          is_expanded ? 'w-57.5' : 'w-18'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
        style={{
          background: 'linear-gradient(145deg, #0F172B 0%, #164A6E 50%, #2C5A6E 100%)',
          color: 'white'
        }}
      >
        <div className="p-4 flex-1">
          {/* Menu Items */}
          <div className="flex flex-col gap-2">
            {/* Room Status */}
            <Link
              href="/dashboard/staff/room-status"
              className={`flex items-center p-3 rounded-lg transition-all duration-200 w-full ${
                is_expanded ? 'justify-start' : 'justify-center'
              }`}
              style={{
                background: isActive('/dashboard/staff/room-status') ? 'rgba(255,255,255,0.2)' : 'transparent',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => {
                if (!isActive('/dashboard/staff/room-status')) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive('/dashboard/staff/room-status')) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <span className="material-icons text-2xl min-w-6 text-center"
                style={{
                  color: isActive('/dashboard/staff/room-status') ? '#00B8DB' : 'white'
                }}>
                meeting_room
              </span>
              {is_expanded && (
                <span className="ml-4 text-sm font-medium"
                  style={{
                    color: isActive('/dashboard/staff/room-status') ? '#00B8DB' : 'white'
                  }}>
                  Room Status
                </span>
              )}
            </Link>

            {/* Front Desk */}
            <Link
              href="/dashboard/staff/front-desk"
              className={`flex items-center p-3 rounded-lg transition-all duration-200 w-full ${
                is_expanded ? 'justify-start' : 'justify-center'
              }`}
              style={{
                background: isActive('/dashboard/staff/front-desk') ? 'rgba(255,255,255,0.2)' : 'transparent',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => {
                if (!isActive('/dashboard/staff/front-desk')) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive('/dashboard/staff/front-desk')) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <span className="material-icons text-2xl min-w-6 text-center"
                style={{
                  color: isActive('/dashboard/staff/front-desk') ? '#00B8DB' : 'white'
                }}>
                desk
              </span>
              {is_expanded && (
                <span className="ml-4 text-sm font-medium"
                  style={{
                    color: isActive('/dashboard/staff/front-desk') ? '#00B8DB' : 'white'
                  }}>
                  Front Desk
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Sign Out Button */}
        <div className="p-4 border-t border-[#00B8DB]/30">
          <button
            onClick={handleSignOut}
            className={`flex items-center p-3 rounded-lg transition-all duration-200 w-full ${
              is_expanded ? 'justify-start' : 'justify-center'
            }`}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <span className="material-icons text-2xl min-w-6 text-center text-white">
              logout
            </span>
            {is_expanded && (
              <span className="ml-4 text-sm font-medium text-white">
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
            className="bg-white rounded-[40px] w-full max-w-100 p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <span className="material-icons text-5xl text-red-600 mb-3">warning</span>
              <h3 className="text-xl font-semibold text-[#0F172B] font-playfair mb-2">
                Confirm Sign Out
              </h3>
              <p className="text-[#718096]">Are you sure you want to sign out?</p>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={cancelSignOut}
                className="px-6 py-2 rounded-lg border border-[#00B8DB] text-[#00B8DB] bg-transparent hover:bg-[#00B8DB] hover:text-white transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmSignOut}
                className="px-6 py-2 rounded-lg text-white hover:opacity-90 transition-all duration-300"
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