// components/guest/MultiBookingModal.js
'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';

export default function MultiBookingModal({ room, isOpen, onClose }) {
  const [nights, setNights] = useState(1);
  const [guests, setGuests] = useState(1);
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [totalPrice, setTotalPrice] = useState(room.price);
  const [errors, setErrors] = useState({});
  
  const { addToCart } = useCart();

  useEffect(() => {
    if (checkInDate && nights) {
      const checkOut = new Date(checkInDate);
      checkOut.setDate(checkOut.getDate() + nights);
      setCheckOutDate(checkOut);
      setTotalPrice(room.price * nights);
    }
  }, [checkInDate, nights, room.price]);

  const validateGuests = () => {
    if (guests > room.capacity) {
      setErrors({ guests: `Maximum ${room.capacity} guests allowed` });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleAddToCart = () => {
    if (!validateGuests()) return;
    if (!checkInDate) {
      setErrors({ checkIn: 'Please select check-in date' });
      return;
    }
    
    addToCart(room, nights, guests, checkInDate, checkOutDate);
    onClose();
    // Reset form
    setNights(1);
    setGuests(1);
    setCheckInDate(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-textPrimary font-playfair">
            Add to Cart - {room.type}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-ocean-ice hover:bg-ocean-light/20 flex items-center justify-center"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Check-in Date */}
          <div>
            <label className="block text-sm font-semibold text-textPrimary mb-2">
              Check-in Date
            </label>
            <input
              type="date"
              value={checkInDate ? checkInDate.toISOString().split('T')[0] : ''}
              onChange={(e) => setCheckInDate(e.target.value ? new Date(e.target.value) : null)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-ocean-light/20 rounded-lg focus:outline-none focus:border-ocean-light"
            />
            {errors.checkIn && <p className="text-red-500 text-sm mt-1">{errors.checkIn}</p>}
          </div>
          
          {/* Nights */}
          <div>
            <label className="block text-sm font-semibold text-textPrimary mb-2">
              Number of Nights
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={nights}
              onChange={(e) => setNights(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-ocean-light/20 rounded-lg focus:outline-none focus:border-ocean-light"
            />
          </div>
          
          {/* Guests */}
          <div>
            <label className="block text-sm font-semibold text-textPrimary mb-2">
              Number of Guests
            </label>
            <input
              type="number"
              min="1"
              max={room.capacity}
              value={guests}
              onChange={(e) => setGuests(parseInt(e.target.value))}
              className={`w-full px-4 py-2 border ${errors.guests ? 'border-red-500' : 'border-ocean-light/20'} rounded-lg focus:outline-none focus:border-ocean-light`}
            />
            {errors.guests && <p className="text-red-500 text-sm mt-1">{errors.guests}</p>}
            <p className="text-xs text-textSecondary mt-1">Maximum capacity: {room.capacity} guests</p>
          </div>
          
          {/* Check-out Date Display */}
          {checkOutDate && (
            <div className="p-3 bg-ocean-ice rounded-lg">
              <p className="text-sm text-textPrimary">
                <span className="font-semibold">Check-out:</span>{' '}
                {checkOutDate.toLocaleDateString()}
              </p>
            </div>
          )}
          
          {/* Total Price */}
          <div className="p-3 bg-gradient-to-r from-ocean-ice to-blue-white rounded-lg">
            <p className="text-sm font-semibold text-textPrimary">Total Price</p>
            <p className="text-2xl font-bold text-ocean-mid">₱{totalPrice.toLocaleString()}</p>
            <p className="text-xs text-textSecondary">₱{room.price.toLocaleString()} x {nights} night(s)</p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-ocean-light/20 rounded-xl text-textSecondary font-medium hover:bg-ocean-ice transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleAddToCart}
              className="flex-1 py-2.5 bg-gradient-to-r from-ocean-mid to-ocean-light text-white rounded-xl font-medium hover:shadow-lg transition-all"
            >
              <i className="fas fa-cart-plus mr-2"></i>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}