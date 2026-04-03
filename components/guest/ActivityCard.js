// components/guest/ActivityCard.js
'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function ActivityCard({ activity }) {
  const [imageError, setImageError] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  // Helper function to get price display text
  const getPriceDisplay = () => {
    const price = activity.priceValue?.toLocaleString();
    switch (activity.priceType) {
      case 'perHour':
        return { label: `/hour`, full: `per hour` };
      case 'per30Mins':
        return { label: `/30 min`, full: `per 30 minutes` };
      case 'per2Hrs':
        return { label: `/2 hrs`, full: `per 2 hours` };
      case 'per1Hr30Mins':
        return { label: `/1.5 hrs`, full: `per 1.5 hours` };
      default:
        return { label: ``, full: `` };
    }
  };

  const priceDisplay = getPriceDisplay();

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
      <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col sm:flex-row">
        {/* Activity Image - Left side (30-35% width) */}
        <div 
          className="relative sm:w-[35%] md:w-[30%] h-48 sm:h-auto min-h-[180px] bg-gradient-to-br from-ocean-pale to-ocean-ice overflow-hidden cursor-pointer"
          onClick={() => setShowDetailsModal(true)}
        >
          {activity.images && activity.images[0] && !imageError ? (
            <Image
              src={activity.images[0]}
              alt={activity.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <i className="fas fa-bicycle text-5xl text-ocean-light/30"></i>
            </div>
          )}
        </div>
        
        {/* Activity Details - Right side (65-70% width) */}
        <div className="flex-1 p-5 flex flex-col">
          <h3 className="text-xl font-bold text-textPrimary mb-2 line-clamp-1">{activity.name}</h3>
          
          <div className="mb-3">
            <p className="text-2xl font-bold text-ocean-mid">
              ₱{activity.priceValue?.toLocaleString()}
              <span className="text-sm font-normal text-textSecondary ml-1">{priceDisplay.label}</span>
            </p>
          </div>
          
          <p className="text-sm text-textSecondary line-clamp-2 mb-4 flex-1">
            {activity.description}
          </p>
          
          <button
            onClick={() => setShowDetailsModal(true)}
            className="w-full sm:w-auto px-5 py-2.5 border border-ocean-light/30 text-ocean-mid rounded-xl font-medium hover:bg-ocean-mid hover:text-white hover:border-ocean-mid transition-all duration-300 text-center"
          >
            View Details
          </button>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDetailsModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-auto p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-2xl font-bold text-textPrimary font-playfair">
                {activity.name}
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

                  <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm z-10">
                    {currentImageIndex + 1} / {activity.images.length}
                  </div>
                </div>
                
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
                <label className="block text-xs font-semibold text-neutral uppercase tracking-wide mb-1">Price</label>
                <p className="text-2xl font-bold text-ocean-mid">
                  ₱{activity.priceValue?.toLocaleString()}
                  <span className="text-sm font-normal text-textSecondary"> {priceDisplay.full}</span>
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
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
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