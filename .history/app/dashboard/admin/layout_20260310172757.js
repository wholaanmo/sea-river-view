'use client';

import { useState, useEffect } from 'react';
import AdminNavbar from '@/components/admin/AdminNavbar';
import AdminSidebar from '@/components/admin/Sidebar';

export default function AdminLayout({ children }) {
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
      <AdminNavbar toggleSidebar={toggleSidebar} />
      <div style={{ 
        display: 'flex', 
        minHeight: 'calc(100vh - 60px)', 
        marginTop: '60px',
        position: 'relative'
      }}>
        <AdminSidebar isOpen={sidebarOpen} onToggle={setSidebarOpen} />
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