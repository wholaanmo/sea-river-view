// app/rooms/booking/page.js
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import GuestLayout from '@/app/guest/layout';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Image from 'next/image';

export default function BookingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = searchParams.get('roomId');
  const roomType = searchParams.get('roomType');
  const price = parseFloat(searchParams.get('price'));
  const capacity = parseInt(searchParams.get('capacity'));
  const checkInDate = searchParams.get('checkIn') ? new Date(searchParams.get('checkIn')) : null;

  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    roomId,
    roomType,
    price,
    capacity,
    checkIn: checkInDate,
    nights: 1,
    checkOut: null,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    paymentProof: null,
    bookingId: null
  });
  const [uploading, setUploading] = useState(false);
  const [totalPrice, setTotalPrice] = useState(price);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (bookingData.checkIn && bookingData.nights) {
      // Calculate check-out date (checkout is 2 hours earlier than exact duration)
      const checkOutDate = new Date(bookingData.checkIn);
      checkOutDate.setDate(checkOutDate.getDate() + bookingData.nights);
      // Set checkout time to 10:00 AM (2 hours earlier than 12:00 PM check-in)
      checkOutDate.setHours(10, 0, 0, 0);
      
      setBookingData(prev => ({ ...prev, checkOut: checkOutDate }));
      setTotalPrice(price * bookingData.nights);
    }
  }, [bookingData.checkIn, bookingData.nights, price]);

  const handleInputChange = (field, value) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    setStep(step + 1);
  };

  const handlePreviousStep = () => {
    setStep(step - 1);
  };

  const handlePaymentProofUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    try {
      // Convert to base64 for demo (in production, upload to Cloudinary)
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
        updatedAt: serverTimestamp()
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

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { 
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
      <div className="min-h-screen bg-gradient-to-br from-ocean-ice to-blue-white py-12">
        <div className="mx-auto max-w-3xl px-4" style={{ marginLeft: '5%', marginRight: '5%' }}>
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
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-textPrimary mb-4">Step 1: Select Dates</h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-ocean-ice rounded-lg">
                  <label className="block text-sm font-semibold text-textPrimary mb-2">Check-in Date</label>
                  <p className="text-lg font-medium text-ocean-mid">{formatDate(bookingData.checkIn)}</p>
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
                
                {bookingData.checkOut && (
                  <div className="p-4 bg-ocean-ice rounded-lg">
                    <label className="block text-sm font-semibold text-textPrimary mb-2">Check-out Date & Time</label>
                    <p className="text-lg font-medium text-ocean-mid">{formatDate(bookingData.checkOut)}</p>
                    <p className="text-xs text-textSecondary mt-1">Check-out time: 10:00 AM</p>
                  </div>
                )}
                
                <div className="p-4 bg-gradient-to-r from-ocean-ice to-blue-white rounded-lg">
                  <label className="block text-sm font-semibold text-textPrimary mb-2">Total Price</label>
                  <p className="text-3xl font-bold text-ocean-mid">₱{totalPrice.toLocaleString()}</p>
                  <p className="text-xs text-textSecondary">₱{price.toLocaleString()} x {bookingData.nights} night(s)</p>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={handleNextStep}
                  className="w-full py-3 bg-gradient-to-r from-ocean-mid to-ocean-light text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
                >
                  Continue to Guest Details
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Guest Details */}
          {step === 2 && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-textPrimary mb-4">Step 2: Guest Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-textPrimary mb-2">First Name *</label>
                  <input
                    type="text"
                    value={bookingData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-4 py-2 border border-ocean-light/20 rounded-lg focus:outline-none focus:border-ocean-light"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-textPrimary mb-2">Last Name *</label>
                  <input
                    type="text"
                    value={bookingData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-4 py-2 border border-ocean-light/20 rounded-lg focus:outline-none focus:border-ocean-light"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-textPrimary mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={bookingData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-2 border border-ocean-light/20 rounded-lg focus:outline-none focus:border-ocean-light"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-textPrimary mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    value={bookingData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-2 border border-ocean-light/20 rounded-lg focus:outline-none focus:border-ocean-light"
                    required
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handlePreviousStep}
                  className="flex-1 py-3 border border-ocean-light/20 rounded-xl text-textSecondary font-medium hover:bg-ocean-ice transition-all duration-300"
                >
                  Back
                </button>
                <button
                  onClick={handleNextStep}
                  disabled={!bookingData.firstName || !bookingData.lastName || !bookingData.email || !bookingData.phone}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all duration-300 ${
                    bookingData.firstName && bookingData.lastName && bookingData.email && bookingData.phone
                      ? 'bg-gradient-to-r from-ocean-mid to-ocean-light text-white hover:shadow-lg'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Continue to Payment
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-textPrimary mb-4">Step 3: Payment</h2>
              
              <div className="space-y-6">
                {/* GCash QR Code */}
                <div className="p-4 bg-ocean-ice rounded-lg text-center">
                  <h3 className="text-lg font-semibold text-textPrimary mb-3">GCash Payment</h3>
                  <div className="flex justify-center mb-3">
                    <div className="w-48 h-48 bg-white rounded-xl flex items-center justify-center border border-ocean-light/20">
                      <i className="fas fa-qrcode text-6xl text-ocean-light"></i>
                    </div>
                  </div>
                  <p className="text-sm text-textSecondary">Scan QR code to pay with GCash</p>
                </div>
                
                {/* Bank Account Details */}
                <div className="p-4 bg-ocean-ice rounded-lg">
                  <h3 className="text-lg font-semibold text-textPrimary mb-3">Bank Transfer</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Bank:</strong> Sample Bank</p>
                    <p><strong>Account Name:</strong> SEA RIVER VIEW RESORT</p>
                    <p><strong>Account Number:</strong> 1234-5678-9012</p>
                  </div>
                </div>
                
                {/* Amount to Pay */}
                <div className="p-4 bg-gradient-to-r from-ocean-ice to-blue-white rounded-lg">
                  <p className="text-sm font-semibold text-textPrimary mb-1">Amount to Pay</p>
                  <p className="text-2xl font-bold text-ocean-mid">₱{totalPrice.toLocaleString()}</p>
                </div>
                
                {/* Upload Proof of Payment */}
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
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
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
                onClick={() => router.push('/')}
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