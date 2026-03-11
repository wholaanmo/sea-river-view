'use client';

import Image from 'next/image';

export default function Navbar({ user, toggleSidebar }) {
  // Determine user role from user object
  const userRole = user?.role || 'staff';
  
  return (
    <nav className="navbar fixed top-0 left-0 right-0 h-15 bg-[#728a9c] text-white z-50 shadow-lg">
      <div className="navbar-content flex items-center justify-between h-full px-4">
        <div className="navbar-left flex items-center">
          <div className="logo-container flex items-center gap-2">
            <div className="logo-img-wrapper w-13 h-13 relative ml-1">
              <Image 
                src="/assets/sea&river_view.png" 
                alt="Sea & River View Resort" 
                width={52}
                height={52}
                className="rounded-full object-cover"
                style={{ width: '52px', height: '52px' }}
              />
            </div>
            <div className="flex flex-col">
              <p className="logo-text font-bold text-lg text-[#121731] leading-tight">
                Sea & River
              </p>
              <p className="logo-text1 font-bold text-sm text-white -mt-1">
                View Resort
              </p>
            </div>
          </div>
        </div>
        
        <div className="navbar-right flex items-center gap-4">
          {/* User role badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#121731] bg-opacity-20 rounded-full">
            <i className={`fas ${userRole === 'admin' ? 'fa-shield-alt' : 'fa-id-card'} text-sm text-white`}></i>
            <span className="text-sm font-medium text-white">
              {userRole === 'admin' ? 'Administrator' : 'Staff Member'}
            </span>
          </div>
          
          {/* User email (truncated if too long) */}
          {user?.email && (
            <span className="hidden lg:block text-sm text-white max-w-[150px] truncate">
              {user.email}
            </span>
          )}
          
          {/* Hamburger menu button */}
          <button 
            className="hamburger-btn flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ease-in-out text-white hover:text-[#121731] hover:rotate-180"
            onClick={toggleSidebar}
            aria-label="Toggle menu"
          >
            <span className="material-icons text-2xl">menu</span>
          </button>
        </div>
      </div>

      {/* Responsive styles */}
      <style jsx>{`
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