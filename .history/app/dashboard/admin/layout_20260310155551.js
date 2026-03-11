'use client'; 

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import UnifiedNavbar from '@/components/navbar/UnifiedNavbar';
import UnifiedSidebar from '@/components/sidebar/UnifiedSidebar';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Get user data from your auth context/session
  const user = {
    role: 'admin',
    email: 'admin@seariverview.com'
  };

  return (
    <div className="admin-layout min-h-screen">
      <UnifiedNavbar user={user} toggleSidebar={toggleSidebar} />
      <div className="layout-body flex min-h-[calc(100vh-60px)] mt-[60px]">
        <UnifiedSidebar 
          role="admin" 
          isOpen={sidebarOpen} 
          onToggle={setSidebarOpen} 
        />
        <main
          className={`admin-content flex-1 transition-all duration-300 ease-in-out p-4 lg:p-8 ${
            sidebarOpen
              ? 'lg:ml-[250px]' 
              : 'lg:ml-[calc(3rem+32px)]'  
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}