'use client';

import { usePathname } from 'next/navigation';

export default function Navbar({ toggleSidebar }) {
  const pathname = usePathname();
  const isAdmin = pathname?.includes('/admin');

  return (
    <nav className="navbar fixed top-0 left-0 right-0 h-15 bg-[#2c5a6e] text-white z-50 shadow-lg">
      <div className="navbar-content flex items-center justify-between h-full px-4">
        <div className="navbar-left flex items-center">
          <div className="logo-container flex items-center gap-2">
            <img 
              src="/assets/sea&river_view.png" 
              alt="Sea & River View Logo" 
              className="logo-img w-12 h-12 object-contain ml-1 rounded-full border-2 border-[#4ECDC4]"
            />
            <p className="logo-text font-bold text-lg text-white">
              Sea & River
              <span className="logo-text1 font-bold text-lg text-[#4ECDC4]"> View</span>
            </p>
          </div>
        </div>
        
        <div className="navbar-right flex items-center">
          <span className="text-sm text-[#4ECDC4] mr-4 hidden sm:block">
            {isAdmin ? 'Administrator' : 'Staff Member'}
          </span>
          <button 
            className="hamburger-btn flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ease-in-out text-white hover:text-[#4ECDC4]" 
            onClick={toggleSidebar}
          >
            <span className="material-icons">menu</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .navbar {
          background: linear-gradient(145deg, #1a4a5a 0%, #2c6a7e 100%);
          border-bottom: 1px solid rgba(78, 205, 196, 0.2);
        }
        
        .hamburger-btn:hover {
          transform: rotate(180deg);
          background: rgba(78, 205, 196, 0.1);
        }

        @media (max-width: 480px) {
          .logo-text {
            font-size: 1rem;
          }
          
          .logo-img {
            width: 35px;
            height: 35px;
          }
        }

        @media (max-width: 360px) {
          .logo-text {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </nav>
  )
}