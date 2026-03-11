'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

export default function StaffSidebar({ isOpen, onToggle }) {
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
              <i className="fas fa-user-tie text-sm text-[#00B8DB]"></i>
            </div>
          </div>
        )}

        {/* Role badge for expanded view */}
        {is_expanded && (
          <div className="w-full mb-4 px-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
                 style={{background: 'rgba(0, 184, 219, 0.15)', border: '1px solid rgba(0, 184, 219, 0.2)'}}>
              <i className="fas fa-user-tie text-[#00B8DB]"></i>
              <span className="text-sm font-medium text-white">Staff</span>
            </div>
          </div>
        )}

        <div
          className={`
            menu w-full m-0 flex flex-col
            ${is_expanded ? 'items-stretch' : 'items-center'}
          `}
        >
          {/* Room Status */}
          <Link
            href="/dashboard/staff/room-status"
            className={`
              group button flex items-center no-underline p-4 transition-all duration-200 ease-out rounded-lg mb-2
              ${is_expanded ? 'justify-start' : 'justify