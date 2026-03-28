// app/rooms/page.js
import GuestLayout from '../guest/layout';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import RoomCard from '@/components/guest/RoomCard';

export default async function RoomsPage() {
  // Fetch rooms from Firestore
  const roomsRef = collection(db, 'rooms');
  const q = query(roomsRef, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  
  const rooms = [];
  querySnapshot.forEach((doc) => {
    rooms.push({
      id: doc.id,
      ...doc.data()
    });
  });
  
  // Filter only available rooms for guests
  const availableRooms = rooms.filter(room => room.availability === 'available');
  
  return (
    <GuestLayout>
      <div className="min-h-screen bg-gradient-to-br from-ocean-ice to-blue-white">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-ocean-deep to-ocean-mid py-16 mb-12">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white font-playfair mb-4">
              Our Rooms & Accommodations
            </h1>
            <p className="text-white/90 text-lg max-w-2xl mx-auto">
              Experience comfort and luxury in our carefully designed rooms. Perfect for families, couples, and groups.
            </p>
          </div>
        </div>
        
        {/* Rooms Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {availableRooms.length === 0 ? (
            <div className="text-center py-16">
              <i className="fas fa-bed text-6xl text-ocean-light/30 mb-4"></i>
              <h2 className="text-2xl font-semibold text-textPrimary mb-2">No Rooms Available</h2>
              <p className="text-textSecondary">Check back soon for available accommodations.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {availableRooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          )}
        </div>
      </div>
    </GuestLayout>
  );
}