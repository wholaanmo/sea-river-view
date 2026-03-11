'use client';

import { useState, useEffect } from 'react';
import AdminNavbar from '@/components/admin/AdminNavbar';
import AdminSidebar from '@/components/admin/Sidebar';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (!mounted) return null;

  return (
    <div className="admin-layout min-h-screen bg-gray-50">
      <AdminNavbar toggleSidebar={toggleSidebar} />
      <div className="layout-body flex relative" style={{ minHeight: 'calc(100vh - 60px)', marginTop: '60px' }}>
        <AdminSidebar isOpen={sidebarOpen} onToggle={setSidebarOpen} />
        <main
          className={`admin-content flex-1 transition-all duration-300 ease-in-out p-4 lg:p-8 ${
            sidebarOpen ? 'lg:ml-[230px]' : 'lg:ml-[72px]'
          }`}
          style={{ 
            backgroundColor: '#f9fafb',
            minHeight: 'calc(100vh - 60px)'
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}