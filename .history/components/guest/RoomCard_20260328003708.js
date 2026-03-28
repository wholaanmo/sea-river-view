// components/guest/RoomCard.js
'use client';

import Image from 'next/image';
import { useState } from 'react';
import ImageSlider from './ImageSlider';
import { useRouter } from 'next/navigation';

export default function RoomCard({ room }) {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const router = useRouter();

  const handleBookNow = () => {
    router.push(`/rooms/calendar?roomId=${room.id}&roomType=${encodeURIComponent(room.type)}&price=${room.price}&capacity=${room.capacity}`);
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group">
        {/* Room Image */}
        <div className="relative h-56 bg-gradient-to-br from-ocean-pale to-ocean-ice overflow-hidden">
          {room.images && room.images.length > 0 ? (
            <Image
              src={room.images[0]}
              alt={room.type}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<div class="flex items-center justify-center h-full"><i class="fas fa-hotel text-6xl text-ocean-light/30"></i></div>';
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <i className="fas fa-hotel text-6xl text-ocean-light/30"></i>
            </div>
          )}
        </div>
        
        {/* Room Details */}
        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-xl font-bold text-textPrimary font-playfair">{room.type}</h3>
            </div>
            <p className="text-2xl font-bold text-ocean-mid">
              ₱{room.price.toLocaleString()}
              <span className="text-sm font-normal text-textSecondary">/night</span>
            </p>
          </div>
          
          {/* Room Features - Removed totalRooms display */}
          <div className="flex gap-4 mt-3 text-sm text-textSecondary border-b border-ocean-light/10 pb-3">
<span className="flex items-center gap-1">
  <i className="fas fa-users"></i> 
  {room.capacityMin && room.capacityMax 
    ? `${room.capacityMin}–${room.capacityMax} Guests` 
    : room.capacity || `${room.capacityMin || room.capacityMax} Guests`}
</span>
          </div>
          
          {/* Inclusions Preview */}
          {room.inclusions && room.inclusions.length > 0 && (
            <div className="mt-3">
              <div className="flex flex-wrap gap-1">
                {room.inclusions.slice(0, 3).map((inclusion, idx) => (
                  <span key={idx} className="text-xs px-2 py-0.5 bg-ocean-ice text-ocean-mid rounded-full">
                    {inclusion}
                  </span>
                ))}
                {room.inclusions.length > 3 && (
                  <span className="text-xs px-2 py-0.5 bg-ocean-ice text-ocean-mid rounded-full">
                    +{room.inclusions.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* Description Preview */}
          <p className="text-sm text-textSecondary mt-3 line-clamp-2">
            {room.description}
          </p>
          
          {/* Buttons */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setShowDetailsModal(true)}
              className="flex-1 px-4 py-2.5 border border-ocean-light/30 text-ocean-mid rounded-xl font-medium hover:bg-ocean-mid hover:text-white hover:border-ocean-mid transition-all duration-300"
            >
              Details
            </button>
            <button 
              onClick={handleBookNow}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-ocean-mid to-ocean-light text-white rounded-xl font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>

      {/* Details Modal with Image Slider - Updated */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDetailsModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-auto p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-2xl font-bold text-textPrimary font-playfair">
                {room.type}
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-8 h-8 rounded-full bg-ocean-ice hover:bg-ocean-light/20 text-neutral hover:text-textPrimary transition-all duration-200 flex items-center justify-center"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            {/* Image Gallery with Slider - Improved Layout */}
            {room.images && room.images.length > 0 && (
              <div className="mb-8">
                <div className="relative rounded-xl overflow-hidden bg-ocean-pale/30">
                  <ImageSlider images={room.images} roomType={room.type} />
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-neutral uppercase tracking-wide mb-1">Room Type</label>
                <p className="text-lg font-semibold text-textPrimary">{room.type}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral uppercase tracking-wide mb-1">Capacity</label>
                <p className="text-textPrimary flex items-center gap-2">
                  <i className="fas fa-users text-ocean-light"></i>
                  {room.capacity} Guests
                </p>
              </div>
              {/* Removed Total Rooms Available section from modal */}
              <div>
                <label className="block text-xs font-semibold text-neutral uppercase tracking-wide mb-1">Price per Night</label>
                <p className="text-2xl font-bold text-ocean-mid">₱{room.price.toLocaleString()}</p>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-neutral uppercase tracking-wide mb-1">Inclusions</label>
                <div className="flex flex-wrap gap-2">
                  {room.inclusions && room.inclusions.length > 0 ? (
                    room.inclusions.map((inclusion, idx) => (
                      <span key={idx} className="px-3 py-1 bg-ocean-ice text-ocean-mid rounded-full text-sm">
                        {inclusion}
                      </span>
                    ))
                  ) : (
                    <p className="text-textSecondary">No inclusions listed</p>
                  )}
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-neutral uppercase tracking-wide mb-1">Description</label>
                <p className="text-textSecondary leading-relaxed whitespace-pre-wrap">
                  {room.description}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-ocean-light/10">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-5 py-2.5 border border-ocean-light/20 rounded-xl text-textSecondary text-sm font-medium hover:bg-ocean-ice transition-all duration-300"
              >
                Close
              </button>
              <button 
                onClick={handleBookNow}
                className="px-5 py-2.5 bg-gradient-to-r from-ocean-mid to-ocean-light rounded-xl text-white text-sm font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  );
}