// app/reservation-tracker/page.js
// app/reservation-tracker/page.js
'use client';

import { useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import GuestLayout from '../guest/layout';

export default function ReservationTrackerPage() {
  const [email, setEmail] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [reservation, setReservation] = useState(null);
  const [error, setError] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!email.trim() || !referenceNumber.trim()) {
      setError('Please enter both email and reservation reference number.');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    
    setLoading(true);
    setError('');
    setReservation(null);
    
    try {
      // Query Firestore for the booking
      const bookingsRef = collection(db, 'bookings');
      const q = query(
        bookingsRef, 
        where('guestInfo.email', '==', email.toLowerCase().trim()),
        where('bookingId', '==', referenceNumber.trim().toUpperCase())
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setError('No reservation found. Please check your details and try again.');
        setLoading(false);
        return;
      }
      
      // Get the first matching reservation
      const bookingDoc = querySnapshot.docs[0];
      const bookingData = bookingDoc.data();
      
      setReservation({
        id: bookingDoc.id,
        ...bookingData
      });
      
    } catch (err) {
      console.error('Error fetching reservation:', err);
      setError('An error occurred while fetching your reservation. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async () => {
    if (!reservation) return;
    
    // Only allow cancellation for pending or confirmed reservations
    if (reservation.status !== 'pending' && reservation.status !== 'confirmed') {
      setError('This reservation cannot be cancelled as it is no longer active.');
      setShowCancelModal(false);
      return;
    }
    
    setCancelling(true);
    
    try {
      const bookingRef = doc(db, 'bookings', reservation.id);
      await updateDoc(bookingRef, {
        status: 'cancelled-by-guest',
        cancelledAt: new Date().toISOString(),
        cancelledBy: 'guest',
        cancellationReason: 'Cancelled by guest through reservation tracker',
        updatedAt: new Date().toISOString()
      });
      
      // Update local state
      setReservation({
        ...reservation,
        status: 'cancelled-by-guest',
        cancelledAt: new Date().toISOString(),
        cancelledBy: 'guest'
      });
      
      setShowCancelModal(false);
      
      // Show success message
      alert('Your reservation has been successfully cancelled. Please note that 50% of the down payment will be retained by the resort.');
      
    } catch (err) {
      console.error('Error cancelling reservation:', err);
      setError('Failed to cancel reservation. Please try again later.');
    } finally {
      setCancelling(false);
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
        month: 'long',
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

  const formatDateOnly = (timestamp) => {
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
      
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
      'confirmed': { label: 'Confirmed', color: 'bg-green-100 text-green-700' },
      'check-in': { label: 'Checked In', color: 'bg-blue-100 text-blue-700' },
      'check-out': { label: 'Checked Out', color: 'bg-purple-100 text-purple-700' },
      'cancelled': { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
      'cancelled-by-guest': { label: 'Cancelled by Guest', color: 'bg-red-100 text-red-700' }
    };
    
    const statusInfo = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  const calculateDownPayment = (totalPrice) => {
    if (!totalPrice) return 0;
    const total = typeof totalPrice === 'number' ? totalPrice : Number(totalPrice) || 0;
    return total * 0.5;
  };

  const calculateBalance = (totalPrice, status) => {
    if (status !== 'confirmed' && status !== 'check-in' && status !== 'check-out') return 'Not applicable';
    const total = typeof totalPrice === 'number' ? totalPrice : Number(totalPrice) || 0;
    const downPayment = total * 0.5;
    const balance = total - downPayment;
    return `₱${balance.toLocaleString()}`;
  };

  const canCancel = (status) => {
    return status === 'pending' || status === 'confirmed';
  };

  return (
    <GuestLayout>
      <div className="min-h-screen bg-gradient-to-br from-ocean-ice to-blue-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-textPrimary font-playfair mb-2">
              Track Your Reservation
            </h1>
            <p className="text-textSecondary">
              Enter your email address and reservation reference number to view your booking details
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-2xl shadow-md border border-ocean-light/10 p-6 mb-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-textPrimary mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-2.5 border border-ocean-light/20 rounded-xl text-sm focus:outline-none focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 transition-all duration-300"
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-textPrimary mb-2">
                  Reservation Reference Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value.toUpperCase())}
                  placeholder="e.g., RES-001"
                  className="w-full px-4 py-2.5 border border-ocean-light/20 rounded-xl text-sm focus:outline-none focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 transition-all duration-300 font-mono"
                  disabled={loading}
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-ocean-mid to-ocean-light text-white font-semibold py-2.5 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="fas fa-spinner fa-spin"></i>
                    Searching...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <i className="fas fa-search"></i>
                    Track Reservation
                  </span>
                )}
              </button>
            </form>
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Reservation Details */}
          {reservation && (
            <div className="space-y-6 animate-fadeIn">
              {/* Status Card */}
              <div className="bg-white rounded-2xl shadow-md border border-ocean-light/10 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-textPrimary font-playfair mb-1">
                      Reservation Details
                    </h2>
                    <p className="text-sm text-neutral">Booking ID: {reservation.bookingId}</p>
                  </div>
                  {getStatusBadge(reservation.status)}
                </div>
                
                {reservation.status === 'cancelled-by-guest' && (
                  <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-red-700 text-sm">
                      <i className="fas fa-info-circle mr-2"></i>
                      This reservation was cancelled by the guest. 50% of the down payment has been retained by the resort.
                    </p>
                  </div>
                )}
                
                {reservation.status === 'cancelled' && reservation.cancellationReason && (
                  <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-red-700 text-sm">
                      <i className="fas fa-info-circle mr-2"></i>
                      Cancellation Reason: {reservation.cancellationReason}
                    </p>
                  </div>
                )}
              </div>

              {/* Guest Information */}
              <div className="bg-white rounded-2xl shadow-md border border-ocean-light/10 p-6">
                <h3 className="text-lg font-bold text-textPrimary mb-4 flex items-center gap-2">
                  <i className="fas fa-user text-ocean-light"></i>
                  Guest Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-neutral uppercase tracking-wide">Full Name</p>
                    <p className="text-textPrimary font-medium">
                      {reservation.guestInfo?.firstName} {reservation.guestInfo?.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral uppercase tracking-wide">Email Address</p>
                    <p className="text-textPrimary font-medium">{reservation.guestInfo?.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral uppercase tracking-wide">Phone Number</p>
                    <p className="text-textPrimary font-medium">{reservation.guestInfo?.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral uppercase tracking-wide">Reservation Reference</p>
                    <p className="text-textPrimary font-medium font-mono">{reservation.bookingId}</p>
                  </div>
                </div>
              </div>

              {/* Booking Schedule */}
              <div className="bg-white rounded-2xl shadow-md border border-ocean-light/10 p-6">
                <h3 className="text-lg font-bold text-textPrimary mb-4 flex items-center gap-2">
                  <i className="fas fa-calendar-alt text-ocean-light"></i>
                  Booking Schedule
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-neutral uppercase tracking-wide">Check-in Date & Time</p>
                    <p className="text-textPrimary font-medium">{formatDateTime(reservation.checkIn)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral uppercase tracking-wide">Check-out Date & Time</p>
                    <p className="text-textPrimary font-medium">{formatDateTime(reservation.checkOut)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral uppercase tracking-wide">Number of Nights</p>
                    <p className="text-textPrimary font-medium">{reservation.numberOfNights || 'N/A'} nights</p>
                  </div>
                </div>
              </div>

              {/* Room Details */}
              <div className="bg-white rounded-2xl shadow-md border border-ocean-light/10 p-6">
                <h3 className="text-lg font-bold text-textPrimary mb-4 flex items-center gap-2">
                  <i className="fas fa-bed text-ocean-light"></i>
                  Room Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-neutral uppercase tracking-wide">Room Type</p>
                    <p className="text-textPrimary font-medium">{reservation.roomType}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral uppercase tracking-wide">Number of Rooms</p>
                    <p className="text-textPrimary font-medium">{reservation.numberOfRooms || 1}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral uppercase tracking-wide">Number of Guests</p>
                    <p className="text-textPrimary font-medium">{reservation.guests}</p>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-white rounded-2xl shadow-md border border-ocean-light/10 p-6">
                <h3 className="text-lg font-bold text-textPrimary mb-4 flex items-center gap-2">
                  <i className="fas fa-credit-card text-ocean-light"></i>
                  Payment Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-ocean-light/10">
                    <span className="text-textSecondary">Total Price</span>
                    <span className="font-bold text-ocean-mid text-lg">
                      ₱{Number(reservation.totalPrice).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-ocean-light/10">
                    <span className="text-textSecondary">Down Payment (50%)</span>
                    <span className="font-semibold text-green-600">
                      ₱{calculateDownPayment(reservation.totalPrice).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-textSecondary">Remaining Balance</span>
                    <span className="font-bold text-ocean-mid text-lg">
                      {calculateBalance(reservation.totalPrice, reservation.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cancel Button */}
              {canCancel(reservation.status) && (
                <div className="flex justify-center">
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
                  >
                    <i className="fas fa-times-circle"></i>
                    Cancel Reservation
                  </button>
                </div>
              )}

              {/* Booking Date */}
              <div className="text-center text-sm text-neutral">
                <p>Booked on: {formatDateTime(reservation.createdAt)}</p>
              </div>
            </div>
          )}

          {/* Cancel Reservation Modal */}
          {showCancelModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-scaleIn">
                <div className="text-center mb-5">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-red-100 flex items-center justify-center">
                    <i className="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-bold text-textPrimary mb-2">Cancel Reservation</h3>
                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 mb-3 rounded">
                    <p className="text-sm text-yellow-800">
                      <i className="fas fa-info-circle mr-2"></i>
                      <span className="font-semibold">Important Note:</span> 50% of the down payment will be retained by the resort upon cancellation.
                    </p>
                  </div>
                  <p className="text-textSecondary text-sm">
                    Are you sure you want to cancel your reservation for{" "}
                    <span className="font-semibold text-textPrimary">
                      {reservation?.guestInfo?.firstName} {reservation?.guestInfo?.lastName}
                    </span>?<br />
                    <span className="text-xs mt-1 block">
                      Booking ID: {reservation?.bookingId}<br />
                      Room: {reservation?.roomType}<br />
                      Dates: {formatDateOnly(reservation?.checkIn)} - {formatDateOnly(reservation?.checkOut)}
                    </span>
                  </p>
                </div>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="px-5 py-2 border border-ocean-light/20 rounded-xl text-textSecondary text-sm font-medium hover:bg-ocean-ice transition-all duration-300"
                  >
                    Go Back
                  </button>
                  <button
                    onClick={handleCancelReservation}
                    disabled={cancelling}
                    className="px-5 py-2 bg-gradient-to-r from-red-500 to-red-600 rounded-xl text-white text-sm font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cancelling ? (
                      <span className="flex items-center gap-2">
                        <i className="fas fa-spinner fa-spin"></i>
                        Processing...
                      </span>
                    ) : (
                      'Yes, Cancel Reservation'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fadeIn {
            animation: fadeIn 0.4s ease-out;
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
    </GuestLayout>
  );
}