'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

export default function Sidebar({ role, isOpen, onToggle }) {
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

  // Admin menu items
  const adminMenuItems = [
    { href: '/dashboard/admin/overview', icon: 'dashboard', label: 'Overview' },
    { href: '/dashboard/admin/reservations', icon: 'event', label: 'Reservations' },
    { href: '/dashboard/admin/rooms', icon: 'hotel', label: 'Rooms' },
    { href: '/dashboard/admin/venues', icon: 'location_city', label: 'Venues' },
    { href: '/dashboard/admin/staffs', icon: 'badge', label: 'Staff' },
    { href: '/dashboard/admin/reports', icon: 'assessment', label: 'Reports' },
    { href: '/dashboard/admin/feedback', icon: 'feedback', label: 'Feedback' },
  ];

  // Staff menu items
  const staffMenuItems = [
    { href: '/dashboard/staff/front-desk', icon: 'front_desk', label: 'Front Desk' },
    { href: '/dashboard/staff/room-status', icon: 'meeting_room', label: 'Room Status' },
    { href: '/dashboard/staff/reservations', icon: 'event', label: 'Reservations' },
    { href: '/dashboard/staff/payments', icon: 'payments', label: 'Payments' },
    { href: '/dashboard/staff/guests', icon: 'people', label: 'Guests' },
    { href: '/dashboard/staff/housekeeping', icon: 'cleaning_services', label: 'Housekeeping' },
  ];

  // Select menu items based on role
  const menuItems = role === 'admin' ? adminMenuItems : staffMenuItems;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-[rgba(211,211,211,0.5)] backdrop-blur-[1px] z-40 lg:hidden"
          onClick={() => onToggle(false)}
        />
      )}
      
      <aside className={`
        flex flex-col font-['Inter'] 
        min-h-[calc(100vh-60px)] overflow-y-auto p-4 
        bg-[#728a9c] text-[#121731] transition-all duration-300 ease-in-out 
        fixed left-0 top-[60px] z-50
        ${is_expanded ? 'w-[250px] items-start' : 'w-[calc(3rem+32px)] items-center'}
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Role Badge for mobile/collapsed view */}
        {!is_expanded && (
          <div className="w-full flex justify-center mb-4">
            <div className="w-8 h-8 rounded-full bg-[#121731] bg-opacity-20 flex items-center justify-center">
              <i className={`fas ${role === 'admin' ? 'fa-shield-alt' : 'fa-id-card'} text-sm text-white`}></i>
            </div>
          </div>
        )}

        {/* Role Badge for expanded view */}
        {is_expanded && (
          <div className="w-full mb-4 px-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-[#121731] bg-opacity-20 rounded-lg">
              <i className={`fas ${role === 'admin' ? 'fa-shield-alt' : 'fa-id-card'} text-white`}></i>
              <span className="text-sm font-medium text-white">
                {role === 'admin' ? 'Administrator' : 'Staff Member'}
              </span>
            </div>
          </div>
        )}
        
        {/* Menu Items */}
        <div className={`
          menu w-full m-0 flex flex-col flex-1
          ${is_expanded ? 'items-stretch' : 'items-center'}
        `}>
          {menuItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href} 
              className={`
                group button flex items-center no-underline p-4 
                transition-all duration-200 ease-out rounded-lg mb-2
                hover:bg-white
                ${is_expanded ? 'justify-start' : 'justify-center w-full'}
              `}
            >
              <span className="material-icons text-2xl text-white transition-all duration-200 ease-out min-w-8 text-center group-hover:text-[#728a9c]">
                {item.icon}
              </span>
              <span className={`
                text-white transition-all duration-200 ease-out
                group-hover:text-[#728a9c]
                ${is_expanded ? 'opacity-100 w-auto pl-4' : 'opacity-0 w-0 overflow-hidden'}
              `}>
                {item.label}
              </span>
            </Link>
          ))}
        </div>

        {/* Sign Out Button */}
        <div className="menu-bottom flex justify-center w-full mt-auto pt-4 border-t border-[#121731] border-opacity-30">
          <button 
            onClick={handleSignOut} 
            className={`
              group sign-out flex items-center no-underline p-4 
              transition-all duration-200 ease-out rounded-lg
              hover:bg-white bg-none border-none cursor-pointer w-full
              ${is_expanded ? 'justify-start' : 'justify-center'}
            `}
          >
            <span className="material-icons text-2xl text-white transition-all duration-200 ease-out min-w-8 text-center group-hover:text-[#728a9c]">
              logout
            </span>
            <span className={`
              text-white transition-all duration-200 ease-out text-lg
              group-hover:text-[#728a9c]
              ${is_expanded ? 'opacity-100 w-auto pl-4' : 'opacity-0 w-0 overflow-hidden'}
            `}>
              Sign Out
            </span>
          </button>
        </div>
      </aside>

      {/* Sign Out Confirmation Modal */}
      {showSignOutModal && (
        <div 
          className="fixed inset-0 bg-[rgba(211,211,211,0.5)] backdrop-blur-[1px] flex justify-center items-center z-50 p-4"
          onClick={cancelSignOut}
        >
          <div 
            className="bg-white rounded-xl w-full max-w-md p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <span className="material-icons text-4xl text-red-600 mb-3">warning</span>
              <h3 className="text-xl font-semibold text-[#121731] mb-2">Confirm Sign Out</h3>
              <p className="text-[#728a9c]">Are you sure you want to sign out?</p>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={cancelSignOut}
                className="px-6 py-2 border border-[#728a9c] text-[#728a9c] rounded-lg hover:bg-[#b7c8d4] hover:text-white transition-colors duration-300"
              >
                Cancel
              </button>

              <button
                onClick={confirmSignOut}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300"
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