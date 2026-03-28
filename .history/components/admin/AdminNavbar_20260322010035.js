'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function AdminNavbar({ toggleSidebar, sidebarOpen }) {
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
      className="fixed right-0 h-navbar bg-white z-40 shadow-md flex items-center transition-all duration-300"
      style={{ 
        left: sidebarOpen ? '260px' : '80px',
        width: sidebarOpen ? 'calc(100% - 260px)' : 'calc(100% - 80px)'
      }}
    >
      <div className="flex items-center justify-between h-full px-6 w-full">
        {/* Page Title */}
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-ocean-coral to-ocean-wave rounded-full"></div>
          <h1 className="text-xl font-semibold text-ocean-deep font-playfair">
            Admin Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Role and Name Badge */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-ocean-foam to-white shadow-sm border border-ocean-wave/20 hover:shadow-md transition-all duration-200">
            <i className="fas fa-user-circle text-ocean-wave text-base"></i>
            <span className="text-sm font-semibold text-ocean-deep">
              {userRole}: {userName}
            </span>
          </div>
          
          <button
            onClick={toggleSidebar}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-ocean-foam to-white text-ocean-wave border border-ocean-wave/20 hover:bg-gradient-to-r hover:from-ocean-coral hover:to-ocean-wave hover:text-white transition-all duration-300 hover:rotate-180 shadow-sm"
          >
            <span className="material-icons">menu</span>
          </button>
        </div>
      </div>
    </nav>
  );
}