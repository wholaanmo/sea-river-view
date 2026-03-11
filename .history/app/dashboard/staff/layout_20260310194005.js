'use client';

import { useState, useEffect } from 'react';
import StaffNavbar from '@/components/staff/StaffNavbar';
import StaffSidebar from '@/components/staff/StaffSidebar';

export default function StaffLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true); // Set to true by default
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (!mounted) return null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <StaffNavbar toggleSidebar={toggleSidebar} />
      <div style={{ 
        display: 'flex', 
        minHeight: 'calc(100vh - 60px)', 
        marginTop: '60px',
        position: 'relative'
      }}>
        <StaffSidebar isOpen={sidebarOpen} onToggle={setSidebarOpen} />
        <main style={{ 
          flex: 1,
          padding: '2rem',
          transition: 'all 300ms ease-in-out',
          marginLeft: sidebarOpen ? '230px' : '72px',
          backgroundColor: '#f9fafb',
          minHeight: 'calc(100vh - 60px)'
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}