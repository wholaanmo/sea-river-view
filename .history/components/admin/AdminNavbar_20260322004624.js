'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function AdminNavbar({ toggleSidebar }) {
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
    <nav className="fixed left-0 right-0 h-navbar bg-main z-40 shadow-md flex items-center transition-all duration-300"
      style={{ 
        left: '230px',
        width: 'calc(100% - 230px)'
      }}
    >
      <div className="flex items-center justify-end h-full px-6 w-full">
        <div className="flex items-center gap-4">
          {/* Role and Name Badge */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-neutral/20 hover:shadow-md transition-shadow duration-200">
            <i className="fas fa-user-circle text-textPrimary text-base"></i>
            <span className="text-sm font-semibold text-textPrimary">
              {userRole}: {userName}
            </span>
          </div>
          
          <button
            onClick={toggleSidebar}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/80 text-textPrimary border border-neutral/20 hover:bg-accent hover:text-white transition-all duration-300 hover:rotate-180"
          >
            <span className="material-icons">menu</span>
          </button>
        </div>
      </div>
    </nav>
  );
}