'use client';

import Image from 'next/image';
import { useEffect } from 'react';

export default function AdminNavbar({ toggleSidebar }) {
  return (
    <nav 
      className="fixed top-0 left-0 right-0 h-15 text-white z-50 shadow-lg" 
      style={{
        background: 'linear-gradient(145deg, #0F172B 0%, #164A6E 50%, #2C5A6E 100%)',
        height: '60px'
      }}
    >
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 relative ml-1">
              <Image 
                src="/assets/sea&river_view.png" 
                alt="Sea & River View Resort" 
                width={48}
                height={48}
                className="rounded-full object-cover"
                priority // This adds loading="eager" and marks as high priority
                style={{ 
                  borderRadius: '50%',
                  border: '2px solid #00B8DB',
                  boxShadow: '0 0 15px rgba(0, 184, 219, 0.5)'
                }}
              />
            </div>
            <div className="flex flex-col">
              <p className="font-bold text-lg text-white leading-tight" style={{fontFamily: "'Playfair Display', serif"}}>
                Sea & River
              </p>
              <p className="font-bold text-sm text-[#00B8DB] -mt-1">
                View Resort
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <div className="hidden md:flex items-center mr-3 px-3 py-1 rounded-full" 
               style={{background: 'rgba(0, 184, 219, 0.2)', border: '1px solid rgba(0, 184, 219, 0.3)'}}>
            <i className="fas fa-shield-alt text-xs text-[#00B8DB] mr-1"></i>
            <span className="text-xs font-medium text-white">Administrator</span>
          </div>
          
          <button
            className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ease-in-out text-white hover:text-[#00B8DB] hover:rotate-180"
            onClick={toggleSidebar}
            style={{background: 'rgba(255, 255, 255, 0.1)'}}
          >
            <span className="material-icons">menu</span>
          </button>
        </div>
      </div>
    </nav>
  );
}