'use client'

import { useState } from 'react'
import UserNavbar from '@/components/user/UserNavbar'
import UserSidebar from '@/components/user/UserSidebar'

export default function UserLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="user-layout min-h-screen">
      <UserNavbar toggleSidebar={toggleSidebar} />
      <div className="layout-body flex min-h-[calc(100vh-60px)] mt-[60px]">
  <UserSidebar isOpen={sidebarOpen} onToggle={setSidebarOpen} />
  <main className={`user-content flex-1 transition-all duration-300 ease-in-out p-4 lg:p-8 ${
    sidebarOpen ? 'lg:ml-[230px]' : 'lg:ml-[calc(2.5rem+32px)]'
  }`}>
    {children}
  </main>
</div>

      <style jsx global>{`
        :root {
          --sidebar-width: 180px; /* reduced sidebar width */
        }
      `}</style>
    </div>
  )
}