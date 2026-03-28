// app/dashboard/admin/day-tour/page.js
'use client';

import { useState, useEffect } from 'react';
import { db } from '../../../../lib/firebase';
import { collection, addDoc, updateDoc, doc, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { uploadImage } from '../../../../lib/cloudinary';
import Image from 'next/image';
import Link from 'next/link';

export default function AdminDayTour() {
  const [dayTours, setDayTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [selectedTour, setSelectedTour] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [confirmArchiveModal, setConfirmArchiveModal] = useState({ show: false, tour: null });
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    maxCapacity: '',
    availability: 'available',
    images: [],
    inclusions: []
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [inclusionInput, setInclusionInput] = useState('');
  
  const availabilityStatuses = [
    { value: 'available', label: 'Available', color: 'bg-green-100 text-green-700' },
    { value: 'unavailable', label: 'Not Available', color: 'bg-red-100 text-red-700' }
  ];
  
  // Real-time listener for active day tours (not archived)
  useEffect(() => {
    const toursRef = collection(db, 'dayTours');
    const q = query(toursRef, where('archived', '!=', true), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const toursList = [];
      querySnapshot.forEach((doc) => {
        toursList.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setDayTours(toursList);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching day tours:', error);
      showNotification('Failed to load day tours.', 'error');
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
    
    if (!formData.name.trim()) errors.name = 'Day tour name is required';
    if (!formData.basePrice) errors.basePrice = 'Base price is required';
    else if (isNaN(formData.basePrice) || parseFloat(formData.basePrice) <= 0) {
      errors.basePrice = 'Base price must be a positive number';
    }
    if (formData.maxCapacity && (isNaN(formData.maxCapacity) || parseInt(formData.maxCapacity) <= 0)) {
      errors.maxCapacity = 'Maximum capacity must be a positive number';
    }
    if (!formData.description.trim()) errors.description = 'Description is required';
    
    return errors;
  };
  
  const isFormIncomplete = () => {
    return !formData.name.trim() || !formData.basePrice || !formData.description.trim();
  };
  
  const handleAddTour = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setActionLoading(true);
    
    try {
      const tourData = {
        ...formData,
        basePrice: parseFloat(formData.basePrice),
        maxCapacity: formData.maxCapacity ? parseInt(formData.maxCapacity) : null,
        archived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await addDoc(collection(db, 'dayTours'), tourData);
      
      showNotification('Day tour added successfully!');
      resetForm();
      
      setTimeout(() => {
        setShowModal(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error adding day tour:', error);
      showNotification('Failed to add day tour.', 'error');
    } finally {
      setActionLoading(false);
    }
  };
  
  const handleUpdateTour = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setActionLoading(true);
    
    try {
      const tourRef = doc(db, 'dayTours', selectedTour.id);
      await updateDoc(tourRef, {
        ...formData,
        basePrice: parseFloat(formData.basePrice),
        maxCapacity: formData.maxCapacity ? parseInt(formData.maxCapacity) : null,
        updatedAt: new Date().toISOString()
      });
      
      showNotification('Day tour updated successfully!');
      
      setTimeout(() => {
        setShowModal(false);
        setShowViewModal(false);
        setSelectedTour(null);
      }, 2000);
      
    } catch (error) {
      console.error('Error updating day tour:', error);
      showNotification('Failed to update day tour.', 'error');
    } finally {
      setActionLoading(false);
    }
  };
  
  const handleArchiveTour = async (tour) => {
    try {
      const tourRef = doc(db, 'dayTours', tour.id);
      await updateDoc(tourRef, {
        archived: true,
        archivedAt: new Date().toISOString()
      });
      showNotification(`${tour.name} has been archived successfully!`);
      setConfirmArchiveModal({ show: false, tour: null });
    } catch (error) {
      console.error('Error archiving day tour:', error);
      showNotification('Failed to archive day tour.', 'error');
    }
  };
  
  const handleEditTour = (tour) => {
    setSelectedTour(tour);
    setFormData({
      name: tour.name || '',
      description: tour.description || '',
      basePrice: tour.basePrice || '',
      maxCapacity: tour.maxCapacity || '',
      availability: tour.availability || 'available',
      images: tour.images || [],
      inclusions: tour.inclusions || []
    });
    setModalType('edit');
    setShowModal(true);
    setShowViewModal(false);
  };
  
  const handleViewTour = (tour) => {
    setSelectedTour(tour);
    setShowViewModal(true);
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      basePrice: '',
      maxCapacity: '',
      availability: 'available',
      images: [],
      inclusions: []
    });
    setInclusionInput('');
    setFormErrors({});
  };
  
  const openAddModal = () => {
    setModalType('add');
    resetForm();
    setSelectedTour(null);
    setShowModal(true);
  };
  
  const filteredTours = dayTours.filter(tour => {
    const matchesSearch = tour.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || tour.availability === filterStatus;
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
    <div className="p-6 bg-gradient-to-br from-ocean-ice to-blue-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-textPrimary font-playfair mb-1">
            Day Tour Management
          </h1>
          <p className="text-textSecondary">
            Manage your day tour packages, pricing, and inclusions
          </p>
        </div>
        
        <div className="flex gap-3">
          <Link
            href="/dashboard/admin/activities"
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-ocean-light to-ocean-lighter text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
          >
            <i className="fas fa-bicycle text-sm"></i>
            Manage Activities
          </Link>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-ocean-mid to-ocean-light text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
          >
            <i className="fas fa-plus text-sm"></i>
            Add New Day Tour
          </button>
        </div>
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
              placeholder="Search by day tour name..."
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
          <option value="unavailable">Not Available</option>
        </select>
      </div>
      
      {/* Day Tours Table */}
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
                  <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Tour Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Max Capacity</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Base Price</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Inclusions</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Actions</th>
                  </tr>
              </thead>
              <tbody>
                {filteredTours.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-12 text-center text-neutral">
                      <i className="fas fa-sun text-5xl mb-3 opacity-50 block"></i>
                      <p className="text-lg">No day tours found</p>
                      <p className="text-sm">Click "Add New Day Tour" to get started</p>
                    </td>
                  </tr>
                ) : (
                  filteredTours.map((tour) => (
                    <tr key={tour.id} className="border-b border-ocean-light/10 hover:bg-ocean-ice/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-textPrimary">{tour.name}</div>
                      </td>
                      <td className="px-4 py-3 text-textSecondary">
                        {tour.maxCapacity ? (
                          <span className="flex items-center gap-1">
                            <i className="fas fa-users text-xs text-ocean-light"></i>
                            {tour.maxCapacity} Guests
                          </span>
                        ) : (
                          <span className="text-neutral">Unlimited</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-ocean-mid">₱{tour.basePrice.toLocaleString()}</span>
                        <span className="text-xs text-neutral">/person</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {tour.inclusions && tour.inclusions.slice(0, 2).map((inclusion, idx) => (
                            <span key={idx} className="text-xs px-2 py-0.5 bg-ocean-ice text-ocean-mid rounded-full">
                              {inclusion}
                            </span>
                          ))}
                          {tour.inclusions && tour.inclusions.length > 2 && (
                            <span className="text-xs px-2 py-0.5 bg-ocean-ice text-ocean-mid rounded-full">
                              +{tour.inclusions.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getAvailabilityStyle(tour.availability)}`}>
                          {getAvailabilityLabel(tour.availability)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewTour(tour)}
                            className="p-2 rounded-lg border border-ocean-light/20 bg-white text-ocean-mid hover:bg-ocean-mid hover:text-white hover:border-ocean-mid transition-all duration-200"
                            title="View Details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            onClick={() => setConfirmArchiveModal({ show: true, tour })}
                            className="p-2 rounded-lg border border-amber-200 bg-white text-amber-600 hover:bg-amber-600 hover:text-white hover:border-amber-600 transition-all duration-200"
                            title="Archive Tour"
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
      
      {/* View Tour Modal */}
      {showViewModal && selectedTour && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => {
          if (!actionLoading) {
            setShowViewModal(false);
            setSelectedTour(null);
          }
        }}>
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-auto p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-2xl font-bold text-textPrimary font-playfair">
                Day Tour Details - {selectedTour.name}
              </h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedTour(null);
                }}
                className="w-8 h-8 rounded-full bg-ocean-ice hover:bg-ocean-light/20 text-neutral hover:text-textPrimary transition-all duration-200 flex items-center justify-center"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            {/* Images Gallery */}
            {selectedTour.images && selectedTour.images.length > 0 && (
              <div className="mb-6">
                <div className="grid grid-cols-3 gap-3">
                  {selectedTour.images.map((img, idx) => (
                    <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-ocean-light/20 group">
                      <Image
                        src={img}
                        alt={`${selectedTour.name} ${idx + 1}`}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-neutral uppercase tracking-wide mb-1">Tour Name</label>
                <p className="text-lg font-semibold text-textPrimary">{selectedTour.name}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral uppercase tracking-wide mb-1">Max Capacity</label>
                <p className="text-textPrimary flex items-center gap-2">
                  <i className="fas fa-users text-ocean-light"></i>
                  {selectedTour.maxCapacity ? `${selectedTour.maxCapacity} Guests` : 'Unlimited'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral uppercase tracking-wide mb-1">Base Price</label>
                <p className="text-2xl font-bold text-ocean-mid">₱{selectedTour.basePrice.toLocaleString()}</p>
                <span className="text-xs text-neutral">per person</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral uppercase tracking-wide mb-1">Status</label>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getAvailabilityStyle(selectedTour.availability)}`}>
                  {getAvailabilityLabel(selectedTour.availability)}
                </span>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-neutral uppercase tracking-wide mb-1">Inclusions</label>
                <div className="flex flex-wrap gap-2">
                  {selectedTour.inclusions && selectedTour.inclusions.length > 0 ? (
                    selectedTour.inclusions.map((inclusion, idx) => (
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
                  {selectedTour.description}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-ocean-light/10">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedTour(null);
                }}
                className="px-5 py-2.5 border border-ocean-light/20 rounded-xl text-textSecondary text-sm font-medium hover:bg-ocean-ice transition-all duration-300"
              >
                Close
              </button>
              <button
                onClick={() => handleEditTour(selectedTour)}
                className="px-5 py-2.5 bg-gradient-to-r from-ocean-mid to-ocean-light rounded-xl text-white text-sm font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                <i className="fas fa-edit mr-2"></i>
                Edit Tour
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add/Edit Tour Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => {
          if (!actionLoading) {
            setShowModal(false);
            setSelectedTour(null);
          }
        }}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-textPrimary font-playfair">
                {modalType === 'add' ? 'Add New Day Tour' : 'Edit Day Tour'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedTour(null);
                }}
                className="w-8 h-8 rounded-full bg-ocean-ice hover:bg-ocean-light/20 text-neutral hover:text-textPrimary transition-all duration-200 flex items-center justify-center"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={modalType === 'add' ? handleAddTour : handleUpdateTour}>
              {/* Tour Name */}
              <div className="mb-4">
                <label className="block mb-1.5 text-sm font-medium text-textPrimary">Day Tour Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Island Hopping Tour, Beach Adventure, etc."
                  className={`w-full px-3 py-2.5 border ${formErrors.name ? 'border-red-500' : 'border-ocean-light/20'} rounded-xl text-sm focus:outline-none focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20`}
                />
                {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
              </div>
              
              {/* Base Price and Max Capacity */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-textPrimary">Base Price (₱) *</label>
                  <input
                    type="number"
                    name="basePrice"
                    value={formData.basePrice}
                    onChange={handleInputChange}
                    placeholder="Price per person"
                    className={`w-full px-3 py-2.5 border ${formErrors.basePrice ? 'border-red-500' : 'border-ocean-light/20'} rounded-xl text-sm focus:outline-none focus:border-ocean-light`}
                  />
                  {formErrors.basePrice && <p className="text-red-500 text-xs mt-1">{formErrors.basePrice}</p>}
                </div>
                
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-textPrimary">Maximum Capacity (Optional)</label>
                  <input
                    type="number"
                    name="maxCapacity"
                    value={formData.maxCapacity}
                    onChange={handleInputChange}
                    placeholder="Leave empty for unlimited"
                    className={`w-full px-3 py-2.5 border ${formErrors.maxCapacity ? 'border-red-500' : 'border-ocean-light/20'} rounded-xl text-sm focus:outline-none focus:border-ocean-light`}
                  />
                  {formErrors.maxCapacity && <p className="text-red-500 text-xs mt-1">{formErrors.maxCapacity}</p>}
                </div>
              </div>
              
              {/* Availability */}
              <div className="mb-4">
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
              
              {/* Inclusions */}
              <div className="mb-4">
                <label className="block mb-1.5 text-sm font-medium text-textPrimary">Inclusions (e.g., Cottage, Lunch, etc.)</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={inclusionInput}
                    onChange={(e) => setInclusionInput(e.target.value)}
                    placeholder="e.g., Cottage, Free Lunch, Snacks"
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
                  placeholder="Describe the day tour experience, itinerary, highlights..."
                  className={`w-full px-3 py-2.5 border ${formErrors.description ? 'border-red-500' : 'border-ocean-light/20'} rounded-xl text-sm focus:outline-none focus:border-ocean-light`}
                />
                {formErrors.description && <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>}
              </div>
              
              {/* Images Upload */}
              <div className="mb-5">
                <label className="block mb-1.5 text-sm font-medium text-textPrimary">Tour Images</label>
                <div className="border-2 border-dashed border-ocean-light/20 rounded-xl p-4 text-center hover:border-ocean-light transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                    id="tour-image-upload"
                  />
                  <label
                    htmlFor="tour-image-upload"
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
                          alt={`Tour image ${idx + 1}`}
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
                    setSelectedTour(null);
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
                    modalType === 'add' ? 'Add Day Tour' : 'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Archive Confirmation Modal */}
      {confirmArchiveModal.show && confirmArchiveModal.tour && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-scaleIn">
            <div className="text-center mb-5">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-amber-100 flex items-center justify-center">
                <i className="fas fa-archive text-amber-500 text-2xl"></i>
              </div>
              <h3 className="text-lg font-bold text-textPrimary mb-2">Archive Day Tour</h3>
              <p className="text-textSecondary text-sm">
                Are you sure you want to archive "{confirmArchiveModal.tour.name}"? 
                This tour will be moved to the archive and won't appear in active listings.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setConfirmArchiveModal({ show: false, tour: null })}
                className="px-5 py-2 border border-ocean-light/20 rounded-xl text-textSecondary text-sm font-medium hover:bg-ocean-ice transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleArchiveTour(confirmArchiveModal.tour)}
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