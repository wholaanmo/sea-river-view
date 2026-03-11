'use client';

import { useState, useEffect } from 'react';
import StaffNavbar from '@/components/staff/staffNavbar';
import StaffSidebar from '@/components/staff/staffSidebar';

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
        position: 'relative',
        width: '100%',
        overflowX: 'hidden' // Prevent horizontal scrolling
      }}>
        <StaffSidebar isOpen={sidebarOpen} onToggle={setSidebarOpen} />
        <main style={{ 
          flex: 1,
          padding: '2rem',
          transition: 'all 300ms ease-in-out',
          marginLeft: sidebarOpen ? '230px' : '72px',
          backgroundColor: '#f9fafb',
          minHeight: 'calc(100vh - 60px)',
          width: sidebarOpen ? 'calc(100% - 230px)' : 'calc(100% - 72px)', // Ensure proper width calculation
          maxWidth: '100%', // Prevent overflow
          overflowX: 'hidden' // Prevent horizontal scrolling in main content
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}