// app/dashboard/admin/archive/page.js
'use client';

import { useState, useEffect } from 'react';
import { db } from '../../../../lib/firebase';
import { collection, query, orderBy, onSnapshot, where, updateDoc, doc } from 'firebase/firestore';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function ArchivePage() {
  const [archivedRooms, setArchivedRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [restoreModal, setRestoreModal] = useState({ show: false, room: null });
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
      setLoading(false);
    }, (error) => {
      console.error('Error fetching archived rooms:', error);
      showNotification('Failed to load archived rooms.', 'error');
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
  
  const handleRestoreRoom = async () => {
    if (!restoreModal.room) return;
    
    try {
      const roomRef = doc(db, 'rooms', restoreModal.room.id);
      await updateDoc(roomRef, {
        archived: false,
        restoredAt: new Date().toISOString()
      });
      showNotification(`${restoreModal.room.name} has been restored successfully!`);
      setRestoreModal({ show: false, room: null });
    } catch (error) {
      console.error('Error restoring room:', error);
      showNotification('Failed to restore room.', 'error');
    }
  };
  
  const getAvailabilityStyle = (availability) => {
    const styles = {
      available: 'bg-green-100 text-green-700',
      unavailable: 'bg-red-100 text-red-700',
      maintenance: 'bg-yellow-100 text-yellow-700'
    };
    return styles[availability] || 'bg-gray-100 text-gray-700';
  };
  
  const getAvailabilityLabel = (availability) => {
    const labels = {
      available: 'Available',
      unavailable: 'Unavailable',
      maintenance: 'Under Maintenance'
    };
    return labels[availability] || availability;
  };
  
  const filteredRooms = archivedRooms.filter(room => {
    const matchesSearch = room.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.type?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });
  
  return (
    <div className="p-6 bg-gradient-to-br from-ocean-ice to-blue-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-textPrimary font-playfair mb-1">
            Archived Rooms
          </h1>
          <p className="text-textSecondary">
            View and restore archived rooms
          </p>
        </div>
        
        <button
          onClick={() => router.push('/dashboard/admin/rooms')}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-ocean-mid to-ocean-light text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
        >
          <i className="fas fa-arrow-left text-sm"></i>
          Back to Rooms
        </button>
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
      
      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-neutral text-sm"></i>
          <input
            type="text"
            placeholder="Search archived rooms by name or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-ocean-light/20 rounded-xl text-sm focus:outline-none focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 transition-all duration-300 bg-white"
          />
        </div>
      </div>
      
      {/* Archived Rooms Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <i className="fas fa-spinner fa-spin text-3xl text-ocean-light"></i>
        </div>
      ) : (
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
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getAvailabilityStyle(room.availability)}`}>
                          {getAvailabilityLabel(room.availability)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-textSecondary text-sm">
                        {room.archivedAt ? new Date(room.archivedAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setRestoreModal({ show: true, room })}
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
      {restoreModal.show && restoreModal.room && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-scaleIn">
            <div className="text-center mb-5">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
                <i className="fas fa-trash-restore text-green-500 text-2xl"></i>
              </div>
              <h3 className="text-lg font-bold text-textPrimary mb-2">Restore Room</h3>
              <p className="text-textSecondary text-sm">
                Are you sure you want to restore "{restoreModal.room.name}"? 
                This room will be moved back to active rooms.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setRestoreModal({ show: false, room: null })}
                className="px-5 py-2 border border-ocean-light/20 rounded-xl text-textSecondary text-sm font-medium hover:bg-ocean-ice transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleRestoreRoom}
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
      `}</style>
    </div>
  );
}