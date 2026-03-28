// app/dashboard/admin/rooms/page.js
'use client';

import { useState, useEffect } from 'react';
import { db } from '../../../../lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { uploadImage } from '../../../../lib/cloudinary';
import { logAdminAction } from '../../../../lib/auditLogger';
import Image from 'next/image';

export default function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [confirmArchiveModal, setConfirmArchiveModal] = useState({ show: false, room: null });
  
  const [formData, setFormData] = useState({
    type: '',
    totalRooms: '',
    capacity: '',
    inclusions: [],
    price: '',
    availability: 'available',
    description: '',
    images: []
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [inclusionInput, setInclusionInput] = useState('');
  
  const availabilityStatuses = [
    { value: 'available', label: 'Available', color: 'bg-green-100 text-green-700' },
    { value: 'unavailable', label: 'Unavailable', color: 'bg-red-100 text-red-700' },
    { value: 'maintenance', label: 'Under Maintenance', color: 'bg-yellow-100 text-yellow-700' }
  ];
  
  // Real-time listener for active rooms (not archived)
  useEffect(() => {
    const roomsRef = collection(db, 'rooms');
    const q = query(roomsRef, where('archived', '!=', true), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const roomsList = [];
      querySnapshot.forEach((doc) => {
        roomsList.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setRooms(roomsList);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching rooms:', error);
      showNotification('Failed to load rooms.', 'error');
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);
  
  // Auto-hide notification
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);
  
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const handleInclusionAdd = () => {
    if (inclusionInput.trim() && !formData.inclusions.includes(inclusionInput.trim())) {
      setFormData(prev => ({
        ...prev,
        inclusions: [...prev.inclusions, inclusionInput.trim()]
      }));
      setInclusionInput('');
    }
  };
  
  const handleInclusionRemove = (inclusion) => {
    setFormData(prev => ({
      ...prev,
      inclusions: prev.inclusions.filter(i => i !== inclusion)
    }));
  };
  
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setUploadingImage(true);
    try {
      const uploadPromises = files.map(file => uploadImage(file));
      const uploadedUrls = await Promise.all(uploadPromises);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
      showNotification(`${files.length} image(s) uploaded successfully!`);
    } catch (error) {
      console.error('Error uploading images:', error);
      showNotification('Failed to upload images.', 'error');
    } finally {
      setUploadingImage(false);
    }
  };
  
  const handleImageRemove = (imageUrl) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img !== imageUrl)
    }));
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.type.trim()) errors.type = 'Room type is required';
    if (!formData.totalRooms) errors.totalRooms = 'Total rooms is required';
    else if (isNaN(formData.totalRooms) || parseInt(formData.totalRooms) <= 0) {
      errors.totalRooms = 'Total rooms must be a positive number';
    }
    if (!formData.capacity) errors.capacity = 'Capacity is required';
    else if (isNaN(formData.capacity) || parseInt(formData.capacity) <= 0) {
      errors.capacity = 'Capacity must be a positive number';
    }
    if (!formData.price) errors.price = 'Price is required';
    else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      errors.price = 'Price must be a positive number';
    }
    if (!formData.description.trim()) errors.description = 'Description is required';
    
    return errors;
  };
  
  const isFormIncomplete = () => {
    return !formData.type.trim() || !formData.totalRooms || 
           !formData.capacity || !formData.price || !formData.description.trim();
  };
  
  const handleAddRoom = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setActionLoading(true);
    
    try {
      const roomData = {
        ...formData,
        totalRooms: parseInt(formData.totalRooms),
        capacity: parseInt(formData.capacity),
        price: parseFloat(formData.price),
        archived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, 'rooms'), roomData);
      
      // Log the action using your existing audit logger
      await logAdminAction({
        action: 'Created Room',
        module: 'Room',
        details: `Added new room: ${roomData.type} (Capacity: ${roomData.capacity} guests, Price: ₱${roomData.price.toLocaleString()}, Total Rooms: ${roomData.totalRooms}, Status: ${roomData.availability})`
      });
      
      showNotification('Room added successfully!');
      resetForm();
      
      setTimeout(() => {
        setShowModal(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error adding room:', error);
      showNotification('Failed to add room.', 'error');
    } finally {
      setActionLoading(false);
    }
  };
  
  const handleUpdateRoom = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setActionLoading(true);
    
    try {
      const roomRef = doc(db, 'rooms', selectedRoom.id);
      
      // Get previous data for audit log
      const previousData = {
        type: selectedRoom.type,
        totalRooms: selectedRoom.totalRooms,
        capacity: selectedRoom.capacity,
        price: selectedRoom.price,
        availability: selectedRoom.availability,
        inclusionsCount: selectedRoom.inclusions?.length || 0,
        imagesCount: selectedRoom.images?.length || 0
      };
      
      const newData = {
        type: formData.type,
        totalRooms: parseInt(formData.totalRooms),
        capacity: parseInt(formData.capacity),
        price: parseFloat(formData.price),
        availability: formData.availability,
        inclusionsCount: formData.inclusions.length,
        imagesCount: formData.images.length
      };
      
      await updateDoc(roomRef, {
        ...formData,
        totalRooms: parseInt(formData.totalRooms),
        capacity: parseInt(formData.capacity),
        price: parseFloat(formData.price),
        updatedAt: new Date().toISOString()
      });
      
      // Build details of what changed
      const changes = [];
      if (previousData.type !== newData.type) changes.push(`type from "${previousData.type}" to "${newData.type}"`);
      if (previousData.totalRooms !== newData.totalRooms) changes.push(`total rooms from ${previousData.totalRooms} to ${newData.totalRooms}`);
      if (previousData.capacity !== newData.capacity) changes.push(`capacity from ${previousData.capacity} to ${newData.capacity}`);
      if (previousData.price !== newData.price) changes.push(`price from ₱${previousData.price.toLocaleString()} to ₱${newData.price.toLocaleString()}`);
      if (previousData.availability !== newData.availability) changes.push(`availability from "${previousData.availability}" to "${newData.availability}"`);
      if (previousData.inclusionsCount !== newData.inclusionsCount) changes.push(`inclusions count from ${previousData.inclusionsCount} to ${newData.inclusionsCount}`);
      if (previousData.imagesCount !== newData.imagesCount) changes.push(`images count from ${previousData.imagesCount} to ${newData.imagesCount}`);
      
      // Log the action
      await logAdminAction({
        action: 'Updated Room',
        module: 'Room Management',
        details: `Updated room "${selectedRoom.type}": ${changes.join(', ')}`
      });
      
      showNotification('Room updated successfully!');
      
      setTimeout(() => {
        setShowModal(false);
        setShowViewModal(false);
        setSelectedRoom(null);
      }, 2000);
      
    } catch (error) {
      console.error('Error updating room:', error);
      showNotification('Failed to update room.', 'error');
    } finally {
      setActionLoading(false);
    }
  };
  
  const handleArchiveRoom = async (room) => {
    try {
      const roomRef = doc(db, 'rooms', room.id);
      await updateDoc(roomRef, {
        archived: true,
        archivedAt: new Date().toISOString()
      });
      
      // Log the action
      await logAdminAction({
        action: 'Archived Room',
        module: 'Room Management',
        details: `Archived room: ${room.type} (Capacity: ${room.capacity} guests, Price: ₱${room.price.toLocaleString()}, Total Rooms: ${room.totalRooms})`
      });
      
      showNotification(`${room.type} has been archived successfully!`);
      setConfirmArchiveModal({ show: false, room: null });
    } catch (error) {
      console.error('Error archiving room:', error);
      showNotification('Failed to archive room.', 'error');
    }
  };
  
  const handleEditRoom = (room) => {
    setSelectedRoom(room);
    setFormData({
      type: room.type || '',
      totalRooms: room.totalRooms || '',
      capacity: room.capacity || '',
      inclusions: room.inclusions || [],
      price: room.price || '',
      availability: room.availability || 'available',
      description: room.description || '',
      images: room.images || []
    });
    setModalType('edit');
    setShowModal(true);
    setShowViewModal(false);
  };
  
  const handleViewRoom = (room) => {
    setSelectedRoom(room);
    setShowViewModal(true);
  };
  
  const resetForm = () => {
    setFormData({
      type: '',
      totalRooms: '',
      capacity: '',
      inclusions: [],
      price: '',
      availability: 'available',
      description: '',
      images: []
    });
    setInclusionInput('');
    setFormErrors({});
  };
  
  const openAddModal = () => {
    setModalType('add');
    resetForm();
    setSelectedRoom(null);
    setShowModal(true);
  };
  
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || room.availability === filterStatus;
    return matchesSearch && matchesFilter;
  });
  
  const getAvailabilityStyle = (availability) => {
    const status = availabilityStatuses.find(s => s.value === availability);
    return status ? status.color : 'bg-gray-100 text-gray-700';
  };
  
  const getAvailabilityLabel = (availability) => {
    const status = availabilityStatuses.find(s => s.value === availability);
    return status ? status.label : availability;
  };
  
  return (
    <div className="p-8 min-h-screen"style={{ backgroundColor: 'var(--color-blue-white)' }} >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-textPrimary font-playfair mb-1">
            Room Management
          </h1>
          <p className="text-textSecondary">
            Manage your resort rooms, pricing, and availability
          </p>
        </div>
        
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-ocean-mid to-ocean-light text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
        >
          <i className="fas fa-plus text-sm"></i>
          Add New Room
        </button>
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
      
      {/* Filters and Search */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="flex-1 min-w-[250px]">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-neutral text-sm"></i>
            <input
              type="text"
              placeholder="Search by room type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 border border-ocean-light/20 rounded-xl text-sm focus:outline-none focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 transition-all duration-300 bg-white"
            />
          </div>
        </div>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 border border-ocean-light/20 rounded-xl text-sm text-textPrimary focus:outline-none focus:border-ocean-light cursor-pointer bg-white"
        >
          <option value="all">All Status</option>
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
          <option value="maintenance">Under Maintenance</option>
        </select>
      </div>
      
      {/* Rooms Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <i className="fas fa-spinner fa-spin text-3xl text-ocean-light"></i>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md border border-ocean-light/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-ocean-pale/50 border-b border-ocean-light/20">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Room Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Capacity</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Total Rooms</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Price</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Actions</th>
                 </tr>
              </thead>
              <tbody>
                {filteredRooms.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-12 text-center text-neutral">
                      <i className="fas fa-bed text-5xl mb-3 opacity-50 block"></i>
                      <p className="text-lg">No rooms found</p>
                      <p className="text-sm">Click "Add New Room" to get started</p>
                    </td>
                  </tr>
                ) : (
                  filteredRooms.map((room) => (
                    <tr key={room.id} className="border-b border-ocean-light/10 hover:bg-ocean-ice/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-textPrimary">{room.type}</div>
                      </td>
                      <td className="px-4 py-3 text-textSecondary">
                        <span className="flex items-center gap-1">
                          <i className="fas fa-users text-xs text-ocean-light"></i>
                          {room.capacity} Guests
                        </span>
                      </td>
                      <td className="px-4 py-3 text-textSecondary">
                        <span className="flex items-center gap-1">
                          <i className="fas fa-door-open text-xs text-ocean-light"></i>
                          {room.totalRooms} Rooms
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-ocean-mid">₱{room.price.toLocaleString()}</span>
                        <span className="text-xs text-neutral">/night</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getAvailabilityStyle(room.availability)}`}>
                          {getAvailabilityLabel(room.availability)}
                        </span>
                      </td>
<td className="px-4 py-3">
  <div className="flex gap-2">
    <button
      onClick={() => handleViewRoom(room)}
      className="p-2 rounded-lg border border-ocean-light/20 bg-white text-ocean-mid hover:bg-ocean-mid hover:text-white hover:border-ocean-mid transition-all duration-200"
      title="View Details"
    >
      <i className="fas fa-eye"></i>
    </button>
    <button
      onClick={() => handleEditRoom(room)}
      className="p-2 rounded-lg border border-ocean-light/20 bg-white text-ocean-mid hover:bg-ocean-mid hover:text-white hover:border-ocean-mid transition-all duration-200"
    >
      <i className="fas fa-edit"></i>
    </button>
    <button
      onClick={() => setConfirmArchiveModal({ show: true, room })}
      className="p-2 rounded-lg border border-amber-200 bg-white text-amber-600 hover:bg-amber-600 hover:text-white hover:border-amber-600 transition-all duration-200"
      title="Archive Room"
    >
      <i className="fas fa-archive"></i>
    </button>
  </div>
</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* View Room Modal */}
      {showViewModal && selectedRoom && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => {
          if (!actionLoading) {
            setShowViewModal(false);
            setSelectedRoom(null);
          }
        }}>
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-auto p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-2xl font-bold text-textPrimary font-playfair">
                Room Details - {selectedRoom.type}
              </h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedRoom(null);
                }}
                className="w-8 h-8 rounded-full bg-ocean-ice hover:bg-ocean-light/20 text-neutral hover:text-textPrimary transition-all duration-200 flex items-center justify-center"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            {/* Room Images Slider/Gallery */}
            {selectedRoom.images && selectedRoom.images.length > 0 && (
              <div className="mb-6">
                <div className="relative">
                  {/* Main Image Container */}
                  <div className="relative overflow-hidden rounded-xl bg-ocean-pale/30" style={{ height: '300px' }}>
                    <Image
                      src={selectedRoom.images[0]}
                      alt={selectedRoom.type}
                      fill
                      className="object-contain"
                    />
                  </div>
                  
                  {/* Thumbnail Navigation */}
                  {selectedRoom.images.length > 1 && (
                    <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                      {selectedRoom.images.map((img, idx) => (
                        <div key={idx} className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-ocean-mid transition-all">
                          <Image
                            src={img}
                            alt={`Thumbnail ${idx + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-neutral uppercase tracking-wide mb-1">Room Type</label>
                <p className="text-lg font-semibold text-textPrimary">{selectedRoom.type}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral uppercase tracking-wide mb-1">Capacity</label>
                <p className="text-textPrimary flex items-center gap-2">
                  <i className="fas fa-users text-ocean-light"></i>
                  {selectedRoom.capacity} Guests
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral uppercase tracking-wide mb-1">Total Rooms Available</label>
                <p className="text-textPrimary flex items-center gap-2">
                  <i className="fas fa-door-open text-ocean-light"></i>
                  {selectedRoom.totalRooms} Rooms
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral uppercase tracking-wide mb-1">Price per Night</label>
                <p className="text-2xl font-bold text-ocean-mid">₱{selectedRoom.price.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral uppercase tracking-wide mb-1">Status</label>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getAvailabilityStyle(selectedRoom.availability)}`}>
                  {getAvailabilityLabel(selectedRoom.availability)}
                </span>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-neutral uppercase tracking-wide mb-1">Inclusions</label>
                <div className="flex flex-wrap gap-2">
                  {selectedRoom.inclusions && selectedRoom.inclusions.length > 0 ? (
                    selectedRoom.inclusions.map((inclusion, idx) => (
                      <span key={idx} className="px-3 py-1 bg-ocean-ice text-ocean-mid rounded-full text-sm">
                        {inclusion}
                      </span>
                    ))
                  ) : (
                    <p className="text-textSecondary">No inclusions listed</p>
                  )}
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-neutral uppercase tracking-wide mb-1">Description</label>
                <p className="text-textSecondary leading-relaxed whitespace-pre-wrap">
                  {selectedRoom.description}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-ocean-light/10">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedRoom(null);
                }}
                className="px-5 py-2.5 border border-ocean-light/20 rounded-xl text-textSecondary text-sm font-medium hover:bg-ocean-ice transition-all duration-300"
              >
                Close
              </button>
              <button
                onClick={() => handleEditRoom(selectedRoom)}
                className="px-5 py-2.5 bg-gradient-to-r from-ocean-mid to-ocean-light rounded-xl text-white text-sm font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                <i className="fas fa-edit mr-2"></i>
                Edit Room
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add/Edit Room Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => {
          if (!actionLoading) {
            setShowModal(false);
            setSelectedRoom(null);
          }
        }}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-textPrimary font-playfair">
                {modalType === 'add' ? 'Add New Room' : 'Edit Room'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedRoom(null);
                }}
                className="w-8 h-8 rounded-full bg-ocean-ice hover:bg-ocean-light/20 text-neutral hover:text-textPrimary transition-all duration-200 flex items-center justify-center"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={modalType === 'add' ? handleAddRoom : handleUpdateRoom}>
              {/* Room Type - Typable input */}
              <div className="mb-4">
                <label className="block mb-1.5 text-sm font-medium text-textPrimary">Room Type *</label>
                <input
                  type="text"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  placeholder="e.g., Deluxe Suite, Family Cottage, etc."
                  className={`w-full px-3 py-2.5 border ${formErrors.type ? 'border-red-500' : 'border-ocean-light/20'} rounded-xl text-sm focus:outline-none focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20`}
                />
                {formErrors.type && <p className="text-red-500 text-xs mt-1">{formErrors.type}</p>}
              </div>
              
              {/* Total Rooms and Capacity */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-textPrimary">Total Rooms *</label>
                  <input
                    type="number"
                    name="totalRooms"
                    value={formData.totalRooms}
                    onChange={handleInputChange}
                    placeholder="Number of rooms"
                    className={`w-full px-3 py-2.5 border ${formErrors.totalRooms ? 'border-red-500' : 'border-ocean-light/20'} rounded-xl text-sm focus:outline-none focus:border-ocean-light`}
                  />
                  {formErrors.totalRooms && <p className="text-red-500 text-xs mt-1">{formErrors.totalRooms}</p>}
                </div>
                
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-textPrimary">Capacity (Guests) *</label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    placeholder="Max guests per room"
                    className={`w-full px-3 py-2.5 border ${formErrors.capacity ? 'border-red-500' : 'border-ocean-light/20'} rounded-xl text-sm focus:outline-none focus:border-ocean-light`}
                  />
                  {formErrors.capacity && <p className="text-red-500 text-xs mt-1">{formErrors.capacity}</p>}
                </div>
              </div>
              
              {/* Price and Availability */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-textPrimary">Price (₱) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="Price per night"
                    className={`w-full px-3 py-2.5 border ${formErrors.price ? 'border-red-500' : 'border-ocean-light/20'} rounded-xl text-sm focus:outline-none focus:border-ocean-light`}
                  />
                  {formErrors.price && <p className="text-red-500 text-xs mt-1">{formErrors.price}</p>}
                </div>
                
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-textPrimary">Availability *</label>
                  <select
                    name="availability"
                    value={formData.availability}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border border-ocean-light/20 rounded-xl text-sm focus:outline-none focus:border-ocean-light bg-white"
                  >
                    {availabilityStatuses.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Inclusions */}
              <div className="mb-4">
                <label className="block mb-1.5 text-sm font-medium text-textPrimary">Inclusions</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={inclusionInput}
                    onChange={(e) => setInclusionInput(e.target.value)}
                    placeholder="e.g., Free Breakfast, Wi-Fi, AC"
                    className="flex-1 px-3 py-2.5 border border-ocean-light/20 rounded-xl text-sm focus:outline-none focus:border-ocean-light"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleInclusionAdd())}
                  />
                  <button
                    type="button"
                    onClick={handleInclusionAdd}
                    className="px-4 py-2.5 bg-ocean-light/10 text-ocean-light rounded-xl hover:bg-ocean-light hover:text-white transition-all"
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.inclusions.map((inclusion, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-ocean-ice text-ocean-mid rounded-full text-sm">
                      {inclusion}
                      <button
                        type="button"
                        onClick={() => handleInclusionRemove(inclusion)}
                        className="hover:text-red-500 transition-colors"
                      >
                        <i className="fas fa-times text-xs"></i>
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Description */}
              <div className="mb-4">
                <label className="block mb-1.5 text-sm font-medium text-textPrimary">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Describe the room features, amenities, and highlights..."
                  className={`w-full px-3 py-2.5 border ${formErrors.description ? 'border-red-500' : 'border-ocean-light/20'} rounded-xl text-sm focus:outline-none focus:border-ocean-light`}
                />
                {formErrors.description && <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>}
              </div>
              
              {/* Images Upload */}
              <div className="mb-5">
                <label className="block mb-1.5 text-sm font-medium text-textPrimary">Room Images</label>
                <div className="border-2 border-dashed border-ocean-light/20 rounded-xl p-4 text-center hover:border-ocean-light transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <i className={`fas ${uploadingImage ? 'fa-spinner fa-spin' : 'fa-cloud-upload-alt'} text-3xl text-ocean-light`}></i>
                    <span className="text-sm text-textSecondary">
                      {uploadingImage ? 'Uploading...' : 'Click to upload images'}
                    </span>
                    <span className="text-xs text-neutral">PNG, JPG up to 5MB</span>
                  </label>
                </div>
                
                {/* Image Preview */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-ocean-light/20">
                        <Image
                          src={img}
                          alt={`Room image ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleImageRemove(img)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <i className="fas fa-times text-xs"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Form Actions */}
              <div className="flex gap-3 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedRoom(null);
                  }}
                  className="px-5 py-2.5 border border-ocean-light/20 rounded-xl text-textSecondary text-sm font-medium hover:bg-ocean-ice transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || isFormIncomplete()}
                  className={`px-5 py-2.5 rounded-xl text-white text-sm font-medium transition-all duration-300 ${
                    actionLoading || isFormIncomplete()
                      ? 'bg-neutral cursor-not-allowed'
                      : 'bg-gradient-to-r from-ocean-mid to-ocean-light hover:shadow-lg hover:-translate-y-0.5'
                  }`}
                >
                  {actionLoading ? (
                    <span><i className="fas fa-spinner fa-spin mr-2"></i> {modalType === 'add' ? 'Adding...' : 'Updating...'}</span>
                  ) : (
                    modalType === 'add' ? 'Add Room' : 'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Archive Confirmation Modal */}
      {confirmArchiveModal.show && confirmArchiveModal.room && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-scaleIn">
            <div className="text-center mb-5">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-amber-100 flex items-center justify-center">
                <i className="fas fa-archive text-amber-500 text-2xl"></i>
              </div>
              <h3 className="text-lg font-bold text-textPrimary mb-2">Archive Room</h3>
              <p className="text-textSecondary text-sm">
                Are you sure you want to archive "{confirmArchiveModal.room.type}"? 
                This room will be moved to the archive and won't appear in active listings.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setConfirmArchiveModal({ show: false, room: null })}
                className="px-5 py-2 border border-ocean-light/20 rounded-xl text-textSecondary text-sm font-medium hover:bg-ocean-ice transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleArchiveRoom(confirmArchiveModal.room)}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl text-white text-sm font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                Archive
              </button>
            </div>
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
        
        @keyframes scaleIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}