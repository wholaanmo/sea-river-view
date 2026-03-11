'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar({ isOpen, onToggle }) {
  const [is_expanded, setIsExpanded] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsExpanded(isOpen);
  }, [isOpen]);

  const isActive = (path) => {
    return pathname === path;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{background: 'rgba(0,0,0,0.5)'}}
          onClick={() => onToggle(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-[60px] h-[calc(100vh-60px)] z-50
          transition-all duration-300 ease-in-out
          ${is_expanded ? 'w-[230px]' : 'w-[72px]'}
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{
          background: 'linear-gradient(145deg, #0F172B 0%, #164A6E 50%, #2C5A6E 100%)',
          color: '#ffffff',
          overflowY: 'auto'
        }}
      >
        <div className="p-4">
          {/* Menu Items */}
          <div className="space-y-2">
            <Link
              href="/dashboard/admin/overview"
              className={`flex items-center p-4 rounded-lg transition-all duration-200 ${
                is_expanded ? 'justify-start' : 'justify-center'
              } ${isActive('/dashboard/admin/overview') ? 'bg-white/20' : 'hover:bg-white/10'}`}
            >
              <span className={`material-icons ${isActive('/dashboard/admin/overview') ? 'text-[#00B8DB]' : 'text-white'}`}>
                dashboard
              </span>
              {is_expanded && (
                <span className={`ml-4 ${isActive('/dashboard/admin/overview') ? 'text-[#00B8DB]' : 'text-white'}`}>
                  Overview
                </span>
              )}
            </Link>

            <Link
              href="/dashboard/admin/reservations"
              className={`flex items-center p-4 rounded-lg transition-all duration-200 ${
                is_expanded ? 'justify-start' : 'justify-center'
              } ${isActive('/dashboard/admin/reservations') ? 'bg-white/20' : 'hover:bg-white/10'}`}
            >
              <span className={`material-icons ${isActive('/dashboard/admin/reservations') ? 'text-[#00B8DB]' : 'text-white'}`}>
                event
              </span>
              {is_expanded && (
                <span className={`ml-4 ${isActive('/dashboard/admin/reservations') ? 'text-[#00B8DB]' : 'text-white'}`}>
                  Reservations
                </span>
              )}
            </Link>

            <Link
              href="/dashboard/admin/rooms"
              className={`flex items-center p-4 rounded-lg transition-all duration-200 ${
                is_expanded ? 'justify-start' : 'justify-center'
              } ${isActive('/dashboard/admin/rooms') ? 'bg-white/20' : 'hover:bg-white/10'}`}
            >
              <span className={`material-icons ${isActive('/dashboard/admin/rooms') ? 'text-[#00B8DB]' : 'text-white'}`}>
                hotel
              </span>
              {is_expanded && (
                <span className={`ml-4 ${isActive('/dashboard/admin/rooms') ? 'text-[#00B8DB]' : 'text-white'}`}>
                  Rooms
                </span>
              )}
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}