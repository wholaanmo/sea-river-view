'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

export default function Sidebar({ isOpen, onToggle }) {
  const [is_expanded, setIsExpanded] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  const isAdmin = pathname?.includes('/admin');
  const isStaff = pathname?.includes('/staff');

  useEffect(() => {
    setIsExpanded(isOpen);
  }, [isOpen]);

  const handleSignOut = () => {
    setShowSignOutModal(true);
  };

  const confirmSignOut = async () => {
    try {
      console.log('Signing out...');
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

  // Menu items for different user types
  const adminMenuItems = [
    { href: '/dashboard/admin/overview', icon: 'dashboard', label: 'Overview' },
    { href: '/dashboard/admin/rooms', icon: 'hotel', label: 'Rooms' },
    { href: '/dashboard/admin/reservations', icon: 'calendar_today', label: 'Reservations' },
    { href: '/dashboard/admin/venues', icon: 'event', label: 'Venues' },
    { href: '/dashboard/admin/staffs', icon: 'group', label: 'Staffs' },
  ];

  const staffMenuItems = [
    { href: '/dashboard/staff/front-desk', icon: 'front_desk', label: 'Front Desk' },
    { href: '/dashboard/staff/room-status', icon: 'meeting_room', label: 'Room Status' },
  ];

  const menuItems = isAdmin ? adminMenuItems : staffMenuItems;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40 lg:hidden"
          onClick={() => onToggle(false)}
        />
      )}
      
      <aside className={`
        flex flex-col font-['Poppins'] 
        min-h-[calc(100vh-60px)] overflow-hidden p-4 
        bg-[#1a4a5a] text-white transition-all duration-300 ease-in-out 
        fixed left-0 top-[60px] z-50
        ${is_expanded ? 'w-[250px] items-start' : 'w-[80px] items-center'}
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        shadow-xl
      `}>
        
        {/* User Type Badge */}
        <div className={`
          w-full mb-6 px-3 py-2 bg-[#4ECDC4]/20 rounded-lg border border-[#4ECDC4]/30
          ${is_expanded ? 'block' : 'hidden'}
        `}>
          <p className="text-xs text-[#4ECDC4] font-semibold">
            {isAdmin ? 'ADMINISTRATOR' : 'STAFF MEMBER'}
          </p>
          <p className="text-sm text-white truncate">
            {isAdmin ? 'Management Access' : 'Operations Access'}
          </p>
        </div>

        {/* Menu Items */}
        <div className={`
          menu w-full m-0 flex flex-col flex-1 gap-1
          ${is_expanded ? 'items-stretch' : 'items-center'}
        `}>
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <Link 
                key={item.href}
                href={item.href} 
                className={`
                  group button flex items-center no-underline p-3 
                  transition-all duration-200 ease-out rounded-lg
                  ${isActive 
                    ? 'bg-[#4ECDC4] text-[#1a4a5a]' 
                    : 'text-white hover:bg-[#4ECDC4]/20'
                  }
                  ${is_expanded ? 'justify-start' : 'justify-center w-full'}
                `}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    onToggle(false);
                  }
                }}
              >
                <span className={`
                  material-icons text-2xl transition-all duration-200 ease-out min-w-8 text-center
                  ${isActive ? 'text-[#1a4a5a]' : 'text-[#4ECDC4] group-hover:text-[#4ECDC4]'}
                `}>
                  {item.icon}
                </span>
                <span className={`
                  transition-all duration-200 ease-out whitespace-nowrap
                  ${is_expanded ? 'opacity-100 w-auto pl-3' : 'opacity-0 w-0 overflow-hidden'}
                  ${isActive ? 'font-semibold' : ''}
                `}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Decorative Wave (matching login page) */}
        <div className="relative w-full h-12 mt-4 opacity-30">
          <div className="absolute bottom-0 left-0 w-full h-full overflow-hidden">
            <div className="wave w-[200%] h-full bg-gradient-to-t from-[#4ECDC4]/20 to-transparent rounded-tl-[100%] rounded-tr-[100%] animate-wave"></div>
          </div>
        </div>

        {/* Sign Out Button */}
        <div className="menu-bottom flex justify-center w-full mt-4 pt-4 border-t border-[#4ECDC4]/30">
          <button 
            onClick={handleSignOut} 
            className={`
              group sign-out flex items-center no-underline p-3 
              transition-all duration-200 ease-out rounded-lg
              hover:bg-red-500/20 bg-none border-none cursor-pointer w-full
              ${is_expanded ? 'justify-start' : 'justify-center'}
            `}
          >
            <span className="material-icons text-2xl text-red-400 transition-all duration-200 ease-out min-w-8 text-center group-hover:text-red-300">
              logout
            </span>
            <span className={`
              text-red-400 transition-all duration-200 ease-out text-base
              group-hover:text-red-300
              ${is_expanded ? 'opacity-100 w-auto pl-3' : 'opacity-0 w-0 overflow-hidden'}
            `}>
              Sign Out
            </span>
          </button>
        </div>
      </aside>

      {/* Sign Out Confirmation Modal */}
      {showSignOutModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-[3px] flex justify-center items-center z-50 p-4"
          onClick={cancelSignOut}
        >
          <div 
            className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <span className="material-icons text-5xl text-red-500 mb-3 animate-pulse">warning</span>
              <h3 className="text-xl font-semibold text-[#1a4a5a] mb-2">Confirm Sign Out</h3>
              <p className="text-[#2c6a7e]">Are you sure you want to sign out?</p>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={cancelSignOut}
                className="px-6 py-2 border-2 border-[#4ECDC4] text-[#1a4a5a] rounded-lg hover:bg-[#4ECDC4]/10 transition-all duration-300 font-medium"
              >
                Cancel
              </button>

              <button
                onClick={confirmSignOut}
                className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes waveMove {
          0% {
            transform: translateX(-30%) scaleX(1.2);
          }
          100% {
            transform: translateX(-10%) scaleX(1.2);
          }
        }
        
        .wave {
          animation: waveMove 15s infinite linear;
          background: linear-gradient(transparent 0%, rgba(78, 205, 196, 0.15) 50%, rgba(78, 205, 196, 0.05) 100%);
        }
      `}</style>
    </>
  );
}