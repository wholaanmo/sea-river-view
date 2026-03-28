// components/guest/RoomCard.js
'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function RoomCard({ room }) {
  const [imageError, setImageError] = useState(false);
  
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group">
      {/* Room Image */}
      <div className="relative h-56 bg-gradient-to-br from-ocean-pale to-ocean-ice overflow-hidden">
        {room.images && room.images.length > 0 && !imageError ? (
          <Image
            src={room.images[0]}
            alt={room.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <i className="fas fa-hotel text-6xl text-ocean-light/30"></i>
          </div>
        )}
        {room.availability === 'unavailable' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="px-4 py-2 bg-red-500 text-white rounded-full text-sm font-semibold">
              Currently Unavailable
            </span>
          </div>
        )}
      </div>
      
      {/* Room Details */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-xl font-bold text-textPrimary font-playfair">{room.name}</h3>
            <p className="text-sm text-ocean-light font-medium mt-0.5">{room.type}</p>
          </div>
          <p className="text-2xl font-bold text-ocean-mid">
            ₱{room.price.toLocaleString()}
            <span className="text-sm font-normal text-textSecondary">/night</span>
          </p>
        </div>
        
        {/* Room Features */}
        <div className="flex gap-4 mt-3 text-sm text-textSecondary border-b border-ocean-light/10 pb-3">
          <span className="flex items-center gap-1">
            <i className="fas fa-users"></i> {room.capacity} Guests
          </span>
          <span className="flex items-center gap-1">
            <i className="fas fa-door-open"></i> {room.totalRooms} Available
          </span>
        </div>
        
        {/* Inclusions */}
        {room.inclusions && room.inclusions.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-semibold text-textSecondary mb-2">INCLUDES:</p>
            <div className="flex flex-wrap gap-1">
              {room.inclusions.map((inclusion, idx) => (
                <span key={idx} className="text-xs px-2 py-0.5 bg-ocean-ice text-ocean-mid rounded-full">
                  {inclusion}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Description */}
        <p className="text-sm text-textSecondary mt-3 line-clamp-3">
          {room.description}
        </p>
        
        {/* Book Now Button */}
        {room.availability === 'available' && (
          <button className="w-full mt-4 px-4 py-2.5 bg-gradient-to-r from-ocean-mid to-ocean-light text-white rounded-xl font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            Book Now
          </button>
        )}
      </div>
      
      <style jsx>{`
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}