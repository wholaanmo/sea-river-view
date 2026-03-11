'use client'

export default function Navbar({ toggleSidebar }) {
  return (
    <nav className="navbar fixed top-0 left-0 right-0 h-15 bg-[#728a9c] text-white z-50 shadow-lg">
      <div className="navbar-content flex items-center justify-between h-full px-4">
        <div className="navbar-left flex items-center">
          <div className="logo-container flex items-center gap-2">
            <img
              src="../assets/CommuniTrade.png"
              alt="CommuniTrade Logo"
              className="logo-img w-13 h-13 object-contain ml-1"
            />
            <p className="logo-text font-bold text-lg text-[#121731]">
              Communi
              <span className="logo-text1 font-bold text-lg text-white">Trade</span>
            </p>
          </div>
        </div>

        <div className="navbar-right flex items-center">
          <button
            className="hamburger-btn flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ease-in-out text-white"
            onClick={toggleSidebar}
          >
            <span className="material-icons">menu</span>
          </button>
        </div>
      </div>

      <style>
        {`
        .hamburger-btn:hover {
          color: #121731;
          transform: rotate(180deg);
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
      `}
      </style>
    </nav>
  );
}
