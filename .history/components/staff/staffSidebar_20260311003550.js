'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';

export default function StaffSidebar({ isOpen, onToggle }) {
  const [is_expanded, setIsExpanded] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setIsExpanded(isOpen);
  }, [isOpen]);

  const handleSignOut = () => {
    setShowSignOutModal(true);
  };

  const confirmSignOut = async () => {
    try {
      await signOut(auth);
      
      // Clear all session data from localStorage
      localStorage.removeItem('userType');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('uid');
      localStorage.removeItem('sessionToken');
      localStorage.removeItem('sessionExpiry');
      localStorage.removeItem('rememberMe');
      
      setShowSignOutModal(false);
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
      
      // Even if there's an error, clear storage and redirect
      localStorage.removeItem('userType');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('uid');
      localStorage.removeItem('sessionToken');
      localStorage.removeItem('sessionExpiry');
      localStorage.removeItem('rememberMe');
      
      setShowSignOutModal(false);
      router.push('/login');
    }
  };

  const cancelSignOut = () => {
    setShowSignOutModal(false);
  };

  const isActive = (path) => {
    return pathname === path;
  };

  // Rest of your component remains the same...
}