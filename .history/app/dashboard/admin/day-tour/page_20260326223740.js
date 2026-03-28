// app/dashboard/admin/day-tour/page.js
'use client';

import { useState, useEffect, useRef } from 'react';
import { db } from '../../../../lib/firebase';
import { collection, addDoc, updateDoc, doc, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { uploadImage } from '../../../../lib/cloudinary';
import { logAdminAction } from '../../../../lib/auditLogger';
import Image from 'next/image';
import ImageSlider from '@/components/guest/ImageSlider';

export default function AdminDayTour() {
  const [dayTours, setDayTours] = useState([]);
  const [activities, setActivities] = useState([]);
  const [activeTab, setActiveTab] = useState('tours');
  const [loading, setLoading] = useState(true);
  const [showTourModal, setShowTourModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showTourDetailsModal, setShowTourDetailsModal] = useState(false);
  const [showActivityDetailsModal, setShowActivityDetailsModal] = useState(false);
  const [tourModalType, setTourModalType] = useState('add');
  const [activityModalType, setActivityModalType] = useState('add');
  const [selectedTour, setSelectedTour] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activitySearchTerm, setActivitySearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [confirmArchiveModal, setConfirmArchiveModal] = useState({ show: false, tour: null });
  const [confirmArchiveActivityModal, setConfirmArchiveActivityModal] = useState({ show: false, activity: null });
  const pendingTourRemovalsRef = useRef([]);
  const tourRemovalTimerRef = useRef(null);
  const pendingActivityRemovalsRef = useRef([]);
  const activityRemovalTimerRef = useRef(null);
  // Track original form data for edit mode
  const [originalTourData, setOriginalTourData] = useState(null);
  const [originalActivityData, setOriginalActivityData] = useState(null);
  
  // Tour Form State
  const [tourFormData, setTourFormData] = useState({
    name: '',
    description: '',
    adultPrice: '',
    kidPrice: '',
    promoPrice: '',
    pricingType: 'per_person', // 'per_person', 'promo'
    maxCapacity: '',
    type: '',
    availability: 'available',
    images: [],
    inclusions: []
  });
  
  // Activity Form State
  const [activityFormData, setActivityFormData] = useState({
    name: '',
    pricePerHour: '',
    description: '',
    images: []
  });
  
  const [tourFormErrors, setTourFormErrors] = useState({});
  const [activityFormErrors, setActivityFormErrors] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [inclusionInput, setInclusionInput] = useState('');
  
  const availabilityStatuses = [
    { value: 'available', label: 'Available', color: 'bg-green-100 text-green-700' },
    { value: 'unavailable', label: 'Not Available', color: 'bg-red-100 text-red-700' }
  ];
  
  const activityStatuses = [
    { value: 'all', label: 'All Status' },
    { value: 'available', label: 'Available' },
    { value: 'unavailable', label: 'Not Available' }
  ];
  
  const pricingTypes = [
    { value: 'per_person', label: 'Price per person' },
    { value: 'promo', label: 'Promo Price' }
  ];
  
  // Real-time listener for day tours
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
    }, (error) => {
      console.error('Error fetching day tours:', error);
      showNotification('Failed to load day tours.', 'error');
    });
    
    return () => unsubscribe();
  }, []);
  
  // Real-time listener for activities (only show non-archived)
  useEffect(() => {
    const activitiesRef = collection(db, 'activities');
    const q = query(activitiesRef, where('archived', '!=', true), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const activitiesList = [];
      querySnapshot.forEach((doc) => {
        activitiesList.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setActivities(activitiesList);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching activities:', error);
      showNotification('Failed to load activities.', 'error');
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
  
  // Check if tour form has changes
  const hasTourChanges = () => {
    if (!originalTourData) return false;
    return JSON.stringify(tourFormData) !== JSON.stringify(originalTourData);
  };
  
  // Check if activity form has changes
  const hasActivityChanges = () => {
    if (!originalActivityData) return false;
    return JSON.stringify(activityFormData) !== JSON.stringify(originalActivityData);
  };
  
  // Tour Handlers
  const handleTourInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle numeric field validation to prevent negative numbers
    if (name === 'adultPrice' || name === 'kidPrice' || name === 'promoPrice' || name === 'maxCapacity') {
      const numValue = parseFloat(value);
      if (value !== '' && (isNaN(numValue) || numValue < 0)) {
        setTourFormErrors(prev => ({
          ...prev,
          [name]: `${name === 'adultPrice' ? 'Adult price' : name === 'kidPrice' ? 'Kid price' : name === 'promoPrice' ? 'Promo price' : 'Maximum capacity'} cannot be negative`
        }));
        setTourFormData(prev => ({
          ...prev,
          [name]: value
        }));
        return;
      } else {
        setTourFormErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
    }
    
    setTourFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (tourFormErrors[name]) {
      setTourFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Handle pricing type change
  const handlePricingTypeChange = (e) => {
    const value = e.target.value;
    setTourFormData(prev => ({
      ...prev,
      pricingType: value,
      maxCapacity: value === 'per_person' ? '' : prev.maxCapacity
    }));
  };
  
  const handleInclusionAdd = () => {
    if (inclusionInput.trim() && !tourFormData.inclusions.includes(inclusionInput.trim())) {
      setTourFormData(prev => ({
        ...prev,
        inclusions: [...prev.inclusions, inclusionInput.trim()]
      }));
      setInclusionInput('');
    }
  };
  
  const handleInclusionRemove = (inclusion) => {
    setTourFormData(prev => ({
      ...prev,
      inclusions: prev.inclusions.filter(i => i !== inclusion)
    }));
  };
  
const handleTourImageUpload = async (e) => {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;
  
  setUploadingImage(true);
  try {
    const uploadPromises = files.map(file => uploadImage(file));
    const uploadedUrls = await Promise.all(uploadPromises);
    
    setTourFormData(prev => ({
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

const handleTourImageRemove = (imageUrl) => {
  setTourFormData(prev => ({
    ...prev,
    images: prev.images.filter(img => img !== imageUrl)
  }));
};


  
  const validateTourForm = () => {
    const errors = {};
    
    if (!tourFormData.type.trim()) errors.type = 'Tour type is required';
    
    // Validate based on pricing type
    if (tourFormData.pricingType === 'per_person') {
      if (!tourFormData.adultPrice) errors.adultPrice = 'Adult price is required';
      else if (isNaN(tourFormData.adultPrice) || parseFloat(tourFormData.adultPrice) <= 0) {
        errors.adultPrice = 'Adult price must be a positive number';
      }
      if (!tourFormData.kidPrice) errors.kidPrice = 'Kid price is required';
      else if (isNaN(tourFormData.kidPrice) || parseFloat(tourFormData.kidPrice) <= 0) {
        errors.kidPrice = 'Kid price must be a positive number';
      }
    } else if (tourFormData.pricingType === 'promo') {
      if (!tourFormData.promoPrice) errors.promoPrice = 'Promo price is required';
      else if (isNaN(tourFormData.promoPrice) || parseFloat(tourFormData.promoPrice) <= 0) {
        errors.promoPrice = 'Promo price must be a positive number';
      }
    }
    
    if (tourFormData.pricingType !== 'per_person' && tourFormData.maxCapacity) {
      if (isNaN(tourFormData.maxCapacity) || parseInt(tourFormData.maxCapacity) <= 0) {
        errors.maxCapacity = 'Maximum capacity must be a positive number';
      }
    }
    if (!tourFormData.description.trim()) errors.description = 'Description is required';
    
    return errors;
  };
  
  const isTourFormIncomplete = () => {
    if (!tourFormData.type.trim() || !tourFormData.description.trim()) return true;
    
    if (tourFormData.pricingType === 'per_person') {
      return !tourFormData.adultPrice || !tourFormData.kidPrice;
    } else if (tourFormData.pricingType === 'promo') {
      return !tourFormData.promoPrice;
    }
    
    return true;
  };
  
  const handleAddTour = async (e) => {
    e.preventDefault();
    const errors = validateTourForm();
    
    if (Object.keys(errors).length > 0) {
      setTourFormErrors(errors);
      return;
    }
    
    setActionLoading(true);
    
    try {
      const tourData = {
        name: tourFormData.name || 'Day Tour',
        description: tourFormData.description,
        adultPrice: tourFormData.pricingType === 'per_person' ? parseFloat(tourFormData.adultPrice) : null,
        kidPrice: tourFormData.pricingType === 'per_person' ? parseFloat(tourFormData.kidPrice) : null,
        promoPrice: tourFormData.pricingType === 'promo' ? parseFloat(tourFormData.promoPrice) : null,
        pricingType: tourFormData.pricingType,
        maxCapacity: tourFormData.pricingType !== 'per_person' && tourFormData.maxCapacity ? parseInt(tourFormData.maxCapacity) : null,
        type: tourFormData.type,
        availability: tourFormData.availability,
        images: tourFormData.images,
        inclusions: tourFormData.inclusions,
        archived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await addDoc(collection(db, 'dayTours'), tourData);
      
      // Log the action
      await logAdminAction({
        action: 'Created Day Tour',
        module: 'Day Tour',
        details: `Added new day tour: ${tourFormData.type} (Name: ${tourFormData.name || 'Day Tour'}, Pricing: ${tourFormData.pricingType === 'per_person' ? `Adult: ₱${parseFloat(tourFormData.adultPrice).toLocaleString()}, Kid: ₱${parseFloat(tourFormData.kidPrice).toLocaleString()}` : `Promo: ₱${parseFloat(tourFormData.promoPrice).toLocaleString()}`}, Capacity: ${tourFormData.maxCapacity || 'Unlimited'}, Status: ${tourFormData.availability})`
      });
      
      showNotification('Day tour added successfully!');
      resetTourForm();
      
      setTimeout(() => {
        setShowTourModal(false);
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
  const errors = validateTourForm();
  
  if (Object.keys(errors).length > 0) {
    setTourFormErrors(errors);
    return;
  }
  
  setActionLoading(true);
  
  try {
    const tourRef = doc(db, 'dayTours', selectedTour.id);
    const tourName = selectedTour.name || selectedTour.type || 'Untitled';
    
    // Get previous data for audit log
    const previousData = {
      type: selectedTour.type,
      name: selectedTour.name || 'Day Tour',
      pricingType: selectedTour.pricingType,
      adultPrice: selectedTour.adultPrice,
      kidPrice: selectedTour.kidPrice,
      promoPrice: selectedTour.promoPrice,
      maxCapacity: selectedTour.maxCapacity,
      availability: selectedTour.availability,
      description: selectedTour.description,
      inclusions: selectedTour.inclusions || []
    };
    
    const newData = {
      type: tourFormData.type,
      name: tourFormData.name || 'Day Tour',
      pricingType: tourFormData.pricingType,
      adultPrice: tourFormData.pricingType === 'per_person' ? parseFloat(tourFormData.adultPrice) : null,
      kidPrice: tourFormData.pricingType === 'per_person' ? parseFloat(tourFormData.kidPrice) : null,
      promoPrice: tourFormData.pricingType === 'promo' ? parseFloat(tourFormData.promoPrice) : null,
      maxCapacity: tourFormData.pricingType !== 'per_person' && tourFormData.maxCapacity ? parseInt(tourFormData.maxCapacity) : null,
      availability: tourFormData.availability,
      description: tourFormData.description,
      inclusions: tourFormData.inclusions
    };
    
    await updateDoc(tourRef, {
      name: tourFormData.name || 'Untitled Tour',
      description: tourFormData.description,
      adultPrice: tourFormData.pricingType === 'per_person' ? parseFloat(tourFormData.adultPrice) : null,
      kidPrice: tourFormData.pricingType === 'per_person' ? parseFloat(tourFormData.kidPrice) : null,
      promoPrice: tourFormData.pricingType === 'promo' ? parseFloat(tourFormData.promoPrice) : null,
      pricingType: tourFormData.pricingType,
      maxCapacity: tourFormData.pricingType !== 'per_person' && tourFormData.maxCapacity ? parseInt(tourFormData.maxCapacity) : null,
      type: tourFormData.type,
      availability: tourFormData.availability,
      images: tourFormData.images,
      inclusions: tourFormData.inclusions,
      updatedAt: new Date().toISOString()
    });
    
    // Track specific changes for logging
    const changes = [];
    
    if (previousData.type !== newData.type) changes.push(`type from "${previousData.type}" to "${newData.type}"`);
    if (previousData.name !== newData.name) changes.push(`name from "${previousData.name}" to "${newData.name}"`);
    if (previousData.pricingType !== newData.pricingType) changes.push(`pricing type from "${previousData.pricingType}" to "${newData.pricingType}"`);
    if (previousData.adultPrice !== newData.adultPrice && newData.adultPrice) changes.push(`adult price from ₱${previousData.adultPrice?.toLocaleString()} to ₱${newData.adultPrice?.toLocaleString()}`);
    if (previousData.kidPrice !== newData.kidPrice && newData.kidPrice) changes.push(`kid price from ₱${previousData.kidPrice?.toLocaleString()} to ₱${newData.kidPrice?.toLocaleString()}`);
    if (previousData.promoPrice !== newData.promoPrice && newData.promoPrice) changes.push(`promo price from ₱${previousData.promoPrice?.toLocaleString()} to ₱${newData.promoPrice?.toLocaleString()}`);
    if (previousData.maxCapacity !== newData.maxCapacity) changes.push(`max capacity from ${previousData.maxCapacity || 'Unlimited'} to ${newData.maxCapacity || 'Unlimited'}`);
    if (previousData.availability !== newData.availability) changes.push(`availability from "${previousData.availability}" to "${newData.availability}"`);
    if (previousData.description !== newData.description) changes.push(`updated the description`);
    
    // Check for inclusions changes
    const previousInclusionsSet = new Set(previousData.inclusions);
    const newInclusionsSet = new Set(newData.inclusions);
    const addedInclusions = newData.inclusions.filter(i => !previousInclusionsSet.has(i));
    const removedInclusions = previousData.inclusions.filter(i => !newInclusionsSet.has(i));
    
    if (addedInclusions.length > 0) {
      changes.push(`added inclusions: ${addedInclusions.join(', ')}`);
    }
    if (removedInclusions.length > 0) {
      changes.push(`removed inclusions: ${removedInclusions.join(', ')}`);
    }
    
    // Build the log message - only log if there are actual changes
    if (changes.length > 0) {
      let logDetails = `Updated Day Tour '${tourName}'`;
      if (changes.length === 1 && changes[0] === 'updated the description') {
        logDetails += `: updated the description.`;
      } else if (changes.length === 1 && changes[0].includes('inclusions')) {
        logDetails += `: ${changes[0]}.`;
      } else if (changes.length > 0) {
        logDetails += `: ${changes.join(', ')}.`;
      }
      
      // Log the action only if there are actual changes
      await logAdminAction({
        action: 'Updated Day Tour',
        module: 'Day Tour',
        details: logDetails
      });
    }
    
    showNotification('Day tour updated successfully!');
    
    setTimeout(() => {
      setShowTourModal(false);
      setSelectedTour(null);
      setOriginalTourData(null);
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
      
      // Log the action
      await logAdminAction({
        action: 'Archived Day Tour',
        module: 'Day Tour',
        details: `Archived day tour: ${tour.type} (Name: ${tour.name || 'Day Tour'}, Pricing: ${tour.pricingType === 'per_person' ? `Adult: ₱${tour.adultPrice?.toLocaleString()}, Kid: ₱${tour.kidPrice?.toLocaleString()}` : `Promo: ₱${tour.promoPrice?.toLocaleString()}`}, Capacity: ${tour.maxCapacity || 'Unlimited'})`
      });
      
      showNotification(`${tour.name} has been archived successfully!`);
      setConfirmArchiveModal({ show: false, tour: null });
    } catch (error) {
      console.error('Error archiving day tour:', error);
      showNotification('Failed to archive day tour.', 'error');
    }
  };
  
  const handleEditTour = (tour) => {
    const formData = {
      name: tour.name || '',
      description: tour.description || '',
      adultPrice: tour.adultPrice || '',
      kidPrice: tour.kidPrice || '',
      promoPrice: tour.promoPrice || '',
      pricingType: tour.pricingType || 'per_person',
      maxCapacity: tour.maxCapacity || '',
      type: tour.type || '',
      availability: tour.availability || 'available',
      images: tour.images || [],
      inclusions: tour.inclusions || []
    };
    setSelectedTour(tour);
    setTourFormData(formData);
    setOriginalTourData(JSON.parse(JSON.stringify(formData)));
    setTourModalType('edit');
    setShowTourModal(true);
  };
  
  const resetTourForm = () => {
    const emptyForm = {
      name: '',
      description: '',
      adultPrice: '',
      kidPrice: '',
      promoPrice: '',
      pricingType: 'per_person',
      maxCapacity: '',
      type: '',
      availability: 'available',
      images: [],
      inclusions: []
    };
    setTourFormData(emptyForm);
    setOriginalTourData(null);
    setInclusionInput('');
    setTourFormErrors({});
  };
  
  const openAddTourModal = () => {
    setTourModalType('add');
    resetTourForm();
    setSelectedTour(null);
    setShowTourModal(true);
  };
  
  // Activity Handlers
  const handleActivityInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'pricePerHour') {
      const numValue = parseFloat(value);
      if (value !== '' && (isNaN(numValue) || numValue < 0)) {
        setActivityFormErrors(prev => ({
          ...prev,
          [name]: 'Price cannot be negative'
        }));
        setActivityFormData(prev => ({
          ...prev,
          [name]: value
        }));
        return;
      } else {
        setActivityFormErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
    }
    
    setActivityFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (activityFormErrors[name]) {
      setActivityFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

const handleActivityImageUpload = async (e) => {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;
  
  setUploadingImage(true);
  try {
    const uploadPromises = files.map(file => uploadImage(file));
    const uploadedUrls = await Promise.all(uploadPromises);
    
    // Log the image addition with count
    const activityName = activityFormData.name || 'Untitled';
    const imageCount = uploadedUrls.length;
    await logAdminAction({
      action: 'Updated Activity',
      module: 'Day Tour',
      details: `Updated Activity '${activityName}': added ${imageCount} image${imageCount > 1 ? 's' : ''}.`
    });
    
    setActivityFormData(prev => ({
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

const handleActivityImageRemove = (imageUrl) => {
  const activityName = activityFormData.name || 'Untitled';

  // Immediately update UI
  setActivityFormData(prev => ({
    ...prev,
    images: prev.images.filter(img => img !== imageUrl)
  }));

  // Add to pending removals grouped by activity
  if (!pendingActivityRemovalsRef.current[activityName]) {
    pendingActivityRemovalsRef.current[activityName] = [];
  }
  pendingActivityRemovalsRef.current[activityName].push(imageUrl);

  // Clear existing timer
  if (activityRemovalTimerRef.current) clearTimeout(activityRemovalTimerRef.current);

  // Set new timer to batch removals
  activityRemovalTimerRef.current = setTimeout(async () => {
    for (const [name, images] of Object.entries(pendingActivityRemovalsRef.current)) {
      const removalCount = images.length;
      if (removalCount > 0) {
        await logAdminAction({
          action: 'Updated Activity',
          module: 'Day Tour',
          details: `Updated Activity '${name}': removed ${removalCount} image${removalCount > 1 ? 's' : ''}.`
        });
      }
    }

    // Clear all pending removals
    pendingActivityRemovalsRef.current = {};
    activityRemovalTimerRef.current = null;
  }, 500);
};
  
  const validateActivityForm = () => {
    const errors = {};
    
    if (!activityFormData.name.trim()) errors.name = 'Activity name is required';
    if (!activityFormData.pricePerHour) errors.pricePerHour = 'Price per hour is required';
    else if (isNaN(activityFormData.pricePerHour) || parseFloat(activityFormData.pricePerHour) <= 0) {
      errors.pricePerHour = 'Price must be a positive number';
    }
    if (!activityFormData.description.trim()) errors.description = 'Description is required';
    
    return errors;
  };
  
  const isActivityFormIncomplete = () => {
    return !activityFormData.name.trim() || !activityFormData.pricePerHour || !activityFormData.description.trim();
  };
  
  const handleAddActivity = async (e) => {
    e.preventDefault();
    const errors = validateActivityForm();
    
    if (Object.keys(errors).length > 0) {
      setActivityFormErrors(errors);
      return;
    }
    
    setActionLoading(true);
    
    try {
      const activityData = {
        name: activityFormData.name,
        pricePerHour: parseFloat(activityFormData.pricePerHour),
        description: activityFormData.description,
        images: activityFormData.images,
        archived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await addDoc(collection(db, 'activities'), activityData);
      
      // Log the action
      await logAdminAction({
        action: 'Created Activity',
        module: 'Day Tour',
        details: `Added new activity: ${activityFormData.name} (Price: ₱${parseFloat(activityFormData.pricePerHour).toLocaleString()}/hour)`
      });
      
      showNotification('Activity added successfully!');
      resetActivityForm();
      
      setTimeout(() => {
        setShowActivityModal(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error adding activity:', error);
      showNotification('Failed to add activity.', 'error');
    } finally {
      setActionLoading(false);
    }
  };
  
const handleUpdateActivity = async (e) => {
  e.preventDefault();
  const errors = validateActivityForm();
  
  if (Object.keys(errors).length > 0) {
    setActivityFormErrors(errors);
    return;
  }
  
  setActionLoading(true);
  
  try {
    const activityRef = doc(db, 'activities', selectedActivity.id);
    const activityName = selectedActivity.name || 'Untitled';
    
    // Get previous data for audit log
    const previousData = {
      name: selectedActivity.name,
      pricePerHour: selectedActivity.pricePerHour,
      description: selectedActivity.description
    };
    
    const newData = {
      name: activityFormData.name,
      pricePerHour: parseFloat(activityFormData.pricePerHour),
      description: activityFormData.description
    };
    
    await updateDoc(activityRef, {
      name: activityFormData.name,
      pricePerHour: parseFloat(activityFormData.pricePerHour),
      description: activityFormData.description,
      images: activityFormData.images,
      updatedAt: new Date().toISOString()
    });
    
    // Track specific changes for logging
    const changes = [];
    
    if (previousData.name !== newData.name) changes.push(`name from "${previousData.name}" to "${newData.name}"`);
    if (previousData.pricePerHour !== newData.pricePerHour) changes.push(`price from ₱${previousData.pricePerHour.toLocaleString()}/hour to ₱${newData.pricePerHour.toLocaleString()}/hour`);
    if (previousData.description !== newData.description) changes.push(`updated the description`);
    
    // Build the log message - only log if there are actual changes
    if (changes.length > 0) {
      let logDetails = `Updated Activity '${activityName}'`;
      if (changes.length === 1 && changes[0] === 'updated the description') {
        logDetails += `: updated the description.`;
      } else if (changes.length > 0) {
        logDetails += `: ${changes.join(', ')}.`;
      }
      
      // Log the action only if there are actual changes
      await logAdminAction({
        action: 'Updated Activity',
        module: 'Day Tour',
        details: logDetails
      });
    }
    
    showNotification('Activity updated successfully!');
    
    setTimeout(() => {
      setShowActivityModal(false);
      setSelectedActivity(null);
      setOriginalActivityData(null);
    }, 2000);
    
  } catch (error) {
    console.error('Error updating activity:', error);
    showNotification('Failed to update activity.', 'error');
  } finally {
    setActionLoading(false);
  }
};
  
  const handleArchiveActivity = async (activity) => {
    try {
      const activityRef = doc(db, 'activities', activity.id);
      await updateDoc(activityRef, {
        archived: true,
        archivedAt: new Date().toISOString()
      });
      
      // Log the action
      await logAdminAction({
        action: 'Archived Activity',
        module: 'Day Tour',
        details: `Archived activity: ${activity.name} (Price: ₱${activity.pricePerHour.toLocaleString()}/hour)`
      });
      
      showNotification(`${activity.name} has been archived successfully!`);
      setConfirmArchiveActivityModal({ show: false, activity: null });
    } catch (error) {
      console.error('Error archiving activity:', error);
      showNotification('Failed to archive activity.', 'error');
    }
  };
  
  const handleEditActivity = (activity) => {
    const formData = {
      name: activity.name || '',
      pricePerHour: activity.pricePerHour || '',
      description: activity.description || '',
      images: activity.images || []
    };
    setSelectedActivity(activity);
    setActivityFormData(formData);
    setOriginalActivityData(JSON.parse(JSON.stringify(formData)));
    setActivityModalType('edit');
    setShowActivityModal(true);
  };
  
  const resetActivityForm = () => {
    setActivityFormData({
      name: '',
      pricePerHour: '',
      description: '',
      images: []
    });
    setOriginalActivityData(null);
    setActivityFormErrors({});
  };
  
  const openAddActivityModal = () => {
    setActivityModalType('add');
    resetActivityForm();
    setSelectedActivity(null);
    setShowActivityModal(true);
  };
  
  // Filter functions with improved search (name and type)
  const filteredTours = dayTours.filter(tour => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = tour.name?.toLowerCase().includes(searchLower) || 
                         tour.type?.toLowerCase().includes(searchLower);
    const matchesFilter = filterStatus === 'all' || tour.availability === filterStatus;
    return matchesSearch && matchesFilter;
  });
  
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.name?.toLowerCase().includes(activitySearchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'available' && true) ||
      (filterStatus === 'unavailable' && false);
    return matchesSearch;
  });
  
  const getAvailabilityStyle = (availability) => {
    const status = availabilityStatuses.find(s => s.value === availability);
    return status ? status.color : 'bg-gray-100 text-gray-700';
  };
  
  const getAvailabilityLabel = (availability) => {
    const status = availabilityStatuses.find(s => s.value === availability);
    return status ? status.label : availability;
  };
  
  const getPricingLabel = (pricingType) => {
    const type = pricingTypes.find(t => t.value === pricingType);
    return type ? type.label : 'Price per person';
  };
  
  // Calculate statistics for Day Tours
  const totalDayTourTypes = dayTours.length;
  const availableDayTourTypes = dayTours.filter(tour => tour.availability === 'available').length;
  const unavailableDayTourTypes = dayTours.filter(tour => tour.availability === 'unavailable').length;
  
  // Calculate statistics for Activities
  const totalActivities = activities.length;
  const availableActivities = activities.length;
  const unavailableActivities = 0;
  
  return (
    <div className="p-8 min-h-screen"style={{ backgroundColor: 'var(--color-blue-white)' }} >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-textPrimary font-playfair mb-1">
            Day Tour & Activities Management
          </h1>
          <p className="text-textSecondary">
            Manage day tour packages and activities like ATV, Banana Boat, etc.
          </p>
        </div>
        
        <div className="flex gap-3">
          {activeTab === 'tours' ? (
            <button
              onClick={openAddTourModal}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-ocean-mid to-ocean-light text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            >
              <i className="fas fa-plus text-sm"></i>
              Add New Day Tour
            </button>
          ) : (
            <button
              onClick={openAddActivityModal}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-ocean-mid to-ocean-light text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            >
              <i className="fas fa-plus text-sm"></i>
              Add New Activity
            </button>
          )}
        </div>
      </div>
      
      {/* Statistics Cards - Day Tour */}
      {activeTab === 'tours' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Total Day Tour Types */}
          <div className="bg-white rounded-2xl shadow-md border border-ocean-light/10 p-5 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between h-full">
              <div>
                <h3 className="text-sm font-semibold text-textSecondary uppercase tracking-wide mb-2">Total Day Tour Types</h3>
                <div className="text-3xl font-bold text-textPrimary">{totalDayTourTypes}</div>
              </div>
              <i className="fas fa-sun text-ocean-light text-3xl"></i>
            </div>
          </div>
          
          {/* Available Day Tour Types */}
          <div className="bg-white rounded-2xl shadow-md border border-ocean-light/10 p-5 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between h-full">
              <div>
                <h3 className="text-sm font-semibold text-textSecondary uppercase tracking-wide mb-2">Available Day Tour Types</h3>
                <div className="text-3xl font-bold text-textPrimary">{availableDayTourTypes}</div>
              </div>
              <i className="fas fa-check-circle text-green-500 text-3xl"></i>
            </div>
          </div>
          
          {/* Unavailable Day Tour Types */}
          <div className="bg-white rounded-2xl shadow-md border border-ocean-light/10 p-5 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between h-full">
              <div>
                <h3 className="text-sm font-semibold text-textSecondary uppercase tracking-wide mb-2">Unavailable Day Tour Types</h3>
                <div className="text-3xl font-bold text-textPrimary">{unavailableDayTourTypes}</div>
              </div>
              <i className="fas fa-ban text-red-500 text-3xl"></i>
            </div>
          </div>
        </div>
      )}
      
      {/* Statistics Cards - Activities */}
      {activeTab === 'activities' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Total Activities */}
          <div className="bg-white rounded-2xl shadow-md border border-ocean-light/10 p-5 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between h-full">
              <div>
                <h3 className="text-sm font-semibold text-textSecondary uppercase tracking-wide mb-2">Total Activities</h3>
                <div className="text-3xl font-bold text-textPrimary">{totalActivities}</div>
              </div>
              <i className="fas fa-bicycle text-ocean-light text-3xl"></i>
            </div>
          </div>
          
          {/* Available Activities */}
          <div className="bg-white rounded-2xl shadow-md border border-ocean-light/10 p-5 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between h-full">
              <div>
                <h3 className="text-sm font-semibold text-textSecondary uppercase tracking-wide mb-2">Available Activities</h3>
                <div className="text-3xl font-bold text-textPrimary">{availableActivities}</div>
              </div>
              <i className="fas fa-check-circle text-green-500 text-3xl"></i>
            </div>
          </div>
          
          {/* Unavailable Activities */}
          <div className="bg-white rounded-2xl shadow-md border border-ocean-light/10 p-5 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between h-full">
              <div>
                <h3 className="text-sm font-semibold text-textSecondary uppercase tracking-wide mb-2">Unavailable Activities</h3>
                <div className="text-3xl font-bold text-textPrimary">{unavailableActivities}</div>
              </div>
              <i className="fas fa-times-circle text-red-500 text-3xl"></i>
            </div>
          </div>
        </div>
      )}
      
      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-ocean-light/20">
        <button
          onClick={() => setActiveTab('tours')}
          className={`px-6 py-3 font-medium transition-all duration-200 ${
            activeTab === 'tours'
              ? 'text-ocean-mid border-b-2 border-ocean-mid'
              : 'text-textSecondary hover:text-ocean-mid'
          }`}
        >
          <i className="fas fa-sun mr-2"></i>
          Day Tours
        </button>
        <button
          onClick={() => setActiveTab('activities')}
          className={`px-6 py-3 font-medium transition-all duration-200 ${
            activeTab === 'activities'
              ? 'text-ocean-mid border-b-2 border-ocean-mid'
              : 'text-textSecondary hover:text-ocean-mid'
          }`}
        >
          <i className="fas fa-bicycle mr-2"></i>
          Activities
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
      
      {/* Day Tours Tab Content */}
      {activeTab === 'tours' && (
        <>
          {/* Filters and Search */}
          <div className="flex gap-4 mb-6 flex-wrap">
            <div className="flex-1 min-w-[350px]">
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-neutral text-sm"></i>
                <input
                  type="text"
                  placeholder="Search by day tour name or type..."
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
            <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Day Tour Name</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Day Tour Type</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Max Capacity</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Pricing</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Inclusions</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Status</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Actions</th>
            </tr>
        </thead>
        <tbody>
          {filteredTours.length === 0 ? (
            <tr>
              <td colSpan="7" className="px-4 py-12 text-center text-neutral">
                <i className="fas fa-sun text-5xl mb-3 opacity-50 block"></i>
                <p className="text-lg">No day tours found</p>
                <p className="text-sm">Click "Add New Day Tour" to get started</p>
              </td>
            </tr>
          ) : (
            filteredTours.map((tour) => (
              <tr key={tour.id} className="border-b border-ocean-light/10 hover:bg-ocean-ice/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium text-textPrimary">{tour.name || 'Untitled Tour'}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-textSecondary">{tour.type || 'N/A'}</div>
                </td>
                <td className="px-4 py-3 text-textSecondary">
                  {tour.maxCapacity ? (
                    <span className="flex items-center gap-1">
                      <i className="fas fa-users text-xs text-ocean-light"></i>
                      {tour.maxCapacity} Guests
                    </span>
                  ) : (
                    <span className="text-neutral">{tour.pricingType === 'per_person' ? 'Not applicable' : 'Unlimited'}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {tour.pricingType === 'per_person' ? (
                    <div>
                      <div className="text-sm">Adult: ₱{tour.adultPrice?.toLocaleString()}<span className="text-xs text-neutral">/person</span></div>
                      <div className="text-sm">Kid: ₱{tour.kidPrice?.toLocaleString()}<span className="text-xs text-neutral">/person</span></div>
                    </div>
                  ) : (
                    <div>
                      <div className="font-semibold text-ocean-mid">₱{tour.promoPrice?.toLocaleString()}</div>
                      <div className="text-xs text-neutral">Promo Price</div>
                    </div>
                  )}
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
                      onClick={() => {
                        setSelectedTour(tour);
                        setShowTourDetailsModal(true);
                      }}
                      className="p-2 rounded-lg border border-ocean-light/20 bg-white text-ocean-mid hover:bg-ocean-mid hover:text-white hover:border-ocean-mid transition-all duration-200"
                      title="View Details"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    <button
                      onClick={() => handleEditTour(tour)}
                      className="p-2 rounded-lg border border-ocean-light/20 bg-white text-ocean-mid hover:bg-ocean-mid hover:text-white hover:border-ocean-mid transition-all duration-200"
                      title="Edit Tour"
                    >
                      <i className="fas fa-edit"></i>
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
        </>
      )}
      
      {/* Activities Tab Content */}
      {activeTab === 'activities' && (
        <>
          <div className="flex gap-4 mb-6 flex-wrap">
            <div className="flex-1 min-w-[350px]">
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-neutral text-sm"></i>
                <input
                  type="text"
                  placeholder="Search activities..."
                  value={activitySearchTerm}
                  onChange={(e) => setActivitySearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-ocean-light/20 rounded-xl text-sm focus:outline-none focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 transition-all duration-300 bg-white"
                />
              </div>
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-ocean-light/20 rounded-xl text-sm text-textPrimary focus:outline-none focus:border-ocean-light cursor-pointer bg-white"
            >
              {activityStatuses.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
          
          <div className="bg-white rounded-2xl shadow-md border border-ocean-light/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-ocean-pale/50 border-b border-ocean-light/20">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Activity Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Price per Hour</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Description</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-textPrimary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActivities.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-4 py-12 text-center text-neutral">
                        <i className="fas fa-bicycle text-5xl mb-3 opacity-50 block"></i>
                        <p className="text-lg">No activities found</p>
                        <p className="text-sm">Click "Add New Activity" to get started</p>
                      </td>
                    </tr>
                  ) : (
                    filteredActivities.map((activity) => (
                      <tr key={activity.id} className="border-b border-ocean-light/10 hover:bg-ocean-ice/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-textPrimary">{activity.name}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-ocean-mid">₱{activity.pricePerHour.toLocaleString()}</span>
                          <span className="text-xs text-neutral">/hour</span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-textSecondary line-clamp-2 max-w-xs">{activity.description}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedActivity(activity);
                                setShowActivityDetailsModal(true);
                              }}
                              className="p-2 rounded-lg border border-ocean-light/20 bg-white text-ocean-mid hover:bg-ocean-mid hover:text-white hover:border-ocean-mid transition-all duration-200"
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              onClick={() => handleEditActivity(activity)}
                              className="p-2 rounded-lg border border-ocean-light/20 bg-white text-ocean-mid hover:bg-ocean-mid hover:text-white hover:border-ocean-mid transition-all duration-200"
                              title="Edit Activity"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              onClick={() => setConfirmArchiveActivityModal({ show: true, activity })}
                              className="p-2 rounded-lg border border-amber-200 bg-white text-amber-600 hover:bg-amber-600 hover:text-white hover:border-amber-600 transition-all duration-200"
                              title="Archive Activity"
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
        </>
      )}
      
      {/* Tour Details Modal */}
      {showTourDetailsModal && selectedTour && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => {
          setShowTourDetailsModal(false);
          setSelectedTour(null);
        }}>
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-auto p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-2xl font-bold text-textPrimary font-playfair">
                {selectedTour.name || 'Untitled Tour'} - {selectedTour.type || 'Day Tour'}
              </h2>
              <button
                onClick={() => {
                  setShowTourDetailsModal(false);
                  setSelectedTour(null);
                }}
                className="w-8 h-8 rounded-full bg-ocean-ice hover:bg-ocean-light/20 text-neutral hover:text-textPrimary transition-all duration-200 flex items-center justify-center"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            {selectedTour.images && selectedTour.images.length > 0 && (
              <div className="mb-6">
                <ImageSlider images={selectedTour.images} roomType={selectedTour.name || 'Day Tour'} />
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-neutral uppercase tracking-wide mb-1">Tour Name</label>
                <p className="text-lg font-semibold text-textPrimary">{selectedTour.name || 'Untitled Tour'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral uppercase tracking-wide mb-1">Tour Type</label>
                <p className="text-textPrimary">{selectedTour.type || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral uppercase tracking-wide mb-1">Max Capacity</label>
                <p className="text-textPrimary flex items-center gap-2">
                  <i className="fas fa-users text-ocean-light"></i>
                  {selectedTour.maxCapacity ? `${selectedTour.maxCapacity} Guests` : (selectedTour.pricingType === 'per_person' ? 'Not applicable' : 'Unlimited')}
                </p>
              </div>
              {selectedTour.pricingType === 'per_person' ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-neutral uppercase tracking-wide mb-1">Adult Price (16+)</label>
                    <p className="text-2xl font-bold text-ocean-mid">₱{selectedTour.adultPrice?.toLocaleString()}<span className="text-sm font-normal text-textSecondary">/person</span></p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral uppercase tracking-wide mb-1">Kid Price (15-)</label>
                    <p className="text-2xl font-bold text-ocean-mid">₱{selectedTour.kidPrice?.toLocaleString()}<span className="text-sm font-normal text-textSecondary">/person</span></p>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-neutral uppercase tracking-wide mb-1">Promo Price</label>
                  <p className="text-2xl font-bold text-ocean-mid">₱{selectedTour.promoPrice?.toLocaleString()}</p>
                  <span className="text-xs text-neutral">Promo Price</span>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-neutral uppercase tracking-wide mb-1">Pricing Type</label>
                <p className="text-textPrimary">{getPricingLabel(selectedTour.pricingType)}</p>
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
                  setShowTourDetailsModal(false);
                  setSelectedTour(null);
                }}
                className="px-5 py-2.5 border border-ocean-light/20 rounded-xl text-textSecondary text-sm font-medium hover:bg-ocean-ice transition-all duration-300"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowTourDetailsModal(false);
                  handleEditTour(selectedTour);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-ocean-mid to-ocean-light rounded-xl text-white text-sm font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                <i className="fas fa-edit mr-2"></i>
                Edit Tour
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Activity Details Modal */}
      {showActivityDetailsModal && selectedActivity && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => {
          setShowActivityDetailsModal(false);
          setSelectedActivity(null);
        }}>
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-auto p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-2xl font-bold text-textPrimary font-playfair">
                {selectedActivity.name}
              </h2>
              <button
                onClick={() => {
                  setShowActivityDetailsModal(false);
                  setSelectedActivity(null);
                }}
                className="w-8 h-8 rounded-full bg-ocean-ice hover:bg-ocean-light/20 text-neutral hover:text-textPrimary transition-all duration-200 flex items-center justify-center"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            {selectedActivity.images && selectedActivity.images.length > 0 && (
              <div className="mb-6">
                <ImageSlider images={selectedActivity.images} roomType={selectedActivity.name} />
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-neutral uppercase tracking-wide mb-1">Activity Name</label>
                <p className="text-lg font-semibold text-textPrimary">{selectedActivity.name}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral uppercase tracking-wide mb-1">Price per Hour</label>
                <p className="text-2xl font-bold text-ocean-mid">₱{selectedActivity.pricePerHour.toLocaleString()}</p>
                <span className="text-xs text-neutral">per hour</span>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-neutral uppercase tracking-wide mb-1">Description</label>
                <p className="text-textSecondary leading-relaxed whitespace-pre-wrap">
                  {selectedActivity.description}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-ocean-light/10">
              <button
                onClick={() => {
                  setShowActivityDetailsModal(false);
                  setSelectedActivity(null);
                }}
                className="px-5 py-2.5 border border-ocean-light/20 rounded-xl text-textSecondary text-sm font-medium hover:bg-ocean-ice transition-all duration-300"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowActivityDetailsModal(false);
                  handleEditActivity(selectedActivity);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-ocean-mid to-ocean-light rounded-xl text-white text-sm font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                <i className="fas fa-edit mr-2"></i>
                Edit Activity
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add/Edit Tour Modal */}
      {showTourModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => {
          if (!actionLoading) {
            setShowTourModal(false);
            setSelectedTour(null);
            setOriginalTourData(null);
          }
        }}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-textPrimary font-playfair">
                {tourModalType === 'add' ? 'Add New Day Tour' : 'Edit Day Tour'}
              </h2>
              <button
                onClick={() => {
                  setShowTourModal(false);
                  setSelectedTour(null);
                  setOriginalTourData(null);
                }}
                className="w-8 h-8 rounded-full bg-ocean-ice hover:bg-ocean-light/20 text-neutral hover:text-textPrimary transition-all duration-200 flex items-center justify-center"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={tourModalType === 'add' ? handleAddTour : handleUpdateTour}>
              {/* Tour Name - Optional */}
              <div className="mb-4">
                <label className="block mb-1.5 text-sm font-medium text-textPrimary">
                  Day Tour Name <span className="text-xs text-neutral">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={tourFormData.name}
                  onChange={handleTourInputChange}
                  placeholder="e.g., Island Hopping Tour, Beach Adventure, etc."
                  className="w-full px-3 py-2.5 border border-ocean-light/20 rounded-xl text-sm focus:outline-none focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20"
                />
                <p className="text-xs text-neutral mt-1">If left empty, will default to "Day Tour"</p>
              </div>
              
              {/* Tour Type */}
              <div className="mb-4">
                <label className="block mb-1.5 text-sm font-medium text-textPrimary">Day Tour Type *</label>
                <input
                  type="text"
                  name="type"
                  value={tourFormData.type}
                  onChange={handleTourInputChange}
                  placeholder="e.g., Family Tour, Adventure Tour, Island Hopping"
                  className={`w-full px-3 py-2.5 border ${tourFormErrors.type ? 'border-red-500' : 'border-ocean-light/20'} rounded-xl text-sm focus:outline-none focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20`}
                />
                {tourFormErrors.type && <p className="text-red-500 text-xs mt-1">{tourFormErrors.type}</p>}
              </div>
              
              {/* Pricing Type */}
              <div className="mb-4">
                <label className="block mb-1.5 text-sm font-medium text-textPrimary">Pricing Type *</label>
                <select
                  name="pricingType"
                  value={tourFormData.pricingType}
                  onChange={handlePricingTypeChange}
                  className="w-full px-3 py-2.5 border border-ocean-light/20 rounded-xl text-sm focus:outline-none focus:border-ocean-light bg-white mb-3"
                >
                  {pricingTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              
              {/* Conditional Pricing Fields */}
              {tourFormData.pricingType === 'per_person' ? (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-textPrimary">Adult Price (₱) - 16+ *</label>
                    <input
                      type="number"
                      name="adultPrice"
                      value={tourFormData.adultPrice}
                      onChange={handleTourInputChange}
                      placeholder="Adult price"
                      className={`w-full px-3 py-2.5 border ${tourFormErrors.adultPrice ? 'border-red-500' : 'border-ocean-light/20'} rounded-xl text-sm focus:outline-none focus:border-ocean-light`}
                      step="0.01"
                      min="0"
                    />
                    {tourFormErrors.adultPrice && <p className="text-red-500 text-xs mt-1">{tourFormErrors.adultPrice}</p>}
                  </div>
                  
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-textPrimary">Kid Price (₱) - 15- *</label>
                    <input
                      type="number"
                      name="kidPrice"
                      value={tourFormData.kidPrice}
                      onChange={handleTourInputChange}
                      placeholder="Kid price"
                      className={`w-full px-3 py-2.5 border ${tourFormErrors.kidPrice ? 'border-red-500' : 'border-ocean-light/20'} rounded-xl text-sm focus:outline-none focus:border-ocean-light`}
                      step="0.01"
                      min="0"
                    />
                    {tourFormErrors.kidPrice && <p className="text-red-500 text-xs mt-1">{tourFormErrors.kidPrice}</p>}
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <label className="block mb-1.5 text-sm font-medium text-textPrimary">Promo Price (₱) *</label>
                  <input
                    type="number"
                    name="promoPrice"
                    value={tourFormData.promoPrice}
                    onChange={handleTourInputChange}
                    placeholder="Promo price"
                    className={`w-full px-3 py-2.5 border ${tourFormErrors.promoPrice ? 'border-red-500' : 'border-ocean-light/20'} rounded-xl text-sm focus:outline-none focus:border-ocean-light`}
                    step="0.01"
                    min="0"
                  />
                  {tourFormErrors.promoPrice && <p className="text-red-500 text-xs mt-1">{tourFormErrors.promoPrice}</p>}
                </div>
              )}
              
              {/* Max Capacity */}
              <div className="mb-4">
                <label className="block mb-1.5 text-sm font-medium text-textPrimary">
                  Maximum Capacity
                  {tourFormData.pricingType === 'per_person' && (
                    <span className="text-xs text-neutral ml-2">(Disabled for per-person pricing)</span>
                  )}
                </label>
                <input
                  type="number"
                  name="maxCapacity"
                  value={tourFormData.maxCapacity}
                  onChange={handleTourInputChange}
                  placeholder={tourFormData.pricingType === 'per_person' ? "Not applicable for per-person pricing" : "Leave empty for unlimited"}
                  disabled={tourFormData.pricingType === 'per_person'}
                  className={`w-full px-3 py-2.5 border ${tourFormErrors.maxCapacity ? 'border-red-500' : 'border-ocean-light/20'} rounded-xl text-sm focus:outline-none focus:border-ocean-light ${
                    tourFormData.pricingType === 'per_person' ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  min="0"
                />
                {tourFormErrors.maxCapacity && <p className="text-red-500 text-xs mt-1">{tourFormErrors.maxCapacity}</p>}
              </div>
              
              {/* Availability */}
              <div className="mb-4">
                <label className="block mb-1.5 text-sm font-medium text-textPrimary">Availability *</label>
                <select
                  name="availability"
                  value={tourFormData.availability}
                  onChange={handleTourInputChange}
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
                  {tourFormData.inclusions.map((inclusion, idx) => (
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
                  value={tourFormData.description}
                  onChange={handleTourInputChange}
                  rows="4"
                  placeholder="Describe the day tour experience, itinerary, highlights..."
                  className={`w-full px-3 py-2.5 border ${tourFormErrors.description ? 'border-red-500' : 'border-ocean-light/20'} rounded-xl text-sm focus:outline-none focus:border-ocean-light`}
                />
                {tourFormErrors.description && <p className="text-red-500 text-xs mt-1">{tourFormErrors.description}</p>}
              </div>
              
              {/* Images Upload - Optional */}
              <div className="mb-5">
                <label className="block mb-1.5 text-sm font-medium text-textPrimary">
                  Tour Images <span className="text-xs text-neutral">(Optional)</span>
                </label>
                <div className="border-2 border-dashed border-ocean-light/20 rounded-xl p-4 text-center hover:border-ocean-light transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleTourImageUpload}
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
                    <span className="text-xs text-neutral">PNG, JPG up to 5MB (Optional)</span>
                  </label>
                </div>
                
                {tourFormData.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {tourFormData.images.map((img, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-ocean-light/20">
                        <Image
                          src={img}
                          alt={`Tour image ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleTourImageRemove(img)}
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
                    setShowTourModal(false);
                    setSelectedTour(null);
                    setOriginalTourData(null);
                  }}
                  className="px-5 py-2.5 border border-ocean-light/20 rounded-xl text-textSecondary text-sm font-medium hover:bg-ocean-ice transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || (tourModalType === 'edit' ? !hasTourChanges() : isTourFormIncomplete())}
                  className={`px-5 py-2.5 rounded-xl text-white text-sm font-medium transition-all duration-300 ${
                    actionLoading || (tourModalType === 'edit' ? !hasTourChanges() : isTourFormIncomplete())
                      ? 'bg-neutral cursor-not-allowed opacity-50'
                      : 'bg-gradient-to-r from-ocean-mid to-ocean-light hover:shadow-lg hover:-translate-y-0.5'
                  }`}
                >
                  {actionLoading ? (
                    <span><i className="fas fa-spinner fa-spin mr-2"></i> {tourModalType === 'add' ? 'Adding...' : 'Updating...'}</span>
                  ) : (
                    tourModalType === 'add' ? 'Add Day Tour' : 'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Add/Edit Activity Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => {
          if (!actionLoading) {
            setShowActivityModal(false);
            setSelectedActivity(null);
            setOriginalActivityData(null);
          }
        }}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-textPrimary font-playfair">
                {activityModalType === 'add' ? 'Add New Activity' : 'Edit Activity'}
              </h2>
              <button
                onClick={() => {
                  setShowActivityModal(false);
                  setSelectedActivity(null);
                  setOriginalActivityData(null);
                }}
                className="w-8 h-8 rounded-full bg-ocean-ice hover:bg-ocean-light/20 text-neutral hover:text-textPrimary transition-all duration-200 flex items-center justify-center"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={activityModalType === 'add' ? handleAddActivity : handleUpdateActivity}>
              {/* Activity Name */}
              <div className="mb-4">
                <label className="block mb-1.5 text-sm font-medium text-textPrimary">Activity Name *</label>
                <input
                  type="text"
                  name="name"
                  value={activityFormData.name}
                  onChange={handleActivityInputChange}
                  placeholder="e.g., ATV, Banana Boat, Jet Ski"
                  className={`w-full px-3 py-2.5 border ${activityFormErrors.name ? 'border-red-500' : 'border-ocean-light/20'} rounded-xl text-sm focus:outline-none focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20`}
                />
                {activityFormErrors.name && <p className="text-red-500 text-xs mt-1">{activityFormErrors.name}</p>}
              </div>
              
              {/* Price per Hour */}
              <div className="mb-4">
                <label className="block mb-1.5 text-sm font-medium text-textPrimary">Price per Hour (₱) *</label>
                <input
                  type="number"
                  name="pricePerHour"
                  value={activityFormData.pricePerHour}
                  onChange={handleActivityInputChange}
                  placeholder="Price per hour"
                  className={`w-full px-3 py-2.5 border ${activityFormErrors.pricePerHour ? 'border-red-500' : 'border-ocean-light/20'} rounded-xl text-sm focus:outline-none focus:border-ocean-light`}
                  step="0.01"
                  min="0"
                />
                {activityFormErrors.pricePerHour && <p className="text-red-500 text-xs mt-1">{activityFormErrors.pricePerHour}</p>}
              </div>
              
              {/* Description */}
              <div className="mb-4">
                <label className="block mb-1.5 text-sm font-medium text-textPrimary">Description *</label>
                <textarea
                  name="description"
                  value={activityFormData.description}
                  onChange={handleActivityInputChange}
                  rows="3"
                  placeholder="Describe the activity..."
                  className={`w-full px-3 py-2.5 border ${activityFormErrors.description ? 'border-red-500' : 'border-ocean-light/20'} rounded-xl text-sm focus:outline-none focus:border-ocean-light`}
                />
                {activityFormErrors.description && <p className="text-red-500 text-xs mt-1">{activityFormErrors.description}</p>}
              </div>
              
              {/* Multiple Images Upload - Optional */}
              <div className="mb-5">
                <label className="block mb-1.5 text-sm font-medium text-textPrimary">
                  Activity Images <span className="text-xs text-neutral">(Optional)</span>
                </label>
                <div className="border-2 border-dashed border-ocean-light/20 rounded-xl p-4 text-center hover:border-ocean-light transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleActivityImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                    id="activity-image-upload"
                  />
                  <label
                    htmlFor="activity-image-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <i className={`fas ${uploadingImage ? 'fa-spinner fa-spin' : 'fa-cloud-upload-alt'} text-3xl text-ocean-light`}></i>
                    <span className="text-sm text-textSecondary">
                      {uploadingImage ? 'Uploading...' : 'Click to upload images'}
                    </span>
                    <span className="text-xs text-neutral">PNG, JPG up to 5MB (Optional)</span>
                  </label>
                </div>
                
                {activityFormData.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {activityFormData.images.map((img, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-ocean-light/20">
                        <Image
                          src={img}
                          alt={`Activity image ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleActivityImageRemove(img)}
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
                    setShowActivityModal(false);
                    setSelectedActivity(null);
                    setOriginalActivityData(null);
                  }}
                  className="px-5 py-2.5 border border-ocean-light/20 rounded-xl text-textSecondary text-sm font-medium hover:bg-ocean-ice transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || (activityModalType === 'edit' ? !hasActivityChanges() : isActivityFormIncomplete())}
                  className={`px-5 py-2.5 rounded-xl text-white text-sm font-medium transition-all duration-300 ${
                    actionLoading || (activityModalType === 'edit' ? !hasActivityChanges() : isActivityFormIncomplete())
                      ? 'bg-neutral cursor-not-allowed opacity-50'
                      : 'bg-gradient-to-r from-ocean-mid to-ocean-light hover:shadow-lg hover:-translate-y-0.5'
                  }`}
                >
                  {actionLoading ? (
                    <span><i className="fas fa-spinner fa-spin mr-2"></i> {activityModalType === 'add' ? 'Adding...' : 'Updating...'}</span>
                  ) : (
                    activityModalType === 'add' ? 'Add Activity' : 'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Archive Modals */}
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
      
      {confirmArchiveActivityModal.show && confirmArchiveActivityModal.activity && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-scaleIn">
            <div className="text-center mb-5">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-amber-100 flex items-center justify-center">
                <i className="fas fa-archive text-amber-500 text-2xl"></i>
              </div>
              <h3 className="text-lg font-bold text-textPrimary mb-2">Archive Activity</h3>
              <p className="text-textSecondary text-sm">
                Are you sure you want to archive "{confirmArchiveActivityModal.activity.name}"? 
                This activity will be moved to the archive and won't appear in active listings.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setConfirmArchiveActivityModal({ show: false, activity: null })}
                className="px-5 py-2 border border-ocean-light/20 rounded-xl text-textSecondary text-sm font-medium hover:bg-ocean-ice transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleArchiveActivity(confirmArchiveActivityModal.activity)}
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