// app/day-tour/page.js
'use client';

import { useState, useEffect } from 'react';
import GuestLayout from '../guest/layout';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import DayTourCard from '@/components/guest/DayTourCard';

export default function DayTourPage() {
  const [dayTours, setDayTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [mounted, setMounted] = useState(false);

  // Handle mounted state for hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Real-time listener for available day tours
  useEffect(() => {
    if (!mounted) return;
    
    const toursRef = collection(db, 'dayTours');
    const q = query(toursRef, where('archived', '!=', true), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const toursList = [];
      
      querySnapshot.forEach((doc) => {
        const tourData = doc.data();
        // Only show available day tours to guests
        if (tourData.availability === 'available') {
          toursList.push({
            id: doc.id,
            ...tourData
          });
        }
      });
      setDayTours(toursList);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching day tours:', error);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [mounted]);

  // Filter tours based on search term
  const filteredTours = dayTours.filter(tour => {
    const matchesSearch = tour.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <GuestLayout>
        <div className="min-h-screen bg-gradient-to-br from-ocean-ice to-blue-white">
          <div className="pt-12 pb-8">
            <div className="mx-auto" style={{ marginLeft: '5%', marginRight: '5%' }}>
              <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-textPrimary font-playfair mb-3 tracking-tight">
                  Day Tour Packages
                </h1>
                <p className="text-textSecondary text-lg max-w-2xl mx-auto leading-relaxed">
                  Discover exciting day tours and adventures. Perfect for making unforgettable memories.
                </p>
              </div>
            </div>
          </div>
          <div className="mx-auto pb-16" style={{ marginLeft: '5%', marginRight: '5%' }}>
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="lg:w-[30%] space-y-5">
                <div className="bg-white rounded-xl shadow-sm border border-ocean-light/10 p-4">
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded mb-3"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
              <div className="lg:w-[70%]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
                      <div className="h-56 bg-gray-200"></div>
                      <div className="p-6">
                        <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded mb-3 w-1/2"></div>
                        <div className="h-20 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </GuestLayout>
    );
  }

  return (
    <GuestLayout>
      <div className="min-h-screen bg-gradient-to-br from-ocean-ice to-blue-white">
        {/* Modern Minimal Header */}
        <div className="pt-12 pb-8">
          <div className="mx-auto" style={{ marginLeft: '5%', marginRight: '5%' }}>
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-textPrimary font-playfair mb-3 tracking-tight">
                Day Tour Packages
              </h1>
              <p className="text-textSecondary text-lg max-w-2xl mx-auto leading-relaxed">
                Discover exciting day tours and adventures. Perfect for making unforgettable memories.
              </p>
            </div>
          </div>
        </div>
        
        {/* Main Content Area with 30-70 Layout */}
        <div className="mx-auto pb-16" style={{ marginLeft: '5%', marginRight: '5%' }}>
          <div className="flex flex-col lg:flex-row gap-5">
            {/* Left Sidebar - 30% width */}
            <div className="lg:w-[30%] space-y-4">
              {/* Search Bar */}
              <div className="bg-white rounded-xl shadow-sm border border-ocean-light/10 p-4">
                <h3 className="text-base font-semibold text-textPrimary mb-3 font-playfair">
                  <i className="fas fa-search mr-2 text-ocean-light text-sm"></i>
                  Search Tours
                </h3>
                <div className="relative">
                  <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-ocean-light/40 text-sm"></i>
                  <input
                    type="text"
                    placeholder="Search by tour name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-ocean-light/20 rounded-lg text-textPrimary placeholder:text-textSecondary/50 focus:outline-none focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 transition-all duration-300 bg-white text-sm"
                  />
                </div>
              </div>

              {/* Tour Info */}
              <div className="bg-white rounded-xl shadow-sm border border-ocean-light/10 p-4">
                <h3 className="text-base font-semibold text-textPrimary mb-3 font-playfair">
                  <i className="fas fa-info-circle mr-2 text-ocean-light text-sm"></i>
                  About Day Tours
                </h3>
                <p className="text-sm text-textSecondary leading-relaxed">
                  Our day tours offer exciting activities and adventures. Each package includes guided experiences and optional add-ons for a complete adventure.
                </p>
              </div>
            </div>

            {/* Right Content Area - 70% width with 2-column grid */}
            <div className="lg:w-[70%]">
              {loading ? (
                <div className="flex justify-center items-center py-16">
                  <i className="fas fa-spinner fa-spin text-3xl text-ocean-light"></i>
                </div>
              ) : filteredTours.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                  <i className="fas fa-sun text-6xl text-ocean-light/30 mb-4"></i>
                  <h2 className="text-2xl font-semibold text-textPrimary mb-2">No Day Tours Available</h2>
                  <p className="text-textSecondary">
                    {searchTerm 
                      ? `No tours matching "${searchTerm}" found.` 
                      : 'Check back soon for exciting day tour packages.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredTours.map((tour) => (
                    <DayTourCard key={tour.id} tour={tour} />
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