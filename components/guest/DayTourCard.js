'use client';

import Image from 'next/image';
import { useState } from 'react';
import ImageSlider from './ImageSlider';
import { useRouter } from 'next/navigation';

export default function DayTourCard({ tour }) {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const router = useRouter();

  return (
    <>
      <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group">
        {/* Tour Image */}
        <div className="relative h-64 bg-gradient-to-br from-ocean-pale to-ocean-ice overflow-hidden">
          {tour.images && tour.images.length > 0 ? (
            <Image
              src={tour.images[0]}
              alt="Day Tour"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<div class="flex items-center justify-center h-full"><i class="fas fa-umbrella-beach text-6xl text-ocean-light/30"></i></div>';
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <i className="fas fa-umbrella-beach text-6xl text-ocean-light/30"></i>
            </div>
          )}
          
          {/* Availability Badge */}
          <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${
            tour.availability === 'available' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {tour.availability === 'available' ? 'Available' : 'Not Available'}
          </div>
        </div>
        
        {/* Tour Details */}
        <div className="p-6">
          {/* Pricing Information */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-textSecondary">Adult (16+)</span>
              <span className="text-xl font-bold text-ocean-mid">₱{tour.adultPrice?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-textSecondary">Kid (15-)</span>
              <span className="text-xl font-bold text-ocean-mid">₱{tour.kidPrice?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-textSecondary">Senior</span>
              <span className="text-xl font-bold text-ocean-mid">₱{tour.seniorPrice?.toLocaleString()}</span>
            </div>
            <p className="text-xs text-neutral mt-2 text-right">per person</p>
          </div>
          
          {/* Capacity */}
          {tour.maxCapacity && (
            <div className="flex items-center gap-2 text-sm text-textSecondary mb-3">
              <i className="fas fa-users text-ocean-light"></i>
              <span>Max {tour.maxCapacity} guests</span>
            </div>
          )}
          
          {/* Inclusions Preview */}
          {tour.inclusions && tour.inclusions.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-1">
                {tour.inclusions.slice(0, 3).map((inclusion, idx) => (
                  <span key={idx} className="text-xs px-2 py-0.5 bg-ocean-ice text-ocean-mid rounded-full">
                    {inclusion}
                  </span>
                ))}
                {tour.inclusions.length > 3 && (
                  <span className="text-xs px-2 py-0.5 bg-ocean-ice text-ocean-mid rounded-full">
                    +{tour.inclusions.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* Description Preview */}
          <p className="text-sm text-textSecondary mb-4 line-clamp-2">
            {tour.description}
          </p>
          
          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowDetailsModal(true)}
              className="flex-1 px-4 py-2.5 border border-ocean-light/30 text-ocean-mid rounded-xl font-medium hover:bg-ocean-mid hover:text-white hover:border-ocean-mid transition-all duration-300"
            >
              Details
            </button>
<button 
  onClick={() => router.push('/day-tour/calendar')}
  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-ocean-mid to-ocean-light text-white rounded-xl font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
>
  Book Now
</button>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDetailsModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-auto p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-2xl font-bold text-textPrimary font-playfair">
                Day Tour Details
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-8 h-8 rounded-full bg-ocean-ice hover:bg-ocean-light/20 text-neutral hover:text-textPrimary transition-all duration-200 flex items-center justify-center"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            {/* Image Gallery with Slider */}
            {tour.images && tour.images.length > 0 && (
              <div className="mb-6">
                <ImageSlider images={tour.images} roomType="Day Tour" />
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-neutral uppercase tracking-wide mb-1">Adult Price (16+)</label>
                <p className="text-2xl font-bold text-ocean-mid">₱{tour.adultPrice?.toLocaleString()}<span className="text-sm font-normal text-textSecondary">/person</span></p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral uppercase tracking-wide mb-1">Kid Price (15-)</label>
                <p className="text-2xl font-bold text-ocean-mid">₱{tour.kidPrice?.toLocaleString()}<span className="text-sm font-normal text-textSecondary">/person</span></p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral uppercase tracking-wide mb-1">Senior Price</label>
                <p className="text-2xl font-bold text-ocean-mid">₱{tour.seniorPrice?.toLocaleString()}<span className="text-sm font-normal text-textSecondary">/person</span></p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral uppercase tracking-wide mb-1">Max Capacity</label>
                <p className="text-textPrimary flex items-center gap-2">
                  <i className="fas fa-users text-ocean-light"></i>
                  {tour.maxCapacity ? `${tour.maxCapacity} Guests` : 'Unlimited'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral uppercase tracking-wide mb-1">Status</label>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  tour.availability === 'available' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {tour.availability === 'available' ? 'Available' : 'Not Available'}
                </span>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-neutral uppercase tracking-wide mb-1">Inclusions</label>
                <div className="flex flex-wrap gap-2">
                  {tour.inclusions && tour.inclusions.length > 0 ? (
                    tour.inclusions.map((inclusion, idx) => (
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
                  {tour.description}
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
              <button onClick={() => router.push('/day-tour/calendar')} className="px-5 py-2.5 bg-gradient-to-r from-ocean-mid to-ocean-light rounded-xl text-white text-sm font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
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