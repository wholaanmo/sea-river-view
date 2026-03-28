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
    <div className="min-h-screen bg-main">
      <AdminNavbar toggleSidebar={toggleSidebar} />
      <div className="flex min-h-screen-minus-navbar mt-navbar relative w-full">
        <AdminSidebar isOpen={sidebarOpen} onToggle={setSidebarOpen} />
        <main 
          className="flex-1 p-8 transition-all duration-300 bg-main overflow-x-hidden"
          style={{ 
            marginLeft: sidebarOpen ? '230px' : '72px',
            width: sidebarOpen ? 'calc(100% - 230px)' : 'calc(100% - 72px)',
            minHeight: 'calc(100vh - 60px)'
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}