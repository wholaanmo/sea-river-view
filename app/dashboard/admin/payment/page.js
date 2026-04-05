// app/dashboard/admin/payment/page.js
'use client';

import { useState, useEffect } from 'react';
import { db } from '../../../../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, collection, query, orderBy, where, addDoc, deleteDoc } from 'firebase/firestore';
import { uploadImage } from '../../../../lib/cloudinary';
import { logAdminAction } from '../../../../lib/auditLogger';
import Image from 'next/image';

export default function AdminPaymentPage() {
  const [gcashQRCode, setGcashQRCode] = useState('');
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingQR, setUploadingQR] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [bankTransferRequests, setBankTransferRequests] = useState([]);
  const [dayTourBankRequests, setDayTourBankRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showBankDetailsModal, setShowBankDetailsModal] = useState(false);
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [editingBank, setEditingBank] = useState(null);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [bankToArchive, setBankToArchive] = useState(null);
  const [activeRequestsTab, setActiveRequestsTab] = useState('room'); // 'room' or 'daytour'
  const [tempBankDetails, setTempBankDetails] = useState({
    bankName: '',
    accountName: '',
    accountNumber: ''
  });

  // Fetch payment settings
  useEffect(() => {
    const fetchPaymentSettings = async () => {
      try {
        const settingsRef = doc(db, 'settings', 'payment');
        const settingsDoc = await getDoc(settingsRef);
        
        if (settingsDoc.exists()) {
          const data = settingsDoc.data();
          setGcashQRCode(data.gcashQRCode || '');
          setBankAccounts(data.bankAccounts || []);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching payment settings:', error);
        setLoading(false);
      }
    };
    
    fetchPaymentSettings();
  }, []);

  // Real-time listener for room bank transfer requests
  useEffect(() => {
    const bankRequestsRef = collection(db, 'bank_requests');
    const q = query(
      bankRequestsRef,
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const requests = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        requests.push({
          id: doc.id,
          ...data
        });
      });
      setBankTransferRequests(requests);
    }, (error) => {
      console.error('Error fetching bank transfer requests:', error);
    });
    
    return () => unsubscribe();
  }, []);

  // Real-time listener for DAY TOUR bank transfer requests (separate collection)
  useEffect(() => {
    const dayTourBankRequestsRef = collection(db, 'daytour_bank_requests');
    const q = query(
      dayTourBankRequestsRef,
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const requests = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        requests.push({
          id: doc.id,
          ...data
        });
      });
      setDayTourBankRequests(requests);
    }, (error) => {
      console.error('Error fetching day tour bank transfer requests:', error);
    });
    
    return () => unsubscribe();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 4000);
  };

  const handleGCashQRUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingQR(true);
    try {
      const qrCodeUrl = await uploadImage(file);
      
      const settingsRef = doc(db, 'settings', 'payment');
      await setDoc(settingsRef, {
        gcashQRCode: qrCodeUrl,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      setGcashQRCode(qrCodeUrl);
      
      await logAdminAction({
        action: 'Updated GCash QR Code',
        module: 'Payment Settings',
        details: 'Admin updated the GCash payment QR code'
      });
      
      showNotification('GCash QR code uploaded successfully!');
    } catch (error) {
      console.error('Error uploading QR code:', error);
      showNotification('Failed to upload QR code.', 'error');
    } finally {
      setUploadingQR(false);
    }
  };

  const handleRemoveGCashQR = async () => {
    try {
      const settingsRef = doc(db, 'settings', 'payment');
      await updateDoc(settingsRef, {
        gcashQRCode: ''
      });
      
      setGcashQRCode('');
      
      await logAdminAction({
        action: 'Removed GCash QR Code',
        module: 'Payment Settings',
        details: 'Admin removed the GCash payment QR code'
      });
      
      showNotification('GCash QR code removed successfully!');
    } catch (error) {
      console.error('Error removing QR code:', error);
      showNotification('Failed to remove QR code.', 'error');
    }
  };

  const handleAddBankAccount = async () => {
    if (!tempBankDetails.bankName || !tempBankDetails.accountName || !tempBankDetails.accountNumber) {
      showNotification('Please fill in all bank details', 'error');
      return;
    }
    
    setSaving(true);
    try {
      const settingsRef = doc(db, 'settings', 'payment');
      const newBankAccount = {
        id: Date.now().toString(),
        ...tempBankDetails,
        createdAt: new Date().toISOString()
      };
      
      const updatedBankAccounts = [...bankAccounts, newBankAccount];
      
      await setDoc(settingsRef, {
        bankAccounts: updatedBankAccounts,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      setBankAccounts(updatedBankAccounts);
      
      await logAdminAction({
        action: 'Added Bank Account',
        module: 'Payment Settings',
        details: `Admin added bank account: ${tempBankDetails.bankName} - ${tempBankDetails.accountName}`
      });
      
      showNotification('Bank account added successfully!');
      setShowAddBankModal(false);
      setTempBankDetails({ bankName: '', accountName: '', accountNumber: '' });
    } catch (error) {
      console.error('Error adding bank account:', error);
      showNotification('Failed to add bank account.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateBankAccount = async () => {
    if (!tempBankDetails.bankName || !tempBankDetails.accountName || !tempBankDetails.accountNumber) {
      showNotification('Please fill in all bank details', 'error');
      return;
    }
    
    setSaving(true);
    try {
      const settingsRef = doc(db, 'settings', 'payment');
      const updatedBankAccounts = bankAccounts.map(account => 
        account.id === editingBank.id 
          ? { ...account, ...tempBankDetails, updatedAt: new Date().toISOString() }
          : account
      );
      
      await setDoc(settingsRef, {
        bankAccounts: updatedBankAccounts,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      setBankAccounts(updatedBankAccounts);
      
      await logAdminAction({
        action: 'Updated Bank Account',
        module: 'Payment Settings',
        details: `Admin updated bank account: ${tempBankDetails.bankName} - ${tempBankDetails.accountName}`
      });
      
      showNotification('Bank account updated successfully!');
      setShowAddBankModal(false);
      setEditingBank(null);
      setTempBankDetails({ bankName: '', accountName: '', accountNumber: '' });
    } catch (error) {
      console.error('Error updating bank account:', error);
      showNotification('Failed to update bank account.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleArchiveBankAccount = async () => {
    if (!bankToArchive) return;
    
    setSaving(true);
    try {
      const settingsRef = doc(db, 'settings', 'payment');
      const updatedBankAccounts = bankAccounts.filter(account => account.id !== bankToArchive.id);
      
      await setDoc(settingsRef, {
        bankAccounts: updatedBankAccounts,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      const archivedRef = collection(db, 'archived_bank_accounts');
      await addDoc(archivedRef, {
        ...bankToArchive,
        archivedAt: new Date().toISOString(),
        archivedBy: 'admin'
      });
      
      setBankAccounts(updatedBankAccounts);
      
      await logAdminAction({
        action: 'Archived Bank Account',
        module: 'Payment Settings',
        details: `Archived bank account: ${bankToArchive.bankName} - ${bankToArchive.accountName}`
      });
      
      showNotification('Bank account archived successfully!');
      setShowArchiveModal(false);
      setBankToArchive(null);
    } catch (error) {
      console.error('Error archiving bank account:', error);
      showNotification('Failed to archive bank account.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const openEditBankModal = (account) => {
    setEditingBank(account);
    setTempBankDetails({
      bankName: account.bankName,
      accountName: account.accountName,
      accountNumber: account.accountNumber
    });
    setShowAddBankModal(true);
  };

  const openArchiveModal = (account) => {
    setBankToArchive(account);
    setShowArchiveModal(true);
  };

  const openBankDetailsModal = (request, type = 'room') => {
    if (request.status === 'completed') {
      showNotification('Bank details already provided for this request.', 'error');
      return;
    }
    setSelectedRequest({ ...request, requestType: type });
    setShowBankDetailsModal(true);
  };

  // Handle providing bank details for Day Tour requests
  const handleProvideBankDetails = async (selectedBankAccount) => {
    if (!selectedRequest) return;
    
    setSaving(true);
    try {
      const isDayTour = selectedRequest.requestType === 'daytour';
      const collectionName = isDayTour ? 'daytour_bank_requests' : 'bank_requests';
      const bankRequestRef = doc(db, collectionName, selectedRequest.id);
      
      await updateDoc(bankRequestRef, {
        status: 'completed',
        providedBankDetails: {
          bankName: selectedBankAccount.bankName,
          accountName: selectedBankAccount.accountName,
          accountNumber: selectedBankAccount.accountNumber,
          providedAt: new Date().toISOString()
        },
        updatedAt: new Date().toISOString()
      });
      
      await logAdminAction({
        action: 'Provided Bank Details',
        module: isDayTour ? 'Day Tour Payment Settings' : 'Payment Settings',
        details: `Provided bank details to guest: ${selectedRequest.guestName} for ${isDayTour ? 'day tour' : 'room'} booking`
      });
      
      showNotification('Bank details provided to guest successfully!');
      setShowBankDetailsModal(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error providing bank details:', error);
      showNotification('Failed to provide bank details.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = new Date(timestamp);
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <div className="p-8 min-h-screen" style={{ backgroundColor: 'var(--color-blue-white)' }}>
        <div className="flex justify-center items-center h-64">
          <i className="fas fa-spinner fa-spin text-3xl text-ocean-light"></i>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen" style={{ backgroundColor: 'var(--color-blue-white)' }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-textPrimary font-playfair mb-2">
          Payment Settings
        </h1>
        <p className="text-textSecondary">
          Manage GCash QR code and bank account details for guest payments
        </p>
      </div>

      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-20 right-5 z-50 px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-slideInRight ${
          notification.type === 'error' ? 'bg-red-50 border-l-4 border-red-500 text-red-700' : 'bg-green-50 border-l-4 border-green-500 text-green-700'
        }`}>
          <i className={`${notification.type === 'error' ? 'fas fa-exclamation-circle text-red-500' : 'fas fa-check-circle text-green-500'} text-base`}></i>
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* GCash Settings */}
        <div className="bg-white rounded-2xl shadow-md border border-ocean-light/10 overflow-hidden">
          <div className="bg-gradient-to-r from-ocean-mid to-ocean-light px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <i className="fab fa-gcash"></i>
              GCash Settings
            </h2>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
              <label className="block text-sm font-semibold text-textPrimary mb-3">
                GCash QR Code
              </label>
              
              {gcashQRCode ? (
                <div className="relative inline-block">
                  <div className="w-48 h-48 bg-white rounded-xl border border-ocean-light/20 overflow-hidden relative">
                    <Image
                      src={gcashQRCode}
                      alt="GCash QR Code"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <button
                    onClick={handleRemoveGCashQR}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all duration-200"
                  >
                    <i className="fas fa-times text-sm"></i>
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-ocean-light/20 rounded-xl p-8 text-center hover:border-ocean-light transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleGCashQRUpload}
                    disabled={uploadingQR}
                    className="hidden"
                    id="gcash-qr-upload"
                  />
                  <label
                    htmlFor="gcash-qr-upload"
                    className="cursor-pointer flex flex-col items-center gap-3"
                  >
                    <i className={`fas ${uploadingQR ? 'fa-spinner fa-spin' : 'fa-qrcode'} text-5xl text-ocean-light`}></i>
                    <span className="text-sm text-textSecondary">
                      {uploadingQR ? 'Uploading...' : 'Click to upload GCash QR code'}
                    </span>
                    <span className="text-xs text-neutral">PNG, JPG up to 5MB</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bank Account Settings */}
        <div className="bg-white rounded-2xl shadow-md border border-ocean-light/10 overflow-hidden">
          <div className="bg-gradient-to-r from-ocean-mid to-ocean-light px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <i className="fas fa-university"></i>
              Bank Accounts
            </h2>
            <button
              onClick={() => {
                setEditingBank(null);
                setTempBankDetails({ bankName: '', accountName: '', accountNumber: '' });
                setShowAddBankModal(true);
              }}
              className="px-3 py-1.5 bg-white text-ocean-mid rounded-lg text-sm font-medium hover:bg-ocean-ice transition-all duration-200"
            >
              <i className="fas fa-plus mr-1"></i> Add Account
            </button>
          </div>
          
          <div className="p-6">
            {bankAccounts.length === 0 ? (
              <div className="text-center py-8">
                <i className="fas fa-university text-4xl text-ocean-light/30 mb-2"></i>
                <p className="text-textSecondary">No bank accounts added yet</p>
                <button
                  onClick={() => {
                    setEditingBank(null);
                    setTempBankDetails({ bankName: '', accountName: '', accountNumber: '' });
                    setShowAddBankModal(true);
                  }}
                  className="mt-3 text-sm text-ocean-mid hover:underline"
                >
                  Add your first bank account
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {bankAccounts.map((account) => (
                  <div key={account.id} className="border border-ocean-light/20 rounded-lg p-4 hover:shadow-md transition-all duration-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-textPrimary">{account.bankName}</p>
                        <p className="text-sm text-textSecondary mt-1">{account.accountName}</p>
                        <p className="text-sm text-textSecondary">{account.accountNumber}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditBankModal(account)}
                          className="p-2 text-ocean-mid hover:bg-ocean-ice rounded-lg transition-all duration-200"
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => openArchiveModal(account)}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-all duration-200"
                          title="Archive"
                        >
                          <i className="fas fa-archive"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bank Transfer Requests Section with Tabs */}
      <div className="mt-8 bg-white rounded-2xl shadow-md border border-ocean-light/10 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <i className="fas fa-clock"></i>
            Bank Transfer Requests
          </h2>
        </div>
        
        {/* Tabs for Room vs Day Tour */}
        <div className="flex border-b border-ocean-light/20 px-6 pt-4">
          <button
            onClick={() => setActiveRequestsTab('room')}
            className={`px-4 py-2 font-medium transition-all duration-200 ${
              activeRequestsTab === 'room'
                ? 'text-ocean-mid border-b-2 border-ocean-mid'
                : 'text-textSecondary hover:text-ocean-mid'
            }`}
          >
            <i className="fas fa-bed mr-2"></i>
            Room Bookings
            {bankTransferRequests.length > 0 && (
              <span className="ml-2 bg-ocean-ice text-ocean-mid text-xs px-2 py-0.5 rounded-full">
                {bankTransferRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveRequestsTab('daytour')}
            className={`px-4 py-2 font-medium transition-all duration-200 ${
              activeRequestsTab === 'daytour'
                ? 'text-ocean-mid border-b-2 border-ocean-mid'
                : 'text-textSecondary hover:text-ocean-mid'
            }`}
          >
            <i className="fas fa-sun mr-2"></i>
            Day Tour Bookings
            {dayTourBankRequests.length > 0 && (
              <span className="ml-2 bg-ocean-ice text-ocean-mid text-xs px-2 py-0.5 rounded-full">
                {dayTourBankRequests.length}
              </span>
            )}
          </button>
        </div>
        
        <div className="p-6">
          {/* Room Bookings Requests */}
          {activeRequestsTab === 'room' && (
            <>
              {bankTransferRequests.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fas fa-check-circle text-5xl text-green-300 mb-3"></i>
                  <p className="text-textSecondary">No bank transfer requests for room bookings</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bankTransferRequests.map((request) => {
                    const isCompleted = request.status === 'completed';

                    return (
                      <div key={request.id} className="border border-ocean-light/20 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="font-semibold text-textPrimary">
                                {request.guestName}
                              </p>
                              <span className="text-xs text-gray-400">
                                {getTimeAgo(request.createdAt)}
                              </span>
                              {isCompleted && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                  Completed
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-textSecondary">{request.guestEmail}</p>
                            <p className="text-sm text-textSecondary">{request.guestPhone}</p>
                            <p className="text-sm font-medium text-ocean-mid mt-2">
                              Room: {request.roomType}
                            </p>
                            <p className="text-sm text-textSecondary">
                              Total Amount: ₱{request.totalPrice?.toLocaleString()}
                            </p>
                            <p className="text-sm font-semibold text-amber-600 mt-1">
                              Down Payment Required (50%): ₱{request.downPayment?.toLocaleString()}
                            </p>
                            {request.requestedBank && (
                              <p className="text-sm text-amber-600 mt-1">
                                <i className="fas fa-university mr-1"></i>
                                Selected Bank: {request.requestedBank.bankName}
                              </p>
                            )}
                            {isCompleted && request.providedBankDetails && (
                              <div className="mt-2 text-xs text-green-600 bg-green-50 p-2 rounded">
                                <i className="fas fa-check-circle mr-1"></i>
                                Bank details provided: {request.providedBankDetails.bankName} - {request.providedBankDetails.accountName}
                              </div>
                            )}
                          </div>
                          {!isCompleted ? (
                            <button
                              onClick={() => openBankDetailsModal(request, 'room')}
                              className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-all duration-200"
                            >
                              Provide Bank Details
                            </button>
                          ) : (
                            <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium flex items-center gap-1">
                              <i className="fas fa-check-circle"></i>
                              Already Provided
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Day Tour Bookings Requests */}
          {activeRequestsTab === 'daytour' && (
            <>
              {dayTourBankRequests.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fas fa-sun text-5xl text-amber-300 mb-3"></i>
                  <p className="text-textSecondary">No bank transfer requests for day tour bookings</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dayTourBankRequests.map((request) => {
                    const isCompleted = request.status === 'completed';

                    return (
                      <div key={request.id} className="border border-ocean-light/20 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="font-semibold text-textPrimary">
                                {request.guestName}
                              </p>
                              <span className="text-xs text-gray-400">
                                {getTimeAgo(request.createdAt)}
                              </span>
                              {isCompleted && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                  Completed
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-textSecondary">{request.guestEmail}</p>
                            <p className="text-sm text-textSecondary">{request.guestPhone}</p>
                            <p className="text-sm text-textSecondary">
                              Selected Date: {request.selectedDate}
                            </p>
                            <p className="text-sm text-textSecondary">
                              Total Amount: ₱{request.totalAmount?.toLocaleString()}
                            </p>
                            <p className="text-sm font-semibold text-amber-600 mt-1">
                              Down Payment Required (50%): ₱{request.downPaymentRequired?.toLocaleString()}
                            </p>
                            {request.requestedBank && (
                              <p className="text-sm text-amber-600 mt-1">
                                <i className="fas fa-university mr-1"></i>
                                Selected Bank: {request.requestedBank.bankName}
                              </p>
                            )}
                            {isCompleted && request.providedBankDetails && (
                              <div className="mt-2 text-xs text-green-600 bg-green-50 p-2 rounded">
                                <i className="fas fa-check-circle mr-1"></i>
                                Bank details provided: {request.providedBankDetails.bankName} - {request.providedBankDetails.accountName}
                              </div>
                            )}
                          </div>
                          {!isCompleted ? (
                            <button
                              onClick={() => openBankDetailsModal(request, 'daytour')}
                              className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-all duration-200"
                            >
                              Provide Bank Details
                            </button>
                          ) : (
                            <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium flex items-center gap-1">
                              <i className="fas fa-check-circle"></i>
                              Already Provided
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add/Edit Bank Account Modal */}
      {showAddBankModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAddBankModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-textPrimary font-playfair">
                {editingBank ? 'Edit Bank Account' : 'Add Bank Account'}
              </h2>
              <button
                onClick={() => setShowAddBankModal(false)}
                className="w-8 h-8 rounded-full bg-ocean-ice hover:bg-ocean-light/20 text-neutral hover:text-textPrimary transition-all duration-200 flex items-center justify-center"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-textPrimary mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={tempBankDetails.bankName}
                  onChange={(e) => setTempBankDetails(prev => ({ ...prev, bankName: e.target.value }))}
                  placeholder="e.g., BDO, BPI, Metrobank"
                  className="w-full px-4 py-2.5 border border-ocean-light/20 rounded-xl text-sm focus:outline-none focus:border-ocean-light"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-textPrimary mb-2">
                  Account Name
                </label>
                <input
                  type="text"
                  value={tempBankDetails.accountName}
                  onChange={(e) => setTempBankDetails(prev => ({ ...prev, accountName: e.target.value }))}
                  placeholder="Account holder's name"
                  className="w-full px-4 py-2.5 border border-ocean-light/20 rounded-xl text-sm focus:outline-none focus:border-ocean-light"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-textPrimary mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  value={tempBankDetails.accountNumber}
                  onChange={(e) => setTempBankDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
                  placeholder="Account number"
                  className="w-full px-4 py-2.5 border border-ocean-light/20 rounded-xl text-sm focus:outline-none focus:border-ocean-light"
                />
              </div>
            </div>
            
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setShowAddBankModal(false)}
                className="px-5 py-2.5 border border-ocean-light/20 rounded-xl text-textSecondary text-sm font-medium hover:bg-ocean-ice transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={editingBank ? handleUpdateBankAccount : handleAddBankAccount}
                disabled={saving}
                className="px-5 py-2.5 bg-gradient-to-r from-ocean-mid to-ocean-light rounded-xl text-white text-sm font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50"
              >
                {saving ? 'Saving...' : (editingBank ? 'Update' : 'Add')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Confirmation Modal */}
      {showArchiveModal && bankToArchive && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <div className="text-center mb-5">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-amber-100 flex items-center justify-center">
                <i className="fas fa-archive text-amber-600 text-2xl"></i>
              </div>
              <h3 className="text-lg font-bold text-textPrimary mb-2">Archive Bank Account</h3>
              <p className="text-textSecondary text-sm">
                Are you sure you want to archive "{bankToArchive.bankName}"? 
                This account will be moved to the archive and won't be available for new bank transfer requests.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowArchiveModal(false)}
                className="px-5 py-2 border border-ocean-light/20 rounded-xl text-textSecondary text-sm font-medium hover:bg-ocean-ice transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleArchiveBankAccount}
                disabled={saving}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl text-white text-sm font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                {saving ? 'Archiving...' : 'Archive'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bank Details Modal - Select which bank account to provide */}
      {showBankDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowBankDetailsModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-textPrimary font-playfair">
                Select Bank Account
              </h2>
              <button
                onClick={() => setShowBankDetailsModal(false)}
                className="w-8 h-8 rounded-full bg-ocean-ice hover:bg-ocean-light/20 text-neutral hover:text-textPrimary transition-all duration-200 flex items-center justify-center"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-textSecondary mb-3">
                Guest: <strong>{selectedRequest.guestName}</strong>
              </p>
              <p className="text-sm text-textSecondary mb-2">
                Email: {selectedRequest.guestEmail}
              </p>
              <p className="text-sm text-textSecondary mb-4">
                Phone: {selectedRequest.guestPhone}
              </p>
              <p className="text-sm text-amber-600 mb-4">
                <i className="fas fa-info-circle mr-1"></i>
                Payment Method: Bank Transfer ({selectedRequest.requestType === 'daytour' ? 'Day Tour' : 'Room Booking'})
              </p>
              {selectedRequest.requestedBank && (
                <p className="text-sm text-textSecondary mb-4">
                  Requested Bank: <strong>{selectedRequest.requestedBank.bankName}</strong>
                </p>
              )}
              {selectedRequest.selectedDate && (
                <p className="text-sm text-textSecondary mb-4">
                  Selected Date: <strong>{selectedRequest.selectedDate}</strong>
                </p>
              )}
            </div>
            
            {bankAccounts.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-textSecondary mb-3">No bank accounts available. Please add a bank account first.</p>
                <button
                  onClick={() => {
                    setShowBankDetailsModal(false);
                    setEditingBank(null);
                    setTempBankDetails({ bankName: '', accountName: '', accountNumber: '' });
                    setShowAddBankModal(true);
                  }}
                  className="px-4 py-2 bg-ocean-mid text-white rounded-lg text-sm font-medium"
                >
                  Add Bank Account
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {bankAccounts.map((account) => (
                  <button
                    key={account.id}
                    onClick={() => handleProvideBankDetails(account)}
                    disabled={saving}
                    className="w-full text-left border border-ocean-light/20 rounded-lg p-4 hover:bg-ocean-ice transition-all duration-200"
                  >
                    <p className="font-semibold text-textPrimary">{account.bankName}</p>
                    <p className="text-sm text-textSecondary mt-1">{account.accountName}</p>
                    <p className="text-sm text-textSecondary">{account.accountNumber}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}