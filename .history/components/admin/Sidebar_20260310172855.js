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

  const linkStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '1rem',
    borderRadius: '0.5rem',
    transition: 'all 200ms ease-out',
    marginBottom: '0.5rem',
    textDecoration: 'none',
    width: is_expanded ? 'auto' : '100%',
    justifyContent: is_expanded ? 'flex-start' : 'center'
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 40
          }}
          className="lg:hidden"
          onClick={() => onToggle(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          position: 'fixed',
          left: 0,
          top: '60px',
          height: 'calc(100vh - 60px)',
          background: 'linear-gradient(145deg, #0F172B 0%, #164A6E 50%, #2C5A6E 100%)',
          color: 'white',
          zIndex: 50,
          overflowY: 'auto',
          transition: 'all 300ms ease-in-out',
          width: is_expanded ? '230px' : '72px',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
        className="lg:transform-none"
      >
        <div style={{ padding: '1rem' }}>
          {/* Role badge for collapsed view */}
          {!is_expanded && (
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0, 184, 219, 0.2)',
                border: '1px solid rgba(0, 184, 219, 0.3)'
              }}>
                <i className="fas fa-shield-alt" style={{ fontSize: '0.875rem', color: '#00B8DB' }}></i>
              </div>
            </div>
          )}

          {/* Role badge for expanded view */}
          {is_expanded && (
            <div style={{ width: '100%', marginBottom: '1rem', padding: '0 0.5rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.5rem',
                background: 'rgba(0, 184, 219, 0.15)',
                border: '1px solid rgba(0, 184, 219, 0.2)'
              }}>
                <i className="fas fa-shield-alt" style={{ color: '#00B8DB' }}></i>
                <span style={{ fontSize: '0.875rem', fontWeight: '500', color: 'white' }}>Administrator</span>
              </div>
            </div>
          )}

          {/* Menu Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {/* Overview */}
            <Link
              href="/dashboard/admin/overview"
              style={{
                ...linkStyle,
                background: isActive('/dashboard/admin/overview') ? 'rgba(255,255,255,0.2)' : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (!isActive('/dashboard/admin/overview')) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive('/dashboard/admin/overview')) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <span className="material-icons" style={{ 
                fontSize: '1.5rem',
                color: isActive('/dashboard/admin/overview') ? '#00B8DB' : 'white',
                minWidth: '2rem',
                textAlign: 'center'
              }}>
                dashboard
              </span>
              {is_expanded && (
                <span style={{ 
                  marginLeft: '1rem',
                  color: isActive('/dashboard/admin/overview') ? '#00B8DB' : 'white'
                }}>
                  Overview
                </span>
              )}
            </Link>

            {/* Reservations */}
            <Link
              href="/dashboard/admin/reservations"
              style={{
                ...linkStyle,
                background: isActive('/dashboard/admin/reservations') ? 'rgba(255,255,255,0.2)' : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (!isActive('/dashboard/admin/reservations')) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive('/dashboard/admin/reservations')) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <span className="material-icons" style={{ 
                fontSize: '1.5rem',
                color: isActive('/dashboard/admin/reservations') ? '#00B8DB' : 'white',
                minWidth: '2rem',
                textAlign: 'center'
              }}>
                event
              </span>
              {is_expanded && (
                <span style={{ 
                  marginLeft: '1rem',
                  color: isActive('/dashboard/admin/reservations') ? '#00B8DB' : 'white'
                }}>
                  Reservations
                </span>
              )}
            </Link>

            {/* Rooms */}
            <Link
              href="/dashboard/admin/rooms"
              style={{
                ...linkStyle,
                background: isActive('/dashboard/admin/rooms') ? 'rgba(255,255,255,0.2)' : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (!isActive('/dashboard/admin/rooms')) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive('/dashboard/admin/rooms')) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <span className="material-icons" style={{ 
                fontSize: '1.5rem',
                color: isActive('/dashboard/admin/rooms') ? '#00B8DB' : 'white',
                minWidth: '2rem',
                textAlign: 'center'
              }}>
                hotel
              </span>
              {is_expanded && (
                <span style={{ 
                  marginLeft: '1rem',
                  color: isActive('/dashboard/admin/rooms') ? '#00B8DB' : 'white'
                }}>
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