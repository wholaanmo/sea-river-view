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
  const capacity = parseInt(searchParams.get('capacity'));
  const totalRooms = parseInt(searchParams.get('totalRooms'));

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [bookedDates, setBookedDates] = useState({}); // Store occupancy per date
  const [occupiedTimes, setOccupiedTimes] = useState([]);
  const [roomDetails, setRoomDetails] = useState(null);

  // Generate 24-hour time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      const hour12 = hour % 12 || 12;
      const ampm = hour < 12 ? 'AM' : 'PM';
      const timeString = `${hour12.toString().padStart(2, '0')}:00 ${ampm}`;
      slots.push({
        value: `${hour.toString().padStart(2, '0')}:00`,
        display: timeString,
        hour: hour
      });
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  useEffect(() => {
    if (roomId) {
      fetchRoomDetails();
      fetchBookings();
    }
  }, [roomId]);

  const fetchRoomDetails = async () => {
    try {
      const roomRef = collection(db, 'rooms');
      const q = query(roomRef, where('__name__', '==', roomId));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const roomData = querySnapshot.docs[0].data();
        setRoomDetails(roomData);
      }
    } catch (error) {
      console.error('Error fetching room details:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const bookingsRef = collection(db, 'bookings');
      const q = query(
        bookingsRef, 
        where('roomId', '==', roomId),
        where('status', 'in', ['pending', 'confirmed', 'check-in'])
      );
      const querySnapshot = await getDocs(q);
      
      const booked = {};
      querySnapshot.forEach((doc) => {
        const booking = doc.data();
        const checkIn = new Date(booking.checkIn);
        const checkOut = new Date(booking.checkOut);
        
        // Track occupancy per date
        let current = new Date(checkIn);
        while (current < checkOut) {
          const dateKey = current.toDateString();
          if (!booked[dateKey]) {
            booked[dateKey] = {
              count: 0,
              times: []
            };
          }
          booked[dateKey].count += booking.guests || 1;
          // Store check-in time for this booking
          const timeKey = `${checkIn.getHours()}:${checkIn.getMinutes()}`;
          booked[dateKey].times.push(timeKey);
          current.setDate(current.getDate() + 1);
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
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const isDateAvailable = (date) => {
    if (!date) return false;
    const dateKey = date.toDateString();
    const bookedCount = bookedDates[dateKey]?.count || 0;
    const totalAvailable = roomDetails?.totalRooms || 1;
    return bookedCount < totalAvailable;
  };

  const isTimeSlotAvailable = (date, hour) => {
    if (!date) return false;
    const dateKey = date.toDateString();
    const bookedTimes = bookedDates[dateKey]?.times || [];
    
    // Check if this specific time slot is occupied
    const timeKey = `${hour}:0`;
    return !bookedTimes.includes(timeKey);
  };

  const isDatePast = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleDateSelect = (date) => {
    if (!isDateAvailable(date) || isDatePast(date)) return;
    setSelectedDate(date);
    setSelectedTime('');
  };

  const handleTimeSelect = (timeSlot) => {
    if (!selectedDate) return;
    if (isTimeSlotAvailable(selectedDate, timeSlot.hour)) {
      setSelectedTime(timeSlot.display);
    }
  };

const handleProceed = () => {
  if (selectedDate && selectedTime) {
    const checkInDateTime = new Date(selectedDate);
    
    // Parse the selected time correctly (e.g., "05:00 PM" or "5:00 PM")
    const timeMatch = selectedTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      const period = timeMatch[3].toUpperCase();
      
      // Convert to 24-hour format
      if (period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }
      
      checkInDateTime.setHours(hours, minutes, 0, 0);
    }
    
    router.push(`/rooms/booking?roomId=${roomId}&roomType=${encodeURIComponent(roomType)}&price=${price}&capacity=${capacity}&totalRooms=${roomDetails?.totalRooms}&checkIn=${checkInDateTime.toISOString()}`);
  }
};

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
    setSelectedTime('');
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
    setSelectedTime('');
  };

  const goBack = () => {
    router.push('/rooms');
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
      <div className="min-h-screen bg-gradient-to-br from-ocean-ice to-blue-white py-12 flex items-center justify-center">
        <div className="max-w-6xl w-full px-4">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-ocean-mid to-ocean-light px-8 py-6">
              <h1 className="text-3xl font-bold text-white">Select Check-in Date & Time</h1>
              <p className="text-white/80 text-base mt-2">{roomType} - ₱{parseInt(price).toLocaleString()}/night</p>
            </div>
            
            <div className="p-8">
              {/* Month Navigation */}
              <div className="flex justify-between items-center mb-8">
                <button
                  onClick={goBack}
                  className="px-5 py-2 border border-ocean-light/20 rounded-lg hover:bg-ocean-ice transition-all duration-200 flex items-center gap-2"
                >
                  <i className="fas fa-arrow-left"></i>
                  Back to Rooms
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={goToPreviousMonth}
                    className="px-4 py-2 border border-ocean-light/20 rounded-lg hover:bg-ocean-ice transition-all duration-200"
                  >
                    <i className="fas fa-chevron-left mr-2"></i>
                    Previous
                  </button>
                  <h2 className="text-2xl font-semibold text-textPrimary px-4">
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
              </div>
              
              {/* Two-column layout: 80% Calendar, 20% Time Selection */}
        <div className="flex gap-6">
  {/* Check-in Date Section - 80% width */}
  <div className="w-4/5">
    {/* Calendar Grid */}
    <div className="grid grid-cols-7 gap-3 mb-4">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
        <div key={day} className="text-center font-semibold text-textSecondary py-3 text-base">
          {day}
        </div>
      ))}
    </div>
    
    <div className="grid grid-cols-7 gap-3">
      {days.map((day, index) => {
        if (!day) {
          return <div key={index} className="aspect-square"></div>;
        }
        
        const isAvailable = isDateAvailable(day);
        const isPast = isDatePast(day);
        const isSelected = selectedDate && selectedDate.toDateString() === day.toDateString();
        const occupancy = bookedDates[day.toDateString()]?.count || 0;
        const totalRoomsAvailable = roomDetails?.totalRooms || 1;
        
        let bgColor = 'bg-white';
        let textColor = 'text-textPrimary';
        let borderClass = 'border border-gray-200';
        let hoverClass = '';
        let cursorClass = 'cursor-pointer';
        
        if (isPast) {
          bgColor = 'bg-gray-100';
          textColor = 'text-gray-400';
          borderClass = 'border border-gray-200';
          cursorClass = 'cursor-not-allowed';
        } else if (!isAvailable) {
          bgColor = 'bg-red-100';
          textColor = 'text-red-600';
          borderClass = 'border border-red-200';
          cursorClass = 'cursor-not-allowed';
        } else if (isSelected) {
          bgColor = 'bg-ocean-mid';
          textColor = 'text-white';
          borderClass = 'border border-ocean-mid';
          hoverClass = 'hover:bg-ocean-mid';
        } else {
          hoverClass = 'hover:bg-ocean-ice';
        }
        
        return (
          <button
            key={index}
            onClick={() => !isPast && isAvailable && handleDateSelect(day)}
            disabled={isPast || !isAvailable}
            className={`aspect-square rounded-xl flex flex-col items-center justify-center text-base font-medium transition-all duration-200 ${bgColor} ${textColor} ${borderClass} ${hoverClass} ${cursorClass}`}
          >
            <span>{day.getDate()}</span>
            {/* Removed "2 left" indicator for guests */}
          </button>
        );
      })}
    </div>
    
    {/* Legend */}
    <div className="mt-8 pt-6 border-t border-ocean-light/10 flex justify-center gap-8">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 bg-white border border-gray-300 rounded"></div>
        <span className="text-sm text-textSecondary">Available</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 bg-red-100 border border-red-200 rounded"></div>
        <span className="text-sm text-textSecondary">Fully Booked</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 bg-gray-100 border border-gray-200 rounded"></div>
        <span className="text-sm text-textSecondary">Past Date</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 bg-ocean-mid rounded"></div>
        <span className="text-sm text-textSecondary">Selected</span>
      </div>
    </div>
  </div>

  {/* Check-in Time Section - 20% width */}
  <div className="w-1/5">
    {selectedDate ? (
      <div className="bg-ocean-ice rounded-xl p-4 sticky top-4">
        <h3 className="text-sm font-semibold text-textPrimary mb-3">
          Select Check-in Time
        </h3>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {timeSlots.map((slot) => {
            const isOccupied = !isTimeSlotAvailable(selectedDate, slot.hour);
            return (
              <button
                key={slot.value}
                onClick={() => !isOccupied && handleTimeSelect(slot)}
                disabled={isOccupied}
                className={`w-full px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                  selectedTime === slot.display
                    ? 'bg-ocean-mid text-white'
                    : isOccupied
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white border border-ocean-light/20 text-textPrimary hover:bg-ocean-ice'
                }`}
              >
                {slot.display}
                {isOccupied && (
                  <span className="block text-xs text-red-500">Occupied</span>
                )}
              </button>
            );
          })}
        </div>
        <div className="mt-4 p-2 bg-white rounded-lg text-xs">
          <p className="text-textPrimary">
            <i className="fas fa-calendar-check text-ocean-mid mr-1"></i>
            {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            {selectedTime && ` at ${selectedTime}`}
          </p>
        </div>
      </div>
    ) : (
      <div className="bg-ocean-ice rounded-xl p-4 text-center">
        <i className="fas fa-clock text-3xl text-ocean-light mb-2"></i>
        <p className="text-sm text-textSecondary">Select a date first</p>
      </div>
    )}
  </div>
</div>
              
              {/* Proceed Button */}
              <div className="mt-6">
                <button
                  onClick={handleProceed}
                  disabled={!selectedDate || !selectedTime}
                  className={`w-full py-3 rounded-xl font-medium transition-all duration-300 text-lg ${
                    selectedDate && selectedTime
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