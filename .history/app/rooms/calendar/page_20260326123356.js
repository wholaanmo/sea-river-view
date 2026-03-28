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

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [bookedDates, setBookedDates] = useState({}); 
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
        
        let current = new Date(checkIn);
        while (current < checkOut) {
          const dateKey = current.toDateString();
          if (!booked[dateKey]) {
            booked[dateKey] = { count: 0, times: [] };
          }
          const roomsBooked = booking.numberOfRooms || 1;
          booked[dateKey].count += roomsBooked;
          
          const timeKey = `${checkIn.getHours()}:0`;
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
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  // FIX: Date is red ONLY if all 24 slots are taken
  const isDateAvailable = (date) => {
    if (!date) return false;
    const dateKey = date.toDateString();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return false;
    
    const bookedTimes = bookedDates[dateKey]?.times || [];
    
    let availableTimeSlots = 0;
    for (let hour = 0; hour < 24; hour++) {
      const timeKey = `${hour}:0`;
      if (!bookedTimes.includes(timeKey)) {
        availableTimeSlots++;
      }
    }
    return availableTimeSlots > 0;
  };

  const isTimeSlotAvailable = (date, hour) => {
    if (!date) return false;
    const dateKey = date.toDateString();
    const bookedTimes = bookedDates[dateKey]?.times || [];
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
      const timeMatch = selectedTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (timeMatch) {
        let hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);
        const period = timeMatch[3].toUpperCase();
        if (period === 'PM' && hours !== 12) hours += 12;
        else if (period === 'AM' && hours === 12) hours = 0;
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
              <h1 className="text-3xl font-bold text-white">Booking Schedule</h1>
              <p className="text-white/80 text-base mt-2">{roomType} - ₱{parseInt(price).toLocaleString()}/night</p>
            </div>
            
            <div className="p-8">
              {/* Month Navigation */}
              <div className="flex justify-between items-center mb-8">
                <button onClick={() => router.push('/rooms')} className="px-5 py-2 border border-ocean-light/20 rounded-lg hover:bg-ocean-ice transition-all flex items-center gap-2">
                  <i className="fas fa-arrow-left"></i> Back
                </button>
                <div className="flex items-center gap-4">
                  <button onClick={goToPreviousMonth} className="p-2 border rounded-lg hover:bg-ocean-ice"><i className="fas fa-chevron-left"></i></button>
                  <h2 className="text-2xl font-semibold text-textPrimary">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                  <button onClick={goToNextMonth} className="p-2 border rounded-lg hover:bg-ocean-ice"><i className="fas fa-chevron-right"></i></button>
                </div>
              </div>
              
              <div className="flex gap-8">
                {/* Box 1: Select Check-in Date (80%) */}
                <div className="w-4/5 border-r border-gray-100 pr-8">
                  <h3 className="text-lg font-bold text-ocean-mid mb-4">Select Check-in Date</h3>
                  <div className="grid grid-cols-7 gap-3 mb-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center font-semibold text-textSecondary text-sm uppercase">{day}</div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-3">
                    {days.map((day, index) => {
                      if (!day) return <div key={index} className="aspect-square"></div>;
                      
                      const isAvailable = isDateAvailable(day);
                      const isPast = isDatePast(day);
                      const isSelected = selectedDate && selectedDate.toDateString() === day.toDateString();
                      
                      let styles = "bg-white text-textPrimary border-gray-200 hover:bg-ocean-ice";
                      if (isPast) styles = "bg-gray-100 text-gray-400 cursor-not-allowed";
                      else if (!isAvailable) styles = "bg-red-100 text-red-600 border-red-200 cursor-not-allowed";
                      else if (isSelected) styles = "bg-ocean-mid text-white border-ocean-mid";

                      return (
                        <button
                          key={index}
                          onClick={() => !isPast && isAvailable && handleDateSelect(day)}
                          disabled={isPast || !isAvailable}
                          className={`aspect-square rounded-xl border flex items-center justify-center text-lg font-medium transition-all ${styles}`}
                        >
                          {day.getDate()}
                        </button>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="mt-8 flex gap-6 text-xs text-textSecondary justify-center">
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-white border rounded"></div> Available</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-100 border-red-200 border rounded"></div> Fully Booked</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-ocean-mid rounded"></div> Selected</div>
                  </div>
                </div>

                {/* Box 2: Select Check-in Time (20%) */}
                <div className="w-1/5">
                  <h3 className="text-lg font-bold text-ocean-mid mb-4">Select Check-in Time</h3>
                  {selectedDate ? (
                    <div className="space-y-2 max-h-[450px] overflow-y-auto pr-2">
                      {timeSlots.map((slot) => {
                        const isOccupied = !isTimeSlotAvailable(selectedDate, slot.hour);
                        return (
                          <button
                            key={slot.value}
                            onClick={() => !isOccupied && handleTimeSelect(slot)}
                            disabled={isOccupied}
                            className={`w-full py-3 rounded-lg text-sm font-medium border transition-all ${
                              selectedTime === slot.display
                                ? 'bg-ocean-mid text-white border-ocean-mid'
                                : isOccupied
                                ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                                : 'bg-white border-gray-200 text-textPrimary hover:border-ocean-light'
                            }`}
                          >
                            {slot.display}
                            {isOccupied && <span className="block text-[10px] text-red-400">Booked</span>}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-40 flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <i className="fas fa-calendar-alt text-gray-300 text-2xl mb-2"></i>
                      <p className="text-xs text-gray-400 text-center px-4">Select a date first</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Footer Proceed */}
              <div className="mt-10 border-t pt-6">
                <button
                  onClick={handleProceed}
                  disabled={!selectedDate || !selectedTime}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                    selectedDate && selectedTime
                      ? 'bg-gradient-to-r from-ocean-mid to-ocean-light text-white shadow-md hover:shadow-xl'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Confirm & Proceed
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}