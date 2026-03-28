// app/dashboard/admin/rooms/page.js
'use client';

import { useState, useEffect } from 'react';
import { db } from '../../../../lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy, onSnapshot } from 'firebase/firestore';
import { uploadImage } from '../../../../lib/cloudinary';
import Image from 'next/image';

export default function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
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
  
  const roomTypes = [
    'Group Room',
    'Family Room',
    'Cottage',
    'Deluxe Room',
    'Standard Room',
    'Suite',
    'Villa',
    'Dormitory'
  ];
  
  const availabilityStatuses = [
    { value: 'available', label: 'Available', color: 'bg-green-100 text-green-700' },
    { value: 'unavailable', label: 'Unavailable', color: 'bg-red-100 text-red-700' },
    { value: 'maintenance', label: 'Under Maintenance', color: 'bg-yellow-100 text-yellow-700' }
  ];
  
  // Real-time listener for rooms
  useEffect(() => {
    const roomsRef = collection(db, 'rooms');
    const q = query(roomsRef, orderBy('createdAt', 'desc'));
    
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
    
    if (!formData.name.trim()) errors.name = 'Room name is required';
    if (!formData.type) errors.type = 'Room type is required';
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
    return !formData.name.trim() || !formData.type || !formData.totalRooms || 
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await addDoc(collection(db, 'rooms'), roomData);
      
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
      await updateDoc(roomRef, {
        ...formData,
        totalRooms: parseInt(formData.totalRooms),
        capacity: parseInt(formData.capacity),
        price: parseFloat(formData.price),
        updatedAt: new Date().toISOString()
      });
      
      showNotification('Room updated successfully!');
      
      setTimeout(() => {
        setShowModal(false);
        setSelectedRoom(null);
      }, 2000);
      
    } catch (error) {
      console.error('Error updating room:', error);
      showNotification('Failed to update room.', 'error');
    } finally {
      setActionLoading(false);
    }
  };
  
  const handleDeleteRoom = async (room) => {
    if (!confirm(`Are you sure you want to delete "${room.name}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const roomRef = doc(db, 'rooms', room.id);
      await deleteDoc(roomRef);
      showNotification('Room deleted successfully!');
    } catch (error) {
      console.error('Error deleting room:', error);
      showNotification('Failed to delete room.', 'error');
    }
  };
  
  const handleEditRoom = (room) => {
    setSelectedRoom(room);
    setFormData({
      name: room.name || '',
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
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
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
    const matchesSearch = room.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || room.availability === filterStatus;
    return matchesSearch && matchesFilter;
  });
  
  const getAvailabilityStyle = (availability) => {
    const status = availabilityStatuses.find(s => s.value === availability);
    return status ? status.color : 'bg-gray-100 text-gray-700';
  };
  
  return (
    <div className="p-6 bg-gradient-to-br from-ocean-ice to-blue-white min-h-screen">
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
              placeholder="Search by name or type..."
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
      
      {/* Rooms Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <i className="fas fa-spinner fa-spin text-3xl text-ocean-light"></i>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.length === 0 ? (
            <div className="col-span-full text-center py-12 text-neutral">
              <i className="fas fa-bed text-5xl mb-3 opacity-50"></i>
              <p className="text-lg">No rooms found</p>
              <p className="text-sm">Click "Add New Room" to get started</p>
            </div>
          ) : (
            filteredRooms.map((room) => (
              <div key={room.id} className="bg-white rounded-2xl shadow-md border border-ocean-light/10 overflow-hidden hover:shadow-xl transition-all duration-300 group">
                {/* Room Images */}
                <div className="relative h-48 bg-gradient-to-br from-ocean-pale to-ocean-ice overflow-hidden">
                  {room.images && room.images.length > 0 ? (
                    <Image
                      src={room.images[0]}
                      alt={room.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <i className="fas fa-image text-5xl text-ocean-light/30"></i>
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getAvailabilityStyle(room.availability)}`}>
                      {room.availability === 'available' ? 'Available' : room.availability === 'unavailable' ? 'Unavailable' : 'Under Maintenance'}
                    </span>
                  </div>
                </div>
                
                {/* Room Details */}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-textPrimary font-playfair">{room.name}</h3>
                      <p className="text-sm text-ocean-light font-medium mt-0.5">{room.type}</p>
                    </div>
                    <p className="text-2xl font-bold text-ocean-mid">₱{room.price.toLocaleString()}</p>
                  </div>
                  
                  <div className="flex gap-4 mt-3 text-sm text-textSecondary">
                    <span className="flex items-center gap-1">
                      <i className="fas fa-bed"></i> {room.capacity} Guests
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="fas fa-door-open"></i> {room.totalRooms} Rooms
                    </span>
                  </div>
                  
                  {room.inclusions && room.inclusions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {room.inclusions.slice(0, 3).map((inclusion, idx) => (
                        <span key={idx} className="text-xs px-2 py-0.5 bg-ocean-ice text-ocean-mid rounded-full">
                          {inclusion}
                        </span>
                      ))}
                      {room.inclusions.length > 3 && (
                        <span className="text-xs px-2 py-0.5 bg-ocean-ice text-ocean-mid rounded-full">
                          +{room.inclusions.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <p className="text-sm text-textSecondary mt-3 line-clamp-2">
                    {room.description}
                  </p>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4 pt-3 border-t border-ocean-light/10">
                    <button
                      onClick={() => handleEditRoom(room)}
                      className="flex-1 px-3 py-2 rounded-lg border border-ocean-light/20 text-ocean-mid hover:bg-ocean-mid hover:text-white transition-all duration-200"
                    >
                      <i className="fas fa-edit mr-1"></i> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteRoom(room)}
                      className="flex-1 px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-200"
                    >
                      <i className="fas fa-trash mr-1"></i> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
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
              {/* Room Name and Type */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-textPrimary">Room Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Ocean View Suite"
                    className={`w-full px-3 py-2.5 border ${formErrors.name ? 'border-red-500' : 'border-ocean-light/20'} rounded-xl text-sm focus:outline-none focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20`}
                  />
                  {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                </div>
                
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-textPrimary">Room Type *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2.5 border ${formErrors.type ? 'border-red-500' : 'border-ocean-light/20'} rounded-xl text-sm focus:outline-none focus:border-ocean-light bg-white`}
                  >
                    <option value="">Select room type</option>
                    {roomTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {formErrors.type && <p className="text-red-500 text-xs mt-1">{formErrors.type}</p>}
                </div>
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
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}