'use client';

import Image from 'next/image';

export default function StaffNavbar({ toggleSidebar }) {
  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '60px',
      background: 'linear-gradient(145deg, #0F172B 0%, #164A6E 50%, #2C5A6E 100%)',
      color: 'white',
      zIndex: 50,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      alignItems: 'center'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '100%',
        padding: '0 1rem',
        width: '100%'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              width: '40px',
              height: '40px', 
              position: 'relative',
              marginLeft: '0.25rem'
            }}>
              <Image 
                src="/assets/Sea&RiverView.png" 
                alt="Sea & River View Resort" 
                width={40}
                height={40}
                priority
                style={{ 
                  borderRadius: '50%',
                  border: '2px solid #00B8DB',
                  boxShadow: '0 0 15px rgba(0, 184, 219, 0.5)',
                  objectFit: 'cover'
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <p style={{ 
                fontWeight: 'bold', 
                fontSize: '1rem',
                color: 'white', 
                lineHeight: '1.2',
                fontFamily: "'Playfair Display', serif",
                margin: 0
              }}>
                Sea & River View
              </p>
              <p style={{ 
                fontWeight: 'bold', 
                fontSize: '0.75rem',
                color: '#00B8DB',
                lineHeight: '1.2',
                margin: 0
              }}>
                Resort and Hotel
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Glowing White Staff Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1.25rem',
            borderRadius: '40px',
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            marginRight: '0.5rem',
            boxShadow: '0 4px 20px rgba(255, 255, 255, 0.5), 0 0 30px rgba(255, 255, 255, 0.3), inset 0 1px 3px rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(2px)',
            position: 'relative',
            animation: 'glowPulse 3s infinite ease-in-out'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 6px 25px rgba(255, 255, 255, 0.7), 0 0 40px rgba(255, 255, 255, 0.4), inset 0 1px 4px rgba(255, 255, 255, 1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 255, 255, 0.5), 0 0 30px rgba(255, 255, 255, 0.3), inset 0 1px 3px rgba(255, 255, 255, 0.9)';
          }}>
            <i className="fas fa-user-tie" style={{ 
              color: '#0F172B', 
              fontSize: '1rem',
              filter: 'drop-shadow(0 2px 3px rgba(0, 0, 0, 0.1))'
            }}></i>
            <span style={{ 
              fontSize: '0.875rem', 
              fontWeight: '600', 
              color: '#0F172B',
              textShadow: '0 1px 2px rgba(255, 255, 255, 0.5)'
            }}>Staff</span>
            
            {/* Inner glow overlay */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: '40px',
              background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8), transparent 70%)',
              pointerEvents: 'none',
              zIndex: 1
            }}></div>
          </div>
          
          <button
            onClick={toggleSidebar}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 300ms ease-in-out',
              position: 'relative',
              zIndex: 2
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#00B8DB';
              e.currentTarget.style.transform = 'rotate(180deg)';
              e.currentTarget.style.background = 'rgba(0, 184, 219, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.transform = 'rotate(0deg)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            <span className="material-icons">menu</span>
          </button>
        </div>
      </div>

      {/* Add keyframe animation style */}
      <style jsx>{`
        @keyframes glowPulse {
          0% {
            box-shadow: 0 4px 20px rgba(255, 255, 255, 0.5), 0 0 30px rgba(255, 255, 255, 0.3), inset 0 1px 3px rgba(255, 255, 255, 0.9);
          }
          50% {
            box-shadow: 0 6px 25px rgba(255, 255, 255, 0.7), 0 0 45px rgba(255, 255, 255, 0.5), inset 0 1px 4px rgba(255, 255, 255, 1);
          }
          100% {
            box-shadow: 0 4px 20px rgba(255, 255, 255, 0.5), 0 0 30px rgba(255, 255, 255, 0.3), inset 0 1px 3px rgba(255, 255, 255, 0.9);
          }
        }
      `}</style>
    </nav>
  );
}