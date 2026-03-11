'use client'; 

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import AdminNavbar from '@/components/admin/AdminNavbar';
import AdminSidebar from '@/components/admin/Sidebar';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="admin-layout min-h-screen">
      <AdminNavbar toggleSidebar={toggleSidebar} />
      <div className="layout-body flex min-h-[calc(100vh-60px)] mt-15"> {/* Changed from mt-[60px] to mt-15 */}
        <AdminSidebar isOpen={sidebarOpen} onToggle={setSidebarOpen} />
        <main
          className={`admin-content flex-1 transition-all duration-300 ease-in-out p-4 lg:p-8 ${
            sidebarOpen
              ? 'lg:ml-57.5'  // Changed from lg:ml-[230px] to lg:ml-57.5 (230/4 = 57.5)
              : 'lg:ml-18'    // Changed from lg:ml-[calc(2.5rem+32px)] to lg:ml-18 (72px/4 = 18)
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}