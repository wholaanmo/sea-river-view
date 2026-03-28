// app/rooms/page.js
'use client';

import { useState, useEffect } from 'react';
import GuestLayout from '../guest/layout';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import RoomCard from '@/components/guest/RoomCard';

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [roomTypes, setRoomTypes] = useState([]);

  // Real-time listener for available rooms
  useEffect(() => {
    const roomsRef = collection(db, 'rooms');
    const q = query(roomsRef, where('archived', '!=', true), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const roomsList = [];
      const typesSet = new Set();
      
      querySnapshot.forEach((doc) => {
        const roomData = doc.data();
        // Only show available rooms to guests
        if (roomData.availability === 'available') {
          roomsList.push({
            id: doc.id,
            ...roomData
          });
          if (roomData.type) {
            typesSet.add(roomData.type);
          }
        }
      });
      setRooms(roomsList);
      setRoomTypes(Array.from(typesSet).sort());
      setLoading(false);
    }, (error) => {
      console.error('Error fetching rooms:', error);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Filter rooms based on search term and selected type
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || room.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <GuestLayout>
      <div className="min-h-screen bg-gradient-to-br from-ocean-ice to-blue-white">
        {/* Modern Minimal Header - No Background Color */}
        <div className="pt-12 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-textPrimary font-playfair mb-3 tracking-tight">
                Our Rooms & Accommodations
              </h1>
              <p className="text-textSecondary text-lg max-w-2xl mx-auto leading-relaxed">
                Experience comfort and luxury in our carefully designed rooms. 
                Perfect for families, couples, and groups.
              </p>
            </div>
          </div>
        </div>
        
        {/* Main Content Area with 30-70 Layout - Compact Margins */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Sidebar - 30% width */}
            <div className="lg:w-[30%] space-y-5">
              {/* Search Bar */}
              <div className="bg-white rounded-xl shadow-sm border border-ocean-light/10 p-4">
                <h3 className="text-base font-semibold text-textPrimary mb-3 font-playfair">
                  <i className="fas fa-search mr-2 text-ocean-light text-sm"></i>
                  Search Rooms
                </h3>
                <div className="relative">
                  <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-ocean-light/40 text-sm"></i>
                  <input
                    type="text"
                    placeholder="Search by room type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-ocean-light/20 rounded-lg text-textPrimary placeholder:text-textSecondary/50 focus:outline-none focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 transition-all duration-300 bg-white text-sm"
                  />
                </div>
              </div>

              {/* Room Types Filter */}
              <div className="bg-white rounded-xl shadow-sm border border-ocean-light/10 p-4">
                <h3 className="text-base font-semibold text-textPrimary mb-3 font-playfair">
                  <i className="fas fa-tag mr-2 text-ocean-light text-sm"></i>
                  Room Types
                </h3>
                <div className="space-y-1.5">
                  <button
                    onClick={() => setSelectedType('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                      selectedType === 'all'
                        ? 'bg-gradient-to-r from-ocean-mid to-ocean-light text-white shadow-sm'
                        : 'hover:bg-ocean-ice text-textPrimary'
                    }`}
                  >
                    <span className="flex items-center justify-between">
                      <span>All Rooms</span>
                      <span className="text-xs opacity-75">{rooms.length}</span>
                    </span>
                  </button>
                  {roomTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                        selectedType === type
                          ? 'bg-gradient-to-r from-ocean-mid to-ocean-light text-white shadow-sm'
                          : 'hover:bg-ocean-ice text-textPrimary'
                      }`}
                    >
                      <span className="flex items-center justify-between">
                        <span>{type}</span>
                        <span className="text-xs opacity-75">
                          {rooms.filter(room => room.type === type).length}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Content Area - 70% width with 2-column grid */}
            <div className="lg:w-[70%]">
              {loading ? (
                <div className="flex justify-center items-center py-16">
                  <i className="fas fa-spinner fa-spin text-3xl text-ocean-light"></i>
                </div>
              ) : filteredRooms.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                  <i className="fas fa-bed text-6xl text-ocean-light/30 mb-4"></i>
                  <h2 className="text-2xl font-semibold text-textPrimary mb-2">No Rooms Available</h2>
                  <p className="text-textSecondary">
                    {searchTerm || selectedType !== 'all' 
                      ? `No rooms matching your filters found.` 
                      : 'Check back soon for available accommodations.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredRooms.map((room) => (
                    <RoomCard key={room.id} room={room} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}