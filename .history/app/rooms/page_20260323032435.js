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

  // Real-time listener for available rooms
  useEffect(() => {
    const roomsRef = collection(db, 'rooms');
    const q = query(roomsRef, where('archived', '!=', true), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const roomsList = [];
      querySnapshot.forEach((doc) => {
        const roomData = doc.data();
        // Only show available rooms to guests
        if (roomData.availability === 'available') {
          roomsList.push({
            id: doc.id,
            ...roomData
          });
        }
      });
      setRooms(roomsList);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching rooms:', error);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Filter rooms based on search term
  const filteredRooms = rooms.filter(room => 
    room.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <GuestLayout>
      <div className="min-h-screen bg-gradient-to-br from-ocean-ice to-blue-white">
        {/* Hero Section with lighter design */}
        <div className="relative bg-gradient-to-r from-ocean-pale/80 to-ocean-ice/80 py-12 mb-8">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-textPrimary font-playfair mb-2">
              Our Rooms & Accommodations
            </h1>
            <p className="text-textSecondary text-base max-w-2xl mx-auto">
              Experience comfort and luxury in our carefully designed rooms. Perfect for families, couples, and groups.
            </p>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="relative max-w-md mx-auto">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-ocean-light/50"></i>
            <input
              type="text"
              placeholder="Search by room type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-ocean-light/20 rounded-xl text-textPrimary placeholder:text-textSecondary/50 focus:outline-none focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 transition-all duration-300 bg-white shadow-sm"
            />
          </div>
        </div>
        
        {/* Rooms Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <i className="fas fa-spinner fa-spin text-3xl text-ocean-light"></i>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="text-center py-16">
              <i className="fas fa-bed text-6xl text-ocean-light/30 mb-4"></i>
              <h2 className="text-2xl font-semibold text-textPrimary mb-2">No Rooms Available</h2>
              <p className="text-textSecondary">
                {searchTerm ? `No rooms matching "${searchTerm}" found.` : 'Check back soon for available accommodations.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredRooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          )}
        </div>
      </div>
    </GuestLayout>
  );
}