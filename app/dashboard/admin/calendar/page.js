// app/dashboard/admin/calendar/page.js
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, doc, onSnapshot, addDoc, deleteDoc } from 'firebase/firestore';
import { logAdminAction } from '@/lib/auditLogger';
import Link from 'next/link';

export default function AdminCalendar() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [roomDetails, setRoomDetails] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedStartTime, setSelectedStartTime] = useState('');
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [selectedEndTime, setSelectedEndTime] = useState('');
  const [bookedDates, setBookedDates] = useState({});
  const [blockedSlots, setBlockedSlots] = useState({});
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [reason, setReason] = useState('');
  const [unitsToBlock, setUnitsToBlock] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const [unavailableRanges, setUnavailableRanges] = useState([]);

  // Fetch rooms list (only non-archived)
  useEffect(() => {
    const roomsRef = collection(db, 'rooms');
    const q = query(roomsRef, where('archived', '!=', true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roomsList = [];
      snapshot.forEach(doc => {
        roomsList.push({ id: doc.id, ...doc.data() });
      });
      setRooms(roomsList);
      if (roomsList.length > 0 && !selectedRoomId) {
        setSelectedRoomId(roomsList[0].id);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch room details
  useEffect(() => {
    if (!selectedRoomId) return;
    const roomRef = doc(db, 'rooms', selectedRoomId);
    const unsubscribe = onSnapshot(roomRef, (snap) => {
      if (snap.exists()) setRoomDetails(snap.data());
      else setRoomDetails(null);
    });
    return () => unsubscribe();
  }, [selectedRoomId]);

  // Fetch bookings
  useEffect(() => {
    if (!selectedRoomId) return;
    const bookingsRef = collection(db, 'bookings');
    const q = query(
      bookingsRef,
      where('roomId', '==', selectedRoomId),
      where('status', 'in', ['pending', 'confirmed', 'check-in'])
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const booked = {};
      snapshot.forEach(docSnap => {
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
            for (let h = 0; h < 24; h++) booked[dateKey].times[`${h}:00`] = 0;
          }
          const startHour = current.getHours();
          const endHour = current.toDateString() === checkOut.toDateString() ? checkOut.getHours() : 24;
          for (let h = startHour; h < endHour; h++) {
            booked[dateKey].times[`${h}:00`] += numberOfRooms;
          }
          current.setDate(current.getDate() + 1);
          current.setHours(0, 0, 0, 0);
        }
      });
      setBookedDates(booked);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [selectedRoomId]);

  const toJsDate = (value) => {
    if (!value) return null;
    if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
    if (typeof value.toDate === 'function') return value.toDate();
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  };

  /** Calendar day key in local timezone (avoids UTC off-by-one vs grid dates). */
  const toLocalDateKey = (d) => {
    if (!d) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const totalRoomUnits = (() => {
    if (!roomDetails) return 1;
    const total = parseInt(roomDetails.totalRooms) || 1;
    const maintenance = parseInt(roomDetails.maintenanceRooms) || 0;
    return Math.max(0, total - maintenance);
  })();

  const getAdminBlockedUnits = (dateKey, hour) => {
    const n = blockedSlots[dateKey]?.[hour];
    return typeof n === 'number' ? n : 0;
  };

  const hourHasNoUnitsLeft = (date, hour) => {
    if (!date || totalRoomUnits <= 0) return true;
    const dateKey = toLocalDateKey(date);
    const blockedUnits = getAdminBlockedUnits(dateKey, hour);
    const d = new Date(date);
    d.setHours(hour, 0, 0, 0);
    const bookingDateKey = d.toDateString();
    const bookedCount = bookedDates[bookingDateKey]?.times?.[`${hour}:00`] || 0;
    return bookedCount + blockedUnits >= totalRoomUnits;
  };

  // Fetch blocked slots (ranges); per-hour value = total admin-blocked units (capped per room capacity)
  useEffect(() => {
    if (!selectedRoomId) return;
    const cap = totalRoomUnits;
    const blockedRef = collection(db, 'unavailableSlots');
    const q = query(blockedRef, where('roomId', '==', selectedRoomId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const blocks = {};
      const ranges = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        const dateKey = data.date;
        const startHour = data.startHour;
        const endHour = data.endHour;
        const reasonText = data.reason;
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
        ranges.push({
          id: docSnap.id,
          date: dateKey,
          startHour,
          endHour,
          reason: reasonText,
          unitsBlocked: rawUnits != null ? docUnits : null,
          createdAt: data.createdAt
        });
      });
      setBlockedSlots(blocks);
      setUnavailableRanges(ranges.sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.startHour - b.startHour;
      }));
    });
    return () => unsubscribe();
  }, [selectedRoomId, totalRoomUnits]);

  useEffect(() => {
    setUnitsToBlock((u) => Math.min(Math.max(1, u), Math.max(1, totalRoomUnits)));
  }, [totalRoomUnits]);

  const isHourAvailable = (date, hour) => {
    if (!date || totalRoomUnits <= 0) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return false;
    return !hourHasNoUnitsLeft(date, hour);
  };

  const isHourFullyBooked = (date, hour) => {
    if (!date || totalRoomUnits <= 0) return false;
    const d = new Date(date);
    d.setHours(hour, 0, 0, 0);
    const bookingDateKey = d.toDateString();
    const bookedCount = bookedDates[bookingDateKey]?.times?.[`${hour}:00`] || 0;
    return bookedCount >= totalRoomUnits;
  };

  const isDatePast = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const hasAnyAvailableHour = (date) => {
    for (let hour = 0; hour < 24; hour++) {
      if (isHourAvailable(date, hour)) return true;
    }
    return false;
  };

  const isDateFullyBooked = (date) => {
    if (!date || isDatePast(date)) return false;
    return !hasAnyAvailableHour(date);
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

  const handleDateSelect = (date) => {
    if (isDatePast(date)) return;
    setSelectedStartDate(date);
    setSelectedStartTime('');
    setSelectedEndDate(null);
    setSelectedEndTime('');
    setReason('');
    setUnitsToBlock(1);
  };

  const handleStartTimeSelect = (timeSlot) => {
    if (!selectedStartDate) return;
    const hour = timeSlot.hour;
    if (hourHasNoUnitsLeft(selectedStartDate, hour)) return;
    setSelectedStartTime(timeSlot.display);
    setSelectedEndDate(null);
    setSelectedEndTime('');
    setReason('');
    setUnitsToBlock(1);
  };

  const handleEndDateSelect = (date) => {
    if (!selectedStartDate || !selectedStartTime) return;
    if (date < selectedStartDate) {
      showNotification('End date cannot be before start date', 'error');
      return;
    }
    setSelectedEndDate(date);
    setSelectedEndTime('');
    setReason('');
    setUnitsToBlock(1);
  };

  const handleEndTimeSelect = (timeSlot) => {
    if (!selectedStartDate || !selectedStartTime || !selectedEndDate) return;
    const startHour = timeSlots.find(s => s.display === selectedStartTime)?.hour;
    const endHour = timeSlot.hour;
    // Validate: if same date, end hour > start hour; if different date, any end hour is allowed (whole day)
    if (selectedEndDate.toDateString() === selectedStartDate.toDateString() && endHour <= startHour) {
      showNotification('End time must be after start time on the same day', 'error');
      return;
    }
    // Check for conflicts in the range (every hour from start to end across days)
    let hasConflict = false;
    let currentDate = new Date(selectedStartDate);
    const endDateObj = new Date(selectedEndDate);
    while (currentDate <= endDateObj && !hasConflict) {
      const dateKey = toLocalDateKey(currentDate);
      let hourStart = (currentDate.toDateString() === selectedStartDate.toDateString()) ? startHour : 0;
      let hourEnd = (currentDate.toDateString() === endDateObj.toDateString()) ? endHour : 24;
      for (let hour = hourStart; hour < hourEnd; hour++) {
        const blockedUnits = getAdminBlockedUnits(dateKey, hour);
        const d = new Date(currentDate);
        d.setHours(hour, 0, 0, 0);
        const bookingDateKey = d.toDateString();
        const bookedCount = bookedDates[bookingDateKey]?.times?.[`${hour}:00`] || 0;
        if (bookedCount + blockedUnits + 1 > totalRoomUnits) {
          hasConflict = true;
          break;
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
      currentDate.setHours(0, 0, 0, 0);
    }
    if (hasConflict) {
      showNotification('Selected time range conflicts with existing blocked or booked slots', 'error');
      return;
    }
    setSelectedEndTime(timeSlot.display);
    setReason('');
    setUnitsToBlock(1);
  };

  const handleMarkUnavailable = async () => {
    if (!selectedStartDate || !selectedStartTime || !selectedEndDate || !selectedEndTime) {
      showNotification('Please select a start date/time and end date/time', 'error');
      return;
    }
    if (!reason.trim()) {
      showNotification('Please provide a reason for blocking this time range', 'error');
      return;
    }
    const nBlock = Math.min(totalRoomUnits, Math.max(1, parseInt(unitsToBlock, 10) || 0));
    if (nBlock < 1) {
      showNotification('Invalid number of units to block', 'error');
      return;
    }
    setActionLoading(true);
    try {
      const startHour = timeSlots.find(s => s.display === selectedStartTime)?.hour;
      const endHour = timeSlots.find(s => s.display === selectedEndTime)?.hour;
      if (startHour === undefined || endHour === undefined) throw new Error('Invalid time');

      // For each date in the range, create a separate document
      let currentDate = new Date(selectedStartDate);
      const endDateObj = new Date(selectedEndDate);
      while (currentDate <= endDateObj) {
        const dateKey = toLocalDateKey(currentDate);
        let hourStart = (currentDate.toDateString() === selectedStartDate.toDateString()) ? startHour : 0;
        let hourEnd = (currentDate.toDateString() === endDateObj.toDateString()) ? endHour : 24;
        // Skip if start hour >= end hour (should not happen)
        if (hourStart < hourEnd) {
          for (let hour = hourStart; hour < hourEnd; hour++) {
            const blockedUnits = getAdminBlockedUnits(dateKey, hour);
            const d = new Date(currentDate);
            d.setHours(hour, 0, 0, 0);
            const bookingDateKey = d.toDateString();
            const bookedCount = bookedDates[bookingDateKey]?.times?.[`${hour}:00`] || 0;
            if (bookedCount + blockedUnits + nBlock > totalRoomUnits) {
              throw new Error('RANGE_OVERCAP');
            }
          }
          await addDoc(collection(db, 'unavailableSlots'), {
            roomId: selectedRoomId,
            date: dateKey,
            startHour: hourStart,
            endHour: hourEnd,
            reason: reason.trim(),
            unitsBlocked: nBlock,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
        currentDate.setDate(currentDate.getDate() + 1);
        currentDate.setHours(0, 0, 0, 0);
      }
      await logAdminAction({
        action: 'Marked Time Range Unavailable',
        module: 'Calendar Management',
        details: `Room: ${roomDetails?.type || selectedRoomId}, Range: ${selectedStartDate.toDateString()} ${selectedStartTime} – ${selectedEndDate.toDateString()} ${selectedEndTime}, Units: ${nBlock}, Reason: ${reason}`
      });
      showNotification('Time range marked as Not Available', 'success');
      setReason('');
      setUnitsToBlock(1);
      // Reset selection
      setSelectedStartDate(null);
      setSelectedStartTime('');
      setSelectedEndDate(null);
      setSelectedEndTime('');
    } catch (error) {
      console.error(error);
      if (error?.message === 'RANGE_OVERCAP') {
        showNotification('Not enough units left in that range for the selected block count (bookings or existing blocks)', 'error');
      } else {
        showNotification('Failed to mark time range', 'error');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveBlock = async (blockId, dateKey, startHour, endHour) => {
    setActionLoading(true);
    try {
      await deleteDoc(doc(db, 'unavailableSlots', blockId));
      await logAdminAction({
        action: 'Removed Blocked Time Range',
        module: 'Calendar Management',
        details: `Room: ${roomDetails?.type || selectedRoomId}, Date: ${dateKey}, Time: ${formatHour(startHour)} – ${formatHour(endHour)}`
      });
      showNotification('Block removed', 'success');
    } catch (error) {
      console.error(error);
      showNotification('Failed to remove block', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
  };

  const formatHour = (hour) => {
    const hour12 = hour % 12 || 12;
    const ampm = hour < 12 ? 'AM' : 'PM';
    return `${hour12.toString().padStart(2, '0')}:00 ${ampm}`;
  };

  const formatDateDisplay = (dateKey) => {
    const [year, month, day] = dateKey.split('-');
    const date = new Date(year, month - 1, day);
    return date.toDateString();
  };

  const timeSlots = (() => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      const hour12 = hour % 12 || 12;
      const ampm = hour < 12 ? 'AM' : 'PM';
      slots.push({
        value: `${hour.toString().padStart(2, '0')}:00`,
        display: `${hour12.toString().padStart(2, '0')}:00 ${ampm}`,
        hour: hour
      });
    }
    return slots;
  })();

  const days = getDaysInMonth(currentDate);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedStartDate(null);
    setSelectedStartTime('');
    setSelectedEndDate(null);
    setSelectedEndTime('');
    setUnitsToBlock(1);
  };
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedStartDate(null);
    setSelectedStartTime('');
    setSelectedEndDate(null);
    setSelectedEndTime('');
    setUnitsToBlock(1);
  };

  const isDateFullyBlocked = (date) => {
    if (!date || totalRoomUnits <= 0) return false;
    const dateKey = toLocalDateKey(date);
    const day = blockedSlots[dateKey];
    if (!day) return false;
    for (let hour = 0; hour < 24; hour++) {
      if ((day[hour] || 0) < totalRoomUnits) return false;
    }
    return true;
  };

const getDateStatus = (date) => {
  if (isDatePast(date)) return 'past';
  if (isDateFullyBooked(date)) return 'fullyBooked';
  if (isDateFullyBlocked(date)) return 'fullyBlocked';
  if (hasAnyBlockedSlot(date)) return 'hasBlocked';
  if (selectedStartDate && selectedStartDate.toDateString() === date.toDateString()) return 'selectedStart';
  if (selectedEndDate && selectedEndDate.toDateString() === date.toDateString()) return 'selectedEnd';
  return 'available';
};

  if (loading && rooms.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ocean-ice to-blue-white flex items-center justify-center">
        <i className="fas fa-spinner fa-spin text-3xl text-ocean-light"></i>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-ocean-ice to-blue-white min-h-screen">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-20 right-5 z-50 px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-slideInRight ${
          notification.type === 'error' ? 'bg-red-50 border-l-4 border-red-500 text-red-700' : 'bg-green-50 border-l-4 border-green-500 text-green-700'
        }`}>
          <i className={`${notification.type === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-check-circle'} text-base`}></i>
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Header & Room Selector */}
      <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-textPrimary font-playfair mb-1">Calendar Management</h1>
          <p className="text-textSecondary">Manage room availability (block ranges, add reasons)</p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href={`/rooms?roomId=${selectedRoomId}&adminMode=true`}
            target="_blank"
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
          >
            <i className="fas fa-user-plus text-sm"></i> Book for Guest
          </Link>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-textPrimary">Select Room Type:</label>
            <select
              value={selectedRoomId}
              onChange={(e) => {
                setSelectedRoomId(e.target.value);
                setSelectedStartDate(null);
                setSelectedStartTime('');
                setSelectedEndDate(null);
                setSelectedEndTime('');
                setUnitsToBlock(1);
              }}
              className="px-4 py-2 border border-ocean-light/20 rounded-xl text-sm focus:outline-none focus:border-ocean-light bg-white"
            >
              {rooms.map(room => (
                <option key={room.id} value={room.id}>{room.type || room.name || room.id}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main two-column layout */}
      <div className="flex flex-col xl:flex-row gap-8">
        {/* Calendar (60%) */}
        <div className="xl:w-[60%]">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-ocean-mid to-ocean-light px-6 py-4">
              <h2 className="text-xl font-bold text-white">Availability Calendar</h2>
              <p className="text-white/80 text-sm">
                {roomDetails?.type || selectedRoomId} – {totalRoomUnits} unit(s) available
              </p>
            </div>
            <div className="p-6">
              {/* Month navigation */}
              <div className="flex justify-between items-center mb-6">
                <button onClick={goToPreviousMonth} className="px-3 py-1.5 border border-ocean-light/20 rounded-lg hover:bg-ocean-ice text-sm">
                  <i className="fas fa-chevron-left mr-1 text-xs"></i> Prev
                </button>
                <h2 className="text-lg font-semibold text-textPrimary">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                <button onClick={goToNextMonth} className="px-3 py-1.5 border border-ocean-light/20 rounded-lg hover:bg-ocean-ice text-sm">
                  Next <i className="fas fa-chevron-right ml-1 text-xs"></i>
                </button>
              </div>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1.5 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} className="text-center font-semibold text-textSecondary text-xs py-1.5">{day}</div>
                ))}
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-1.5">
                {days.map((day, idx) => {
                  if (!day) return <div key={idx} className="aspect-square"></div>;
                  const status = getDateStatus(day);
                  let bgColor = 'bg-white';
                  let textColor = 'text-textPrimary';
                  let borderClass = 'border border-gray-200';
                  let cursorClass = 'cursor-pointer';
                  let titleText = '';
                  switch(status) {
  case 'past':
    bgColor = 'bg-gray-100';
    textColor = 'text-gray-400';
    cursorClass = 'cursor-not-allowed';
    titleText = 'Past date';
    break;
  case 'fullyBooked':
    bgColor = 'bg-red-100';
    textColor = 'text-red-600';
    cursorClass = 'cursor-not-allowed';
    titleText = 'Fully Booked';
    break;
  case 'hasBlocked':
    textColor = 'text-orange-700';
    cursorClass = 'cursor-pointer';
    titleText = 'Some hours blocked';
    break;
                    case 'selectedStart':
                      bgColor = 'bg-ocean-mid';
                      textColor = 'text-white';
                      titleText = 'Start date';
                      break;
                    case 'selectedEnd':
                      bgColor = 'bg-ocean-mid';
                      textColor = 'text-white';
                      titleText = 'End date';
                      break;
                    default:
                      bgColor = 'bg-white';
                      textColor = 'text-textPrimary';
                      titleText = 'Available';
                  }
                  return (
                    <button
                      key={idx}
                      onClick={() => (status !== 'past' && status !== 'fullyBooked') && handleDateSelect(day)}
                      disabled={status === 'past' || status === 'fullyBooked'}
                      title={titleText}
                      className={`relative w-full pt-[100%] rounded-lg transition-all duration-200 ${bgColor} ${borderClass} ${cursorClass}`}
                    >
                      <span className={`absolute inset-0 flex items-center justify-center text-sm font-medium ${textColor}`}>
                        {day.getDate()}
                      </span>
                      {status === 'hasBlocked' && !isDatePast(day) && (
                        <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-orange-400 rounded-full"></span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-6 pt-4 border-t border-ocean-light/10 flex justify-center gap-6 text-xs flex-wrap">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-white border border-gray-300 rounded"></div><span>Available</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div><span>Fully Booked</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded"></div><span>Past Dates</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-ocean-mid rounded"></div><span>Selected</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-orange-400 rounded-full"></div><span className="text-textSecondary">Has Unavailable Slots</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Management Panel (40%) */}
        <div className="xl:w-[40%] space-y-6">
          {/* Main Management Panel */}
          <div className="bg-white rounded-2xl shadow-lg border border-ocean-light/10 p-5">
            <h3 className="text-lg font-bold text-textPrimary mb-4 flex items-center gap-2">
              <i className="fas fa-sliders-h text-ocean-light"></i> Management Panel
            </h3>
            
            {!selectedStartDate ? (
              <div className="text-center py-10 text-neutral">
                <i className="fas fa-calendar-day text-4xl mb-3 block"></i>
                <p>Select a start date from the calendar</p>
              </div>
            ) : !selectedStartTime ? (
              <div>
                <div className="bg-ocean-ice rounded-xl p-3 mb-4">
                  <p className="text-sm text-textSecondary">Selected Start Date</p>
                  <p className="text-md font-semibold text-textPrimary">{selectedStartDate.toDateString()}</p>
                  <p className="text-sm text-textSecondary mt-1">Room Type: {roomDetails?.type || selectedRoomId}</p>
                </div>
                <label className="block text-sm font-medium text-textPrimary mb-2">Select Start Time</label>
                <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto mb-4">
                  {timeSlots.map(slot => {
                    const dateKey = toLocalDateKey(selectedStartDate);
                    const blockedUnits = getAdminBlockedUnits(dateKey, slot.hour);
                    const d = new Date(selectedStartDate);
                    d.setHours(slot.hour, 0, 0, 0);
                    const bookedCount = bookedDates[d.toDateString()]?.times?.[`${slot.hour}:00`] || 0;
                    const noUnitsLeft = bookedCount + blockedUnits >= totalRoomUnits;
                    const fullyBookedByGuests = isHourFullyBooked(selectedStartDate, slot.hour);
                    let btnClass = 'py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ';
                    let disabled = false;
                    if (selectedStartTime === slot.display) {
                      btnClass += 'bg-ocean-mid text-white';
                    } else if (noUnitsLeft) {
                      btnClass += fullyBookedByGuests && blockedUnits === 0
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'bg-orange-100 text-orange-700 border border-orange-200';
                      disabled = true;
                    } else if (blockedUnits > 0) {
                      btnClass += 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100';
                    } else {
                      btnClass += 'bg-ocean-ice text-textPrimary hover:bg-ocean-light/20';
                    }
                    let statusText = '';
                    if (noUnitsLeft) {
                      statusText = fullyBookedByGuests && blockedUnits === 0 ? 'Fully Booked' : 'Unavailable';
                    } else if (blockedUnits > 0) {
                      statusText = 'Partial block';
                    }
                    return (
                      <button key={slot.value} onClick={() => !disabled && handleStartTimeSelect(slot)} disabled={disabled} className={btnClass}>
                        {slot.display}
                        {statusText && <span className="block text-[9px] mt-0.5">{statusText}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : !selectedEndDate ? (
              <div>
                <div className="bg-ocean-ice rounded-xl p-3 mb-4">
                  <p className="text-sm text-textSecondary">Start Date & Time</p>
                  <p className="text-md font-semibold text-textPrimary">{selectedStartDate.toDateString()} – {selectedStartTime}</p>
                </div>
                <label className="block text-sm font-medium text-textPrimary mb-2">Select End Date</label>
                <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto mb-4">
                  {Array.from({ length: 30 }, (_, i) => {
                    const date = new Date(selectedStartDate);
                    date.setDate(date.getDate() + i);
                    const isPast = isDatePast(date);
                    const isDisabled = isPast;
                    let btnClass = 'py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ';
                    if (selectedEndDate && selectedEndDate.toDateString() === date.toDateString()) {
                      btnClass += 'bg-ocean-mid text-white';
                    } else if (isDisabled) {
                      btnClass += 'bg-gray-100 text-gray-400 cursor-not-allowed';
                    } else {
                      btnClass += 'bg-ocean-ice text-textPrimary hover:bg-ocean-light/20';
                    }
                    return (
                      <button
                        key={i}
                        onClick={() => !isDisabled && handleEndDateSelect(date)}
                        disabled={isDisabled}
                        className={btnClass}
                      >
                        {date.toDateString()}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => { setSelectedStartTime(''); setSelectedEndDate(null); setSelectedEndTime(''); }}
                  className="w-full py-2 border border-ocean-light/20 rounded-xl text-textSecondary text-sm hover:bg-ocean-ice transition"
                >
                  Back to Start Time
                </button>
              </div>
            ) : !selectedEndTime ? (
              <div>
                <div className="bg-ocean-ice rounded-xl p-3 mb-4">
                  <p className="text-sm text-textSecondary">Selected Range</p>
                  <p className="text-md font-semibold text-textPrimary">{selectedStartDate.toDateString()} {selectedStartTime} – {selectedEndDate.toDateString()}</p>
                </div>
                <label className="block text-sm font-medium text-textPrimary mb-2">Select End Time</label>
                <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto mb-4">
                  {timeSlots.map(slot => {
                    const startHour = timeSlots.find(s => s.display === selectedStartTime)?.hour;
                    let isDisabled = false;
                    if (selectedEndDate.toDateString() === selectedStartDate.toDateString() && slot.hour <= startHour) {
                      isDisabled = true;
                    }
                    // Check conflicts
                    let hasConflict = false;
                    if (!isDisabled) {
                      let currentDate = new Date(selectedStartDate);
                      const endDateObj = new Date(selectedEndDate);
                      while (currentDate <= endDateObj && !hasConflict) {
                        const dateKey = toLocalDateKey(currentDate);
                        let hourStart = (currentDate.toDateString() === selectedStartDate.toDateString()) ? startHour : 0;
                        let hourEnd = (currentDate.toDateString() === endDateObj.toDateString()) ? slot.hour : 24;
                        for (let hour = hourStart; hour < hourEnd; hour++) {
                          const blockedUnits = getAdminBlockedUnits(dateKey, hour);
                          const dh = new Date(currentDate);
                          dh.setHours(hour, 0, 0, 0);
                          const bookedCount = bookedDates[dh.toDateString()]?.times?.[`${hour}:00`] || 0;
                          if (bookedCount + blockedUnits + 1 > totalRoomUnits) {
                            hasConflict = true;
                            break;
                          }
                        }
                        currentDate.setDate(currentDate.getDate() + 1);
                        currentDate.setHours(0, 0, 0, 0);
                      }
                    }
                    let btnClass = 'py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ';
                    if (selectedEndTime === slot.display) {
                      btnClass += 'bg-ocean-mid text-white';
                    } else if (isDisabled) {
                      btnClass += 'bg-gray-100 text-gray-400 cursor-not-allowed';
                    } else if (hasConflict) {
                      btnClass += 'bg-orange-100 text-orange-700 border border-orange-200';
                    } else {
                      btnClass += 'bg-ocean-ice text-textPrimary hover:bg-ocean-light/20';
                    }
                    let statusText = '';
                    if (hasConflict) statusText = 'Conflict';
                    return (
                      <button
                        key={slot.value}
                        onClick={() => !isDisabled && !hasConflict && handleEndTimeSelect(slot)}
                        disabled={isDisabled || hasConflict}
                        className={btnClass}
                      >
                        {slot.display}
                        {statusText && <span className="block text-[9px] mt-0.5">{statusText}</span>}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => { setSelectedEndDate(null); setSelectedEndTime(''); }}
                  className="w-full py-2 border border-ocean-light/20 rounded-xl text-textSecondary text-sm hover:bg-ocean-ice transition"
                >
                  Back to End Date
                </button>
              </div>
            ) : (
              <div>
                <div className="bg-ocean-ice rounded-xl p-4 mb-4">
                  <p className="text-sm text-textSecondary">Selected Time Range</p>
                  <p className="text-md font-semibold text-textPrimary">{selectedStartDate.toDateString()} {selectedStartTime}</p>
                  <p className="text-md font-semibold text-textPrimary">to</p>
                  <p className="text-md font-semibold text-textPrimary">{selectedEndDate.toDateString()} {selectedEndTime}</p>
                </div>
                {totalRoomUnits > 0 && (
                  <>
                    <label className="block text-sm font-medium text-textPrimary mb-2">
                      Units to mark unavailable <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-textSecondary mb-2">
                      Choose how many of {totalRoomUnits} unit(s) to block for this range (remaining units stay bookable).
                    </p>
                    <select
                      value={Math.min(Math.max(1, unitsToBlock), totalRoomUnits)}
                      onChange={(e) => setUnitsToBlock(parseInt(e.target.value, 10) || 1)}
                      className="w-full px-3 py-2 border border-ocean-light/20 rounded-xl text-sm focus:outline-none focus:border-ocean-light mb-4 bg-white"
                    >
                      {Array.from({ length: totalRoomUnits }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n} unit{n !== 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </>
                )}
                <label className="block text-sm font-medium text-textPrimary mb-2">
                  Reason for blocking <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., Maintenance, Private Event, Renovation, etc."
                  rows="3"
                  className="w-full px-3 py-2 border border-ocean-light/20 rounded-xl text-sm focus:outline-none focus:border-ocean-light mb-4"
                />
                <button
                  onClick={handleMarkUnavailable}
                  disabled={actionLoading || !reason.trim() || totalRoomUnits < 1}
                  className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
                >
                  {actionLoading ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-ban mr-2"></i>}
                  Mark as Not Available
                </button>
                <button
                  onClick={() => { setSelectedEndDate(null); setSelectedEndTime(''); setReason(''); }}
                  className="w-full mt-3 py-2 border border-ocean-light/20 rounded-xl text-textSecondary text-sm hover:bg-ocean-ice transition"
                >
                  Change End Date/Time
                </button>
              </div>
            )}
          </div>

          {/* Unavailable Dates & Ranges Container */}
          <div className="bg-white rounded-2xl shadow-lg border border-ocean-light/10 p-5">
            <h3 className="text-lg font-bold text-textPrimary mb-4 flex items-center gap-2">
              <i className="fas fa-calendar-times text-orange-500"></i> Unavailable Time Ranges
            </h3>
            {unavailableRanges.length === 0 ? (
              <div className="text-center py-8 text-neutral">
                <i className="fas fa-check-circle text-3xl mb-2 block text-green-400"></i>
                <p className="text-sm">No unavailable time ranges</p>
                <p className="text-xs mt-1">All slots are available for booking</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {unavailableRanges.map((range) => (
                  <div key={range.id} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-orange-800">
                          {formatDateDisplay(range.date)}
                        </p>
                        <p className="text-xs text-orange-700 mt-0.5">
                          {formatHour(range.startHour)} – {formatHour(range.endHour)}
                          {range.unitsBlocked != null && (
                            <span className="block mt-1 text-orange-800">
                              Units blocked: {range.unitsBlocked}
                            </span>
                          )}
                          {range.unitsBlocked == null && (
                            <span className="block mt-1 text-orange-800">Units blocked: all</span>
                          )}
                        </p>
                        <p className="text-xs text-orange-600 mt-2">
                          <span className="font-medium">Reason:</span> {range.reason}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveBlock(range.id, range.date, range.startHour, range.endHour)}
                        disabled={actionLoading}
                        className="ml-2 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium transition-all duration-200 disabled:opacity-50 flex items-center gap-1"
                      >
                        <i className="fas fa-trash-alt text-xs"></i> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slideInRight { animation: slideInRight 0.3s ease-out; }
      `}</style>
    </div>
  );
}