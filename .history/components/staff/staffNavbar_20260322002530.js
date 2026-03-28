'use client';

import Image from 'next/image';

export default function StaffNavbar({ toggleSidebar }) {
  return (
    <nav className="fixed top-0 left-0 right-0 h-15 z-50 flex items-center"
      style={{
        background: 'linear-gradient(145deg, #0F172B 0%, #164A6E 50%, #2C5A6E 100%)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
      <div className="flex items-center justify-between h-full px-4 w-full">
        <div className="flex items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 relative ml-1">
              <Image 
                src="/assets/Sea&RiverView.png" 
                alt="Sea & River View Resort" 
                width={40}
                height={40}
                priority
                className="rounded-full object-cover"
                style={{
                  border: '2px solid #00B8DB',
                  boxShadow: '0 0 15px rgba(0, 184, 219, 0.5)'
                }}
              />
            </div>
            <div className="flex flex-col">
              <p className="font-bold text-base text-white leading-tight font-playfair m-0">
                Sea & River View
              </p>
              <p className="font-bold text-xs text-[#00B8DB] leading-tight m-0">
                Resort and Hotel
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Staff Badge */}
          <div className="flex items-center gap-2 px-5 py-2 rounded-full relative"
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255, 255, 255, 0.95)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1), 0 0 12px rgba(255, 255, 255, 0.5)'
            }}>
            <i className="fas fa-user-tie" style={{ color: '#0F172B', fontSize: '1rem', opacity: 0.9 }}></i>
            <span className="text-sm font-semibold" style={{ color: '#0F172B', opacity: 0.95 }}>Staff</span>
            <div className="absolute top-0 left-[10%] right-[10%] h-px"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)',
                borderRadius: '50%'
              }}></div>
          </div>
          
          <button
            onClick={toggleSidebar}
            className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 hover:rotate-180"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              zIndex: 2
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#00B8DB';
              e.currentTarget.style.background = 'rgba(0, 184, 219, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'white';
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