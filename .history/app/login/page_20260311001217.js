'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { auth } from '../../lib/firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from 'firebase/auth';
import './login.css'; // Import the CSS file

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [userType, setUserType] = useState('staff');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isClient, setIsClient] = useState(false);
    
    // Forgot password modal states
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const [resetMessage, setResetMessage] = useState('');
    const [resetError, setResetError] = useState('');
    
    const router = useRouter();

    // Check for existing session on mount
    useEffect(() => {
        setIsClient(true);
        
        // Check if user is already logged in
        const checkAuth = async () => {
            const userType = localStorage.getItem('userType');
            const sessionToken = localStorage.getItem('sessionToken');
            const sessionExpiry = localStorage.getItem('sessionExpiry');
            
            if (userType && sessionToken && sessionExpiry) {
                // Check if session is still valid (24 hours)
                const now = new Date().getTime();
                if (now < parseInt(sessionExpiry)) {
                    // Valid session, redirect to appropriate dashboard
                    if (userType === 'admin') {
                        router.push('/dashboard/admin/overview');
                    } else {
                        router.push('/dashboard/admin/overview');
                    }
                } else {
                    // Session expired, clear storage
                    localStorage.removeItem('userType');
                    localStorage.removeItem('userEmail');
                    localStorage.removeItem('uid');
                    localStorage.removeItem('sessionToken');
                    localStorage.removeItem('sessionExpiry');
                    localStorage.removeItem('rememberMe');
                }
            }
        };
        
        checkAuth();
        
        // Animation code
        const loginBox = document.querySelector('.login-box');
        if (loginBox) {
            loginBox.style.transform = 'translateY(20px)';
            loginBox.style.opacity = '0';

            setTimeout(() => {
                loginBox.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
                loginBox.style.transform = 'translateY(0)';
                loginBox.style.opacity = '1';
            }, 100);
        }
        
        // Remove scrollbar from right panel
        const rightPanel = document.querySelector('.right-panel.light-bg.enhanced');
        if (rightPanel) {
            rightPanel.style.overflow = 'hidden';
        }
    }, [router]);

    const togglePassword = () => {
        setShowPassword(!showPassword);
    };

    const handleUserTypeChange = (type) => {
        setUserType(type);
        setError('');
        setEmail('');
        setPassword('');
    };

    // Generate a simple session token
    const generateSessionToken = () => {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15) + 
               Date.now().toString(36);
    };

    const loginUser = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!email || !password) {
            setError('Email and password are required.');
            return;
        }

        setLoading(true);

        try {
            // Firebase authentication for all users
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Use the selected user type as role
            const role = userType;
            
            // Generate session token
            const sessionToken = generateSessionToken();
            const sessionExpiry = new Date().getTime() + (24 * 60 * 60 * 1000); // 24 hours
            
            console.log("Login successful!", user);
            
            // Store session data
            localStorage.setItem('userType', role);
            localStorage.setItem('userEmail', user.email);
            localStorage.setItem('uid', user.uid);
            localStorage.setItem('sessionToken', sessionToken);
            localStorage.setItem('sessionExpiry', sessionExpiry.toString());
            
            // Store refresh token for persistent sessions
            if (rememberMe) {
                localStorage.setItem('rememberMe', 'true');
                // Firebase handles token refresh automatically
            }
            
            // Redirect based on role
            if (role === 'admin') {
                router.push('/dashboard/staff/front-desk');
            } else {
                router.push('/dashboard/admin/overview');
            }
            
        } catch (err) {
            console.error("Login Error:", err);
            
            // Handle Firebase auth errors
            if (err.code === 'auth/user-not-found') {
                setError('No account found with this email.');
            } else if (err.code === 'auth/wrong-password') {
                setError('Incorrect password.');
            } else if (err.code === 'auth/invalid-email') {
                setError('Invalid email format.');
            } else if (err.code === 'auth/too-many-requests') {
                setError('Too many failed attempts. Try again later.');
            } else if (err.code === 'auth/network-request-failed') {
                setError('Network error. Please check your connection.');
            } else {
                setError(err.message || 'Login failed. Please check your credentials.');
            }
        } finally {
            setLoading(false);
        }
    };
    
    const handleForgotPassword = (e) => {
        e.preventDefault();
        setShowForgotModal(true);
        setResetEmail(email); // Pre-fill with current email
        setResetMessage('');
        setResetError('');
    };
    
    const handleResetPassword = async (e) => {
        e.preventDefault();
        
        if (!resetEmail) {
            setResetError('Please enter your email address.');
            return;
        }
        
        setResetLoading(true);
        setResetError('');
        setResetMessage('');
        
        try {
            await sendPasswordResetEmail(auth, resetEmail);
            setResetMessage('Password reset email sent! Check your inbox.');
            
            // Close modal after 3 seconds
            setTimeout(() => {
                setShowForgotModal(false);
                setResetMessage('');
                setResetEmail('');
            }, 3000);
        } catch (error) {
            console.error('Reset password error:', error);
            
            if (error.code === 'auth/user-not-found') {
                setResetError('No account found with this email address.');
            } else if (error.code === 'auth/invalid-email') {
                setResetError('Invalid email format.');
            } else {
                setResetError('Failed to send reset email. Please try again.');
            }
        } finally {
            setResetLoading(false);
        }
    };

    // Logout function
    const logout = async () => {
        try {
            await signOut(auth);
            
            // Clear local storage
            localStorage.removeItem('userType');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('uid');
            localStorage.removeItem('sessionToken');
            localStorage.removeItem('sessionExpiry');
            localStorage.removeItem('rememberMe');
            
            // Redirect to login page
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    if (!isClient) {
        return null;
    }

    return (
        <>
            <Head>
                <title>Login - Sea & River View Resort</title>
                <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
                <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
            </Head>

            <div className="login-container">
                {/* Modern gradient background */}
                <div className="gradient-bg">
                    <div className="gradient-orb orb-1"></div>
                    <div className="gradient-orb orb-2"></div>
                    <div className="gradient-orb orb-3"></div>
                </div>
                
                {/* Subtle pattern overlay */}
                <div className="pattern-overlay"></div>

                <div className="container smaller-container">
                    {/* Left Panel - Enhanced Dark Background with Gradient */}
                    <div className="left-panel dark-bg enhanced">
                        <div className="brand-content">
                            {/* Logo Container - Made Bigger */}
                            <div className="logo-container enhanced-logo">
                                <div className="logo-circle enhanced-circle">
                                    <div className="logo-wrapper enhanced-wrapper">
                                        <Image 
                                            src="/assets/Sea&RiverView.png" 
                                            alt="Sea & River View Resort" 
                                            width={160}
                                            height={160}
                                            className="logo"
                                            style={{ 
                                                objectFit: 'cover',
                                                borderRadius: '50%',
                                                width: '100%',
                                                height: '100%'
                                            }}
                                            priority
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            {/* Sea & River View text - below logo */}
                            <div className="sea-river-title dark-title enhanced-title">Sea & River View</div>
                            
                            {/* Reduced size text below Sea & River View */}
                            <h1 className="brand-name dark-brand-name enhanced-brand">Relax Where the Sea and River Meet</h1>
                            
                            {/* Simple feature indicators with enhanced styling */}
                            <div className="features-simple dark-features enhanced-features">
                                <div className="feature-item dark-feature-item enhanced-feature">
                                    <div className="feature-icon-wrapper">
                                        <i className="fas fa-hotel"></i>
                                    </div>
                                    <span>Luxury Rooms</span>
                                </div>
                                <div className="feature-item dark-feature-item enhanced-feature">
                                    <div className="feature-icon-wrapper">
                                        <i className="fas fa-calendar-alt"></i>
                                    </div>
                                    <span>Event Venue</span>
                                </div>
                                <div className="feature-item dark-feature-item enhanced-feature">
                                    <div className="feature-icon-wrapper">
                                        <i className="fas fa-umbrella-beach"></i>
                                    </div>
                                    <span>Beach Access</span>
                                </div>
                            </div>
                            
                            {/* Decorative wave element */}
                            <div className="decorative-waves">
                                <div className="wave wave1"></div>
                                <div className="wave wave2"></div>
                                <div className="wave wave3"></div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Right Panel - Enhanced Light Background */}
                    <div className="right-panel light-bg enhanced no-scrollbar">
                        <div className="login-box enhanced-login-box smaller-box">
                            <div className="login-header enhanced-header">
                                <h1 className="welcome-title dark-text">Welcome Back</h1>
                                <h2 className="dark-text-secondary">Sign in to your account</h2>
                            </div>
                            
                            {/* User Type Selection */}
                            <div className="user-type-selector enhanced-selector">
                                <button
                                    type="button"
                                    className={`user-type-btn light-btn enhanced-btn ${userType === 'staff' ? 'active enhanced-active' : ''}`}
                                    onClick={() => handleUserTypeChange('staff')}
                                >
                                    <i className="fas fa-users"></i>
                                    Staff
                                </button>
                                <button
                                    type="button"
                                    className={`user-type-btn light-btn enhanced-btn ${userType === 'admin' ? 'active enhanced-active' : ''}`}
                                    onClick={() => handleUserTypeChange('admin')}
                                >
                                    <i className="fas fa-user-tie"></i>
                                    Admin
                                </button>
                            </div>
                            
                            {/* Role Badge */}
                            <div className={`role-badge light-role-badge enhanced-role-badge ${userType}`}>
                                <i className={`fas ${userType === 'admin' ? 'fa-shield-alt' : 'fa-id-card'}`}></i>
                                <span>{userType === 'admin' ? 'Administrator' : 'Staff Member'}</span>
                            </div>
                            
                            {error && (
                                <div className="error-message light-error enhanced-error">
                                    <i className="fas fa-exclamation-circle"></i>
                                    <span>{error}</span>
                                </div>
                            )}
                            
                            <form onSubmit={loginUser}>
                                {/* Email Field */}
                                <div className="input-group light-input-group enhanced-input-group">
                                    <div className="input-icon light-icon enhanced-icon">
                                        <i className="fas fa-envelope"></i>
                                    </div>
                                    <input 
                                        type="email" 
                                        placeholder="Email address" 
                                        required 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={loading}
                                        className="light-input enhanced-input"
                                    />
                                </div>
                                
                                {/* Password Field */}
                                <div className="input-group light-input-group enhanced-input-group">
                                    <div className="input-icon light-icon enhanced-icon">
                                        <i className="fas fa-lock"></i>
                                    </div>
                                    <input 
                                        type={showPassword ? 'text' : 'password'} 
                                        placeholder="Password" 
                                        required 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={loading}
                                        className="light-input enhanced-input"
                                    />
                                    <button 
                                        type="button"
                                        className="password-toggle light-toggle enhanced-toggle"
                                        onClick={togglePassword}
                                    >
                                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                    </button>
                                </div>
                                
                                {/* Remember Me and Forgot Password */}
                                <div className="form-options light-options enhanced-options">
                                    <label className="remember-me light-remember enhanced-remember">
                                        <input 
                                            type="checkbox" 
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                        />
                                        <span>Remember me</span>
                                    </label>
                                    <a 
                                        href="#" 
                                        className="forgot-password light-forgot enhanced-forgot"
                                        onClick={handleForgotPassword}
                                    >
                                        Forgot password?
                                    </a>
                                </div>
                                
                                {/* Sign In Button */}
                                <button 
                                    type="submit" 
                                    className="login-button light-login-btn enhanced-login-btn" 
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span>
                                            <i className="fas fa-spinner fa-spin"></i> Signing in...
                                        </span>
                                    ) : (
                                        <span>Sign In</span>
                                    )}
                                </button>
                            </form>
                            
                            {/* Footer */}
                            <div className="login-footer light-footer enhanced-footer">
                                <p>© 2025 Sea & River View Resort</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Forgot Password Modal */}
            {showForgotModal && (
                <div className="modal-overlay" onClick={() => setShowForgotModal(false)}>
                    <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Reset Password</h3>
                            <button 
                                className="modal-close"
                                onClick={() => setShowForgotModal(false)}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <div className="modal-body">
                            <p className="modal-description">
                                Enter your email address and we'll send you a link to reset your password.
                            </p>
                            
                            {resetMessage && (
                                <div className="modal-success">
                                    <i className="fas fa-check-circle"></i>
                                    <span>{resetMessage}</span>
                                </div>
                            )}
                            
                            {resetError && (
                                <div className="modal-error">
                                    <i className="fas fa-exclamation-circle"></i>
                                    <span>{resetError}</span>
                                </div>
                            )}
                            
                            <form onSubmit={handleResetPassword}>
                                <div className="modal-input-group">
                                    <div className="modal-input-icon">
                                        <i className="fas fa-envelope"></i>
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="Your email address"
                                        value={resetEmail}
                                        onChange={(e) => setResetEmail(e.target.value)}
                                        disabled={resetLoading || resetMessage}
                                        className="modal-input"
                                    />
                                </div>
                                
                                <div className="modal-actions">
                                    <button
                                        type="button"
                                        className="modal-btn modal-btn-secondary"
                                        onClick={() => setShowForgotModal(false)}
                                        disabled={resetLoading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="modal-btn modal-btn-primary"
                                        disabled={resetLoading || resetMessage}
                                    >
                                        {resetLoading ? (
                                            <>
                                                <i className="fas fa-spinner fa-spin"></i> Sending...
                                            </>
                                        ) : (
                                            'Send Reset Link'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}