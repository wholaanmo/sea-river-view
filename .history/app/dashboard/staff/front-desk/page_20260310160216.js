'use client';

import { useState } from 'react';

export default function StaffFrontDesk() {
  const [selectedTab, setSelectedTab] = useState('today');
  const [searchQuery, setSearchQuery] = useState('');

  const [todaySchedule] = useState([
    { id: 1, room: '101', guest: 'John Smith', checkIn: '02:00 PM', checkOut: '11:00 AM', status: 'checked-in', guests: 2 },
    { id: 2, room: '205', guest: 'Emma Wilson', checkIn: '03:30 PM', checkOut: '12:00 PM', status: 'expected', guests: 4 },
    { id: 3, room: '304', guest: 'Michael Brown', checkIn: '04:00 PM', checkOut: '10:00 AM', status: 'checked-out', guests: 2 },
    { id: 4, room: '412', guest: 'Sarah Chen', checkIn: '01:00 PM', checkOut: '11:00 AM', status: 'checked-in', guests: 3 },
    { id: 5, room: '156', guest: 'David Miller', checkIn: '05:30 PM', checkOut: '02:00 PM', status: 'expected', guests: 2 },
  ]);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'checked-in':
        return <span className="px-2 py-1 text-xs rounded-full" style={{ background: '#d4edda', color: '#155724' }}>Checked In</span>;
      case 'checked-out':
        return <span className="px-2 py-1 text-xs rounded-full" style={{ background: '#f8d7da', color: '#721c24' }}>Checked Out</span>;
      case 'expected':
        return <span className="px-2 py-1 text-xs rounded-full" style={{ background: '#fff3cd', color: '#856404' }}>Expected</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0F172B', fontFamily: "'Playfair Display', serif" }}>
            Front Desk
          </h1>
          <p className="text-sm mt-1" style={{ color: '#718096' }}>
            Welcome back, Staff. Manage guest check-ins, check-outs, and room assignments.
          </p>
        </div>
        
        {/* Date Display */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: '#f8fafd' }}>
          <span className="material-icons text-sm" style={{ color: '#00B8DB' }}>calendar_today</span>
          <span className="text-sm font-medium" style={{ color: '#0F172B' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border" style={{ borderColor: '#e2e8f0' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(0, 184, 219, 0.1)' }}>
              <span className="material-icons text-[#00B8DB]">meeting_room</span>
            </div>
            <div>
              <p className="text-xs" style={{ color: '#718096' }}>Available Rooms</p>
              <p className="text-xl font-bold" style={{ color: '#0F172B' }}>12</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border" style={{ borderColor: '#e2e8f0' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(78, 205, 196, 0.1)' }}>
              <span className="material-icons text-[#4ECDC4]">login</span>
            </div>
            <div>
              <p className="text-xs" style={{ color: '#718096' }}>Today's Check-ins</p>
              <p className="text-xl font-bold" style={{ color: '#0F172B' }}>8</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border" style={{ borderColor: '#e2e8f0' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255, 159, 67, 0.1)' }}>
              <span className="material-icons text-[#FF9F43]">logout</span>
            </div>
            <div>
              <p className="text-xs" style={{ color: '#718096' }}>Today's Check-outs</p>
              <p className="text-xl font-bold" style={{ color: '#0F172B' }}>6</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border" style={{ borderColor: '#e2e8f0' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(15, 23, 43, 0.1)' }}>
              <span className="material-icons text-[#0F172B]">people</span>
            </div>
            <div>
              <p className="text-xs" style={{ color: '#718096' }}>Guests Today</p>
              <p className="text-xl font-bold" style={{ color: '#0F172B' }}>24</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex gap-2">
          {['today', 'upcoming', 'in-house', 'checkouts'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className="px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all"
              style={{
                background: selectedTab === tab ? 'linear-gradient(135deg, #00B8DB, #0095b3)' : '#f8fafd',
                color: selectedTab === tab ? '#ffffff' : '#4a5568'
              }}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>

        <div className="relative">
          <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#a0aec0' }}>search</span>
          <input
            type="text"
            placeholder="Search guest or room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-lg text-sm w-full sm:w-64"
            style={{ background: '#f8fafd', border: '1px solid #e2e8f0' }}
          />
        </div>
      </div>

      {/* Today's Schedule Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: '#e2e8f0' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ background: '#f8fafd' }}>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#718096' }}>Room</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#718096' }}>Guest Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#718096' }}>Check-in</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#718096' }}>Check-out</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#718096' }}>Guests</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#718096' }}>Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#718096' }}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#e2e8f0' }}>
              {todaySchedule.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-medium" style={{ color: '#0F172B' }}>{item.room}</span>
                  </td>
                  <td className="px-4 py-3" style={{ color: '#4a5568' }}>{item.guest}</td>
                  <td className="px-4 py-3" style={{ color: '#4a5568' }}>{item.checkIn}</td>
                  <td className="px-4 py-3" style={{ color: '#4a5568' }}>{item.checkOut}</td>
                  <td className="px-4 py-3" style={{ color: '#4a5568' }}>{item.guests}</td>
                  <td className="px-4 py-3">{getStatusBadge(item.status)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="p-1 rounded hover:bg-gray-100">
                        <span className="material-icons text-sm" style={{ color: '#00B8DB' }}>visibility</span>
                      </button>
                      <button className="p-1 rounded hover:bg-gray-100">
                        <span className="material-icons text-sm" style={{ color: '#4ECDC4' }}>edit</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions for Front Desk */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="p-4 rounded-xl border-2 border-dashed transition-all hover:scale-105" 
                style={{ borderColor: '#00B8DB', background: 'rgba(0, 184, 219, 0.05)' }}>
          <span className="material-icons text-3xl" style={{ color: '#00B8DB' }}>person_add</span>
          <p className="mt-2 font-medium" style={{ color: '#0F172B' }}>Walk-in Guest</p>
          <p className="text-xs mt-1" style={{ color: '#718096' }}>Register new guest without reservation</p>
        </button>

        <button className="p-4 rounded-xl border-2 border-dashed transition-all hover:scale-105"
                style={{ borderColor: '#4ECDC4', background: 'rgba(78, 205, 196, 0.05)' }}>
          <span className="material-icons text-3xl" style={{ color: '#4ECDC4' }}>room_service</span>
          <p className="mt-2 font-medium" style={{ color: '#0F172B' }}>Guest Request</p>
          <p className="text-xs mt-1" style={{ color: '#718096' }}Handle guest requests and services</p>
        </button>

        <button className="p-4 rounded-xl border-2 border-dashed transition-all hover:scale-105"
                style={{ borderColor: '#FF9F43', background: 'rgba(255, 159, 67, 0.05)' }}>
          <span className="material-icons text-3xl" style={{ color: '#FF9F43' }}>quick_reference</span>
          <p className="mt-2 font-medium" style={{ color: '#0F172B' }}>Quick Reference</p>
          <p className="text-xs mt-1" style={{ color: '#718096' }}>Room rates, policies, and info</p>
        </button>
      </div>
    </div>
  );
}
}