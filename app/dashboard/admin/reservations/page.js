// app/dashboard/admin/reservations/page.js
'use client';

import { useState, useEffect } from 'react';
import { db } from '../../../../lib/firebase';
import { collection, query, orderBy, onSnapshot, where, updateDoc, doc, getDocs } from 'firebase/firestore';
import { logAdminAction } from '../../../../lib/auditLogger';
import { sendConfirmationEmail, sendCancellationEmail } from '../../../../lib/emailService';

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
  const [refundModal, setRefundModal] = useState({ show: false, booking: null, sending: false });
  
  // New state for confirmation modals
  const [confirmModal, setConfirmModal] = useState({ show: false, booking: null, type: '' });
  const [cancelModal, setCancelModal] = useState({ show: false, booking: null, reason: '' });

  const statuses = ['all', 'pending', 'confirmed', 'check-in', 'check-out', 'cancelled', 'cancelled-by-guest'];

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

  // Auto-hide notification
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

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
    case 'cancelled-by-guest':
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
      let dateObj;
      if (date && typeof date.toDate === 'function') {
        dateObj = date.toDate();
      } else if (date && typeof date === 'object' && date.seconds) {
        dateObj = new Date(date.seconds * 1000);
      } else {
        dateObj = new Date(date);
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
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  // Updated confirm reservation function with confirmation modal and email notification
  const handleConfirmReservation = async () => {
    const booking = confirmModal.booking;
    if (!booking) return;
    
    if (booking.status !== 'pending') {
      showNotification('This reservation is no longer pending.', 'error');
      setConfirmModal({ show: false, booking: null, type: '' });
      return;
    }
    
    setActionLoading(prev => ({ ...prev, [booking.id]: true }));
    try {
      const bookingRef = doc(db, 'bookings', booking.id);
      await updateDoc(bookingRef, {
        status: 'confirmed',
        updatedAt: new Date().toISOString()
      });

      // Send confirmation email to guest
      const emailResult = await sendConfirmationEmail(booking);
      if (emailResult.success) {
        console.log('Confirmation email sent successfully');
      } else {
        console.warn('Failed to send confirmation email:', emailResult.error);
        // Still show success for booking, but log the email failure
      }

      await logAdminAction({
        action: 'Confirmed Reservation',
        module: 'Reservations',
        details: `Confirmed booking ${booking.bookingId} for ${booking.guestInfo?.firstName} ${booking.guestInfo?.lastName} - ${booking.roomType}`
      });

      showNotification(`Booking ${booking.bookingId} has been confirmed. A confirmation email has been sent to the guest.`, 'success');
      setShowPaymentModal(false); // Close modal on success
      setConfirmModal({ show: false, booking: null, type: '' });
    } catch (error) {
      console.error('Error confirming reservation:', error);
      showNotification('Failed to confirm reservation.', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [booking.id]: false }));
    }
  };

  // Updated cancel reservation function with reason and email notification
  const handleCancelReservation = async () => {
    const booking = cancelModal.booking;
    const reason = cancelModal.reason;
    
    if (!booking) return;
    
    if (!reason.trim()) {
      showNotification('Please provide a cancellation reason.', 'error');
      return;
    }
    
    if (booking.status !== 'pending') {
      showNotification('This reservation is no longer pending.', 'error');
      setCancelModal({ show: false, booking: null, reason: '' });
      return;
    }
    
    setActionLoading(prev => ({ ...prev, [booking.id]: true }));
    try {
      const bookingRef = doc(db, 'bookings', booking.id);
      await updateDoc(bookingRef, {
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
        cancellationReason: reason,
        cancelledBy: 'admin',
        updatedAt: new Date().toISOString()
      });

      // Send cancellation email to guest
      const emailResult = await sendCancellationEmail(booking, reason, 'admin');
      if (emailResult.success) {
        console.log('Cancellation email sent successfully');
      } else {
        console.warn('Failed to send cancellation email:', emailResult.error);
      }

      await logAdminAction({
        action: 'Cancelled Reservation',
        module: 'Reservations',
        details: `Cancelled booking ${booking.bookingId} for ${booking.guestInfo?.firstName} ${booking.guestInfo?.lastName} - ${booking.roomType}. Reason: ${reason}`
      });

      showNotification(`Booking ${booking.bookingId} has been cancelled. A cancellation email has been sent to the guest.`, 'success');
      setShowPaymentModal(false); // Close modal on success
      setCancelModal({ show: false, booking: null, reason: '' });
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      showNotification('Failed to cancel reservation.', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [booking.id]: false }));
    }
  };

 const handleSendRefundNotification = async () => {
  const booking = refundModal.booking;
  if (!booking) return;

  setRefundModal(prev => ({ ...prev, sending: true }));
  try {
    const response = await fetch('/api/admin/send-refund-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: booking.id })
    });
    const data = await response.json();

    if (response.ok) {
      // Calculate refund amount for audit log
      const total = typeof booking.totalPrice === 'number' ? booking.totalPrice : Number(booking.totalPrice) || 0;
      const downPayment = total * 0.5;
      const refundAmount = downPayment * 0.5;
      
      await logAdminAction({
        action: 'Refund Notification Sent',
        module: 'Reservations',
        details: `Sent refund notification for booking ${booking.bookingId} to ${booking.guestInfo?.firstName} ${booking.guestInfo?.lastName} (${booking.guestInfo?.email}). Refund amount: ₱${refundAmount.toLocaleString()} (50% of down payment)`
      });
      
      showNotification(`Refund notification sent to ${booking.guestInfo?.email}`, 'success');
    } else {
      showNotification(data.error || 'Failed to send refund notification', 'error');
    }
  } catch (error) {
    console.error('Error sending refund notification:', error);
    showNotification('Failed to send refund notification', 'error');
  } finally {
    setRefundModal({ show: false, booking: null, sending: false });
  }
};

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
  };

  // Helper function to calculate 50% down payment
  const calculateDownPayment = (totalPrice) => {
    if (!totalPrice) return 0;
    const total = typeof totalPrice === 'number' ? totalPrice : Number(totalPrice) || 0;
    return total * 0.5;
  };

  // Helper function to calculate remaining balance
const calculateBalance = (booking) => {
  const total = typeof booking.totalPrice === 'number' ? booking.totalPrice : Number(booking.totalPrice) || 0;
  const downPayment = total * 0.5;
  
  if (booking.status === 'confirmed') {
    const balance = total - downPayment;
    return `₱${balance.toLocaleString()}`;
  } else if (booking.status === 'cancelled-by-guest') {
    // 50% of down payment
    const refundableAmount = downPayment * 0.5;
    return `₱${refundableAmount.toLocaleString()}`;
  } else if (booking.status === 'cancelled') {
    return 'Not Confirmed';
  } else {
    return 'Not Confirmed';
  }
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
                      <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">50% Down Payment</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Balance</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Actions</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Booked On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan="12" className="px-4 py-12 text-center text-neutral">
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
                            <span className="font-semibold text-ocean-mid">₱{Number(booking.totalPrice).toLocaleString()}</span>
                           </td>
                          <td className="px-4 py-3">
                            <span className="font-semibold text-ocean-mid">₱{calculateDownPayment(booking.totalPrice).toLocaleString()}</span>
                           </td>
                          <td className="px-4 py-3">
                            <span className={`text-sm font-medium ${booking.status === 'confirmed' ? 'text-ocean-mid' : 'text-neutral'}`}>
                              {calculateBalance(booking)}
                            </span>
                           </td>
                          <td className="px-4 py-3">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                              {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                            </span>
                           </td>
<td className="px-4 py-3">
  <div className="flex gap-2">
    {(booking.paymentProof || booking.status === 'pending') && (
      <button
        onClick={() => {
          setSelectedBooking(booking);
          setShowPaymentModal(true);
        }}
        className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
        title="View Payment Proof"
      >
        <i className="fas fa-receipt mr-1"></i>
        View Payment
      </button>
    )}
    {booking.status === 'cancelled-by-guest' && (
      <button
        onClick={() => setRefundModal({ show: true, booking, sending: false })}
        className="px-3 py-1.5 text-xs font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all duration-200"
        title="Send Refund Notification"
      >
        <i className="fas fa-dollar-sign mr-1"></i>
        Refund Notify
      </button>
    )}
  </div>
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

      {/* Payment Proof Modal with Confirm/Cancel buttons inside */}
      {showPaymentModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowPaymentModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-textPrimary font-playfair">
                Payment Proof - {selectedBooking.bookingId}
              </h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-8 h-8 rounded-full bg-ocean-ice hover:bg-ocean-light/20 text-neutral hover:text-textPrimary transition-all duration-200 flex items-center justify-center"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-ocean-ice rounded-xl">
                <div>
                  <p className="text-xs font-semibold text-neutral uppercase tracking-wide">Guest Name</p>
                  <p className="text-textPrimary font-medium">
                    {selectedBooking.guestInfo?.firstName} {selectedBooking.guestInfo?.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral uppercase tracking-wide">Room Type</p>
                  <p className="text-textPrimary font-medium">{selectedBooking.roomType}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral uppercase tracking-wide">Total Amount</p>
                  <p className="text-ocean-mid font-bold">₱{Number(selectedBooking.totalPrice).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral uppercase tracking-wide">50% Down Payment</p>
                  <p className="text-ocean-mid font-bold">₱{calculateDownPayment(selectedBooking.totalPrice).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral uppercase tracking-wide">Balance</p>
                  <p className="text-ocean-mid font-bold">
                    {calculateBalance(selectedBooking)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral uppercase tracking-wide">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedBooking.status)}`}>
                    {selectedBooking.status?.charAt(0).toUpperCase() + selectedBooking.status?.slice(1)}
                  </span>
                </div>
                <div>
  <p className="text-xs font-semibold text-neutral uppercase tracking-wide">Check-in Date</p>
  <p className="text-textPrimary font-medium">
    {formatDateTimeFromDate(selectedBooking.checkIn)}
  </p>
</div>
<div>
  <p className="text-xs font-semibold text-neutral uppercase tracking-wide">Check-out Date</p>
  <p className="text-textPrimary font-medium">
    {formatDateTimeFromDate(selectedBooking.checkOut)}
  </p>
</div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-textPrimary mb-3">Payment Proof Image</label>
                {selectedBooking.paymentProof ? (
                  <div className="relative bg-ocean-pale/30 rounded-xl overflow-hidden">
                    <img
                      src={selectedBooking.paymentProof}
                      alt="Payment Proof"
                      className="w-full h-auto max-h-[500px] object-contain"
                      onError={(e) => {
                        console.error('Error loading image:', e);
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="p-8 text-center"><i class="fas fa-image text-4xl text-neutral mb-2 block"></i><p class="text-textSecondary">Error loading payment proof image</p></div>';
                      }}
                    />
                  </div>
                ) : (
                  <div className="p-8 text-center bg-ocean-ice rounded-xl">
                    <i className="fas fa-image text-4xl text-neutral mb-2 block"></i>
                    <p className="text-textSecondary">No payment proof uploaded</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Redesigned Confirm/Cancel buttons inside modal (only for pending bookings) */}
            <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-ocean-light/10">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-5 py-2.5 border border-ocean-light/20 rounded-xl text-textSecondary text-sm font-medium hover:bg-ocean-ice transition-all duration-300"
              >
                Close
              </button>
              {selectedBooking.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      setShowPaymentModal(false);
                      setConfirmModal({ show: true, booking: selectedBooking, type: 'confirm' });
                    }}
                    disabled={actionLoading[selectedBooking.id]}
                    className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 rounded-xl text-white text-sm font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                  >
                    <i className="fas fa-check"></i>
                    Confirm Reservation
                  </button>
                  <button
                    onClick={() => {
                      setShowPaymentModal(false);
                      setCancelModal({ show: true, booking: selectedBooking, reason: '' });
                    }}
                    disabled={actionLoading[selectedBooking.id]}
                    className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 rounded-xl text-white text-sm font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                  >
                    <i className="fas fa-times"></i>
                    Cancel Reservation
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Reservation Modal - Replicated from archive page */}
      {confirmModal.show && confirmModal.booking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-scaleIn">
            <div className="text-center mb-5">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
                <i className="fas fa-check-circle text-green-500 text-2xl"></i>
              </div>
              <h3 className="text-lg font-bold text-textPrimary mb-2">Confirm Reservation</h3>
              <p className="text-textSecondary text-sm">
                Are you sure you want to confirm this reservation for{" "}
                <span className="font-semibold text-textPrimary">
                  {confirmModal.booking.guestInfo?.firstName} {confirmModal.booking.guestInfo?.lastName}
                </span>?<br />
                <span className="text-xs mt-1 block">
                  Booking ID: {confirmModal.booking.bookingId}<br />
                  Room: {confirmModal.booking.roomType}
                </span>
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setConfirmModal({ show: false, booking: null, type: '' })}
                className="px-5 py-2 border border-ocean-light/20 rounded-xl text-textSecondary text-sm font-medium hover:bg-ocean-ice transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReservation}
                className="px-5 py-2 bg-gradient-to-r from-green-500 to-green-600 rounded-xl text-white text-sm font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                Confirm Reservation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Reservation Modal with Reason - Replicated from archive page style */}
      {cancelModal.show && cancelModal.booking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-scaleIn">
            <div className="text-center mb-5">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-red-100 flex items-center justify-center">
                <i className="fas fa-times-circle text-red-500 text-2xl"></i>
              </div>
              <h3 className="text-lg font-bold text-textPrimary mb-2">Cancel Reservation</h3>
              <p className="text-textSecondary text-sm">
                Are you sure you want to cancel this reservation for{" "}
                <span className="font-semibold text-textPrimary">
                  {cancelModal.booking.guestInfo?.firstName} {cancelModal.booking.guestInfo?.lastName}
                </span>?<br />
                <span className="text-xs mt-1 block">
                  Booking ID: {cancelModal.booking.bookingId}<br />
                  Room: {cancelModal.booking.roomType}
                </span>
              </p>
            </div>
            
            {/* Reason input */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-textPrimary mb-2">
                Cancellation Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={cancelModal.reason}
                onChange={(e) => setCancelModal(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Please provide a reason for cancellation..."
                rows="3"
                className="w-full px-3 py-2 border border-ocean-light/20 rounded-xl text-sm focus:outline-none focus:border-red-300 focus:ring-2 focus:ring-red-200 transition-all duration-300 bg-white resize-none"
              ></textarea>
              <p className="text-xs text-textSecondary mt-1">
                This reason will be logged for audit purposes.
              </p>
            </div>
            
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setCancelModal({ show: false, booking: null, reason: '' })}
                className="px-5 py-2 border border-ocean-light/20 rounded-xl text-textSecondary text-sm font-medium hover:bg-ocean-ice transition-all duration-300"
              >
                Go Back
              </button>
              <button
                onClick={handleCancelReservation}
                disabled={!cancelModal.reason.trim()}
                className="px-5 py-2 bg-gradient-to-r from-red-500 to-red-600 rounded-xl text-white text-sm font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                Cancel Reservation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Notification Confirmation Modal */}
{refundModal.show && refundModal.booking && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-scaleIn">
      <div className="text-center mb-5">
        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
          <i className="fas fa-envelope-open-text text-green-500 text-2xl"></i>
        </div>
        <h3 className="text-lg font-bold text-textPrimary mb-2">Send Refund Notification</h3>
        <p className="text-textSecondary text-sm">
          Send an email to <strong>{refundModal.booking.guestInfo?.firstName} {refundModal.booking.guestInfo?.lastName}</strong><br />
          confirming that 50% of their down payment has been refunded.
        </p>
        <p className="text-xs text-neutral mt-2">
          Booking ID: {refundModal.booking.bookingId}
        </p>
      </div>
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => setRefundModal({ show: false, booking: null, sending: false })}
          className="px-5 py-2 border border-ocean-light/20 rounded-xl text-textSecondary text-sm font-medium hover:bg-ocean-ice transition-all duration-300"
          disabled={refundModal.sending}
        >
          Cancel
        </button>
        <button
          onClick={handleSendRefundNotification}
          disabled={refundModal.sending}
          className="px-5 py-2 bg-gradient-to-r from-green-500 to-green-600 rounded-xl text-white text-sm font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
        >
          {refundModal.sending ? (
            <><i className="fas fa-spinner fa-spin mr-1"></i> Sending...</>
          ) : (
            <><i className="fas fa-paper-plane mr-1"></i> Send Email</>
          )}
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