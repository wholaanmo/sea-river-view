// components/admin/AdminNavbar.js
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc, collection, query, orderBy, onSnapshot, updateDoc, writeBatch, getDocs } from 'firebase/firestore';

export default function AdminNavbar({ toggleSidebar, sidebarOpen }) {
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const uid = localStorage.getItem('uid');
        if (uid) {
          const userDoc = await getDoc(doc(db, 'users', uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserName(userData.name || 'User');
            setUserRole(userData.role === 'admin' ? 'Administrator' : 'Staff');
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    fetchUserData();
  }, []);

  // Real-time listener for bank transfer requests
  useEffect(() => {
    const bankRequestsRef = collection(db, 'bank_requests');
    const q = query(bankRequestsRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const requests = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const isRead = data.read === true;
        requests.push({
          id: doc.id,
          type: 'bank_transfer',
          guestName: data.guestName,
          totalPrice: data.totalPrice,
          createdAt: data.createdAt,
          read: isRead,
          roomType: data.roomType,
          bookingId: data.bookingId
        });
      });
      setNotifications(prev => {
        const combined = [...prev.filter(n => n.type !== 'bank_transfer'), ...requests];
        combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return combined;
      });
    }, (error) => {
      console.error('Error fetching bank transfer requests:', error);
    });
    
    return () => unsubscribe();
  }, []);

  // Real-time listener for guest cancellation notifications
  useEffect(() => {
    const cancellationsRef = collection(db, 'guest_cancellations');
    const q = query(cancellationsRef, orderBy('cancelledAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const cancellations = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const isRead = data.read === true;
        cancellations.push({
          id: doc.id,
          type: 'cancellation',
          guestName: data.guestName,
          bookingId: data.bookingId,
          roomType: data.roomType,
          createdAt: data.cancelledAt,
          read: isRead,
        });
      });
      setNotifications(prev => {
        const combined = [...prev.filter(n => n.type !== 'cancellation'), ...cancellations];
        combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return combined;
      });
    }, (error) => {
      console.error('Error fetching guest cancellations:', error);
    });
    
    return () => unsubscribe();
  }, []);

  // Recalculate unread count whenever notifications change
  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  // Mark a single notification as read
  const markNotificationAsRead = async (notification) => {
    if (notification.read) return;

    try {
      const collectionName = notification.type === 'bank_transfer' ? 'bank_requests' : 'guest_cancellations';
      const docRef = doc(db, collectionName, notification.id);
      await updateDoc(docRef, { read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read when dropdown is opened
  const markAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      const batch = writeBatch(db);
      
      // Mark bank requests as read
      const bankRequestsRef = collection(db, 'bank_requests');
      const bankSnapshot = await getDocs(query(bankRequestsRef));
      bankSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.read !== true) {
          batch.update(doc.ref, { read: true });
        }
      });
      
      // Mark guest cancellations as read
      const cancellationsRef = collection(db, 'guest_cancellations');
      const cancelSnapshot = await getDocs(query(cancellationsRef));
      cancelSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.read !== true) {
          batch.update(doc.ref, { read: true });
        }
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const handleToggleNotifications = async () => {
    if (!showNotifications) {
      await markAllAsRead();
    }
    setShowNotifications(!showNotifications);
  };

  return (
    <nav 
      className="fixed right-0 h-navbar bg-white z-40 shadow-sm flex items-center transition-all duration-300 ease-in-out"
      style={{ 
        left: sidebarOpen ? '260px' : '80px',
        width: sidebarOpen ? 'calc(100% - 260px)' : 'calc(100% - 80px)',
        transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <div className="flex items-center justify-between h-full px-6 w-full">
        {/* Page Title */}
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-ocean-light to-ocean-mid rounded-full"></div>
          <h1 className="text-xl font-semibold text-ocean-deep font-playfair">
            Admin Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Role and Name Badge */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-white to-white shadow-sm border border-ocean-light/10 hover:shadow-md transition-all duration-200">
            <i className="fas fa-user-circle text-ocean-light text-base"></i>
            <span className="text-sm font-semibold text-ocean-deep">
              {userRole}: {userName}
            </span>
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={handleToggleNotifications}
              className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-white to-white text-ocean-light border border-ocean-light/10 hover:bg-gradient-to-r hover:from-ocean-light hover:to-ocean-mid hover:text-white transition-all duration-300 shadow-sm"
            >
              <i className="fas fa-bell text-base"></i>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-ocean-light/20 overflow-hidden z-50">
                <div className="bg-gradient-to-r from-ocean-mid to-ocean-light px-4 py-3">
                  <h3 className="text-white font-semibold text-sm">
                    Notifications
                    {unreadCount > 0 && (
                      <span className="ml-2 bg-white text-ocean-mid text-xs px-2 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-textSecondary text-sm">
                      <i className="fas fa-bell-slash text-2xl mb-2 block opacity-50"></i>
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        onClick={() => markNotificationAsRead(notification)}
                        className={`border-b border-ocean-light/10 p-4 hover:bg-ocean-ice/30 transition-colors cursor-pointer ${!notification.read ? 'bg-ocean-ice/10' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            notification.type === 'bank_transfer' ? 'bg-amber-100' : 'bg-red-100'
                          }`}>
                            <i className={`${
                              notification.type === 'bank_transfer' ? 'fas fa-university text-amber-600' : 'fas fa-times-circle text-red-600'
                            } text-sm`}></i>
                          </div>
                          <div className="flex-1">
                            {notification.type === 'bank_transfer' ? (
                              <>
                                <p className="text-sm font-semibold text-textPrimary">
                                  Bank Transfer Request
                                </p>
                                <p className="text-xs text-textSecondary mt-1">
                                  {notification.guestName} requested bank transfer for {notification.roomType || 'room'}
                                </p>
                                <p className="text-xs text-ocean-mid mt-1 font-medium">
                                  ₱{notification.totalPrice?.toLocaleString()}
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="text-sm font-semibold text-textPrimary">
                                  Guest Cancellation
                                </p>
                                <p className="text-xs text-textSecondary mt-1">
                                  {notification.guestName} cancelled reservation {notification.bookingId} ({notification.roomType})
                                </p>
                              </>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {/* Removed "Go to Payment Settings" footer */}
              </div>
            )}
          </div>
          
          {/* Hamburger Menu Button */}
          <button
            onClick={toggleSidebar}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-white to-white text-ocean-light border border-ocean-light/10 hover:bg-gradient-to-r hover:from-ocean-light hover:to-ocean-mid hover:text-white transition-all duration-300 hover:rotate-180 shadow-sm"
          >
            <span className="material-icons">menu</span>
          </button>
        </div>
      </div>
    </nav>
  );
}