
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { auth, db } from '../../../lib/firebase';
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
    <nav className="fixed top-0 left-0 right-0 h-[60px] bg-[#ECF9FC] z-50 shadow-md flex items-center">
      <div className="flex items-center justify-between h-full px-4 w-full">
        <div className="flex items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 relative ml-1">
              <Image 
                src="/assets/Sea&RiverView.png" 
                alt="SandyFeet Reservation" 
                width={40}
                height={40}
                priority
                className="rounded-full border-2 border-[#5FB3C8] object-cover shadow-md"
              />
            </div>
            <div className="flex flex-col">
              <p className="font-bold text-base text-[#2F6F7E] leading-tight font-['Playfair_Display'] m-0">
                SandyFeet
              </p>
              <p className="font-bold text-xs text-[#5FB3C8] leading-tight m-0">
                Reservation
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Role and Name Badge */}
          <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-white shadow-sm border border-[#9CA3AF]/20">
            <i className="fas fa-user-circle text-[#2F6F7E] text-base"></i>
            <span className="text-sm font-semibold text-[#2F6F7E]">
              {userRole}: {userName}
            </span>
          </div>
          
          <button
            onClick={toggleSidebar}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/80 text-[#2F6F7E] border border-[#9CA3AF]/20 hover:bg-[#5FB3C8] hover:text-white transition-all duration-300 hover:rotate-180"
          >
            <span className="material-icons">menu</span>
          </button>
        </div>
      </div>
    </nav>
  );
}