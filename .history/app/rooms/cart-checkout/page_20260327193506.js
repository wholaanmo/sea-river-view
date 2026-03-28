// app/rooms/cart-checkout/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GuestLayout from '@/app/guest/layout';
import { useCart } from '@/contexts/CartContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, getDoc, doc, query, where, getDocs } from 'firebase/firestore';
import Image from 'next/image';

export default function CartCheckoutPage() {
  const router = useRouter();
  const { cartItems, getCartTotal, clearCart } = useCart();
  
  const [step, setStep] = useState(1);
  const [guestInfo, setGuestInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [paymentProof, setPaymentProof] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [availabilityErrors, setAvailabilityErrors] = useState({});

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0 && !submitting) {
      router.push('/rooms');
    }
  }, [cartItems, router, submitting]);

  const validatePhone = (phone) => {
    const phoneRegex = /^\d{11}$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateGuestInfo = () => {
    const newErrors = {};
    
    if (!guestInfo.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!guestInfo.lastName.trim()) newErrors.lastName = 'Last name is required';
    
    if (!guestInfo.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(guestInfo.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!guestInfo.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(guestInfo.phone)) {
      newErrors.phone = 'Phone number must be exactly 11 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkRoomAvailability = async (item) => {
    const bookingsRef = collection(db, 'bookings');
    const checkInDate = new Date(item.checkIn);
    const checkOutDate = new Date(item.checkOut);
    
    // Get room details
    const roomDoc = await getDoc(doc(db, 'rooms', item.roomId));
    if (!roomDoc.exists()) {
      return { available: false, message: 'Room not found' };
    }
    
    const roomData = roomDoc.data();
    const totalRoomsAvailable = roomData.totalRooms || 1;
    
    // Check existing bookings
    const q = query(
      bookingsRef,
      where('roomId', '==', item.roomId),
      where('status', 'in', ['confirmed', 'check-in', 'pending']),
      where('checkIn', '<', checkOutDate),
      where('checkOut', '>', checkInDate)
    );
    
    const existingBookings = await getDocs(q);
    let totalBookedCount = 0;
    existingBookings.forEach((bookingDoc) => {
      const booking = bookingDoc.data();
      totalBookedCount += booking.numberOfRooms || 1;
    });
    
    const isAvailable = totalBookedCount < totalRoomsAvailable;
    const remainingRooms = totalRoomsAvailable - totalBookedCount;
    
    return {
      available: isAvailable,
      message: isAvailable 
        ? `${remainingRooms} room(s) available`
        : `Fully booked! Only ${totalRoomsAvailable} room(s) total.`
    };
  };

  const handleSubmitBooking = async () => {
    setSubmitting(true);
    
    try {
      // Check availability for all cart items
      const availabilityChecks = await Promise.all(
        cartItems.map(async (item) => {
          const availability = await checkRoomAvailability(item);
          return { item, availability };
        })
      );
      
      const unavailableItems = availabilityChecks.filter(check => !check.availability.available);
      
      if (unavailableItems.length > 0) {
        const errorMessages = {};
        unavailableItems.forEach(({ item, availability }) => {
          errorMessages[item.id] = availability.message;
        });
        setAvailabilityErrors(errorMessages);
        setSubmitting(false);
        return;
      }
      
      // Create booking for each cart item
      const bookingPromises = cartItems.map(async (item) => {
        const bookingId = `BOOK-${Date.now()}-${Math.floor(Math.random() * 1000)}-${item.id.slice(-4)}`;
        
        const booking = {
          bookingId,
          roomId: item.roomId,
          roomType: item.roomType,
          price: item.price,
          nights: item.nights,
          guests: item.guests,
          totalPrice: item.totalPrice,
          checkIn: new Date(item.checkIn),
          checkOut: new Date(item.checkOut),
          guestInfo: {
            firstName: guestInfo.firstName,
            lastName: guestInfo.lastName,
            email: guestInfo.email,
            phone: guestInfo.phone
          },
          status: 'pending',
          paymentProof: paymentProof,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          type: 'room',
          numberOfRooms: 1
        };
        
        return await addDoc(collection(db, 'bookings'), booking);
      });
      
      await Promise.all(bookingPromises);
      
      setBookingId(`CART-${Date.now()}`);
      setStep(3);
      clearCart();
    } catch (error) {
      console.error('Error creating bookings:', error);
      alert('Failed to create bookings. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentProofUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentProof(reader.result);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploading(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (cartItems.length === 0 && step !== 3) {
    return (
      <GuestLayout>
        <div className="min-h-screen bg-gradient-to-br from-ocean-ice to-blue-white flex items-center justify-center">
          <div className="text-center">
            <i className="fas fa-shopping-cart text-5xl text-ocean-light mb-4"></i>
            <p className="text-textPrimary">Your cart is empty.</p>
            <button
              onClick={() => router.push('/rooms')}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-ocean-mid to-ocean-light text-white rounded-lg"
            >
              Browse Rooms
            </button>
          </div>
        </div>
      </GuestLayout>
    );
  }

  return (
    <GuestLayout>
      <div className="min-h-screen bg-gradient-to-br from-ocean-ice to-blue-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex-1 relative">
                  <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center font-semibold ${
                    step >= s ? 'bg-ocean-mid text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {s}
                  </div>
                  <div className="text-center text-xs mt-2 text-textSecondary">
                    {s === 1 && 'Review Cart'}
                    {s === 2 && 'Guest Details'}
                    {s === 3 && 'Confirmation'}
                  </div>
                  {s < 3 && (
                    <div className={`absolute top-5 left-1/2 w-full h-0.5 ${
                      step > s ? 'bg-ocean-mid' : 'bg-gray-200'
                    }`} style={{ transform: 'translateY(-50%)' }}></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Review Cart */}
          {step === 1 && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-textPrimary mb-6">Review Your Cart</h2>
              
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="border border-ocean-light/20 rounded-xl p-4">
                    <div className="flex gap-4">
                      {/* Image */}
                      <div className="w-24 h-24 rounded-lg bg-ocean-ice overflow-hidden flex-shrink-0">
                        {item.images && item.images[0] ? (
                          <div className="relative w-full h-full">
                            <Image
                              src={item.images[0]}
                              alt={item.roomType}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <i className="fas fa-hotel text-2xl text-ocean-light/30"></i>
                          </div>
                        )}
                      </div>
                      
                      {/* Details */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-textPrimary">{item.roomType}</h3>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                          <p className="text-textSecondary">
                            <i className="fas fa-users mr-1"></i> {item.guests} Guest(s)
                          </p>
                          <p className="text-textSecondary">
                            <i className="fas fa-calendar mr-1"></i> {item.nights} Night(s)
                          </p>
                          <p className="text-textSecondary col-span-2">
                            <i className="fas fa-calendar-check mr-1"></i> Check-in: {formatDateTime(item.checkIn)}
                          </p>
                          <p className="text-textSecondary col-span-2">
                            <i className="fas fa-calendar-times mr-1"></i> Check-out: {formatDateTime(item.checkOut)}
                          </p>
                        </div>
                        {availabilityErrors[item.id] && (
                          <p className="text-red-500 text-xs mt-2">
                            <i className="fas fa-exclamation-circle mr-1"></i>
                            {availabilityErrors[item.id]}
                          </p>
                        )}
                      </div>
                      
                      {/* Price */}
                      <div className="text-right">
                        <p className="font-bold text-ocean-mid">₱{item.totalPrice.toLocaleString()}</p>
                        <p className="text-xs text-textSecondary">₱{item.price.toLocaleString()}/night</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Total */}
              <div className="p-5 bg-gradient-to-r from-ocean-ice to-blue-white rounded-xl mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-textPrimary">Total</span>
                  <span className="text-2xl font-bold text-ocean-mid">₱{getCartTotal().toLocaleString()}</span>
                </div>
              </div>
              
              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => router.push('/rooms')}
                  className="flex-1 py-3 border border-ocean-light/20 rounded-xl text-textSecondary font-medium hover:bg-ocean-ice transition-all"
                >
                  Add More Rooms
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 bg-gradient-to-r from-ocean-mid to-ocean-light text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  Proceed to Guest Details
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Guest Details */}
          {step === 2 && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-textPrimary mb-6">Guest Details</h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-textPrimary mb-2">First Name *</label>
                  <input
                    type="text"
                    value={guestInfo.firstName}
                    onChange={(e) => setGuestInfo({ ...guestInfo, firstName: e.target.value })}
                    className={`w-full px-4 py-2 border ${errors.firstName ? 'border-red-500' : 'border-ocean-light/20'} rounded-lg focus:outline-none focus:border-ocean-light`}
                  />
                  {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-textPrimary mb-2">Last Name *</label>
                  <input
                    type="text"
                    value={guestInfo.lastName}
                    onChange={(e) => setGuestInfo({ ...guestInfo, lastName: e.target.value })}
                    className={`w-full px-4 py-2 border ${errors.lastName ? 'border-red-500' : 'border-ocean-light/20'} rounded-lg focus:outline-none focus:border-ocean-light`}
                  />
                  {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-textPrimary mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={guestInfo.email}
                    onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                    className={`w-full px-4 py-2 border ${errors.email ? 'border-red-500' : 'border-ocean-light/20'} rounded-lg focus:outline-none focus:border-ocean-light`}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-textPrimary mb-2">Phone Number * (11 digits)</label>
                  <input
                    type="tel"
                    value={guestInfo.phone}
                    onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                    placeholder="09123456789"
                    className={`w-full px-4 py-2 border ${errors.phone ? 'border-red-500' : 'border-ocean-light/20'} rounded-lg focus:outline-none focus:border-ocean-light`}
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
              </div>
              
              {/* Payment Section */}
              <div className="mt-6 pt-6 border-t border-ocean-light/10">
                <h3 className="text-lg font-semibold text-textPrimary mb-4">Payment</h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-ocean-ice rounded-xl">
                    <h4 className="font-semibold text-textPrimary mb-2">GCash Payment</h4>
                    <div className="flex justify-center mb-2">
                      <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center">
                        <i className="fas fa-qrcode text-4xl text-ocean-light"></i>
                      </div>
                    </div>
                    <p className="text-xs text-center text-textSecondary">Scan QR code to pay with GCash</p>
                  </div>
                  
                  <div className="p-4 bg-ocean-ice rounded-xl">
                    <h4 className="font-semibold text-textPrimary mb-2">Bank Transfer</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Bank:</strong> Sample Bank</p>
                      <p><strong>Account Name:</strong> SEA RIVER VIEW RESORT</p>
                      <p><strong>Account Number:</strong> 1234-5678-9012</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-ocean-ice to-blue-white rounded-xl">
                    <p className="text-sm font-semibold text-textPrimary mb-1">Amount to Pay</p>
                    <p className="text-2xl font-bold text-ocean-mid">₱{getCartTotal().toLocaleString()}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-textPrimary mb-2">Upload Proof of Payment *</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePaymentProofUpload}
                      className="w-full"
                      disabled={uploading}
                    />
                    {uploading && <p className="text-sm text-ocean-mid mt-1">Uploading...</p>}
                    {paymentProof && (
                      <p className="text-sm text-green-600 mt-1">✓ Payment proof uploaded</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border border-ocean-light/20 rounded-xl text-textSecondary font-medium hover:bg-ocean-ice transition-all"
                >
                  Back to Cart
                </button>
                <button
                  onClick={() => {
                    if (validateGuestInfo()) {
                      if (!paymentProof) {
                        alert('Please upload proof of payment');
                        return;
                      }
                      handleSubmitBooking();
                    }
                  }}
                  disabled={submitting}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                    !submitting
                      ? 'bg-gradient-to-r from-ocean-mid to-ocean-light text-white hover:shadow-lg'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {submitting ? 'Processing...' : 'Confirm All Bookings'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-check text-3xl text-green-600"></i>
              </div>
              <h2 className="text-2xl font-bold text-textPrimary mb-2">Bookings Confirmed!</h2>
              <p className="text-textSecondary mb-4">
                Thank you for your bookings. We'll send a confirmation email to {guestInfo.email}
              </p>
              <div className="p-4 bg-ocean-ice rounded-lg mb-6">
                <p className="text-sm text-textPrimary">Booking Reference: <strong>{bookingId}</strong></p>
                <p className="text-xs text-textSecondary mt-1">You have booked {cartItems.length} room type(s)</p>
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full py-3 bg-gradient-to-r from-ocean-mid to-ocean-light text-white rounded-xl font-medium hover:shadow-lg transition-all"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </GuestLayout>
  );
}