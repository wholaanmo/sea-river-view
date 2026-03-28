'app/dashboard/admin/layout.js'
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
      <div className="flex min-h-[calc(100vh-3.75rem)] mt-15 relative w-full overflow-x-hidden">
        <AdminSidebar isOpen={sidebarOpen} onToggle={setSidebarOpen} />
        <main 
          className="flex-1 p-8 transition-all duration-300 bg-main min-h-[calc(100vh-3.75rem)] max-w-full overflow-x-hidden"
          style={{ 
            marginLeft: sidebarOpen ? '230px' : '72px',
            width: sidebarOpen ? 'calc(100% - 230px)' : 'calc(100% - 72px)'
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}