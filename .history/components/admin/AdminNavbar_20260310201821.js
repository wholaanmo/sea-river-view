'use client';

import Image from 'next/image';

export default function AdminNavbar({ toggleSidebar }) {
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
              width: '48px', 
              height: '48px', 
              position: 'relative',
              marginLeft: '0.25rem'
            }}>
              <Image 
                src="/assets/sea&river_view.png" 
                alt="Sea & River View Resort" 
                width={48}
                height={48}
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
                fontSize: '1.125rem', 
                color: 'white', 
                lineHeight: '1.2',
                fontFamily: "'Playfair Display', serif",
                margin: 0
              }}>
                Sea & River View
              </p>
              <p style={{ 
                fontWeight: 'bold', 
                fontSize: '0.875rem', 
                color: '#00B8DB',
                lineHeight: '1.2',
                margin: 0
              }}>
                Resort and Hotel
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ 
            display: 'none', 
            alignItems: 'center', 
            marginRight: '0.75rem', 
            padding: '0.25rem 0.75rem', 
            borderRadius: '9999px',
            background: 'rgba(0, 184, 219, 0.2)',
            border: '1px solid rgba(0, 184, 219, 0.3)'
          }} className="md:flex">
            <i className="fas fa-shield-alt" style={{ fontSize: '0.75rem', color: '#00B8DB', marginRight: '0.25rem' }}></i>
            <span style={{ fontSize: '0.75rem', fontWeight: '500', color: 'white' }}>Administrator</span>
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
              transition: 'all 300ms ease-in-out'
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
    </nav>
  );
}