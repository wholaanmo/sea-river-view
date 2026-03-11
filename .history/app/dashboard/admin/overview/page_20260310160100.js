'use client';

import { useState, useEffect } from 'react';

export default function AdminOverview() {
  const [stats, setStats] = useState({
    totalRooms: 45,
    occupiedRooms: 32,
    availableRooms: 13,
    todayCheckIns: 8,
    todayCheckOuts: 6,
    totalReservations: 156,
    pendingReservations: 23,
    totalStaff: 18,
    totalVenues: 5
  });

  const [recentActivities, setRecentActivities] = useState([
    { id: 1, action: 'New reservation - Room 304', time: '5 mins ago', user: 'John Smith' },
    { id: 2, action: 'Check-out - Room 201', time: '15 mins ago', user: 'Emma Wilson' },
    { id: 3, action: 'Staff added - Housekeeping', time: '1 hour ago', user: 'Admin' },
    { id: 4, action: 'Venue booked - Beach Wedding', time: '2 hours ago', user: 'Sarah Chen' },
    { id: 5, action: 'Room maintenance - Room 405', time: '3 hours ago', user: 'Mike Johnson' },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#0F172B', fontFamily: "'Playfair Display', serif" }}>
          Admin Dashboard Overview
        </h1>
        <p className="text-sm mt-1" style={{ color: '#718096' }}>
          Welcome back, Admin. Here's what's happening at Sea & River View Resort today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Rooms Card */}
        <div className="bg-white rounded-xl p-5 shadow-sm border" style={{ borderColor: '#e2e8f0' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#718096' }}>Total Rooms</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#0F172B' }}>{stats.totalRooms}</p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(0, 184, 219, 0.1)' }}>
              <span className="material-icons" style={{ color: '#00B8DB' }}>hotel</span>
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs">
            <span className="text-green-600 font-medium">{stats.availableRooms} available</span>
            <span className="mx-2" style={{ color: '#cbd5e0' }}>•</span>
            <span style={{ color: '#718096' }}>{stats.occupiedRooms} occupied</span>
          </div>
        </div>

        {/* Reservations Card */}
        <div className="bg-white rounded-xl p-5 shadow-sm border" style={{ borderColor: '#e2e8f0' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#718096' }}>Reservations</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#0F172B' }}>{stats.totalReservations}</p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(78, 205, 196, 0.1)' }}>
              <span className="material-icons" style={{ color: '#4ECDC4' }}>event</span>
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs">
            <span className="text-yellow-600 font-medium">{stats.pendingReservations} pending</span>
            <span className="mx-2" style={{ color: '#cbd5e0' }}>•</span>
            <span style={{ color: '#718096' }}>This month</span>
          </div>
        </div>

        {/* Check-ins/outs Card */}
        <div className="bg-white rounded-xl p-5 shadow-sm border" style={{ borderColor: '#e2e8f0' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#718096' }}>Today's Activity</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#0F172B' }}>{stats.todayCheckIns + stats.todayCheckOuts}</p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(255, 159, 67, 0.1)' }}>
              <span className="material-icons" style={{ color: '#FF9F43' }}>swap_horiz</span>
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs">
            <span className="text-green-600 font-medium">{stats.todayCheckIns} check-ins</span>
            <span className="mx-2" style={{ color: '#cbd5e0' }}>•</span>
            <span className="text-orange-600 font-medium">{stats.todayCheckOuts} check-outs</span>
          </div>
        </div>

        {/* Staff & Venues Card */}
        <div className="bg-white rounded-xl p-5 shadow-sm border" style={{ borderColor: '#e2e8f0' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#718096' }}>Staff & Venues</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#0F172B' }}>{stats.totalStaff + stats.totalVenues}</p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(15, 23, 43, 0.1)' }}>
              <span className="material-icons" style={{ color: '#0F172B' }}>people</span>
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs">
            <span style={{ color: '#718096' }}>{stats.totalStaff} staff • {stats.totalVenues} venues</span>
          </div>
        </div>
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Table */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm border" style={{ borderColor: '#e2e8f0' }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: '#0F172B', fontFamily: "'Playfair Display', serif" }}>
            Recent Activities
          </h2>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: '#f0f4f8' }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(0, 184, 219, 0.1)' }}>
                    <span className="material-icons text-sm" style={{ color: '#00B8DB' }}>notifications</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#0F172B' }}>{activity.action}</p>
                    <p className="text-xs" style={{ color: '#718096' }}>{activity.user} • {activity.time}</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full" style={{ background: '#f0f4f8', color: '#4a5568' }}>
                  New
                </span>
              </div>
            ))}
          </div>
          <button className="mt-4 text-sm font-medium w-full py-2 rounded-lg transition-colors" style={{ color: '#00B8DB' }}>
            View All Activities
          </button>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-5 shadow-sm border" style={{ borderColor: '#e2e8f0' }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: '#0F172B', fontFamily: "'Playfair Display', serif" }}>
            Quick Actions
          </h2>
          <div className="space-y-3">
            <button className="w-full p-3 rounded-lg flex items-center gap-3 transition-all hover:translate-x-1" style={{ background: '#f8fafd' }}>
              <span className="material-icons text-sm" style={{ color: '#00B8DB' }}>add</span>
              <span className="text-sm" style={{ color: '#0F172B' }}>Add New Reservation</span>
            </button>
            <button className="w-full p-3 rounded-lg flex items-center gap-3 transition-all hover:translate-x-1" style={{ background: '#f8fafd' }}>
              <span className="material-icons text-sm" style={{ color: '#4ECDC4' }}>person_add</span>
              <span className="text-sm" style={{ color: '#0F172B' }}>Add Staff Member</span>
            </button>
            <button className="w-full p-3 rounded-lg flex items-center gap-3 transition-all hover:translate-x-1" style={{ background: '#f8fafd' }}>
              <span className="material-icons text-sm" style={{ color: '#FF9F43' }}>assessment</span>
              <span className="text-sm" style={{ color: '#0F172B' }}>Generate Report</span>
            </button>
            <button className="w-full p-3 rounded-lg flex items-center gap-3 transition-all hover:translate-x-1" style={{ background: '#f8fafd' }}>
              <span className="material-icons text-sm" style={{ color: '#0F172B' }}>settings</span>
              <span className="text-sm" style={{ color: '#0F172B' }}>System Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}