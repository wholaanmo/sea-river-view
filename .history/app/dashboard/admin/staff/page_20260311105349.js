'use client';

import { useState, useEffect } from 'react';
import { auth, db } from '../../../../lib/firebase';
import { collection, query, getDocs, addDoc, updateDoc, doc, deleteDoc, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add', 'edit', 'promote'
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'inactive'
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'staff',
    status: 'active',
    phone: '',
    position: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
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
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
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
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      const uid = userCredential.user.uid;
      
      // Create user document in Firestore
      await addDoc(collection(db, 'users'), {
        uid: uid,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status,
        phone: formData.phone || '',
        position: formData.position || '',
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

  const handleToggleStatus = async (staffMember) => {
    try {
      const newStatus = staffMember.status === 'active' ? 'inactive' : 'active';
      
      // Update in Firestore
      const userRef = doc(db, 'users', staffMember.id);
      await updateDoc(userRef, {
        status: newStatus
      });
      
      setSuccessMessage(`Staff account ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`);
      
      // Update local state
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
      
      // Update local state
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
      
      // Update local state
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

  const handleSendResetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage(`Password reset email sent to ${email}`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error sending reset email:', error);
      setErrorMessage('Failed to send password reset email.');
      setTimeout(() => setErrorMessage(''), 3000);
    }
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
      position: ''
    });
    setFormErrors({});
  };

  const openAddModal = () => {
    setModalType('add');
    resetForm();
    setShowModal(true);
  };

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.position?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || member.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '1.875rem', 
            fontWeight: 'bold', 
            color: '#0F172B',
            fontFamily: "'Playfair Display', serif",
            marginBottom: '0.5rem'
          }}>
            Staff Management
          </h1>
          <p style={{ color: '#4a5568' }}>
            Manage staff accounts, permissions, and status
          </p>
        </div>
        
        <button
          onClick={openAddModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, #00B8DB, #0095b3)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.95rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(0, 184, 219, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 184, 219, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 184, 219, 0.3)';
          }}
        >
          <i className="fas fa-plus" style={{ fontSize: '0.9rem' }}></i>
          Add New Staff
        </button>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #86efac',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: '#166534'
        }}>
          <i className="fas fa-check-circle" style={{ color: '#22c55e' }}></i>
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: '#991b1b'
        }}>
          <i className="fas fa-exclamation-circle" style={{ color: '#ef4444' }}></i>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Filters and Search */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <div style={{ position: 'relative' }}>
            <i className="fas fa-search" style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#a0aec0',
              fontSize: '0.9rem'
            }}></i>
            <input
              type="text"
              placeholder="Search by name, email, or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#00B8DB'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
            />
          </div>
        </div>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: '0.75rem 2rem 0.75rem 1rem',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '0.95rem',
            color: '#1a202c',
            outline: 'none',
            cursor: 'pointer',
            background: 'white',
            minWidth: '150px'
          }}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Staff Table */}
      {loading ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '200px' 
        }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#00B8DB' }}></i>
        </div>
      ) : (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafd', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#0F172B', fontWeight: '600' }}>Name</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#0F172B', fontWeight: '600' }}>Email</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#0F172B', fontWeight: '600' }}>Role</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#0F172B', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#0F172B', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#718096' }}>
                    No staff members found
                  </td>
                </tr>
              ) : (
                filteredStaff.map((member) => (
                  <tr key={member.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: '500', color: '#0F172B' }}>{member.name}</div>
                    </td>
                    <td style={{ padding: '1rem', color: '#4a5568' }}>{member.email}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: '500',
                        background: member.role === 'admin' ? 'rgba(0, 184, 219, 0.1)' : '#f1f5f9',
                        color: member.role === 'admin' ? '#00B8DB' : '#4a5568',
                        border: member.role === 'admin' ? '1px solid rgba(0, 184, 219, 0.3)' : '1px solid #e2e8f0'
                      }}>
                        {member.role === 'admin' ? 'Admin' : 'Staff'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: '500',
                        background: member.status === 'active' ? '#f0fdf4' : '#fef2f2',
                        color: member.status === 'active' ? '#166534' : '#991b1b',
                        border: member.status === 'active' ? '1px solid #86efac' : '1px solid #fecaca'
                      }}>
                        {member.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {/* Toggle Status Button */}
                        <button
                          onClick={() => handleToggleStatus(member)}
                          style={{
                            padding: '0.5rem',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            background: 'white',
                            color: member.status === 'active' ? '#991b1b' : '#166534',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          title={member.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          <i className={`fas ${member.status === 'active' ? 'fa-ban' : 'fa-check-circle'}`}></i>
                        </button>

                        {/* Promote/Demote Button */}
                        {member.role === 'staff' ? (
                          <button
                            onClick={() => handlePromoteToAdmin(member)}
                            style={{
                              padding: '0.5rem',
                              borderRadius: '6px',
                              border: '1px solid #e2e8f0',
                              background: 'white',
                              color: '#00B8DB',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            title="Promote to Admin"
                          >
                            <i className="fas fa-arrow-up"></i>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDemoteToStaff(member)}
                            style={{
                              padding: '0.5rem',
                              borderRadius: '6px',
                              border: '1px solid #e2e8f0',
                              background: 'white',
                              color: '#164A6E',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            title="Demote to Staff"
                          >
                            <i className="fas fa-arrow-down"></i>
                          </button>
                        )}

                        {/* Reset Password Button */}
                        <button
                          onClick={() => handleSendResetPassword(member.email)}
                          style={{
                            padding: '0.5rem',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            background: 'white',
                            color: '#2C5A6E',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          title="Send Password Reset"
                        >
                          <i className="fas fa-key"></i>
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

      {/* Add/Edit Staff Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowModal(false)}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#0F172B',
                fontFamily: "'Playfair Display', serif"
              }}>
                {modalType === 'add' ? 'Add New Staff Member' : 'Edit Staff Member'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#718096'
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleAddStaff}>
              {/* Name */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#0F172B',
                  fontWeight: '500',
                  fontSize: '0.95rem'
                }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${formErrors.name ? '#ef4444' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#00B8DB'}
                  onBlur={(e) => e.currentTarget.style.borderColor = formErrors.name ? '#ef4444' : '#e2e8f0'}
                />
                {formErrors.name && (
                  <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    {formErrors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#0F172B',
                  fontWeight: '500',
                  fontSize: '0.95rem'
                }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${formErrors.email ? '#ef4444' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#00B8DB'}
                  onBlur={(e) => e.currentTarget.style.borderColor = formErrors.email ? '#ef4444' : '#e2e8f0'}
                />
                {formErrors.email && (
                  <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    {formErrors.email}
                  </p>
                )}
              </div>

              {/* Password (only for new accounts) */}
              {modalType === 'add' && (
                <>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#0F172B',
                      fontWeight: '500',
                      fontSize: '0.95rem'
                    }}>
                      Password *
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `1px solid ${formErrors.password ? '#ef4444' : '#e2e8f0'}`,
                        borderRadius: '8px',
                        fontSize: '0.95rem',
                        outline: 'none'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#00B8DB'}
                      onBlur={(e) => e.currentTarget.style.borderColor = formErrors.password ? '#ef4444' : '#e2e8f0'}
                    />
                    {formErrors.password && (
                      <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                        {formErrors.password}
                      </p>
                    )}
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#0F172B',
                      fontWeight: '500',
                      fontSize: '0.95rem'
                    }}>
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `1px solid ${formErrors.confirmPassword ? '#ef4444' : '#e2e8f0'}`,
                        borderRadius: '8px',
                        fontSize: '0.95rem',
                        outline: 'none'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#00B8DB'}
                      onBlur={(e) => e.currentTarget.style.borderColor = formErrors.confirmPassword ? '#ef4444' : '#e2e8f0'}
                    />
                    {formErrors.confirmPassword && (
                      <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                        {formErrors.confirmPassword}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Phone */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#0F172B',
                  fontWeight: '500',
                  fontSize: '0.95rem'
                }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="e.g. +63 123 456 7890"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#00B8DB'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                />
              </div>

              {/* Role and Status (for new accounts) */}
              {modalType === 'add' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#0F172B',
                      fontWeight: '500',
                      fontSize: '0.95rem'
                    }}>
                      Role
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '0.95rem',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#0F172B',
                      fontWeight: '500',
                      fontSize: '0.95rem'
                    }}>
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '0.95rem',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    background: 'white',
                    color: '#4a5568',
                    fontSize: '0.95rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f8fafd';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #00B8DB, #0095b3)',
                    color: 'white',
                    fontSize: '0.95rem',
                    fontWeight: '500',
                    cursor: actionLoading ? 'not-allowed' : 'pointer',
                    opacity: actionLoading ? 0.7 : 1,
                    transition: 'all 0.3s ease'
                  }}
                >
                  {actionLoading ? (
                    <span>
                      <i className="fas fa-spinner fa-spin" style={{ marginRight: '0.5rem' }}></i>
                      Creating...
                    </span>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}