// app/dashboard/admin/archive/page.js
'use client';

import { useState, useEffect } from 'react';
import { db } from '../../../../lib/firebase';
import { collection, query, orderBy, onSnapshot, where, updateDoc, doc } from 'firebase/firestore';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function ArchivePage() {
  const [archivedRooms, setArchivedRooms] = useState([]);
  const [archivedDayTours, setArchivedDayTours] = useState([]);
  const [archivedActivities, setArchivedActivities] = useState([]);
  const [activeTab, setActiveTab] = useState('rooms');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [restoreModal, setRestoreModal] = useState({ show: false, item: null, type: '' });
  const router = useRouter();

  // Real-time listener for archived rooms
  useEffect(() => {
    const roomsRef = collection(db, 'rooms');
    const q = query(roomsRef, where('archived', '==', true), orderBy('archivedAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const roomsList = [];
      querySnapshot.forEach((doc) => {
        roomsList.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setArchivedRooms(roomsList);
    }, (error) => {
      console.error('Error fetching archived rooms:', error);
      showNotification('Failed to load archived rooms.', 'error');
    });
    
    return () => unsubscribe();
  }, []);
  
  // Real-time listener for archived day tours
  useEffect(() => {
    const toursRef = collection(db, 'dayTours');
    const q = query(toursRef, where('archived', '==', true), orderBy('archivedAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const toursList = [];
      querySnapshot.forEach((doc) => {
        toursList.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setArchivedDayTours(toursList);
    }, (error) => {
      console.error('Error fetching archived day tours:', error);
      showNotification('Failed to load archived day tours.', 'error');
    });
    
    return () => unsubscribe();
  }, []);
  
  // Real-time listener for archived activities
  useEffect(() => {
    const activitiesRef = collection(db, 'activities');
    const q = query(activitiesRef, where('archived', '==', true), orderBy('archivedAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const activitiesList = [];
      querySnapshot.forEach((doc) => {
        activitiesList.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setArchivedActivities(activitiesList);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching archived activities:', error);
      showNotification('Failed to load archived activities.', 'error');
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);
  
  // Auto-hide notification
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);
  
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
  };
  
  const handleRestore = async () => {
    if (!restoreModal.item) return;
    
    try {
      const collectionName = restoreModal.type === 'room' ? 'rooms' : 
                             restoreModal.type === 'daytour' ? 'dayTours' : 'activities';
      const itemRef = doc(db, collectionName, restoreModal.item.id);
      await updateDoc(itemRef, {
        archived: false,
        restoredAt: new Date().toISOString()
      });
      showNotification(`${restoreModal.item.name || restoreModal.item.type || restoreModal.item.name} has been restored successfully!`);
      setRestoreModal({ show: false, item: null, type: '' });
    } catch (error) {
      console.error('Error restoring item:', error);
      showNotification('Failed to restore item.', 'error');
    }
  };
  
  const getRoomAvailabilityStyle = (availability) => {
    const styles = {
      available: 'bg-green-100 text-green-700',
      unavailable: 'bg-red-100 text-red-700',
      maintenance: 'bg-yellow-100 text-yellow-700'
    };
    return styles[availability] || 'bg-gray-100 text-gray-700';
  };
  
  const getRoomAvailabilityLabel = (availability) => {
    const labels = {
      available: 'Available',
      unavailable: 'Unavailable',
      maintenance: 'Under Maintenance'
    };
    return labels[availability] || availability;
  };
  
  const getTourAvailabilityStyle = (availability) => {
    const styles = {
      available: 'bg-green-100 text-green-700',
      unavailable: 'bg-red-100 text-red-700'
    };
    return styles[availability] || 'bg-gray-100 text-gray-700';
  };
  
  const getTourAvailabilityLabel = (availability) => {
    const labels = {
      available: 'Available',
      unavailable: 'Not Available'
    };
    return labels[availability] || availability;
  };
  
  const filteredRooms = archivedRooms.filter(room => {
    const matchesSearch = room.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.type?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });
  
  const filteredDayTours = archivedDayTours.filter(tour => {
    const matchesSearch = tour.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tour.type?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });
  
  const filteredActivities = archivedActivities.filter(activity => {
    const matchesSearch = activity.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });
  
  const getPricingLabel = (pricingType) => {
    if (pricingType === 'per_person') return 'Per Person';
    if (pricingType === 'promo') return 'Promo';
    return 'Per Person';
  };
  
  return (
    <div className="p-8 min-h-screen"style={{ backgroundColor: 'var(--color-blue-white)' }} >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-textPrimary font-playfair mb-1">
            Archive Management
          </h1>
          <p className="text-textSecondary">
            View and restore archived items (rooms, day tours, and activities)
          </p>
        </div>
      </div>
      
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-20 right-5 z-50 px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-slideInRight ${
          notification.type === 'error' ? 'bg-red-50 border-l-4 border-red-500 text-red-700' : 'bg-green-50 border-l-4 border-green-500 text-green-700'
        }`}>
          <i className={`${notification.type === 'error' ? 'fas fa-exclamation-circle text-red-500' : 'fas fa-check-circle text-green-500'} text-base`}></i>
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}
      
      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-ocean-light/20">
        <button
          onClick={() => setActiveTab('rooms')}
          className={`px-6 py-3 font-medium transition-all duration-200 ${
            activeTab === 'rooms'
              ? 'text-ocean-mid border-b-2 border-ocean-mid'
              : 'text-textSecondary hover:text-ocean-mid'
          }`}
        >
          <i className="fas fa-bed mr-2"></i>
          Archived Rooms
        </button>
        <button
          onClick={() => setActiveTab('daytours')}
          className={`px-6 py-3 font-medium transition-all duration-200 ${
            activeTab === 'daytours'
              ? 'text-ocean-mid border-b-2 border-ocean-mid'
              : 'text-textSecondary hover:text-ocean-mid'
          }`}
        >
          <i className="fas fa-sun mr-2"></i>
          Archived Day Tours
        </button>
        <button
          onClick={() => setActiveTab('activities')}
          className={`px-6 py-3 font-medium transition-all duration-200 ${
            activeTab === 'activities'
              ? 'text-ocean-mid border-b-2 border-ocean-mid'
              : 'text-textSecondary hover:text-ocean-mid'
          }`}
        >
          <i className="fas fa-bicycle mr-2"></i>
          Archived Activities
        </button>
      </div>
      
      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-neutral text-sm"></i>
          <input
            type="text"
            placeholder={`Search archived ${activeTab === 'rooms' ? 'rooms by name or type...' : activeTab === 'daytours' ? 'day tours by name or type...' : 'activities by name...'}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-ocean-light/20 rounded-xl text-sm focus:outline-none focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 transition-all duration-300 bg-white"
          />
        </div>
      </div>
      
      {/* Rooms Tab */}
      {activeTab === 'rooms' && (
        <div className="bg-white rounded-2xl shadow-md border border-ocean-light/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-ocean-pale/50 border-b border-ocean-light/20">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Room Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Capacity</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Total Rooms</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Price</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Archived Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Actions</th>
                 </tr>
              </thead>
              <tbody>
                {filteredRooms.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-12 text-center text-neutral">
                      <i className="fas fa-archive text-5xl mb-3 opacity-50 block"></i>
                      <p className="text-lg">No archived rooms found</p>
                      <p className="text-sm">Archived rooms will appear here</p>
                    </td>
                  </tr>
                ) : (
                  filteredRooms.map((room) => (
                    <tr key={room.id} className="border-b border-ocean-light/10 hover:bg-ocean-ice/30 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-textPrimary">{room.name}</div>
                          <div className="text-xs text-textSecondary mt-0.5">{room.type}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-textSecondary">
                        <span className="flex items-center gap-1">
                          <i className="fas fa-users text-xs text-ocean-light"></i>
                          {room.capacity} Guests
                        </span>
                      </td>
                      <td className="px-4 py-3 text-textSecondary">
                        <span className="flex items-center gap-1">
                          <i className="fas fa-door-open text-xs text-ocean-light"></i>
                          {room.totalRooms} Rooms
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-ocean-mid">₱{room.price.toLocaleString()}</span>
                        <span className="text-xs text-neutral">/night</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getRoomAvailabilityStyle(room.availability)}`}>
                          {getRoomAvailabilityLabel(room.availability)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-textSecondary text-sm">
                        {room.archivedAt ? new Date(room.archivedAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setRestoreModal({ show: true, item: room, type: 'room' })}
                          className="px-3 py-2 rounded-lg bg-green-500/10 text-green-600 hover:bg-green-600 hover:text-white transition-all duration-200 flex items-center gap-1"
                        >
                          <i className="fas fa-trash-restore"></i>
                          <span className="text-sm">Restore</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Day Tours Tab */}
      {activeTab === 'daytours' && (
        <div className="bg-white rounded-2xl shadow-md border border-ocean-light/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-ocean-pale/50 border-b border-ocean-light/20">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Day Tour Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Day Tour Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Max Capacity</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Pricing</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Archived Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDayTours.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-12 text-center text-neutral">
                      <i className="fas fa-archive text-5xl mb-3 opacity-50 block"></i>
                      <p className="text-lg">No archived day tours found</p>
                      <p className="text-sm">Archived day tours will appear here</p>
                    </td>
                  </tr>
                ) : (
                  filteredDayTours.map((tour) => (
                    <tr key={tour.id} className="border-b border-ocean-light/10 hover:bg-ocean-ice/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-textPrimary">{tour.name || 'Untitled Tour'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-textSecondary">{tour.type || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-3 text-textSecondary">
                        {tour.maxCapacity ? (
                          <span className="flex items-center gap-1">
                            <i className="fas fa-users text-xs text-ocean-light"></i>
                            {tour.maxCapacity} Guests
                          </span>
                        ) : (
                          <span className="text-neutral">{tour.pricingType === 'per_person' ? 'Not applicable' : 'Unlimited'}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {tour.pricingType === 'per_person' ? (
                          <div>
                            <div className="text-sm">Adult: ₱{tour.adultPrice?.toLocaleString()}<span className="text-xs text-neutral">/person</span></div>
                            <div className="text-sm">Kid: ₱{tour.kidPrice?.toLocaleString()}<span className="text-xs text-neutral">/person</span></div>
                          </div>
                        ) : (
                          <div>
                            <div className="font-semibold text-ocean-mid">₱{tour.promoPrice?.toLocaleString()}</div>
                            <div className="text-xs text-neutral">Promo Price</div>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getTourAvailabilityStyle(tour.availability)}`}>
                          {getTourAvailabilityLabel(tour.availability)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-textSecondary text-sm">
                        {tour.archivedAt ? new Date(tour.archivedAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setRestoreModal({ show: true, item: tour, type: 'daytour' })}
                          className="px-3 py-2 rounded-lg bg-green-500/10 text-green-600 hover:bg-green-600 hover:text-white transition-all duration-200 flex items-center gap-1"
                        >
                          <i className="fas fa-trash-restore"></i>
                          <span className="text-sm">Restore</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Activities Tab */}
      {activeTab === 'activities' && (
        <div className="bg-white rounded-2xl shadow-md border border-ocean-light/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-ocean-pale/50 border-b border-ocean-light/20">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Activity Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Price per Hour</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Description</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Available Inventory</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Archived Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredActivities.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-12 text-center text-neutral">
                      <i className="fas fa-archive text-5xl mb-3 opacity-50 block"></i>
                      <p className="text-lg">No archived activities found</p>
                      <p className="text-sm">Archived activities will appear here</p>
                    </td>
                  </tr>
                ) : (
                  filteredActivities.map((activity) => (
                    <tr key={activity.id} className="border-b border-ocean-light/10 hover:bg-ocean-ice/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-textPrimary">{activity.name}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-ocean-mid">₱{activity.pricePerHour.toLocaleString()}</span>
                        <span className="text-xs text-neutral">/hour</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-textSecondary line-clamp-2 max-w-xs">{activity.description}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          activity.availableInventory > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {activity.availableInventory} available
                        </span>
                      </td>
                      <td className="px-4 py-3 text-textSecondary text-sm">
                        {activity.archivedAt ? new Date(activity.archivedAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setRestoreModal({ show: true, item: activity, type: 'activity' })}
                          className="px-3 py-2 rounded-lg bg-green-500/10 text-green-600 hover:bg-green-600 hover:text-white transition-all duration-200 flex items-center gap-1"
                        >
                          <i className="fas fa-trash-restore"></i>
                          <span className="text-sm">Restore</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Restore Confirmation Modal */}
      {restoreModal.show && restoreModal.item && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-scaleIn">
            <div className="text-center mb-5">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
                <i className="fas fa-trash-restore text-green-500 text-2xl"></i>
              </div>
              <h3 className="text-lg font-bold text-textPrimary mb-2">Restore Item</h3>
              <p className="text-textSecondary text-sm">
                Are you sure you want to restore "{restoreModal.item.name || restoreModal.item.type || restoreModal.item.name}"? 
                This item will be moved back to active listings.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setRestoreModal({ show: false, item: null, type: '' })}
                className="px-5 py-2 border border-ocean-light/20 rounded-xl text-textSecondary text-sm font-medium hover:bg-ocean-ice transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleRestore}
                className="px-5 py-2 bg-gradient-to-r from-green-500 to-green-600 rounded-xl text-white text-sm font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                Restore
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
        
        @keyframes scaleIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}