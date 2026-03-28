// contexts/CartContext.js
'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('roomBookingCart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error loading cart:', e);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('roomBookingCart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (room, nights, guests, checkIn, checkOut) => {
    const cartItem = {
      id: `${room.id}-${Date.now()}`,
      roomId: room.id,
      roomType: room.type,
      price: room.price,
      maxCapacity: room.capacity,
      nights,
      guests,
      checkIn: checkIn ? checkIn.toISOString() : null,
      checkOut: checkOut ? checkOut.toISOString() : null,
      totalPrice: room.price * nights,
      images: room.images || []
    };
    
    setCartItems(prev => [...prev, cartItem]);
    setCartOpen(true);
  };

  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateCartItem = (itemId, updates) => {
    setCartItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, ...updates, totalPrice: (updates.price || item.price) * (updates.nights || item.nights) }
        : item
    ));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.totalPrice, 0);
  };

  const getCartItemCount = () => {
    return cartItems.length;
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      cartOpen,
      setCartOpen,
      addToCart,
      removeFromCart,
      updateCartItem,
      clearCart,
      getCartTotal,
      getCartItemCount
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}