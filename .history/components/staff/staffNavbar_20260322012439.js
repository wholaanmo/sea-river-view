'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function StaffNavbar({ toggleSidebar, sidebarOpen }) {
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const uid = localStorage.getItem('uid');
        if (uid) {
          const userDoc = await getDoc(doc(db, 'users', uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserName(userData.name || 'User');
            setUserRole(userData.role === 'admin' ? 'Administrator' : 'Staff');
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    fetchUserData();
  }, []);

  return (
    <nav 
      className="fixed right-0 h-navbar bg-white z-40 shadow-sm flex items-center transition-all duration-300 ease-in-out"
      style={{ 
        left: sidebarOpen ? '260px' : '80px',
        width: sidebarOpen ? 'calc(100% - 260px)' : 'calc(100% - 80px)',
        transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <div className="flex items-center justify-between h-full px-6 w-full">
        {/* Page Title */}
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-ocean-light to-ocean-mid rounded-full"></div>
          <h1 className="text-xl font-semibold text-ocean-deep font-playfair">
            Staff Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Role and Name Badge */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-white to-white shadow-sm border border-ocean-light/10 hover:shadow-md transition-all duration-200">
            <i className="fas fa-user-tie text-ocean-light text-base"></i>
            <span className="text-sm font-semibold text-ocean-deep">
              Staff: {userName || 'Staff Member'}
            </span>
          </div>
          
          <button
            onClick={toggleSidebar}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-white to-white text-ocean-light border border-ocean-light/10 hover:bg-gradient-to-r hover:from-ocean-light hover:to-ocean-mid hover:text-white transition-all duration-300 hover:rotate-180 shadow-sm"
          >
            <span className="material-icons">menu</span>
          </button>
        </div>
      </div>
    </nav>
  );
}