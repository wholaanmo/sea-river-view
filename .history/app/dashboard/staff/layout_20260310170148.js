'use client';

import { useState, useEffect } from 'react';
import StaffNavbar from '@/components/staff/StaffNavbar';
import StaffSidebar from '@/components/staff/StaffSidebar';

export default function StaffLayout({ children }) {
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
    <div className="staff-layout min-h-screen bg-gray-50">
      <StaffNavbar toggleSidebar={toggleSidebar} />
      <div className="layout-body flex min-h-[calc(100vh-60px)] mt-[60px] relative">
        <StaffSidebar isOpen={sidebarOpen} onToggle={setSidebarOpen} />
        <main
          className={`staff-content flex-1 transition-all duration-300 ease-in-out p-4 lg:p-8 ${
            sidebarOpen ? 'lg:ml-[230px]' : 'lg:ml-[72px]'
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}