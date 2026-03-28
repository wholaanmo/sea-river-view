// app/rooms/calendar/page.js
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import GuestLayout from '@/app/guest/layout';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function RoomCalendar() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = searchParams.get('roomId');
  const roomType = searchParams.get('roomType');
  const price = searchParams.get('price');
  const capacity = searchParams.get('capacity');

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookedDates, setBookedDates] = useState([]);

  useEffect(() => {
    if (roomId) {
      fetchBookings();
    }
  }, [roomId]);

  const fetchBookings = async () => {
    try {
      // Fetch bookings for this room
      const bookingsRef = collection(db, 'bookings');
      const q = query(bookingsRef, where('roomId', '==', roomId));
      const querySnapshot = await getDocs(q);
      
      const booked = [];
      querySnapshot.forEach((doc) => {
        const booking = doc.data();
        if (booking.status !== 'cancelled') {
          const checkIn = new Date(booking.checkIn);
          const checkOut = new Date(booking.checkOut);
          
          // Add all dates between check-in and check-out (excluding check-out)
          let current = new Date(checkIn);
          while (current < checkOut) {
            booked.push(new Date(current).toDateString());
            current.setDate(current.getDate() + 1);
          }
        }
      });
      setBookedDates(booked);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const isDateAvailable = (date) => {
    if (!date) return false;
    const dateString = date.toDateString();
    return !bookedDates.includes(dateString);
  };

  const isDatePast = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleDateSelect = (date) => {
    if (!isDateAvailable(date) || isDatePast(date)) return;
    setSelectedDate(date);
  };

  const handleProceed = () => {
    if (selectedDate) {
      router.push(`/rooms/booking?roomId=${roomId}&roomType=${encodeURIComponent(roomType)}&price=${price}&capacity=${capacity}&checkIn=${selectedDate.toISOString()}`);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  if (loading) {
    return (
      <GuestLayout>
        <div className="min-h-screen bg-gradient-to-br from-ocean-ice to-blue-white flex items-center justify-center">
          <i className="fas fa-spinner fa-spin text-3xl text-ocean-light"></i>
        </div>
      </GuestLayout>
    );
  }

  return (
    <GuestLayout>
      <div className="min-h-screen bg-gradient-to-br from-ocean-ice to-blue-white py-12">
        <div className="mx-auto max-w-4xl px-4" style={{ marginLeft: '5%', marginRight: '5%' }}>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-ocean-mid to-ocean-light px-6 py-4">
              <h1 className="text-2xl font-bold text-white">Select Check-in Date</h1>
              <p className="text-white/80 text-sm mt-1">{roomType} - ₱{parseInt(price).toLocaleString()}/night</p>
            </div>
            
            <div className="p-6">
              {/* Month Navigation */}
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={goToPreviousMonth}
                  className="px-4 py-2 border border-ocean-light/20 rounded-lg hover:bg-ocean-ice transition-all duration-200"
                >
                  <i className="fas fa-chevron-left mr-2"></i>
                  Previous
                </button>
                <h2 className="text-xl font-semibold text-textPrimary">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <button
                  onClick={goToNextMonth}
                  className="px-4 py-2 border border-ocean-light/20 rounded-lg hover:bg-ocean-ice transition-all duration-200"
                >
                  Next
                  <i className="fas fa-chevron-right ml-2"></i>
                </button>
              </div>
              
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center font-semibold text-textSecondary py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {days.map((day, index) => {
                  if (!day) {
                    return <div key={index} className="aspect-square"></div>;
                  }
                  
                  const isAvailable = isDateAvailable(day);
                  const isPast = isDatePast(day);
                  const isSelected = selectedDate && selectedDate.toDateString() === day.toDateString();
                  
                  let bgColor = 'bg-white';
                  let textColor = 'text-textPrimary';
                  let hoverClass = '';
                  let cursorClass = 'cursor-pointer';
                  
                  if (isPast) {
                    bgColor = 'bg-gray-100';
                    textColor = 'text-gray-400';
                    cursorClass = 'cursor-not-allowed';
                  } else if (!isAvailable) {
                    bgColor = 'bg-red-50';
                    textColor = 'text-red-400';
                    cursorClass = 'cursor-not-allowed';
                  } else if (isSelected) {
                    bgColor = 'bg-ocean-mid';
                    textColor = 'text-white';
                    hoverClass = 'hover:bg-ocean-mid';
                  } else {
                    hoverClass = 'hover:bg-ocean-ice';
                  }
                  
                  return (
                    <button
                      key={index}
                      onClick={() => !isPast && isAvailable && handleDateSelect(day)}
                      disabled={isPast || !isAvailable}
                      className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-200 ${bgColor} ${textColor} ${hoverClass} ${cursorClass}`}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>
              
              {/* Legend */}
              <div className="mt-6 pt-4 border-t border-ocean-light/10 flex justify-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
                  <span className="text-sm text-textSecondary">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-50 rounded"></div>
                  <span className="text-sm text-textSecondary">Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 rounded"></div>
                  <span className="text-sm text-textSecondary">Past Date</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-ocean-mid rounded"></div>
                  <span className="text-sm text-textSecondary">Selected</span>
                </div>
              </div>
              
              {/* Selected Date Display */}
              {selectedDate && (
                <div className="mt-6 p-4 bg-ocean-ice rounded-lg">
                  <p className="text-textPrimary">
                    <i className="fas fa-calendar-check text-ocean-mid mr-2"></i>
                    Selected check-in date: <strong>{selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                  </p>
                </div>
              )}
              
              {/* Proceed Button */}
              <div className="mt-6">
                <button
                  onClick={handleProceed}
                  disabled={!selectedDate}
                  className={`w-full py-3 rounded-xl font-medium transition-all duration-300 ${
                    selectedDate
                      ? 'bg-gradient-to-r from-ocean-mid to-ocean-light text-white hover:shadow-lg hover:-translate-y-0.5'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Proceed to Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}