'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

export default function AdminOverview() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // Not logged in, redirect to login
        router.push('/login');
        return;
      }

      try {
        // Check role in Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (!userDoc.exists()) {
          // User exists in Auth but not in Firestore
          console.log('User document not found');
          router.push('/login');
          return;
        }

        const userData = userDoc.data();
        const userRole = userData.role;

        // Verify if user is admin
        if (userRole !== 'admin') {
          // User is not admin, redirect to staff dashboard
          router.push('/dashboard/staff/front-desk');
          return;
        }

        // User is authorized as admin
        setAuthorized(true);
        setLoading(false);

        // Check session expiry
        const sessionExpiry = localStorage.getItem('sessionExpiry');
        const now = new Date().getTime();
        
        if (sessionExpiry && now > parseInt(sessionExpiry)) {
          // Session expired, clear storage and redirect to login
          localStorage.removeItem('userType');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('uid');
          localStorage.removeItem('sessionToken');
          localStorage.removeItem('sessionExpiry');
          localStorage.removeItem('rememberMe');
          
          await auth.signOut();
          router.push('/login');
          return;
        }

      } catch (error) {
        console.error('Error checking user role:', error);
        router.push('/login');
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <i className="fas fa-spinner fa-spin" style={{ 
            fontSize: '3rem', 
            color: '#00B8DB',
            marginBottom: '1rem'
          }}></i>
          <p style={{ color: '#0F172B', fontFamily: "'Poppins', sans-serif" }}>
            Verifying access...
          </p>
        </div>
      </div>
    );
  }

  // Only render the page content if authorized
  if (!authorized) {
    return null;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#0F172B] mb-4">Admin Dashboard Overview</h1>
      <p className="text-gray-600">Welcome to Sea & River View Resort Admin Dashboard</p>
      
      {/* Test cards to verify content is visible */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="font-semibold text-[#0F172B]">Total Rooms</h3>
          <p className="text-2xl text-[#00B8DB]">45</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="font-semibold text-[#0F172B]">Reservations</h3>
          <p className="text-2xl text-[#00B8DB]">156</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="font-semibold text-[#0F172B]">Staff</h3>
          <p className="text-2xl text-[#00B8DB]">18</p>
        </div>
      </div>
    </div>
  );
}