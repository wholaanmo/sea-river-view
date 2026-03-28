// components/guest/ActivityCard.js
'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function ActivityCard({ activity }) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="flex gap-3 p-3 bg-ocean-ice/30 rounded-lg hover:bg-ocean-ice transition-all duration-200 group">
      {/* Activity Image */}
      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-ocean-pale">
        {activity.image && !imageError ? (
          <Image
            src={activity.image}
            alt={activity.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <i className="fas fa-bicycle text-2xl text-ocean-light/50"></i>
          </div>
        )}
      </div>
      
      {/* Activity Details */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-textPrimary text-sm mb-1">
          {activity.name}
        </h4>
        <p className="text-xs text-textSecondary line-clamp-2 mb-2">
          {activity.description}
        </p>
        <p className="text-sm font-bold text-ocean-mid">
          ₱{activity.pricePerHour.toLocaleString()}
          <span className="text-xs font-normal text-textSecondary">/hour</span>
        </p>
      </div>
    </div>
  );
}