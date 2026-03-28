'use client';

import { useState, useEffect } from 'react';
import GuestLayout from '../guest/layout';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import DayTourCard from '@/components/guest/DayTourCard';
import ActivityCard from '@/components/guest/ActivityCard';

export default function DayTourPage() {
  const [dayTours, setDayTours] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTourType, setSelectedTourType] = useState('all');
  const [tourTypes, setTourTypes] = useState([]);
  const [mounted, setMounted] = useState(false);

  // Handle mounted state for hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Real-time listener for available day tours
  useEffect(() => {
    if (!mounted) return;
    
    const toursRef = collection(db, 'dayTours');
    const toursQuery = query(toursRef, where('archived', '!=', true), orderBy('createdAt', 'desc'));
    
    const unsubscribeTours = onSnapshot(toursQuery, (querySnapshot) => {
      const toursList = [];
      const typesSet = new Set();
      
      querySnapshot.forEach((doc) => {
        const tourData = doc.data();
        if (tourData.availability === 'available') {
          toursList.push({
            id: doc.id,
            ...tourData
          });
          if (tourData.type) {
            typesSet.add(tourData.type);
          }
        }
      });
      setDayTours(toursList);
      setTourTypes(Array.from(typesSet).sort());
    }, (error) => {
      console.error('Error fetching day tours:', error);
    });
    
    return () => unsubscribeTours();
  }, [mounted]);

  // Real-time listener for activities (only non-archived)
  useEffect(() => {
    if (!mounted) return;
    
    const activitiesRef = collection(db, 'activities');
    const activitiesQuery = query(activitiesRef, where('archived', '!=', true), orderBy('createdAt', 'desc'));
    
    const unsubscribeActivities = onSnapshot(activitiesQuery, (querySnapshot) => {
      const activitiesList = [];
      querySnapshot.forEach((doc) => {
        activitiesList.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setActivities(activitiesList);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching activities:', error);
      setLoading(false);
    });
    
    return () => unsubscribeActivities();
  }, [mounted]);

  // Filter tours based on search term and selected type
  const filteredTours = dayTours.filter(tour => {
    const matchesSearch = tour.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedTourType === 'all' || tour.type === selectedTourType;
    return matchesSearch && matchesType;
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
                  Day Tour Packages & Activities
                </h1>
                <p className="text-textSecondary text-lg max-w-2xl mx-auto leading-relaxed">
                  Discover exciting day tours and adventure activities. Perfect for making unforgettable memories.
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
                Day Tour Packages & Activities
              </h1>
              <p className="text-textSecondary text-lg max-w-2xl mx-auto leading-relaxed">
                Discover exciting day tours and adventure activities. Perfect for making unforgettable memories.
              </p>
            </div>
          </div>
        </div>
        
        {/* Main Content Area with 30-70 Layout */}
        <div className="mx-auto pb-16" style={{ marginLeft: '5%', marginRight: '5%' }}>
          <div className="flex flex-col lg:flex-row gap-5">
            {/* Left Sidebar - 30% width */}
            <div className="lg:w-[30%] space-y-4">
              {/* Search Day Tours */}
              <div className="bg-white rounded-xl shadow-sm border border-ocean-light/10 p-4">
                <h3 className="text-base font-semibold text-textPrimary mb-3 font-playfair">
                  <i className="fas fa-search mr-2 text-ocean-light text-sm"></i>
                  Search Day Tours
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

              {/* Day Tour Types Filter */}
              {tourTypes.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-ocean-light/10 p-4">
                  <h3 className="text-base font-semibold text-textPrimary mb-3 font-playfair">
                    <i className="fas fa-tag mr-2 text-ocean-light text-sm"></i>
                    Tour Types
                  </h3>
                  <div className="space-y-1.5">
                    <button
                      onClick={() => setSelectedTourType('all')}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                        selectedTourType === 'all'
                          ? 'bg-gradient-to-r from-ocean-mid to-ocean-light text-white shadow-sm'
                          : 'hover:bg-ocean-ice text-textPrimary'
                      }`}
                    >
                      <span className="flex items-center justify-between">
                        <span>All Tours</span>
                        <span className="text-xs opacity-75">{dayTours.length}</span>
                      </span>
                    </button>
                    {tourTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedTourType(type)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                          selectedTourType === type
                            ? 'bg-gradient-to-r from-ocean-mid to-ocean-light text-white shadow-sm'
                            : 'hover:bg-ocean-ice text-textPrimary'
                        }`}
                      >
                        <span className="flex items-center justify-between">
                          <span>{type}</span>
                          <span className="text-xs opacity-75">
                            {dayTours.filter(tour => tour.type === type).length}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* About Day Tours Section */}
              <div className="bg-white rounded-xl shadow-sm border border-ocean-light/10 p-4">
                <h3 className="text-base font-semibold text-textPrimary mb-3 font-playfair">
                  <i className="fas fa-info-circle mr-2 text-ocean-light text-sm"></i>
                  About Day Tours
                </h3>
                <p className="text-sm text-textSecondary leading-relaxed">
                  Our day tours offer exciting activities and adventures. Each package includes guided experiences and optional add-ons for a complete adventure. Perfect for families, couples, and groups looking to explore the best attractions.
                </p>
              </div>

              {/* Activities Section - Inventory Hidden */}
              {activities.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-ocean-light/10 p-4">
                  <h3 className="text-base font-semibold text-textPrimary mb-3 font-playfair">
                    <i className="fas fa-bicycle mr-2 text-ocean-light text-sm"></i>
                    Activities
                  </h3>
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {activities.map((activity) => (
                      <ActivityCard key={activity.id} activity={activity} />
                    ))}
                  </div>
                </div>
              )}
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
                    {searchTerm || selectedTourType !== 'all' 
                      ? `No tours matching your filters found.` 
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