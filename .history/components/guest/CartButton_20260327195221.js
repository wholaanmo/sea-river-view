// components/guest/CartButton.js
'use client';

import { useContext } from 'react';
import { CartContext } from '@/contexts/CartContext';

export default function CartButton() {
  const context = useContext(CartContext);
  
  // If cart context is not available, return a disabled button
  if (!context) {
    return (
      <button
        onClick={() => {}}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
        disabled
      >
        <i className="fas fa-shopping-cart text-xl text-gray-700"></i>
      </button>
    );
  }

  const { getCartItemCount, setCartOpen } = context;
  const itemCount = getCartItemCount();

  return (
    <button
      onClick={() => setCartOpen(true)}
      className="relative p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
    >
      <i className="fas fa-shopping-cart text-xl text-gray-700"></i>
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
          {itemCount > 9 ? '9+' : itemCount}
        </span>
      )}
    </button>
  );
}