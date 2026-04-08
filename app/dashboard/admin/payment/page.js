// app/dashboard/admin/payment/page.js
'use client';

import { useState, useEffect } from 'react';
import { db } from '../../../../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, collection, query, orderBy, where, addDoc, deleteDoc, getDocs } from 'firebase/firestore';
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
  const [activeRequestsTab, setActiveRequestsTab] = useState('room');
  const [tempBankDetails, setTempBankDetails] = useState({
    bankName: '',
    accountName: '',
    accountNumber: ''
  });
  const [showEditQRModal, setShowEditQRModal] = useState(false);
  const [tempQRFile, setTempQRFile] = useState(null);
  const [tempQRPreview, setTempQRPreview] = useState('');
  const [viewedRoomRequests, setViewedRoomRequests] = useState(new Set());
  const [viewedDayTourRequests, setViewedDayTourRequests] = useState(new Set());
  const [hasBankChanges, setHasBankChanges] = useState(false);
  const [originalBankDetails, setOriginalBankDetails] = useState(null);
  const [selectedBankForRequest, setSelectedBankForRequest] = useState(null);
  const [showArchiveQRModal, setShowArchiveQRModal] = useState(false);
  const [archivingQR, setArchivingQR] = useState(false);
  const [requestsSearchTerm, setRequestsSearchTerm] = useState('');

  // Fetch payment settings
 useEffect(() => {
  const fetchPaymentSettings = async () => {
    try {
      const settingsRef = doc(db, 'settings', 'payment');
      const settingsDoc = await getDoc(settingsRef);
      
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        setGcashQRCode(data.gcashQRCode || '');
      }
      
      // Fetch bank accounts from bank_accounts collection (only non-archived ones)
      const bankAccountsRef = collection(db, 'bank_accounts');
      const q = query(bankAccountsRef, where('archived', '==', false));
      const bankAccountsSnapshot = await getDocs(q);
      const bankAccountsList = [];
      bankAccountsSnapshot.forEach((doc) => {
        bankAccountsList.push(doc.data());
      });
      setBankAccounts(bankAccountsList);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching payment settings:', error);
      setLoading(false);
    }
  };
  
  fetchPaymentSettings();
}, []);

  // Load viewed requests from localStorage
  useEffect(() => {
    const storedViewedRoom = localStorage.getItem('viewedRoomRequests');
    const storedViewedDayTour = localStorage.getItem('viewedDayTourRequests');
    if (storedViewedRoom) {
      setViewedRoomRequests(new Set(JSON.parse(storedViewedRoom)));
    }
    if (storedViewedDayTour) {
      setViewedDayTourRequests(new Set(JSON.parse(storedViewedDayTour)));
    }
  }, []);

  // Save viewed requests to localStorage
  const markRoomRequestsAsViewed = () => {
    const requestIds = bankTransferRequests.map(req => req.id);
    const newViewedSet = new Set([...viewedRoomRequests, ...requestIds]);
    setViewedRoomRequests(newViewedSet);
    localStorage.setItem('viewedRoomRequests', JSON.stringify([...newViewedSet]));
  };

  const markDayTourRequestsAsViewed = () => {
    const requestIds = dayTourBankRequests.map(req => req.id);
    const newViewedSet = new Set([...viewedDayTourRequests, ...requestIds]);
    setViewedDayTourRequests(newViewedSet);
    localStorage.setItem('viewedDayTourRequests', JSON.stringify([...newViewedSet]));
  };

  // Mark requests as viewed when tab is clicked
  const handleTabChange = (tab) => {
    setActiveRequestsTab(tab);
    if (tab === 'room') {
      markRoomRequestsAsViewed();
    } else if (tab === 'daytour') {
      markDayTourRequestsAsViewed();
    }
  };

  // Calculate unread counts - EXCLUDE completed requests (bank details already provided)
  const unreadRoomCount = bankTransferRequests.filter(req => !viewedRoomRequests.has(req.id) && req.status !== 'completed').length;
  const unreadDayTourCount = dayTourBankRequests.filter(req => !viewedDayTourRequests.has(req.id) && req.status !== 'completed').length;

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

    const isBankFormValid = () => {
    const { bankName, accountName, accountNumber } = tempBankDetails;
    if (!bankName.trim() || !accountName.trim() || !accountNumber.trim()) return false;
    if (editingBank && !hasBankChanges) return false;
    return true;
  };

  const handleArchiveGCashQR = async () => {
  setArchivingQR(true);
  try {
    // Get current QR code URL before archiving
    const currentQRCode = gcashQRCode;
    
    // Create archived QR code record
    const archivedQRRef = collection(db, 'archived_gcash_qr');
    await addDoc(archivedQRRef, {
      qrCodeUrl: currentQRCode,
      archivedAt: new Date().toISOString(),
      originalSettings: {
        gcashQRCode: currentQRCode
      }
    });
    
    // Remove QR code from settings
    const settingsRef = doc(db, 'settings', 'payment');
    await updateDoc(settingsRef, {
      gcashQRCode: ''
    });
    
    setGcashQRCode('');
    
    await logAdminAction({
      action: 'Archived GCash QR Code',
      module: 'Payment Settings',
      details: 'Admin archived the GCash payment QR code'
    });
    
    showNotification('GCash QR code archived successfully!');
    setShowArchiveQRModal(false);
  } catch (error) {
    console.error('Error archiving QR code:', error);
    showNotification('Failed to archive QR code.', 'error');
  } finally {
    setArchivingQR(false);
  }
};

  // Handle Account Number input – only numeric
  const handleAccountNumberChange = (e) => {
    const numericValue = e.target.value.replace(/\D/g, '');
    handleBankDetailsChange('accountNumber', numericValue);
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

  // Handle editing GCash QR code
  const handleEditGCashQR = async () => {
    if (!tempQRFile) {
      showNotification('Please select a new QR code image', 'error');
      return;
    }
    
    setUploadingQR(true);
    try {
      const qrCodeUrl = await uploadImage(tempQRFile);
      
      const settingsRef = doc(db, 'settings', 'payment');
      await setDoc(settingsRef, {
        gcashQRCode: qrCodeUrl,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      setGcashQRCode(qrCodeUrl);
      
      await logAdminAction({
        action: 'Edited GCash QR Code',
        module: 'Payment Settings',
        details: 'Admin edited the GCash payment QR code'
      });
      
      showNotification('GCash QR code updated successfully!');
      setShowEditQRModal(false);
      setTempQRFile(null);
      setTempQRPreview('');
    } catch (error) {
      console.error('Error editing QR code:', error);
      showNotification('Failed to update QR code.', 'error');
    } finally {
      setUploadingQR(false);
    }
  };

  const handleEditQRFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setTempQRFile(file);
    const previewUrl = URL.createObjectURL(file);
    setTempQRPreview(previewUrl);
  };

const handleAddBankAccount = async () => {
  if (!tempBankDetails.bankName || !tempBankDetails.accountName || !tempBankDetails.accountNumber) {
    showNotification('Please fill in all bank details', 'error');
    return;
  }
  
  setSaving(true);
  try {
    // Create new bank account with archived: false
    const newBankAccount = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      bankName: tempBankDetails.bankName,
      accountName: tempBankDetails.accountName,
      accountNumber: tempBankDetails.accountNumber,
      createdAt: new Date().toISOString(),
      archived: false // Add archived flag
    };
    
    // Save directly to the bank_accounts collection
    const bankAccountsRef = collection(db, 'bank_accounts');
    await addDoc(bankAccountsRef, newBankAccount);
    
    // Also add to local state for UI display
    const updatedBankAccounts = [...bankAccounts, { ...newBankAccount, firestoreId: newBankAccount.id }];
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

// Replace the handleUpdateBankAccount function
const handleUpdateBankAccount = async () => {
  if (!tempBankDetails.bankName || !tempBankDetails.accountName || !tempBankDetails.accountNumber) {
    showNotification('Please fill in all bank details', 'error');
    return;
  }
  
  setSaving(true);
  try {
    // Find the bank account document in bank_accounts collection
    const bankAccountsRef = collection(db, 'bank_accounts');
    const q = query(bankAccountsRef, where('id', '==', editingBank.id));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const bankDoc = querySnapshot.docs[0];
      const bankRef = doc(db, 'bank_accounts', bankDoc.id);
      
      await updateDoc(bankRef, {
        bankName: tempBankDetails.bankName,
        accountName: tempBankDetails.accountName,
        accountNumber: tempBankDetails.accountNumber,
        updatedAt: new Date().toISOString()
      });
    }
    
    // Update local state
    const updatedBankAccounts = bankAccounts.map(account => 
      account.id === editingBank.id 
        ? { ...account, ...tempBankDetails, updatedAt: new Date().toISOString() }
        : account
    );
    
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
    setHasBankChanges(false);
    setOriginalBankDetails(null);
  } catch (error) {
    console.error('Error updating bank account:', error);
    showNotification('Failed to update bank account.', 'error');
  } finally {
    setSaving(false);
  }
};

// Replace the handleArchiveBankAccount function
const handleArchiveBankAccount = async () => {
  if (!bankToArchive) return;
  
  setSaving(true);
  try {
    // Find the bank account in bank_accounts collection
    const bankAccountsRef = collection(db, 'bank_accounts');
    const q = query(bankAccountsRef, where('id', '==', bankToArchive.id));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const bankDoc = querySnapshot.docs[0];
      const bankRef = doc(db, 'bank_accounts', bankDoc.id);
      
      // Update the bank account: set archived to true and add archivedAt
      await updateDoc(bankRef, {
        archived: true,
        archivedAt: new Date().toISOString()
      });
    }
    
    // Update local state - filter out archived accounts from active list
    const updatedBankAccounts = bankAccounts.filter(account => account.id !== bankToArchive.id);
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
    setOriginalBankDetails({
      bankName: account.bankName,
      accountName: account.accountName,
      accountNumber: account.accountNumber
    });
    setTempBankDetails({
      bankName: account.bankName,
      accountName: account.accountName,
      accountNumber: account.accountNumber
    });
    setHasBankChanges(false);
    setShowAddBankModal(true);
  };

  const handleBankDetailsChange = (field, value) => {
    const newDetails = { ...tempBankDetails, [field]: value };
    setTempBankDetails(newDetails);
    
    // Check if any changes were made
    if (originalBankDetails) {
      const hasChanges = 
        newDetails.bankName !== originalBankDetails.bankName ||
        newDetails.accountName !== originalBankDetails.accountName ||
        newDetails.accountNumber !== originalBankDetails.accountNumber;
      setHasBankChanges(hasChanges);
    } else {
      setHasBankChanges(true);
    }
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
    setSelectedBankForRequest(null); // Reset selected bank when opening modal
    setShowBankDetailsModal(true);
  };

  // Handle providing bank details for Day Tour requests - now called by Send button
  const handleSendBankDetails = async () => {
    if (!selectedRequest || !selectedBankForRequest) return;
    
    setSaving(true);
    try {
      const isDayTour = selectedRequest.requestType === 'daytour';
      const collectionName = isDayTour ? 'daytour_bank_requests' : 'bank_requests';
      const bankRequestRef = doc(db, collectionName, selectedRequest.id);
      
      await updateDoc(bankRequestRef, {
        status: 'completed',
        providedBankDetails: {
          bankName: selectedBankForRequest.bankName,
          accountName: selectedBankForRequest.accountName,
          accountNumber: selectedBankForRequest.accountNumber,
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
      setSelectedBankForRequest(null);
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

  // Filter out archived bank accounts from display
  const activeBankAccounts = bankAccounts.filter(account => !account.archived);

  const normalizeDateText = (value) => {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value).toLowerCase();
    return `${d.toLocaleDateString()} ${d.toLocaleString()}`.toLowerCase();
  };

  const roomRequestsFiltered = bankTransferRequests.filter((request) => {
    const q = requestsSearchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      String(request.guestName || '').toLowerCase().includes(q) ||
      String(request.guestEmail || '').toLowerCase().includes(q) ||
      String(request.requestedBank?.bankName || '').toLowerCase().includes(q) ||
      String(request.requestedBank?.accountName || '').toLowerCase().includes(q) ||
      String(request.requestedBank?.accountNumber || '').toLowerCase().includes(q) ||
      normalizeDateText(request.createdAt).includes(q)
    );
  });

  const dayTourRequestsFiltered = dayTourBankRequests.filter((request) => {
    const q = requestsSearchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      String(request.guestName || '').toLowerCase().includes(q) ||
      String(request.guestEmail || '').toLowerCase().includes(q) ||
      String(request.requestedBank?.bankName || '').toLowerCase().includes(q) ||
      String(request.requestedBank?.accountName || '').toLowerCase().includes(q) ||
      String(request.requestedBank?.accountNumber || '').toLowerCase().includes(q) ||
      String(request.selectedDate || '').toLowerCase().includes(q) ||
      normalizeDateText(request.createdAt).includes(q)
    );
  });

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
          <div className="bg-gradient-to-r from-ocean-mid to-ocean-light px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <i className="fab fa-gcash"></i>
              GCash Settings
            </h2>
{gcashQRCode && (
  <div className="flex gap-2">
    <button
      onClick={() => setShowEditQRModal(true)}
      className="px-3 py-1.5 bg-white text-ocean-mid rounded-lg text-sm font-medium hover:bg-ocean-ice transition-all duration-200"
      title="Edit QR Code"
    >
      <i className="fas fa-edit mr-1"></i> Edit
    </button>
    <button
      onClick={() => setShowArchiveQRModal(true)}
      className="px-3 py-1.5 bg-white text-amber-600 rounded-lg text-sm font-medium hover:bg-amber-50 transition-all duration-200"
      title="Archive QR Code"
    >
      <i className="fas fa-archive mr-1"></i> Archive
    </button>
  </div>
)}
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
                setOriginalBankDetails(null);
                setTempBankDetails({ bankName: '', accountName: '', accountNumber: '' });
                setHasBankChanges(false);
                setShowAddBankModal(true);
              }}
              className="px-3 py-1.5 bg-white text-ocean-mid rounded-lg text-sm font-medium hover:bg-ocean-ice transition-all duration-200"
            >
              <i className="fas fa-plus mr-1"></i> Add Account
            </button>
          </div>
          
          <div className="p-6">
            {activeBankAccounts.length === 0 ? (
              <div className="text-center py-8">
                <i className="fas fa-university text-4xl text-ocean-light/30 mb-2"></i>
                <p className="text-textSecondary">No bank accounts added yet</p>
                <button
                  onClick={() => {
                    setEditingBank(null);
                    setOriginalBankDetails(null);
                    setTempBankDetails({ bankName: '', accountName: '', accountNumber: '' });
                    setHasBankChanges(false);
                    setShowAddBankModal(true);
                  }}
                  className="mt-3 text-sm text-ocean-mid hover:underline"
                >
                  Add your first bank account
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {activeBankAccounts.map((account) => (
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
            onClick={() => handleTabChange('room')}
            className={`px-4 py-2 font-medium transition-all duration-200 ${
              activeRequestsTab === 'room'
                ? 'text-ocean-mid border-b-2 border-ocean-mid'
                : 'text-textSecondary hover:text-ocean-mid'
            }`}
          >
            <i className="fas fa-bed mr-2"></i>
            Room Bookings
            {unreadRoomCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {unreadRoomCount}
              </span>
            )}
          </button>
          <button
            onClick={() => handleTabChange('daytour')}
            className={`px-4 py-2 font-medium transition-all duration-200 ${
              activeRequestsTab === 'daytour'
                ? 'text-ocean-mid border-b-2 border-ocean-mid'
                : 'text-textSecondary hover:text-ocean-mid'
            }`}
          >
            <i className="fas fa-sun mr-2"></i>
            Day Tour Bookings
            {unreadDayTourCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {unreadDayTourCount}
              </span>
            )}
          </button>
        </div>

        <div className="px-6 pt-4">
          <div className="relative max-w-md">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-neutral text-sm"></i>
            <input
              type="text"
              value={requestsSearchTerm}
              onChange={(e) => setRequestsSearchTerm(e.target.value)}
              placeholder="Search by name, email, bank account, or date"
              className="w-full pl-9 pr-3 py-2.5 border border-ocean-light/20 rounded-xl text-sm focus:outline-none focus:border-ocean-light bg-white"
            />
          </div>
        </div>
        
        <div className="p-6">
          {/* Room Bookings Requests */}
          {activeRequestsTab === 'room' && (
            <>
              {roomRequestsFiltered.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fas fa-check-circle text-5xl text-green-300 mb-3"></i>
                  <p className="text-textSecondary">No bank transfer requests for room bookings</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {roomRequestsFiltered.map((request) => {
                    const isCompleted = request.status === 'completed';
                    const isNew = !viewedRoomRequests.has(request.id);
                    // Remove orange border once bank details have been provided
                    const hasBorder = isNew && !isCompleted;

                    return (
                      <div key={request.id} className={`border rounded-xl p-4 hover:shadow-md transition-all duration-200 ${hasBorder ? 'border-amber-300 bg-amber-50/30' : 'border-ocean-light/20'}`}>
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
                              {isNew && !isCompleted && (
                                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                  New
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
              {dayTourRequestsFiltered.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fas fa-sun text-5xl text-amber-300 mb-3"></i>
                  <p className="text-textSecondary">No bank transfer requests for day tour bookings</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dayTourRequestsFiltered.map((request) => {
                    const isCompleted = request.status === 'completed';
                    const isNew = !viewedDayTourRequests.has(request.id);
                    // Remove orange border once bank details have been provided
                    const hasBorder = isNew && !isCompleted;

                    return (
                      <div key={request.id} className={`border rounded-xl p-4 hover:shadow-md transition-all duration-200 ${hasBorder ? 'border-amber-300 bg-amber-50/30' : 'border-ocean-light/20'}`}>
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
                              {isNew && !isCompleted && (
                                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                  New
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
                onClick={() => {
                  setShowAddBankModal(false);
                  setHasBankChanges(false);
                  setOriginalBankDetails(null);
                }}
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
                  onChange={(e) => handleBankDetailsChange('bankName', e.target.value)}
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
                  onChange={(e) => handleBankDetailsChange('accountName', e.target.value)}
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
    inputMode="numeric"
    value={tempBankDetails.accountNumber}
    onChange={handleAccountNumberChange}
    placeholder="Account number"
    className="w-full px-4 py-2.5 border border-ocean-light/20 rounded-xl text-sm focus:outline-none focus:border-ocean-light"
  />
              </div>
            </div>
            
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setShowAddBankModal(false);
                  setHasBankChanges(false);
                  setOriginalBankDetails(null);
                }}
                className="px-5 py-2.5 border border-ocean-light/20 rounded-xl text-textSecondary text-sm font-medium hover:bg-ocean-ice transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={editingBank ? handleUpdateBankAccount : handleAddBankAccount}
                disabled={saving || !isBankFormValid()}
                className="px-5 py-2.5 bg-gradient-to-r from-ocean-mid to-ocean-light rounded-xl text-white text-sm font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : (editingBank ? 'Update' : 'Add')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Confirmation Modal for Bank Account */}
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

      {/* Edit GCash QR Code Modal */}
      {showEditQRModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowEditQRModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-textPrimary font-playfair">
                Edit GCash QR Code
              </h2>
              <button
                onClick={() => {
                  setShowEditQRModal(false);
                  setTempQRFile(null);
                  setTempQRPreview('');
                }}
                className="w-8 h-8 rounded-full bg-ocean-ice hover:bg-ocean-light/20 text-neutral hover:text-textPrimary transition-all duration-200 flex items-center justify-center"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-textPrimary mb-3">
                  Current QR Code
                </label>
                <div className="w-32 h-32 bg-white rounded-xl border border-ocean-light/20 overflow-hidden relative mb-4">
                  <Image
                    src={gcashQRCode}
                    alt="Current GCash QR Code"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-textPrimary mb-3">
                  New QR Code
                </label>
                <div className="border-2 border-dashed border-ocean-light/20 rounded-xl p-6 text-center hover:border-ocean-light transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditQRFileSelect}
                    disabled={uploadingQR}
                    className="hidden"
                    id="edit-qr-upload"
                  />
                  <label
                    htmlFor="edit-qr-upload"
                    className="cursor-pointer flex flex-col items-center gap-3"
                  >
                    {tempQRPreview ? (
                      <div className="relative w-32 h-32">
                        <Image
                          src={tempQRPreview}
                          alt="New QR Code Preview"
                          fill
                          className="object-contain rounded-lg"
                        />
                      </div>
                    ) : (
                      <>
                        <i className="fas fa-qrcode text-4xl text-ocean-light"></i>
                        <span className="text-sm text-textSecondary">
                          Click to upload new QR code
                        </span>
                      </>
                    )}
                    <span className="text-xs text-neutral">PNG, JPG up to 5MB</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setShowEditQRModal(false);
                  setTempQRFile(null);
                  setTempQRPreview('');
                }}
                className="px-5 py-2.5 border border-ocean-light/20 rounded-xl text-textSecondary text-sm font-medium hover:bg-ocean-ice transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleEditGCashQR}
                disabled={uploadingQR || !tempQRFile}
                className="px-5 py-2.5 bg-gradient-to-r from-ocean-mid to-ocean-light rounded-xl text-white text-sm font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingQR ? 'Uploading...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archive GCash QR Code Confirmation Modal */}
{showArchiveQRModal && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
      <div className="text-center mb-5">
        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-amber-100 flex items-center justify-center">
          <i className="fas fa-archive text-amber-600 text-2xl"></i>
        </div>
        <h3 className="text-lg font-bold text-textPrimary mb-2">Archive GCash QR Code</h3>
        <p className="text-textSecondary text-sm">
          Are you sure you want to archive the current GCash QR code? 
          This will remove it from the payment settings and move it to the archive.
        </p>
      </div>
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => setShowArchiveQRModal(false)}
          className="px-5 py-2 border border-ocean-light/20 rounded-xl text-textSecondary text-sm font-medium hover:bg-ocean-ice transition-all duration-300"
        >
          Cancel
        </button>
        <button
          onClick={handleArchiveGCashQR}
          disabled={archivingQR}
          className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl text-white text-sm font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50"
        >
          {archivingQR ? 'Archiving...' : 'Archive'}
        </button>
      </div>
    </div>
  </div>
)}

      {/* Bank Details Modal - Select which bank account to provide with Send button */}
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
                      {/* Total Amount & Down Payment */}
<div className="mb-4 p-3 bg-ocean-ice rounded-lg">
  <p className="text-sm font-semibold text-textPrimary mb-1">Total Amount</p>
  <p className="text-l font-bold text-ocean-mid">
    ₱{(selectedRequest.totalPrice || selectedRequest.totalAmount || 0).toLocaleString()}
  </p>
  <p className="text-sm font-semibold text-textPrimary mt-2 mb-1">Down Payment Required (50%)</p>
  <p className="text-l font-bold text-amber-600">
    ₱{((selectedRequest.totalPrice || selectedRequest.totalAmount || 0) * 0.5).toLocaleString()}
  </p>
</div>
            </div>
            
            {activeBankAccounts.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-textSecondary mb-3">No bank accounts available. Please add a bank account first.</p>
                <button
                  onClick={() => {
                    setShowBankDetailsModal(false);
                    setEditingBank(null);
                    setOriginalBankDetails(null);
                    setTempBankDetails({ bankName: '', accountName: '', accountNumber: '' });
                    setHasBankChanges(false);
                    setShowAddBankModal(true);
                  }}
                  className="px-4 py-2 bg-ocean-mid text-white rounded-lg text-sm font-medium"
                >
                  Add Bank Account
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                  {activeBankAccounts.map((account) => (
                    <button
                      key={account.id}
                      onClick={() => setSelectedBankForRequest(account)}
                      className={`w-full text-left border rounded-lg p-4 transition-all duration-200 ${
                        selectedBankForRequest?.id === account.id
                          ? 'border-ocean-mid bg-ocean-ice ring-2 ring-ocean-mid/20'
                          : 'border-ocean-light/20 hover:bg-ocean-ice'
                      }`}
                    >
                      <p className="font-semibold text-textPrimary">{account.bankName}</p>
                      <p className="text-sm text-textSecondary mt-1">{account.accountName}</p>
                      <p className="text-sm text-textSecondary">{account.accountNumber}</p>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowBankDetailsModal(false)}
                    className="px-5 py-2.5 border border-ocean-light/20 rounded-xl text-textSecondary text-sm font-medium hover:bg-ocean-ice transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendBankDetails}
                    disabled={saving || !selectedBankForRequest}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl text-white text-sm font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Sending...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane"></i>
                        Send
                      </>
                    )}
                  </button>
                </div>
              </>
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