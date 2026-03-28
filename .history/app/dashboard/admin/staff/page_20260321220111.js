'use client';

import { useState, useEffect } from 'react';
import { auth, db } from '../../../../lib/firebase';
import { collection, query, getDocs, addDoc, updateDoc, doc, deleteDoc, where, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'staff',
    status: 'active',
    phone: '',
  });
  
  // Password 
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formErrors, setFormErrors] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  const router = useRouter();

  // Fetch staff members
  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', 'in', ['staff', 'admin']));
      const querySnapshot = await getDocs(q);
      
      const staffList = [];
      querySnapshot.forEach((doc) => {
        staffList.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setStaff(staffList);
    } catch (error) {
      console.error('Error fetching staff:', error);
      setErrorMessage('Failed to load staff members.');
    } finally {
      setLoading(false);
    }
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (modalType === 'add') {
      if (!formData.password) {
        errors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
      
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }
    
    return errors;
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setActionLoading(true);
    setErrorMessage('');
    
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      const uid = userCredential.user.uid;
      
      await setDoc(doc(db, 'users', uid), {
        uid: uid,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status,
        phone: formData.phone || '',
        createdAt: new Date().toISOString(),
        createdBy: auth.currentUser?.uid || ''
      });
      
      setSuccessMessage('Staff account created successfully!');
      resetForm();
      fetchStaff();
      
      setTimeout(() => {
        setShowModal(false);
        setSuccessMessage('');
      }, 2000);
      
    } catch (error) {
      console.error('Error creating staff:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        setErrorMessage('Email is already in use.');
      } else {
        setErrorMessage('Failed to create staff account. Please try again.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setFormErrors({ name: 'Name is required' });
      return;
    }
    
    setActionLoading(true);
    setErrorMessage('');
    
    try {
      const userRef = doc(db, 'users', selectedStaff.id);
      await updateDoc(userRef, {
        name: formData.name,
        phone: formData.phone || '',
      });
      
      setSuccessMessage('Staff information updated successfully!');
      fetchStaff();
      
      setTimeout(() => {
        setShowModal(false);
        setSelectedStaff(null);
        setIsEditing(false);
        setSuccessMessage('');
      }, 2000);
      
    } catch (error) {
      console.error('Error updating staff:', error);
      setErrorMessage('Failed to update staff information.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (staffMember) => {
    try {
      const newStatus = staffMember.status === 'active' ? 'inactive' : 'active';
      
      const userRef = doc(db, 'users', staffMember.id);
      await updateDoc(userRef, {
        status: newStatus
      });
      
      setSuccessMessage(`Staff account ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`);
      
      setStaff(prev => prev.map(s => 
        s.id === staffMember.id ? { ...s, status: newStatus } : s
      ));
      
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (error) {
      console.error('Error toggling status:', error);
      setErrorMessage('Failed to update staff status.');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handlePromoteToAdmin = async (staffMember) => {
    if (!confirm(`Are you sure you want to promote ${staffMember.name} to Admin?`)) {
      return;
    }
    
    try {
      const userRef = doc(db, 'users', staffMember.id);
      await updateDoc(userRef, {
        role: 'admin'
      });
      
      setSuccessMessage(`${staffMember.name} has been promoted to Admin successfully!`);
      
      setStaff(prev => prev.map(s => 
        s.id === staffMember.id ? { ...s, role: 'admin' } : s
      ));
      
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (error) {
      console.error('Error promoting to admin:', error);
      setErrorMessage('Failed to promote staff member.');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleDemoteToStaff = async (staffMember) => {
    if (!confirm(`Are you sure you want to demote ${staffMember.name} to Staff?`)) {
      return;
    }
    
    try {
      const userRef = doc(db, 'users', staffMember.id);
      await updateDoc(userRef, {
        role: 'staff'
      });
      
      setSuccessMessage(`${staffMember.name} has been demoted to Staff successfully!`);
      
      setStaff(prev => prev.map(s => 
        s.id === staffMember.id ? { ...s, role: 'staff' } : s
      ));
      
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (error) {
      console.error('Error demoting to staff:', error);
      setErrorMessage('Failed to demote staff member.');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleViewStaff = (staffMember) => {
    setSelectedStaff(staffMember);
    setFormData({
      name: staffMember.name || '',
      email: staffMember.email || '',
      phone: staffMember.phone || '',
      role: staffMember.role || 'staff',
      status: staffMember.status || 'active',
    });
    setModalType('view');
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEditToggle = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({
      name: selectedStaff.name || '',
      email: selectedStaff.email || '',
      phone: selectedStaff.phone || '',
      role: selectedStaff.role || 'staff',
      status: selectedStaff.status || 'active',
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'staff',
      status: 'active',
      phone: '',
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
    setFormErrors({});
  };

  const openAddModal = () => {
    setModalType('add');
    resetForm();
    setSelectedStaff(null);
    setShowModal(true);
  };

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || member.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0F172B] font-['Playfair_Display'] mb-2">
            Staff Management
          </h1>
          <p className="text-gray-600">
            Manage staff accounts, permissions, and status
          </p>
        </div>
        
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-[#00B8DB] to-[#0095b3] text-white rounded-lg font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
        >
          <i className="fas fa-plus text-sm"></i>
          Add New Staff
        </button>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700">
          <i className="fas fa-check-circle text-green-500"></i>
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
          <i className="fas fa-exclamation-circle text-red-500"></i>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex gap-4 mb-8 flex-wrap">
        <div className="flex-1 min-w-62.5">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00B8DB] focus:ring-2 focus:ring-[#00B8DB]/20 transition-all duration-300"
            />
          </div>
        </div>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00B8DB] focus:ring-2 focus:ring-[#00B8DB]/20 text-gray-700 cursor-pointer min-w-[150px]"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Staff Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <i className="fas fa-spinner fa-spin text-4xl text-[#00B8DB]"></i>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="px-6 py-4 text-left text-gray-700 font-semibold">Name</th>
                <th className="px-6 py-4 text-left text-gray-700 font-semibold">Email</th>
                <th className="px-6 py-4 text-left text-gray-700 font-semibold">Phone</th>
                <th className="px-6 py-4 text-left text-gray-700 font-semibold">Role</th>
                <th className="px-6 py-4 text-left text-gray-700 font-semibold">Status</th>
                <th className="px-6 py-4 text-left text-gray-700 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No staff members found
                  </td>
                </tr>
              ) : (
                filteredStaff.map((member) => (
                  <tr key={member.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{member.name}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{member.email}</td>
                    <td className="px-6 py-4 text-gray-600">{member.phone || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        member.role === 'admin' 
                          ? 'bg-cyan-50 text-cyan-600 border border-cyan-200' 
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}>
                        {member.role === 'admin' ? 'Admin' : 'Staff'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        member.status === 'active' 
                          ? 'bg-green-50 text-green-700 border border-green-200' 
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {member.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {/* Toggle Status Button */}
                        <button
                          onClick={() => handleToggleStatus(member)}
                          className={`p-2 rounded-lg border border-gray-200 bg-white hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 ${
                            member.status === 'active' 
                              ? 'text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600' 
                              : 'text-green-600 hover:bg-green-600 hover:text-white hover:border-green-600'
                          }`}
                          title={member.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          <i className={`fas ${member.status === 'active' ? 'fa-ban' : 'fa-check-circle'}`}></i>
                        </button>

                        {/* Promote/Demote Button */}
                        {member.role === 'staff' ? (
                          <button
                            onClick={() => handlePromoteToAdmin(member)}
                            className="p-2 rounded-lg border border-gray-200 bg-white text-cyan-600 hover:bg-cyan-600 hover:text-white hover:border-cyan-600 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200"
                            title="Promote to Admin"
                          >
                            <i className="fas fa-arrow-up"></i>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDemoteToStaff(member)}
                            className="p-2 rounded-lg border border-gray-200 bg-white text-blue-800 hover:bg-blue-800 hover:text-white hover:border-blue-800 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200"
                            title="Demote to Staff"
                          >
                            <i className="fas fa-arrow-down"></i>
                          </button>
                        )}

                        {/* View/Edit Staff Button */}
                        <button
                          onClick={() => handleViewStaff(member)}
                          className="p-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-700 hover:text-white hover:border-gray-700 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200"
                          title="View/Edit Staff Information"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/View/Edit Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => {
          if (!actionLoading) {
            setShowModal(false);
            setSelectedStaff(null);
            setIsEditing(false);
          }
        }}>
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#0F172B] font-['Playfair_Display']">
                  {modalType === 'add' ? 'Add New Staff Member' : 
                   modalType === 'view' && !isEditing ? 'Staff Information' : 'Edit Staff Information'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedStaff(null);
                    setIsEditing(false);
                  }}
                  className="text-gray-400 hover:text-cyan-500 hover:scale-110 transition-all duration-200 text-2xl"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              {modalType === 'add' ? (
                <form onSubmit={handleAddStaff}>
                  {/* Name */}
                  <div className="mb-4">
                    <label className="block mb-2 text-gray-700 font-medium text-sm">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-3 border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300`}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#00B8DB'}
                      onBlur={(e) => e.currentTarget.style.borderColor = formErrors.name ? '#ef4444' : '#e2e8f0'}
                    />
                    {formErrors.name && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="mb-4">
                    <label className="block mb-2 text-gray-700 font-medium text-sm">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-3 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300`}
                    />
                    {formErrors.email && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                    )}
                  </div>

                  {/* Password with Eye Toggle */}
                  <div className="mb-4">
                    <label className="block mb-2 text-gray-700 font-medium text-sm">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-3 pr-10 border ${formErrors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300`}
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-500 transition-colors"
                      >
                        <i className={`fas ${showPassword ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                      </button>
                    </div>
                    {formErrors.password && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password with Eye Toggle */}
                  <div className="mb-4">
                    <label className="block mb-2 text-gray-700 font-medium text-sm">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-3 pr-10 border ${formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300`}
                      />
                      <button
                        type="button"
                        onClick={toggleConfirmPasswordVisibility}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-500 transition-colors"
                      >
                        <i className={`fas ${showConfirmPassword ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                      </button>
                    </div>
                    {formErrors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="mb-4">
                    <label className="block mb-2 text-gray-700 font-medium text-sm">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="e.g. +63 123 456 7890"
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300"
                    />
                  </div>

                  {/* Role and Status */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block mb-2 text-gray-700 font-medium text-sm">
                        Role
                      </label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 cursor-pointer"
                      >
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-2 text-gray-700 font-medium text-sm">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 cursor-pointer"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex gap-3 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-all duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70"
                    >
                      {actionLoading ? (
                        <span>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Creating...
                        </span>
                      ) : (
                        'Create Account'
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  {!isEditing ? (
                    /* View Mode */
                    <div>
                      <div className="mb-4">
                        <label className="block mb-2 text-gray-700 font-semibold text-xs uppercase tracking-wide">
                          Full Name
                        </label>
                        <p className="px-3 py-3 bg-gray-50 rounded-lg text-gray-800 border border-gray-200">
                          {selectedStaff?.name}
                        </p>
                      </div>

                      <div className="mb-4">
                        <label className="block mb-2 text-gray-700 font-semibold text-xs uppercase tracking-wide">
                          Email Address
                        </label>
                        <p className="px-3 py-3 bg-gray-50 rounded-lg text-gray-800 border border-gray-200">
                          {selectedStaff?.email}
                        </p>
                      </div>

                      <div className="mb-4">
                        <label className="block mb-2 text-gray-700 font-semibold text-xs uppercase tracking-wide">
                          Phone Number
                        </label>
                        <p className="px-3 py-3 bg-gray-50 rounded-lg text-gray-800 border border-gray-200">
                          {selectedStaff?.phone || '—'}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                          <label className="block mb-2 text-gray-700 font-semibold text-xs uppercase tracking-wide">
                            Role
                          </label>
                          <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-medium ${
                            selectedStaff?.role === 'admin' 
                              ? 'bg-cyan-50 text-cyan-600 border border-cyan-200' 
                              : 'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}>
                            {selectedStaff?.role === 'admin' ? 'Admin' : 'Staff'}
                          </span>
                        </div>

                        <div>
                          <label className="block mb-2 text-gray-700 font-semibold text-xs uppercase tracking-wide">
                            Status
                          </label>
                          <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-medium ${
                            selectedStaff?.status === 'active' 
                              ? 'bg-green-50 text-green-700 border border-green-200' 
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            {selectedStaff?.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-3 justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setShowModal(false);
                            setSelectedStaff(null);
                          }}
                          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-all duration-300"
                        >
                          Close
                        </button>
                        <button
                          type="button"
                          onClick={handleEditToggle}
                          className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
                        >
                          <i className="fas fa-edit mr-2"></i>
                          Edit Information
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Edit Mode */
                    <form onSubmit={handleUpdateStaff}>
                      {/* Name */}
                      <div className="mb-4">
                        <label className="block mb-2 text-gray-700 font-medium text-sm">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-3 border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300`}
                        />
                        {formErrors.name && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                        )}
                      </div>

                      {/* Email (read-only) */}
                      <div className="mb-4">
                        <label className="block mb-2 text-gray-700 font-medium text-sm">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          disabled
                          className="w-full px-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-gray-500 text-xs mt-1">
                          Email cannot be changed
                        </p>
                      </div>

                      {/* Phone */}
                      <div className="mb-6">
                        <label className="block mb-2 text-gray-700 font-medium text-sm">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="e.g. +63 123 456 7890"
                          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300"
                        />
                      </div>

                      {/* Form Actions */}
                      <div className="flex gap-3 justify-end">
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-all duration-300"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={actionLoading}
                          className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70"
                        >
                          {actionLoading ? (
                            <span>
                              <i className="fas fa-spinner fa-spin mr-2"></i>
                              Updating...
                            </span>
                          ) : (
                            'Save Changes'
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}