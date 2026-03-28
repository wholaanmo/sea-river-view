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
  const [bookedDates, setBookedDates] = useState({}); 
  const [roomDetails, setRoomDetails] = useState(null);

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
        setRoomDetails(querySnapshot.docs[0].data());
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
        const dateKey = checkIn.toDateString();
        const timeKey = `${checkIn.getHours()}:0`;

        if (!booked[dateKey]) {
          booked[dateKey] = { times: new Set() };
        }
        booked[dateKey].times.add(timeKey);
      });

      // Convert Sets to Arrays for state storage
      const finalBookedData = {};
      Object.keys(booked).forEach(key => {
        finalBookedData[key] = { times: Array.from(booked[key].times) };
      });

      setBookedDates(finalBookedData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setLoading(false);
    }
  };

  const isDateAvailable = (date) => {
    if (!date) return false;
    const dateKey = date.toDateString();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return false;
    
    const bookedTimes = bookedDates[dateKey]?.times || [];
    // Date is red ONLY if all 24 slots are taken
    return bookedTimes.length < 24;
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

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));
    return days;
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  if (loading) return <GuestLayout><div className="min-h-screen flex items-center justify-center"><i className="fas fa-spinner fa-spin text-3xl text-ocean-light"></i></div></GuestLayout>;

  return (
    <GuestLayout>
      <div className="min-h-screen bg-gradient-to-br from-ocean-ice to-blue-white py-12 flex items-center justify-center">
        <div className="max-w-6xl w-full px-4">
          
          {/* Main Layout: Single Row */}
          <div className="flex flex-row gap-6 items-start">
            
            {/* BOX 1: Calendar Section (80%) */}
            <div className="w-4/5 bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-ocean-mid to-ocean-light px-8 py-6">
                <h1 className="text-3xl font-bold text-white">Select Check-in Date</h1>
                <p className="text-white/80 text-base mt-2">{roomType} - ₱{parseInt(price).toLocaleString()}/night</p>
              </div>
              
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <button onClick={() => router.push('/rooms')} className="px-5 py-2 border border-ocean-light/20 rounded-lg hover:bg-ocean-ice flex items-center gap-2">
                    <i className="fas fa-arrow-left"></i> Back
                  </button>
                  <div className="flex gap-3 items-center">
                    <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2 border rounded-lg hover:bg-ocean-ice"><i className="fas fa-chevron-left"></i></button>
                    <h2 className="text-xl font-semibold w-48 text-center">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                    <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 border rounded-lg hover:bg-ocean-ice"><i className="fas fa-chevron-right"></i></button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-3 mb-4 text-center font-semibold text-textSecondary">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
                </div>

                <div className="grid grid-cols-7 gap-3">
                  {days.map((day, index) => {
                    if (!day) return <div key={index} className="aspect-square"></div>;
                    const isAvailable = isDateAvailable(day);
                    const isPast = isDatePast(day);
                    const isSelected = selectedDate?.toDateString() === day.toDateString();
                    
                    return (
                      <button
                        key={index}
                        onClick={() => handleDateSelect(day)}
                        disabled={isPast || !isAvailable}
                        className={`aspect-square rounded-xl flex items-center justify-center text-base font-medium transition-all 
                          ${isPast ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 
                            !isAvailable ? 'bg-red-100 text-red-600 border border-red-200 cursor-not-allowed' : 
                            isSelected ? 'bg-ocean-mid text-white' : 'bg-white border hover:bg-ocean-ice'}`}
                      >
                        {day.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* BOX 2: Time Selection Section (20%) */}
            <div className="w-1/5">
              {selectedDate ? (
                <div className="bg-white rounded-2xl shadow-lg p-5 border border-ocean-light/10">
                  <h3 className="text-lg font-bold text-ocean-mid mb-4">Select Check-in Time</h3>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {timeSlots.map((slot) => {
                      const isOccupied = !isTimeSlotAvailable(selectedDate, slot.hour);
                      return (
                        <button
                          key={slot.value}
                          onClick={() => !isOccupied && handleTimeSelect(slot)}
                          disabled={isOccupied}
                          className={`w-full px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                            selectedTime === slot.display ? 'bg-ocean-mid text-white' : 
                            isOccupied ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60' : 
                            'bg-ocean-ice text-textPrimary hover:bg-ocean-light hover:text-white'
                          }`}
                        >
                          {slot.display}
                          {isOccupied && <span className="block text-[10px] text-red-500 uppercase font-bold">Full</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="bg-white/50 backdrop-blur-sm rounded-2xl border-2 border-dashed border-ocean-light/30 p-8 text-center">
                  <i className="fas fa-calendar-alt text-4xl text-ocean-light/40 mb-3"></i>
                  <p className="text-sm font-medium text-ocean-mid/60">Select a date first</p>
                </div>
              )}
            </div>
          </div>

          {/* Proceed Button Row */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleProceed}
              disabled={!selectedDate || !selectedTime}
              className={`w-full max-w-md py-4 rounded-2xl font-bold transition-all text-xl shadow-lg ${
                selectedDate && selectedTime ? 'bg-gradient-to-r from-ocean-mid to-ocean-light text-white hover:scale-[1.02]' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Confirm & Proceed
            </button>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}