'use client'

import { useState } from 'react'
import StaffNavbar from '@/components/staff/staffNavbar'
import StaffSidebar from '@/components/staff/staffSidebar'

export default function StaffLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="staff-layout min-h-screen">
      <StaffNavbar toggleSidebar={toggleSidebar} />
      <div className="layout-body flex min-h-[calc(100vh-60px)] mt-15"> {/* Changed from mt-[60px] to mt-15 */}
        <StaffSidebar isOpen={sidebarOpen} onToggle={setSidebarOpen} />
        <main className={`staff-content flex-1 transition-all duration-300 ease-in-out p-4 lg:p-8 ${
          sidebarOpen ? 'lg:ml-57.5' : 'lg:ml-18'  // Updated both values
        }`}>
          {children}
        </main>
      </div>
    </div>
  )
}