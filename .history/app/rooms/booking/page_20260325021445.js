// app/rooms/booking/page.js
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import GuestLayout from '@/app/guest/layout';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function BookingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = searchParams.get('roomId');
  const roomType = searchParams.get('roomType');
  const price = parseFloat(searchParams.get('price'));
  const maxCapacity = parseInt(searchParams.get('capacity'));
  const checkInDate = searchParams.get('checkIn') ? new Date(searchParams.get('checkIn')) : null;

  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    roomId,
    roomType,
    price,
    maxCapacity,
    checkIn: checkInDate,
    nights: 1,
    guests: 1,
    checkOut: null,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    paymentProof: null,
    bookingId: null
  });
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [totalPrice, setTotalPrice] = useState(price);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (bookingData.checkIn && bookingData.nights) {
      const checkOutDate = new Date(bookingData.checkIn);
      checkOutDate.setDate(checkOutDate.getDate() + bookingData.nights);
      checkOutDate.setHours(10, 0, 0, 0);
      
      setBookingData(prev => ({ ...prev, checkOut: checkOutDate }));
      setTotalPrice(price * bookingData.nights);
    }
  }, [bookingData.checkIn, bookingData.nights, price]);

  const validatePhone = (phone) => {
    const phoneRegex = /^\d{11}$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateGuests = () => {
    if (bookingData.guests > maxCapacity) {
      setErrors(prev => ({ ...prev, guests: `Number of guests cannot exceed ${maxCapacity}` }));
      return false;
    }
    setErrors(prev => ({ ...prev, guests: '' }));
    return true;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!bookingData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!bookingData.lastName.trim()) newErrors.lastName = 'Last name is required';
    
    if (!bookingData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(bookingData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!bookingData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(bookingData.phone)) {
      newErrors.phone = 'Phone number must be exactly 11 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
    if (field === 'guests') {
      if (value > maxCapacity) {
        setErrors(prev => ({ ...prev, guests: `Number of guests cannot exceed ${maxCapacity}` }));
      } else {
        setErrors(prev => ({ ...prev, guests: '' }));
      }
    }
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (validateGuests()) {
        setStep(step + 1);
      }
    } else if (step === 2) {
      if (validateStep2()) {
        setStep(step + 1);
      }
    } else {
      setStep(step + 1);
    }
  };

  const handlePreviousStep = () => {
    if (step === 1) {
      router.push(`/rooms/calendar?roomId=${roomId}&roomType=${encodeURIComponent(roomType)}&price=${price}&capacity=${maxCapacity}`);
    } else {
      setStep(step - 1);
    }
  };

  const handlePaymentProofUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBookingData(prev => ({ ...prev, paymentProof: reader.result }));
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploading(false);
    }
  };

  const handleSubmitBooking = async () => {
    setSubmitting(true);
    try {
      const bookingId = `BOOK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      const booking = {
        bookingId,
        roomId: bookingData.roomId,
        roomType: bookingData.roomType,
        price: bookingData.price,
        nights: bookingData.nights,
        guests: bookingData.guests,
        totalPrice,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guestInfo: {
          firstName: bookingData.firstName,
          lastName: bookingData.lastName,
          email: bookingData.email,
          phone: bookingData.phone
        },
        status: 'pending',
        paymentProof: bookingData.paymentProof,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        type: 'room'
      };
      
      const docRef = await addDoc(collection(db, 'bookings'), booking);
      setBookingData(prev => ({ ...prev, bookingId: docRef.id }));
      setStep(4);
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDateTime = (date) => {
    if (!date) return '';
    return date.toLocaleString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!checkInDate) {
    return (
      <GuestLayout>
        <div className="min-h-screen bg-gradient-to-br from-ocean-ice to-blue-white flex items-center justify-center">
          <div className="text-center">
            <i className="fas fa-calendar-times text-5xl text-ocean-light mb-4"></i>
            <p className="text-textPrimary">No check-in date selected. Please select a date first.</p>
            <button
              onClick={() => router.push('/rooms')}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-ocean-mid to-ocean-light text-white rounded-lg"
            >
              Back to Rooms
            </button>
          </div>
        </div>
      </GuestLayout>
    );
  }

  return (
    <GuestLayout>
      <div className="min-h-screen bg-gradient-to-br from-ocean-ice to-blue-white py-12 flex items-center justify-center">
        <div className="max-w-3xl w-full px-4">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex-1 relative">
                  <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center font-semibold ${
                    step >= s ? 'bg-ocean-mid text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {s}
                  </div>
                  <div className="text-center text-xs mt-2 text-textSecondary">
                    {s === 1 && 'Dates'}
                    {s === 2 && 'Guest Details'}
                    {s === 3 && 'Payment'}
                    {s === 4 && 'Confirmation'}
                  </div>
                  {s < 4 && (
                    <div className={`absolute top-5 left-1/2 w-full h-0.5 ${
                      step > s ? 'bg-ocean-mid' : 'bg-gray-200'
                    }`} style={{ transform: 'translateY(-50%)' }}></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Dates */}
          {step === 1 && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-textPrimary mb-6">Step 1: Select Dates & Guests</h2>
              
              <div className="space-y-5">
                <div className="p-5 bg-ocean-ice rounded-xl">
                  <label className="block text-sm font-semibold text-textPrimary mb-2">Check-in Date & Time</label>
                  <p className="text-lg font-medium text-ocean-mid">{formatDateTime(bookingData.checkIn)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-textPrimary mb-2">Number of Nights</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={bookingData.nights}
                    onChange={(e) => handleInputChange('nights', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-ocean-light/20 rounded-lg focus:outline-none focus:border-ocean-light"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-textPrimary mb-2">Number of Guests *</label>
                  <input
                    type="number"
                    min="1"
                    max={maxCapacity}
                    value={bookingData.guests}
                    onChange={(e) => handleInputChange('guests', parseInt(e.target.value))}
                    className={`w-full px-4 py-2 border ${errors.guests ? 'border-red-500' : 'border-ocean-light/20'} rounded-lg focus:outline-none focus:border-ocean-light`}
                  />
                  {errors.guests && <p className="text-red-500 text-sm mt-1">{errors.guests}</p>}
                  <p className="text-xs text-textSecondary mt-1">Maximum capacity: {maxCapacity} guests</p>
                </div>
                
                {bookingData.checkOut && (
                  <div className="p-5 bg-ocean-ice rounded-xl">
                    <label className="block text-sm font-semibold text-textPrimary mb-2">Check-out Date & Time</label>
                    <p className="text-lg font-medium text-ocean-mid">{formatDateTime(bookingData.checkOut)}</p>
                    <p className="text-xs text-textSecondary mt-1">Check-out time: 10:00 AM (2 hours earlier than check-in)</p>
                  </div>
                )}
                
                <div className="p-5 bg-gradient-to-r from-ocean-ice to-blue-white rounded-xl">
                  <label className="block text-sm font-semibold text-textPrimary mb-2">Total Price</label>
                  <p className="text-3xl font-bold text-ocean-mid">₱{totalPrice.toLocaleString()}</p>
                  <p className="text-xs text-textSecondary">₱{price.toLocaleString()} x {bookingData.nights} night(s) x {bookingData.guests} guest(s)</p>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handlePreviousStep}
                  className="flex-1 py-3 border border-ocean-light/20 rounded-xl text-textSecondary font-medium hover:bg-ocean-ice transition-all duration-300"
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  Back
                </button>
                <button
                  onClick={handleNextStep}
                  className="flex-1 py-3 bg-gradient-to-r from-ocean-mid to-ocean-light text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
                >
                  Continue to Guest Details
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Guest Details */}
          {step === 2 && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-textPrimary mb-6">Step 2: Guest Details</h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-textPrimary mb-2">First Name *</label>
                  <input
                    type="text"
                    value={bookingData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`w-full px-4 py-2 border ${errors.firstName ? 'border-red-500' : 'border-ocean-light/20'} rounded-lg focus:outline-none focus:border-ocean-light`}
                  />
                  {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-textPrimary mb-2">Last Name *</label>
                  <input
                    type="text"
                    value={bookingData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`w-full px-4 py-2 border ${errors.lastName ? 'border-red-500' : 'border-ocean-light/20'} rounded-lg focus:outline-none focus:border-ocean-light`}
                  />
                  {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-textPrimary mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={bookingData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-4 py-2 border ${errors.email ? 'border-red-500' : 'border-ocean-light/20'} rounded-lg focus:outline-none focus:border-ocean-light`}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-textPrimary mb-2">Phone Number * (11 digits)</label>
                  <input
                    type="tel"
                    value={bookingData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="09123456789"
                    className={`w-full px-4 py-2 border ${errors.phone ? 'border-red-500' : 'border-ocean-light/20'} rounded-lg focus:outline-none focus:border-ocean-light`}
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handlePreviousStep}
                  className="flex-1 py-3 border border-ocean-light/20 rounded-xl text-textSecondary font-medium hover:bg-ocean-ice transition-all duration-300"
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  Back
                </button>
                <button
                  onClick={handleNextStep}
                  className="flex-1 py-3 bg-gradient-to-r from-ocean-mid to-ocean-light text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
                >
                  Continue to Payment
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-textPrimary mb-6">Step 3: Payment</h2>
              
              <div className="space-y-6">
                <div className="p-5 bg-ocean-ice rounded-xl text-center">
                  <h3 className="text-lg font-semibold text-textPrimary mb-3">GCash Payment</h3>
                  <div className="flex justify-center mb-3">
                    <div className="w-48 h-48 bg-white rounded-xl flex items-center justify-center border border-ocean-light/20">
                      <i className="fas fa-qrcode text-6xl text-ocean-light"></i>
                    </div>
                  </div>
                  <p className="text-sm text-textSecondary">Scan QR code to pay with GCash</p>
                </div>
                
                <div className="p-5 bg-ocean-ice rounded-xl">
                  <h3 className="text-lg font-semibold text-textPrimary mb-3">Bank Transfer</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Bank:</strong> Sample Bank</p>
                    <p><strong>Account Name:</strong> SEA RIVER VIEW RESORT</p>
                    <p><strong>Account Number:</strong> 1234-5678-9012</p>
                  </div>
                </div>
                
                <div className="p-5 bg-gradient-to-r from-ocean-ice to-blue-white rounded-xl">
                  <p className="text-sm font-semibold text-textPrimary mb-1">Amount to Pay</p>
                  <p className="text-2xl font-bold text-ocean-mid">₱{totalPrice.toLocaleString()}</p>
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
                  {bookingData.paymentProof && (
                    <div className="mt-2">
                      <p className="text-sm text-green-600">✓ Payment proof uploaded</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handlePreviousStep}
                  className="flex-1 py-3 border border-ocean-light/20 rounded-xl text-textSecondary font-medium hover:bg-ocean-ice transition-all duration-300"
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  Back
                </button>
                <button
                  onClick={handleSubmitBooking}
                  disabled={!bookingData.paymentProof || submitting}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all duration-300 ${
                    bookingData.paymentProof && !submitting
                      ? 'bg-gradient-to-r from-ocean-mid to-ocean-light text-white hover:shadow-lg'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {submitting ? 'Submitting...' : 'Confirm Booking'}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-check text-3xl text-green-600"></i>
              </div>
              <h2 className="text-2xl font-bold text-textPrimary mb-2">Booking Confirmed!</h2>
              <p className="text-textSecondary mb-4">
                Thank you for your booking. We'll send a confirmation email to {bookingData.email}
              </p>
              <div className="p-4 bg-ocean-ice rounded-lg mb-6">
                <p className="text-sm text-textPrimary">Booking Reference: <strong>{bookingData.bookingId}</strong></p>
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full py-3 bg-gradient-to-r from-ocean-mid to-ocean-light text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
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