// components/guest/ActivityCard.js
'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function ActivityCard({ activity }) {
  const [imageError, setImageError] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const nextImage = () => {
    if (activity.images && activity.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % activity.images.length);
    }
  };

  const prevImage = () => {
    if (activity.images && activity.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + activity.images.length) % activity.images.length);
    }
  };

  return (
    <>
      <div className="flex gap-3 p-3 bg-ocean-ice/30 rounded-lg hover:bg-ocean-ice transition-all duration-200 group">
        {/* Activity Image */}
        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-ocean-pale cursor-pointer" onClick={() => setShowDetailsModal(true)}>
          {activity.images && activity.images[0] && !imageError ? (
            <Image
              src={activity.images[0]}
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
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-ocean-mid">
                ₱{activity.pricePerHour.toLocaleString()}
                <span className="text-xs font-normal text-textSecondary">/hour</span>
              </p>
              <p className="text-xs text-textSecondary mt-0.5">
                <i className="fas fa-boxes mr-1"></i>
                {activity.availableInventory} available
              </p>
            </div>
            <button
              onClick={() => setShowDetailsModal(true)}
              className="text-xs px-2 py-1 bg-ocean-light/10 text-ocean-mid rounded-lg hover:bg-ocean-light hover:text-white transition-all duration-200"
            >
              Details
            </button>
          </div>
        </div>
      </div>

      {/* Details Modal with Image Slider */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDetailsModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-auto p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-2xl font-bold text-textPrimary font-playfair">
                {activity.name} - Activity Details
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-8 h-8 rounded-full bg-ocean-ice hover:bg-ocean-light/20 text-neutral hover:text-textPrimary transition-all duration-200 flex items-center justify-center"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            {/* Image Gallery with Slider */}
            {activity.images && activity.images.length > 0 && (
              <div className="mb-6">
                <div className="relative">
                  {/* Main Image Container with Zoom */}
                  <div 
                    className={`relative overflow-hidden rounded-xl bg-ocean-pale/30 ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
                    style={{ height: '400px' }}
                    onClick={() => setIsZoomed(!isZoomed)}
                  >
                    <div
                      className={`w-full h-full transition-transform duration-300 ${
                        isZoomed ? 'scale-150' : 'scale-100'
                      }`}
                    >
                      <Image
                        src={activity.images[currentImageIndex]}
                        alt={`${activity.name} - Image ${currentImageIndex + 1}`}
                        fill
                        className="object-contain"
                      />
                    </div>
                    
                    {/* Zoom Indicator */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsZoomed(!isZoomed);
                      }}
                      className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200 backdrop-blur-sm z-10"
                    >
                      <i className={`fas fa-${isZoomed ? 'search-minus' : 'search-plus'} text-lg`}></i>
                    </button>
                  </div>

                  {/* Navigation Controls */}
                  {activity.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200 backdrop-blur-sm z-10"
                      >
                        <i className="fas fa-chevron-left text-lg"></i>
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200 backdrop-blur-sm z-10"
                      >
                        <i className="fas fa-chevron-right text-lg"></i>
                      </button>
                    </>
                  )}

                  {/* Image Counter */}
                  <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm z-10">
                    {currentImageIndex + 1} / {activity.images.length}
                  </div>
                </div>
                
                {/* Thumbnail Navigation */}
                {activity.images.length > 1 && (
                  <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                    {activity.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setCurrentImageIndex(idx);
                          setIsZoomed(false);
                        }}
                        className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all duration-200 ${
                          currentImageIndex === idx
                            ? 'ring-2 ring-ocean-mid ring-offset-2'
                            : 'opacity-60 hover:opacity-100'
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`Thumbnail ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-neutral uppercase tracking-wide mb-1">Activity Name</label>
                <p className="text-lg font-semibold text-textPrimary">{activity.name}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral uppercase tracking-wide mb-1">Price per Hour</label>
                <p className="text-2xl font-bold text-ocean-mid">₱{activity.pricePerHour.toLocaleString()}</p>
                <span className="text-xs text-neutral">per hour</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral uppercase tracking-wide mb-1">Available Inventory</label>
                <p className="text-textPrimary flex items-center gap-2">
                  <i className="fas fa-boxes text-ocean-light"></i>
                  {activity.availableInventory} units available
                </p>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-neutral uppercase tracking-wide mb-1">Description</label>
                <p className="text-textSecondary leading-relaxed whitespace-pre-wrap">
                  {activity.description}
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