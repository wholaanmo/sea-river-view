// app/rooms/calendar/page.js
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import GuestLayout from '@/app/guest/layout';
import { db } from '@/lib/firebase';
import { collection, query, where, doc, onSnapshot } from 'firebase/firestore';
import Image from 'next/image';

export default function RoomCalendar() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = searchParams.get('roomId');
  const roomType = searchParams.get('roomType');
  const price = searchParams.get('price');
  const maxCapacity = parseInt(searchParams.get('capacity'));
  const totalRoomsParam = parseInt(searchParams.get('totalRooms'), 10);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [bookedDates, setBookedDates] = useState({});
  const [blockedSlots, setBlockedSlots] = useState({}); // { dateKey: { hour: blockedUnitCount } }
  const [fullyBlockedDates, setFullyBlockedDates] = useState({}); // { dateKey: true }
  const [roomDetails, setRoomDetails] = useState(null);
  const [timeSelectionError, setTimeSelectionError] = useState('');

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

  const totalRoomUnits = (() => {
    const totalRoomsFromUrl =
      Number.isFinite(totalRoomsParam) && totalRoomsParam >= 0 ? totalRoomsParam : null;
    const totalRoomsFromDetails = parseInt(roomDetails?.totalRooms, 10);
    const maintenanceRoomsFromDetails = parseInt(roomDetails?.maintenanceRooms, 10);

    const effectiveTotalRooms =
      Number.isFinite(totalRoomsFromDetails) && totalRoomsFromDetails >= 0
        ? totalRoomsFromDetails
        : Number.isFinite(totalRoomsFromUrl) && totalRoomsFromUrl >= 0
          ? totalRoomsFromUrl
          : 1;

    const maintenanceRooms =
      Number.isFinite(maintenanceRoomsFromDetails) && maintenanceRoomsFromDetails > 0
        ? maintenanceRoomsFromDetails
        : 0;

    return Math.max(0, effectiveTotalRooms - maintenanceRooms);
  })();

  const toJsDate = (value) => {
    if (value == null) return null;
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
    if (typeof value.toDate === 'function') return value.toDate();
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  /** Calendar day key in local timezone (matches admin calendar / Firestore date strings). */
  const toLocalDateKey = (d) => {
    if (!d) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  useEffect(() => {
    if (!roomId) return;
    const unsubscribe = onSnapshot(doc(db, 'rooms', roomId), (snap) => {
      if (snap.exists()) setRoomDetails(snap.data());
      else setRoomDetails(null);
    });
    return () => unsubscribe();
  }, [roomId]);

  // Bookings listener
  useEffect(() => {
    if (!roomId) {
      setLoading(false);
      return;
    }

    const bookingsRef = collection(db, 'bookings');
    const q = query(
      bookingsRef,
      where('roomId', '==', roomId),
      where('status', 'in', ['pending', 'confirmed', 'check-in'])
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const booked = {};
        querySnapshot.forEach((docSnap) => {
          const booking = docSnap.data();
          const checkIn = toJsDate(booking.checkIn);
          const checkOut = toJsDate(booking.checkOut);
          const numberOfRooms = booking.numberOfRooms || 1;
          if (!checkIn || !checkOut || checkOut <= checkIn) return;
          let current = new Date(checkIn);
          while (current < checkOut) {
            const dateKey = current.toDateString();
            if (!booked[dateKey]) {
              booked[dateKey] = { times: {} };
              for (let h = 0; h < 24; h++) {
                booked[dateKey].times[`${h}:00`] = 0;
              }
            }
            const startHour = current.getHours();
            const endHour =
              current.toDateString() === checkOut.toDateString()
                ? checkOut.getHours()
                : 24;
            for (let h = startHour; h < endHour; h++) {
              booked[dateKey].times[`${h}:00`] += numberOfRooms;
            }
            current.setDate(current.getDate() + 1);
            current.setHours(0, 0, 0, 0);
          }
        });
        setBookedDates(booked);
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to bookings:', error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [roomId]);

  // Blocked slots: per-hour total admin-blocked units (partial blocks supported)
  useEffect(() => {
    if (!roomId) return;
    const cap = totalRoomUnits;
    const blockedRef = collection(db, 'unavailableSlots');
    const q = query(blockedRef, where('roomId', '==', roomId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const blocks = {}; // { dateKey: { hour: number } }
      const fullyBlocked = {}; // { dateKey: true } — all hours have blockedUnits >= cap

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const dateKey = data.date;
        const startHour = data.startHour;
        const endHour = data.endHour;
        const rawUnits = data.unitsBlocked;
        const docUnits =
          rawUnits != null
            ? Math.min(cap, Math.max(1, parseInt(rawUnits, 10) || 0))
            : cap;

        if (!blocks[dateKey]) blocks[dateKey] = {};
        for (let hour = startHour; hour < endHour; hour++) {
          const prev = blocks[dateKey][hour] || 0;
          blocks[dateKey][hour] = Math.min(cap, prev + docUnits);
        }
      });

      if (cap > 0) {
        Object.keys(blocks).forEach((dateKey) => {
          let allHoursBlocked = true;
          for (let hour = 0; hour < 24; hour++) {
            if ((blocks[dateKey][hour] || 0) < cap) {
              allHoursBlocked = false;
              break;
            }
          }
          if (allHoursBlocked) {
            fullyBlocked[dateKey] = true;
          }
        });
      }

      setBlockedSlots(blocks);
      setFullyBlockedDates(fullyBlocked);
    });
    return () => unsubscribe();
  }, [roomId, totalRoomUnits]);

  useEffect(() => {
    if (!selectedDate || !selectedTime) return;
    const timeMatch = selectedTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!timeMatch) return;
    let hours = parseInt(timeMatch[1], 10);
    const period = timeMatch[3].toUpperCase();
    if (period === 'PM' && hours !== 12) hours += 12;
    else if (period === 'AM' && hours === 12) hours = 0;
    if (!canFitRequiredBookingDuration(selectedDate, hours)) {
      setSelectedTime('');
    }
  }, [bookedDates, blockedSlots, selectedDate, selectedTime, totalRoomUnits]);

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

  const BOOKING_DURATION_HOURS = 22;

  const isHourAvailable = (date, hour) => {
    if (!date) return false;
    if (totalRoomUnits <= 0) return false;
    const dateKey = toLocalDateKey(date);
    const blockedUnits = blockedSlots[dateKey]?.[hour] ?? 0;

    const d = new Date(date);
    d.setHours(hour, 0, 0, 0);
    const bookingDateKey = d.toDateString();
    const bookedCount = bookedDates[bookingDateKey]?.times?.[`${hour}:00`] || 0;

    return totalRoomUnits - bookedCount - blockedUnits > 0;
  };

  const canFitRequiredBookingDuration = (date, startHour) => {
    if (!date) return false;
    if (totalRoomUnits <= 0) return false;
    for (let offset = 0; offset < BOOKING_DURATION_HOURS; offset++) {
      const d = new Date(date);
      d.setHours(startHour + offset, 0, 0, 0);
      const dateKey = toLocalDateKey(d);
      const hour = d.getHours();
      const blockedUnits = blockedSlots[dateKey]?.[hour] ?? 0;
      const bookingDateKey = d.toDateString();
      const bookedCount = bookedDates[bookingDateKey]?.times?.[`${hour}:00`] || 0;
      if (bookedCount + blockedUnits >= totalRoomUnits) return false;
    }
    return true;
  };

  const hasAnyAvailableHour = (date) => {
    for (let hour = 0; hour < 24; hour++) {
      if (isHourAvailable(date, hour)) return true;
    }
    return false;
  };

  const isDateSelectable = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return false;
    const minBookableDate = new Date();
    minBookableDate.setDate(minBookableDate.getDate() + 2);
    minBookableDate.setHours(0, 0, 0, 0);
    if (date < minBookableDate) return false;
    return hasAnyAvailableHour(date);
  };

  const isDateFullyBooked = (date) => {
    if (!date) return false;
    return !hasAnyAvailableHour(date);
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

  const hasAnyBlockedSlot = (date) => {
    if (!date) return false;
    const dateKey = toLocalDateKey(date);
    const day = blockedSlots[dateKey];
    if (!day) return false;
    for (let h = 0; h < 24; h++) {
      if ((day[h] || 0) > 0) return true;
    }
    return false;
  };

  const isDateFullyBlockedByAdmin = (date) => {
    if (!date) return false;
    const dateKey = toLocalDateKey(date);
    return fullyBlockedDates[dateKey] === true;
  };

  const handleDateSelect = (date) => {
    if (!isDateSelectable(date)) return;
    setSelectedDate(date);
    setSelectedTime('');
    setTimeSelectionError('');
  };

  const handleTimeSelect = (timeSlot) => {
    if (!selectedDate) return;
    if (!isHourAvailable(selectedDate, timeSlot.hour)) return;
    if (!canFitRequiredBookingDuration(selectedDate, timeSlot.hour)) {
      setSelectedTime('');
      setTimeSelectionError(
        `The selected time does not meet the required ${BOOKING_DURATION_HOURS}-hour minimum continuous booking duration. Please choose a different check-in time.`
      );
      return;
    }
    setTimeSelectionError('');
    setSelectedTime(timeSlot.display);
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
        if (!canFitRequiredBookingDuration(selectedDate, hours)) {
          setSelectedTime('');
          setTimeSelectionError(
            `The selected time does not meet the required ${BOOKING_DURATION_HOURS}-hour minimum continuous booking duration. Please choose a different check-in time.`
          );
          return;
        }
        checkInDateTime.setHours(hours, minutes, 0, 0);
      }
      router.push(`/rooms/booking?roomId=${roomId}&roomType=${encodeURIComponent(roomType)}&price=${price}&maxCapacity=${maxCapacity}&totalRooms=${roomDetails?.totalRooms ?? totalRoomUnits}&checkIn=${checkInDateTime.toISOString()}`);
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

                        const isPast = isDatePast(day);
                        const isTooSoon = isDateTooSoon(day);
                        const isFullyBooked = isDateFullyBooked(day);
                        const isSelected = selectedDate && selectedDate.toDateString() === day.toDateString();
                        const isFullyBlockedByAdmin = isDateFullyBlockedByAdmin(day);
                        const hasPartialBlock = hasAnyBlockedSlot(day) && !isFullyBlockedByAdmin;

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
                        } else if (isFullyBlockedByAdmin) {
                          bgColor = 'bg-orange-100';
                          textColor = 'text-orange-700';
                          borderClass = 'border border-orange-200';
                          cursorClass = 'cursor-not-allowed';
                          titleText = 'Not Available (all hours blocked by admin)';
                        } else if (isSelected) {
                          bgColor = 'bg-ocean-mid';
                          textColor = 'text-white';
                          borderClass = 'border border-ocean-mid';
                          hoverClass = 'hover:bg-ocean-mid';
                          titleText = 'Selected';
                        } else {
                          hoverClass = 'hover:bg-ocean-ice';
                          titleText = 'Available';
                        }

                        return (
                          <button
                            key={index}
                            onClick={() => handleDateSelect(day)}
                            disabled={isPast || isTooSoon || isFullyBooked || isFullyBlockedByAdmin}
                            title={titleText}
                            className={`w-full pt-[100%] relative rounded-lg transition-all duration-200 ${bgColor} ${borderClass} ${hoverClass} ${cursorClass}`}
                          >
                            <span className={`absolute inset-0 flex items-center justify-center text-sm font-medium ${textColor}`}>
                              {day.getDate()}
                            </span>
                            {hasPartialBlock && !isPast && !isTooSoon && !isFullyBooked && !isFullyBlockedByAdmin && (
                              <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="mt-6 pt-4 border-t border-ocean-light/10 flex justify-center gap-6 text-xs flex-shrink-0 flex-wrap">
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
                      <span className="text-textSecondary">Past / Too Soon</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 bg-ocean-mid rounded"></div>
                      <span className="text-textSecondary">Selected</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      <span className="text-textSecondary">Has Unavailable Slots</span>
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
                    {timeSelectionError && (
                      <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-xs text-red-700">
                          <i className="fas fa-exclamation-triangle mr-1"></i>
                          {timeSelectionError}
                        </p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
                      {timeSlots.map((slot) => {
                        const dateKey = toLocalDateKey(selectedDate);
                        const blockedUnits = blockedSlots[dateKey]?.[slot.hour] ?? 0;
                        const d = new Date(selectedDate);
                        d.setHours(slot.hour, 0, 0, 0);
                        const bookedCount = bookedDates[d.toDateString()]?.times?.[`${slot.hour}:00`] || 0;
                        const isAvailable = isHourAvailable(selectedDate, slot.hour);
                        const fullyBookedByGuests = bookedCount >= totalRoomUnits;
                        return (
                          <button
                            type="button"
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
                            {!isAvailable && fullyBookedByGuests && blockedUnits === 0 && (
                              <span className="block text-[10px] text-red-500 mt-0.5">Fully Booked</span>
                            )}
                            {!isAvailable && (blockedUnits > 0 || !fullyBookedByGuests) && (
                              <span className="block text-[10px] text-orange-600 mt-0.5">Not Available</span>
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