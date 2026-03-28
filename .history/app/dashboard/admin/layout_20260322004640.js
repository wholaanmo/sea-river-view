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
    <div className="min-h-screen bg-white">
      <AdminSidebar isOpen={sidebarOpen} onToggle={setSidebarOpen} />
      <div className="flex flex-col min-h-screen transition-all duration-300"
        style={{ 
          marginLeft: sidebarOpen ? '230px' : '72px',
          width: sidebarOpen ? 'calc(100% - 230px)' : 'calc(100% - 72px)'
        }}
      >
        <AdminNavbar toggleSidebar={toggleSidebar} />
        <main className="flex-1 p-8 bg-white overflow-x-hidden mt-navbar">
          {children}
        </main>
      </div>
    </div>
  );
}