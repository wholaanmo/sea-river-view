'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
          // Use conditional transform for desktop
          ...(typeof window !== 'undefined' && window.innerWidth >= 1024 && { transform: 'translateX(0)' }),
          display: 'flex',
          flexDirection: 'column'
        }}
        className="lg:translate-x-0"
      >
        <div style={{ padding: '1rem', flex: 1 }}>


          {/* Menu Items - Icons always visible */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {/* Room Status */}
            <Link
              href="/dashboard/staff/room-status"
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                transition: 'all 200ms ease-out',
                textDecoration: 'none',
                width: '100%',
                justifyContent: is_expanded ? 'flex-start' : 'center',
                background: isActive('/dashboard/staff/room-status') ? 'rgba(255,255,255,0.2)' : 'transparent',
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
              <span className="material-icons" style={{ 
                fontSize: '1.5rem',
                color: isActive('/dashboard/staff/room-status') ? '#00B8DB' : 'white',
                minWidth: '24px',
                textAlign: 'center'
              }}>
                meeting_room
              </span>
              {is_expanded && (
                <span style={{ 
                  marginLeft: '1rem',
                  color: isActive('/dashboard/staff/room-status') ? '#00B8DB' : 'white',
                  fontSize: '0.95rem',
                  fontWeight: '500'
                }}>
                  Room Status
                </span>
              )}
            </Link>

            {/* Front Desk */}
            <Link
              href="/dashboard/staff/front-desk"
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                transition: 'all 200ms ease-out',
                textDecoration: 'none',
                width: '100%',
                justifyContent: is_expanded ? 'flex-start' : 'center',
                background: isActive('/dashboard/staff/front-desk') ? 'rgba(255,255,255,0.2)' : 'transparent',
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
              <span className="material-icons" style={{ 
                fontSize: '1.5rem',
                color: isActive('/dashboard/staff/front-desk') ? '#00B8DB' : 'white',
                minWidth: '24px',
                textAlign: 'center'
              }}>
                desk
              </span>
              {is_expanded && (
                <span style={{ 
                  marginLeft: '1rem',
                  color: isActive('/dashboard/staff/front-desk') ? '#00B8DB' : 'white',
                  fontSize: '0.95rem',
                  fontWeight: '500'
                }}>
                  Front Desk
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Sign Out Button */}
        <div style={{ 
          padding: '1rem', 
          borderTop: '1px solid rgba(0, 184, 219, 0.3)',
        }}>
          <button
            onClick={handleSignOut}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              transition: 'all 200ms ease-out',
              width: '100%',
              justifyContent: is_expanded ? 'flex-start' : 'center',
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
            <span className="material-icons" style={{ 
              fontSize: '1.5rem',
              color: 'white',
              minWidth: '24px',
              textAlign: 'center'
            }}>
              logout
            </span>
            {is_expanded && (
              <span style={{ marginLeft: '1rem', color: 'white', fontSize: '0.95rem', fontWeight: '500' }}>
                Sign Out
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* Sign Out Modal */}
      {showSignOutModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(1px)',
            zIndex: 100,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '1rem'
          }}
          onClick={cancelSignOut}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '40px',
              width: '100%',
              maxWidth: '400px',
              padding: '1.5rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <span className="material-icons" style={{ fontSize: '3rem', color: '#c53030', marginBottom: '0.75rem' }}>warning</span>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                color: '#0F172B', 
                fontFamily: "'Playfair Display', serif",
                marginBottom: '0.5rem'
              }}>
                Confirm Sign Out
              </h3>
              <p style={{ color: '#718096' }}>Are you sure you want to sign out?</p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={cancelSignOut}
                style={{
                  padding: '0.5rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #00B8DB',
                  color: '#00B8DB',
                  background: 'transparent',
                  cursor: 'pointer',
                  transition: 'all 300ms'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#00B8DB';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#00B8DB';
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmSignOut}
                style={{
                  padding: '0.5rem 1.5rem',
                  borderRadius: '0.5rem',
                  background: 'linear-gradient(135deg, #00B8DB, #0095b3)',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 300ms'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
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