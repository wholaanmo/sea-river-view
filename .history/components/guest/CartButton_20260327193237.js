// components/guest/CartButton.js
'use client';

import { useCart } from '@/contexts/CartContext';

export default function CartButton() {
  const { getCartItemCount, setCartOpen } = useCart();
  const itemCount = getCartItemCount();

  return (
    <button
      onClick={() => setCartOpen(true)}
      className="relative p-2 rounded-full hover:bg-ocean-ice transition-all duration-200"
    >
      <i className="fas fa-shopping-cart text-xl text-ocean-mid"></i>
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
          {itemCount > 9 ? '9+' : itemCount}
        </span>
      )}
    </button>
  );
}