'use client';

import Image from 'next/image';

export default function UnifiedNavbar({ user, toggleSidebar }) {
  // Determine user role from user object
  const userRole = user?.role || 'staff';
  
  return (
    <nav className="navbar fixed top-0 left-0 right-0 h-15 bg-[#0F172B] text-white z-50 shadow-lg" style={{background: 'linear-gradient(145deg, #0F172B 0%, #164A6E 50%, #2C5A6E 100%)'}}>
      <div className="navbar-content flex items-center justify-between h-full px-4">
        <div className="navbar-left flex items-center">
          <div className="logo-container flex items-center gap-3">
            <div className="logo-img-wrapper w-12 h-12 relative ml-1">
              <Image 
                src="/assets/sea&river_view.png" 
                alt="Sea & River View Resort" 
                width={48}
                height={48}
                className="rounded-full object-cover border-2 border-[#4ECDC4]"
                style={{ 
                  objectFit: 'cover',
                  borderRadius: '50%',
                  width: '100%',
                  height: '100%',
                  boxShadow: '0 0 15px rgba(78, 205, 196, 0.5)'
                }}
              />
            </div>
            <div className="flex flex-col">
              <p className="logo-text font-bold text-lg text-white leading-tight" style={{fontFamily: "'Playfair Display', serif"}}>
                Sea & River
              </p>
              <p className="logo-text1 font-bold text-sm text-[#4ECDC4] -mt-1">
                View Resort
              </p>
            </div>
          </div>
        </div>
        
        <div className="navbar-right flex items-center gap-4">
          {/* User role badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full" 
               style={{background: 'rgba(78, 205, 196, 0.2)', border: '1px solid rgba(78, 205, 196, 0.3)'}}>
            <i className={`fas ${userRole === 'admin' ? 'fa-shield-alt' : 'fa-id-card'} text-sm text-[#4ECDC4]`}></i>
            <span className="text-sm font-medium text-white">
              {userRole === 'admin' ? 'Administrator' : 'Staff Member'}
            </span>
          </div>
          
          {/* User email (truncated if too long) */}
          {user?.email && (
            <span className="hidden lg:block text-sm text-white max-w-[150px] truncate opacity-80">
              {user.email}
            </span>
          )}
          
          {/* Hamburger menu button */}
          <button 
            className="hamburger-btn flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ease-in-out text-white hover:text-[#4ECDC4] hover:rotate-180"
            onClick={toggleSidebar}
            aria-label="Toggle menu"
            style={{background: 'rgba(255, 255, 255, 0.1)'}}
          >
            <span className="material-icons text-2xl">menu</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .hamburger-btn:hover {
          transform: rotate(180deg);
          background: rgba(78, 205, 196, 0.2);
        }

        @media (max-width: 480px) {
          .logo-text {
            font-size: 0.9rem;
          }
          .logo-text1 {
            font-size: 0.7rem;
          }
          .logo-img-wrapper {
            width: 40px;
            height: 40px;
          }
        }
      `}</style>
    </nav>
  );
}