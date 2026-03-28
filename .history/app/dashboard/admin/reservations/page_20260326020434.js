// app/dashboard/admin/reservations/page.js
'use client';

import { useState, useEffect } from 'react';
import { db } from '../../../../lib/firebase';
import { collection, query, orderBy, onSnapshot, where, updateDoc, doc, getDocs } from 'firebase/firestore';
import { logAdminAction } from '../../../../lib/auditLogger';

export default function AdminReservations() {
  const [activeTab, setActiveTab] = useState('rooms');
  const [statusFilter, setStatusFilter] = useState('all');
  const [bookings, setBookings] = useState([]);
  const [dayTours, setDayTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [actionLoading, setActionLoading] = useState({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
const [selectedBooking, setSelectedBooking] = useState(null);

  const statuses = ['all', 'pending', 'confirmed', 'check-in', 'check-out', 'cancelled'];

  // Real-time listener for room bookings
  useEffect(() => {
    const bookingsRef = collection(db, 'bookings');
    const q = query(bookingsRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const bookingsList = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.type === 'room') {
          bookingsList.push({
            id: doc.id,
            ...data
          });
        }
      });
      setBookings(bookingsList);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching bookings:', error);
      setNotification({ show: true, message: 'Failed to load reservations.', type: 'error' });
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Real-time listener for day tour bookings (placeholder)
  useEffect(() => {
    // This will be implemented when day tour booking is added
    setDayTours([]);
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'check-in':
        return 'bg-blue-100 text-blue-700';
      case 'check-out':
        return 'bg-purple-100 text-purple-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

const formatDateTime = (timestamp) => {
  if (!timestamp) return 'N/A';
  try {
    let dateObj;
    if (timestamp && typeof timestamp.toDate === 'function') {
      dateObj = timestamp.toDate();
    } else if (timestamp && typeof timestamp === 'object' && timestamp.seconds) {
      dateObj = new Date(timestamp.seconds * 1000);
    } else {
      dateObj = new Date(timestamp);
    }
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    
    return dateObj.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return 'Invalid Date';
  }
};

 const formatDateTimeFromDate = (date) => {
  if (!date) return 'N/A';
  try {
    // Handle Firestore Timestamp
    let dateObj;
    if (date && typeof date.toDate === 'function') {
      dateObj = date.toDate();
    } else if (date && typeof date === 'object' && date.seconds) {
      // Handle Firestore Timestamp with seconds property
      dateObj = new Date(date.seconds * 1000);
    } else {
      dateObj = new Date(date);
    }
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    
    return dateObj.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

  const handleConfirmReservation = async (booking) => {
    setActionLoading(prev => ({ ...prev, [booking.id]: true }));
    try {
      const bookingRef = doc(db, 'bookings', booking.id);
      await updateDoc(bookingRef, {
        status: 'confirmed',
        updatedAt: new Date().toISOString()
      });

      // Log the action
      await logAdminAction({
        action: 'Confirmed Reservation',
        module: 'Reservations',
        details: `Confirmed booking ${booking.bookingId} for ${booking.guestInfo?.firstName} ${booking.guestInfo?.lastName} - ${booking.roomType}`
      });

      showNotification(`Booking ${booking.bookingId} has been confirmed.`, 'success');
    } catch (error) {
      console.error('Error confirming reservation:', error);
      showNotification('Failed to confirm reservation.', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [booking.id]: false }));
    }
  };

  const handleCancelReservation = async (booking) => {
    if (!confirm(`Are you sure you want to cancel booking ${booking.bookingId}? This will make the dates available again.`)) {
      return;
    }

    setActionLoading(prev => ({ ...prev, [booking.id]: true }));
    try {
      const bookingRef = doc(db, 'bookings', booking.id);
      await updateDoc(bookingRef, {
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Log the action
      await logAdminAction({
        action: 'Cancelled Reservation',
        module: 'Reservations',
        details: `Cancelled booking ${booking.bookingId} for ${booking.guestInfo?.firstName} ${booking.guestInfo?.lastName} - ${booking.roomType}`
      });

      showNotification(`Booking ${booking.bookingId} has been cancelled. Dates are now available again.`, 'success');
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      showNotification('Failed to cancel reservation.', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [booking.id]: false }));
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 4000);
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.roomType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guestInfo?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guestInfo?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.bookingId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredDayTours = dayTours.filter(tour => {
    const matchesSearch = 
      tour.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tour.guestInfo?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tour.guestInfo?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || tour.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 bg-gradient-to-br from-ocean-ice to-blue-white min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-textPrimary font-playfair mb-1">
          Reservations Management
        </h1>
        <p className="text-textSecondary">
          Manage all room and day tour reservations
        </p>
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
          Rooms
        </button>
        <button
          onClick={() => setActiveTab('daytour')}
          className={`px-6 py-3 font-medium transition-all duration-200 ${
            activeTab === 'daytour'
              ? 'text-ocean-mid border-b-2 border-ocean-mid'
              : 'text-textSecondary hover:text-ocean-mid'
          }`}
        >
          <i className="fas fa-sun mr-2"></i>
          Day Tour
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-neutral text-sm"></i>
          <input
            type="text"
            placeholder={`Search by ${activeTab === 'rooms' ? 'room type, guest name, or booking ID' : 'tour name or guest name'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-ocean-light/20 rounded-xl text-sm focus:outline-none focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 transition-all duration-300 bg-white"
          />
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              statusFilter === status
                ? 'bg-ocean-mid text-white'
                : 'bg-white border border-ocean-light/20 text-textSecondary hover:bg-ocean-ice'
            }`}
          >
            {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Rooms Reservations Table */}
      {activeTab === 'rooms' && (
        <>
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <i className="fas fa-spinner fa-spin text-3xl text-ocean-light"></i>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-md border border-ocean-light/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-ocean-pale/50 border-b border-ocean-light/20">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Booking ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Guest Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Room Type</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Check-in</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Check-out</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Guests</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Total</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Actions</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Booked On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="px-4 py-12 text-center text-neutral">
                          <i className="fas fa-calendar-alt text-5xl mb-3 opacity-50 block"></i>
                          <p className="text-lg">No reservations found</p>
                          <p className="text-sm">Reservations will appear here once guests book</p>
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((booking) => (
                        <tr key={booking.id} className="border-b border-ocean-light/10 hover:bg-ocean-ice/30 transition-colors">
                          <td className="px-4 py-3">
                            <span className="font-mono text-sm">{booking.bookingId}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-textPrimary">
                              {booking.guestInfo?.firstName} {booking.guestInfo?.lastName}
                            </div>
                            <div className="text-xs text-neutral">{booking.guestInfo?.email}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-textPrimary">{booking.roomType}</div>
                          </td>
                          <td className="px-4 py-3 text-sm text-textSecondary">
                            {formatDateTimeFromDate(booking.checkIn)}
                          </td>
                          <td className="px-4 py-3 text-sm text-textSecondary">
                            {formatDateTimeFromDate(booking.checkOut)}
                          </td>
                          <td className="px-4 py-3 text-sm text-textSecondary">
                            {booking.guests}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-semibold text-ocean-mid">₱{booking.totalPrice?.toLocaleString()}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                              {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {booking.status === 'pending' && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleConfirmReservation(booking)}
                                  disabled={actionLoading[booking.id]}
                                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-all duration-200 disabled:opacity-50"
                                  title="Confirm after payment verification"
                                >
                                  <i className="fas fa-check mr-1"></i>
                                  Confirm
                                </button>
                                <button
                                  onClick={() => handleCancelReservation(booking)}
                                  disabled={actionLoading[booking.id]}
                                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-all duration-200 disabled:opacity-50"
                                  title="Cancel if payment is invalid"
                                >
                                  <i className="fas fa-times mr-1"></i>
                                  Cancel
                                </button>
                              </div>
                            )}
                            {booking.status !== 'pending' && (
                              <span className="text-xs text-textSecondary">
                                {booking.status === 'confirmed' && 'Confirmed'}
                                {booking.status === 'check-in' && 'Checked In'}
                                {booking.status === 'check-out' && 'Checked Out'}
                                {booking.status === 'cancelled' && 'Cancelled'}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-textSecondary">
                            {formatDateTime(booking.createdAt)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Day Tour Reservations Table (Empty for now) */}
      {activeTab === 'daytour' && (
        <div className="bg-white rounded-2xl shadow-md border border-ocean-light/10 overflow-hidden">
          <div className="p-12 text-center">
            <i className="fas fa-sun text-6xl text-ocean-light/30 mb-4 block"></i>
            <h3 className="text-xl font-semibold text-textPrimary mb-2">Day Tour Reservations</h3>
            <p className="text-textSecondary">Day tour booking system will be available soon</p>
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
      `}</style>
    </div>
  );
}