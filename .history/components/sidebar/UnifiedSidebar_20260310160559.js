'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

export default function UnifiedSidebar({ role, isOpen, onToggle }) {
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
      // Clear any localStorage items
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

  // Admin menu items for Sea & River View Resort
  const adminMenuItems = [
    { href: '/dashboard/admin/overview', icon: 'dashboard', label: 'Overview' },
    { href: '/dashboard/admin/reservations', icon: 'event', label: 'Reservations' },
    { href: '/dashboard/admin/rooms', icon: 'hotel', label: 'Rooms' },
    { href: '/dashboard/admin/venues', icon: 'location_city', label: 'Venues' },
    { href: '/dashboard/admin/staffs', icon: 'badge', label: 'Staff Management' },
    { href: '/dashboard/admin/reports', icon: 'assessment', label: 'Reports' },
    { href: '/dashboard/admin/feedback', icon: 'feedback', label: 'Guest Feedback' },
  ];

  // Staff menu items for Sea & River View Resort
  const staffMenuItems = [
    { href: '/dashboard/staff/front-desk', icon: 'front_desk', label: 'Front Desk' },
    { href: '/dashboard/staff/room-status', icon: 'meeting_room', label: 'Room Status' },
    { href: '/dashboard/staff/reservations', icon: 'event', label: 'Reservations' },
    { href: '/dashboard/staff/check-in', icon: 'login', label: 'Check-In' },
    { href: '/dashboard/staff/check-out', icon: 'logout', label: 'Check-Out' },
    { href: '/dashboard/staff/housekeeping', icon: 'cleaning_services', label: 'Housekeeping' },
    { href: '/dashboard/staff/guest-requests', icon: 'support_agent', label: 'Guest Requests' },
  ];

  // Select menu items based on role
  const menuItems = role === 'admin' ? adminMenuItems : staffMenuItems;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          style={{background: 'rgba(211,211,211,0.5)', backdropFilter: 'blur(1px)'}}
          onClick={() => onToggle(false)}
        />
      )}
      
      <aside className={`
        flex flex-col font-['Inter'] 
        min-h-[calc(100vh-60px)] overflow-y-auto p-4 
        transition-all duration-300 ease-in-out 
        fixed left-0 top-[60px] z-50
        ${is_expanded ? 'w-[250px] items-start' : 'w-[calc(3rem+32px)] items-center'}
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
      style={{
        background: 'linear-gradient(145deg, #0F172B 0%, #164A6E 50%, #2C5A6E 100%)',
        color: '#ffffff',
        boxShadow: '2px 0 10px rgba(0,0,0,0.1)'
      }}>
        
        {/* Role Badge for mobile/collapsed view */}
        {!is_expanded && (
          <div className="w-full flex justify-center mb-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
                 style={{background: 'rgba(78, 205, 196, 0.2)', border: '1px solid rgba(78, 205, 196, 0.3)'}}>
              <i className={`fas ${role === 'admin' ? 'fa-shield-alt' : 'fa-id-card'} text-sm text-[#4ECDC4]`}></i>
            </div>
          </div>
        )}

        {/* Role Badge for expanded view */}
        {is_expanded && (
          <div className="w-full mb-4 px-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
                 style={{background: 'rgba(78, 205, 196, 0.15)', border: '1px solid rgba(78, 205, 196, 0.2)'}}>
              <i className={`fas ${role === 'admin' ? 'fa-shield-alt' : 'fa-id-card'} text-[#4ECDC4]`}></i>
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
                ${is_expanded ? 'justify-start' : 'justify-center w-full'}
              `}
              style={{color: '#ffffff'}}
            >
              <span className="material-icons text-2xl text-white transition-all duration-200 ease-out min-w-8 text-center group-hover:text-[#4ECDC4]">
                {item.icon}
              </span>
              <span className={`
                text-white transition-all duration-200 ease-out
                group-hover:text-[#4ECDC4]
                ${is_expanded ? 'opacity-100 w-auto pl-4' : 'opacity-0 w-0 overflow-hidden'}
              `}>
                {item.label}
              </span>
            </Link>
          ))}
        </div>

        {/* Decorative wave element */}
        {is_expanded && (
          <div className="decorative-waves-sidebar relative w-full h-12 mb-2 opacity-30">
            <div className="wave wave1 absolute bottom-0 left-0 w-full h-full"
                 style={{background: 'linear-gradient(transparent 0%, rgba(78, 205, 196, 0.2) 50%, transparent 100%)'}}></div>
          </div>
        )}

        {/* Sign Out Button */}
        <div className="menu-bottom flex justify-center w-full mt-auto pt-4 border-t"
             style={{borderColor: 'rgba(78, 205, 196, 0.3)'}}>
          <button 
            onClick={handleSignOut} 
            className={`
              group sign-out flex items-center no-underline p-4 
              transition-all duration-200 ease-out rounded-lg
              bg-none border-none cursor-pointer w-full
              ${is_expanded ? 'justify-start' : 'justify-center'}
            `}
            style={{color: '#ffffff'}}
          >
            <span className="material-icons text-2xl text-white transition-all duration-200 ease-out min-w-8 text-center group-hover:text-[#4ECDC4]">
              logout
            </span>
            <span className={`
              text-white transition-all duration-200 ease-out text-lg
              group-hover:text-[#4ECDC4]
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
          className="fixed inset-0 flex justify-center items-center z-50 p-4"
          style={{background: 'rgba(211,211,211,0.5)', backdropFilter: 'blur(1px)'}}
          onClick={cancelSignOut}
        >
          <div 
            className="bg-white rounded-xl w-full max-w-md p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
            style={{borderRadius: '40px'}}
          >
            <div className="text-center mb-6">
              <span className="material-icons text-4xl text-red-600 mb-3" style={{color: '#c53030'}}>warning</span>
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