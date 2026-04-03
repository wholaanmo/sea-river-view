// app/rooms/calendar/page.js
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import GuestLayout from '@/app/guest/layout';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Image from 'next/image';

export default function RoomCalendar() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = searchParams.get('roomId');
  const roomType = searchParams.get('roomType');
  const price = searchParams.get('price');
  const maxCapacity = parseInt(searchParams.get('capacity'));
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
        const roomData = querySnapshot.docs[0].data();
        setRoomDetails(roomData);
      }
    } catch (error) {
      console.error('Error fetching room details:', error);
    }
  };

  // Fetch bookings and store per‑hour room counts for the check-in hour only
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
      const numberOfRooms = booking.numberOfRooms || 1;

      let current = new Date(checkIn);

      while (current < checkOut) {
        const dateKey = current.toDateString();

        if (!booked[dateKey]) {
          booked[dateKey] = { times: {} };
          for (let h = 0; h < 24; h++) {
            booked[dateKey].times[`${h}:00`] = 0;
          }
        }

        // ✅ LOOP THROUGH HOURS OF THE DAY
        const startHour = current.getHours();
        const endHour =
          current.toDateString() === checkOut.toDateString()
            ? checkOut.getHours()
            : 24;

        for (let h = startHour; h < endHour; h++) {
          booked[dateKey].times[`${h}:00`] += numberOfRooms;
        }

        // move to next day at 00:00
        current.setDate(current.getDate() + 1);
        current.setHours(0, 0, 0, 0);
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

  // Check if there's at least one practical bookable time slot
  // A practical bookable slot is one that allows a reasonable check-in (not too late)
  // For this implementation, we consider all hours as potential check-in times
const hasPracticalBookableSlot = (date) => {
  const dateKey = date.toDateString();
  const timesObj = bookedDates[dateKey]?.times || {};

  // ✅ Only allow reasonable hours (example: 6AM–10PM)
  for (let hour = 6; hour <= 22; hour++) {
    const bookedCount = timesObj[`${hour}:00`] || 0;
    if (bookedCount < totalRooms) {
      return true;
    }
  }

  return false;
};

  // A date is selectable if at least one hour has available rooms
  const isDateSelectable = (date) => {
    if (!date) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return false;

    const minBookableDate = new Date();
    minBookableDate.setDate(minBookableDate.getDate() + 2);
    minBookableDate.setHours(0, 0, 0, 0);
    if (date < minBookableDate) return false;

    return hasPracticalBookableSlot(date);
  };

  // A time slot is available if booked count < totalRooms
  const isTimeSlotAvailable = (date, hour) => {
    if (!date) return false;
    const dateKey = date.toDateString();
    const timesObj = bookedDates[dateKey]?.times || {};
    const timeKey = `${hour}:00`;
    const bookedCount = timesObj[timeKey] || 0;
    return bookedCount < totalRooms;
  };

  const isDatePast = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isDateTooSoon = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const minBookableDate = new Date();
    minBookableDate.setDate(minBookableDate.getDate() + 2);
    minBookableDate.setHours(0, 0, 0, 0);
    return date < minBookableDate && date >= today;
  };

  const handleDateSelect = (date) => {
    if (!isDateSelectable(date)) return;
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

        if (period === 'PM' && hours !== 12) {
          hours += 12;
        } else if (period === 'AM' && hours === 12) {
          hours = 0;
        }

        checkInDateTime.setHours(hours, minutes, 0, 0);
      }

      router.push(`/rooms/booking?roomId=${roomId}&roomType=${encodeURIComponent(roomType)}&price=${price}&maxCapacity=${maxCapacity}&totalRooms=${roomDetails?.totalRooms}&checkIn=${checkInDateTime.toISOString()}`);
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

  const getCapacityDisplay = () => {
    if (roomDetails) {
      const minCap = roomDetails.capacityMin || 1;
      const maxCap = roomDetails.capacityMax || maxCapacity;
      return `${minCap} – ${maxCap} guests`;
    }
    return `${maxCapacity} guests`;
  };

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
      <div className="min-h-screen bg-gradient-to-br from-ocean-ice to-blue-white py-8">
        <div className="max-w-7xl w-full mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8 items-stretch">
            {/* Left Column - Calendar */}
            <div className="lg:w-[70%] flex">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden w-full flex flex-col">
                <div className="bg-gradient-to-r from-ocean-mid to-ocean-light px-6 py-4 flex-shrink-0">
                  <h1 className="text-2xl font-bold text-white">Select Check-in Date & Time</h1>
                  <p className="text-white/80 text-sm mt-1">{roomType} - ₱{parseInt(price).toLocaleString()}/night</p>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  {/* Month Navigation */}
                  <div className="flex justify-between items-center mb-6 flex-shrink-0">
                    <button
                      onClick={goBack}
                      className="px-3 py-1.5 border border-ocean-light/20 rounded-lg hover:bg-ocean-ice transition-all duration-200 flex items-center gap-1 text-sm"
                    >
                      <i className="fas fa-arrow-left text-xs"></i>
                      Back
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={goToPreviousMonth}
                        className="px-3 py-1.5 border border-ocean-light/20 rounded-lg hover:bg-ocean-ice transition-all duration-200 text-sm"
                      >
                        <i className="fas fa-chevron-left mr-1 text-xs"></i>
                        Prev
                      </button>
                      <h2 className="text-lg font-semibold text-textPrimary px-3">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                      </h2>
                      <button
                        onClick={goToNextMonth}
                        className="px-3 py-1.5 border border-ocean-light/20 rounded-lg hover:bg-ocean-ice transition-all duration-200 text-sm"
                      >
                        Next
                        <i className="fas fa-chevron-right ml-1 text-xs"></i>
                      </button>
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  <div className="flex-1 flex flex-col">
                    <div className="grid grid-cols-7 gap-1.5 mb-2">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                        <div key={day} className="text-center font-semibold text-textSecondary text-xs py-1.5">
                          {day}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1.5 flex-1">
                      {days.map((day, index) => {
                        if (!day) return <div key={index} className="aspect-square"></div>;

                        const isSelectable = isDateSelectable(day);
                        const isPast = isDatePast(day);
                        const isTooSoon = isDateTooSoon(day);
                        const isSelected = selectedDate && selectedDate.toDateString() === day.toDateString();
                        const dateKey = day.toDateString();
                        const timesObj = bookedDates[dateKey]?.times || {};

                        // Fully booked only if every hour has bookedCount >= totalRooms
                        let isFullyBooked = true;
                        for (let hour = 0; hour < 24; hour++) {
                          const timeKey = `${hour}:00`;
                          const bookedCount = timesObj[timeKey] || 0;
                          if (bookedCount < totalRooms) {
                            isFullyBooked = false;
                            break;
                          }
                        }

                        let bgColor = 'bg-white';
                        let textColor = 'text-textPrimary';
                        let borderClass = 'border border-gray-200';
                        let hoverClass = '';
                        let cursorClass = 'cursor-pointer';
                        let titleText = '';

                        if (isPast) {
                          bgColor = 'bg-gray-100';
                          textColor = 'text-gray-400';
                          borderClass = 'border border-gray-200';
                          cursorClass = 'cursor-not-allowed';
                          titleText = 'Past date';
                        } else if (isTooSoon) {
                          bgColor = 'bg-gray-100';
                          textColor = 'text-gray-400';
                          borderClass = 'border border-gray-200';
                          cursorClass = 'cursor-not-allowed';
                          titleText = 'Must book at least 1 day in advance';
                        } else if (isFullyBooked) {
                          bgColor = 'bg-red-100';
                          textColor = 'text-red-600';
                          borderClass = 'border border-red-200';
                          cursorClass = 'cursor-not-allowed';
                          titleText = 'Fully booked';
                        } else if (isSelected) {
                          bgColor = 'bg-ocean-mid';
                          textColor = 'text-white';
                          borderClass = 'border border-ocean-mid';
                          hoverClass = 'hover:bg-ocean-mid';
                          titleText = 'Selected';
                        } else if (isSelectable) {
                          hoverClass = 'hover:bg-ocean-ice';
                          titleText = 'Available';
                        } else {
                          hoverClass = 'hover:bg-ocean-ice';
                          titleText = 'Available';
                        }

                        return (
                          <button
                            key={index}
                            onClick={() => handleDateSelect(day)}
                            disabled={isPast || isTooSoon || isFullyBooked}
                            title={titleText}
                            className={`w-full pt-[100%] relative rounded-lg transition-all duration-200 ${bgColor} ${borderClass} ${hoverClass} ${cursorClass}`}
                          >
                            <span className={`absolute inset-0 flex items-center justify-center text-sm font-medium ${textColor}`}>
                              {day.getDate()}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="mt-6 pt-4 border-t border-ocean-light/10 flex justify-center gap-6 text-xs flex-shrink-0">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 bg-white border border-gray-300 rounded"></div>
                      <span className="text-textSecondary">Available</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
                      <span className="text-textSecondary">Fully Booked</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded"></div>
                      <span className="text-textSecondary">Past/Unavailable</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 bg-ocean-mid rounded"></div>
                      <span className="text-textSecondary">Selected</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Room Card + Time Slots */}
            <div className="lg:w-[30%] flex">
              <div className="w-full flex flex-col gap-6">
                {/* Room Card */}
                <div className="bg-white rounded-xl shadow-md border border-ocean-light/20 overflow-hidden flex-shrink-0">
                  <div className="relative h-48 bg-gradient-to-br from-ocean-pale to-ocean-ice overflow-hidden">
                    {roomDetails?.images && roomDetails.images[0] ? (
                      <Image
                        src={roomDetails.images[0]}
                        alt={roomType}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <i className="fas fa-hotel text-5xl text-ocean-light/30"></i>
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-textPrimary text-xl mb-2">{roomType}</h3>
                    <div className="mb-4">
                      <p className="text-2xl font-bold text-ocean-mid">
                        ₱{parseInt(price).toLocaleString()}
                        <span className="text-sm font-normal text-textSecondary">/night</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-textSecondary mb-4">
                      <i className="fas fa-users text-ocean-light"></i>
                      <span className="text-sm">{getCapacityDisplay()}</span>
                    </div>
                    <div className="bg-ocean-ice rounded-lg p-3 mb-4">
                      <p className="text-sm font-semibold text-textPrimary mb-2">
                        <i className="fas fa-calendar-check text-ocean-mid mr-2"></i>
                        Selected Schedule
                      </p>
                      {selectedDate ? (
                        <>
                          <p className="text-sm text-textSecondary">
                            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                          </p>
                          {selectedTime && (
                            <p className="text-sm text-ocean-mid font-medium mt-2">
                              <i className="fas fa-clock mr-2"></i>
                              {selectedTime}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-textSecondary">No date selected</p>
                      )}
                    </div>
                    <button
                      onClick={handleProceed}
                      disabled={!selectedDate || !selectedTime}
                      className={`w-full py-3 rounded-lg font-semibold text-base transition-all duration-300 ${
                        selectedDate && selectedTime
                          ? 'bg-gradient-to-r from-ocean-mid to-ocean-light text-white hover:shadow-lg hover:-translate-y-0.5'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Proceed to Booking
                    </button>
                  </div>
                </div>

                {/* Available Check-in Times */}
                {selectedDate ? (
                  <div className="bg-white rounded-xl shadow-md border border-ocean-light/20 p-5 flex-1">
                    <h3 className="text-base font-semibold text-textPrimary mb-4 flex items-center gap-2">
                      <i className="fas fa-clock text-ocean-light"></i>
                      Available Check-in Times
                    </h3>
                    <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
                      {timeSlots.map((slot) => {
                        const isAvailable = isTimeSlotAvailable(selectedDate, slot.hour);
                        return (
                          <button
                            key={slot.value}
                            onClick={() => isAvailable && handleTimeSelect(slot)}
                            disabled={!isAvailable}
                            className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                              selectedTime === slot.display
                                ? 'bg-ocean-mid text-white shadow-md'
                                : !isAvailable
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-ocean-ice border border-ocean-light/20 text-textPrimary hover:bg-ocean-light/20 hover:shadow-sm'
                            }`}
                          >
                            {slot.display}
                            {!isAvailable && (
                              <span className="block text-[10px] text-red-500 mt-0.5">Fully Booked</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {!selectedTime && (
                      <div className="mt-4 p-2 bg-amber-50 rounded-lg text-center">
                        <p className="text-xs text-amber-600">
                          <i className="fas fa-info-circle mr-1"></i>
                          Select a check-in time to continue
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-md border border-ocean-light/20 p-8 text-center flex-1 flex flex-col items-center justify-center">
                    <i className="fas fa-calendar-day text-4xl text-ocean-light/40 mb-3 block"></i>
                    <p className="text-textSecondary text-sm">Select a date first</p>
                    <p className="text-textSecondary text-xs mt-1">to see available check-in times</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}