'use client';

import { useState, useEffect } from 'react';
import AdminNavbar from '@/components/admin/AdminNavbar';
import AdminSidebar from '@/components/admin/Sidebar';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-pale to-ocean-ice">
      <AdminSidebar isOpen={sidebarOpen} onToggle={setSidebarOpen} />
      <div className="flex flex-col min-h-screen transition-all duration-300">
        <AdminNavbar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <main 
          className="flex-1 p-8 overflow-x-hidden"
          style={{ 
            marginLeft: sidebarOpen ? '260px' : '80px',
            marginTop: '60px'
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}