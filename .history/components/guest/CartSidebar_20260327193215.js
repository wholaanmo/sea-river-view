// components/guest/CartSidebar.js
'use client';

import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function CartSidebar() {
  const { cartItems, cartOpen, setCartOpen, removeFromCart, getCartTotal } = useCart();
  const router = useRouter();

  const handleCheckout = () => {
    setCartOpen(false);
    router.push('/rooms/cart-checkout');
  };

  const handleContinueBooking = () => {
    setCartOpen(false);
  };

  if (!cartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={() => setCartOpen(false)}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center p-5 border-b border-ocean-light/20">
            <h2 className="text-xl font-bold text-textPrimary font-playfair">
              Your Cart ({cartItems.length})
            </h2>
            <button
              onClick={() => setCartOpen(false)}
              className="w-8 h-8 rounded-full bg-ocean-ice hover:bg-ocean-light/20 flex items-center justify-center transition-all"
            >
              <i className="fas fa-times text-neutral"></i>
            </button>
          </div>
          
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-shopping-cart text-5xl text-ocean-light/30 mb-3"></i>
                <p className="text-textSecondary">Your cart is empty</p>
                <button
                  onClick={() => setCartOpen(false)}
                  className="mt-4 px-4 py-2 bg-ocean-mid text-white rounded-lg text-sm"
                >
                  Continue Browsing
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className="border border-ocean-light/20 rounded-xl p-4 hover:shadow-md transition-all">
                  <div className="flex gap-3">
                    {/* Image */}
                    <div className="w-20 h-20 rounded-lg bg-ocean-ice overflow-hidden flex-shrink-0">
                      {item.images && item.images[0] ? (
                        <div className="relative w-full h-full">
                          <Image
                            src={item.images[0]}
                            alt={item.roomType}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <i className="fas fa-hotel text-2xl text-ocean-light/30"></i>
                        </div>
                      )}
                    </div>
                    
                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-textPrimary">{item.roomType}</h3>
                          <p className="text-xs text-textSecondary mt-1">
                            <i className="fas fa-users mr-1"></i>{item.guests} Guest(s)
                          </p>
                          <p className="text-xs text-textSecondary">
                            <i className="fas fa-calendar mr-1"></i>{item.nights} Night(s)
                          </p>
                          {item.checkIn && (
                            <p className="text-xs text-textSecondary mt-1">
                              <i className="fas fa-calendar-check mr-1"></i>
                              {new Date(item.checkIn).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-ocean-mid">₱{item.totalPrice.toLocaleString()}</p>
                          <p className="text-xs text-textSecondary">₱{item.price.toLocaleString()}/night</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="mt-2 text-xs text-red-500 hover:text-red-600 transition-colors"
                      >
                        <i className="fas fa-trash-alt mr-1"></i> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t border-ocean-light/20 p-5 space-y-3">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total</span>
                <span className="text-ocean-mid">₱{getCartTotal().toLocaleString()}</span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full py-3 bg-gradient-to-r from-ocean-mid to-ocean-light text-white rounded-xl font-medium hover:shadow-lg transition-all"
              >
                Proceed to Checkout
              </button>
              <button
                onClick={handleContinueBooking}
                className="w-full py-3 border border-ocean-light/20 rounded-xl text-textSecondary font-medium hover:bg-ocean-ice transition-all"
              >
                Continue Booking
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}