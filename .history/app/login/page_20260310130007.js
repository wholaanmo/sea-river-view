'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { auth } from '../../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
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
    
    const router = useRouter();

    // Admin credentials
    const ADMIN_EMAIL = 'admin@seariverview.com';
    const ADMIN_PASSWORD = 'Admin@123';

    useEffect(() => {
        setIsClient(true);
        
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
    }, []);

    const togglePassword = () => {
        setShowPassword(!showPassword);
    };

    const handleUserTypeChange = (type) => {
        setUserType(type);
        setError('');
        setEmail('');
        setPassword('');
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
            if (userType === 'admin') {
                if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
                    console.log("Admin login successful!");
                    localStorage.setItem('userType', 'admin');
                    localStorage.setItem('userEmail', email);
                    if (rememberMe) {
                        localStorage.setItem('rememberMe', 'true');
                    }
                    router.push('/dashboard/admin');
                    return;
                } else {
                    throw new Error('Invalid admin credentials');
                }
            } else {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                
                console.log("Staff login successful!", user);
                localStorage.setItem('userType', 'staff');
                localStorage.setItem('userEmail', user.email);
                localStorage.setItem('uid', user.uid);
                if (rememberMe) {
                    localStorage.setItem('rememberMe', 'true');
                }
                router.push('/dashboard/staff');
            }
        } catch (err) {
            console.error("Login Error:", err);
            
            if (err.code === 'auth/user-not-found') {
                setError('No account found with this email.');
            } else if (err.code === 'auth/wrong-password') {
                setError('Incorrect password.');
            } else if (err.code === 'auth/invalid-email') {
                setError('Invalid email format.');
            } else if (err.code === 'auth/too-many-requests') {
                setError('Too many failed attempts. Try again later.');
            } else {
                setError(err.message || 'Login failed. Please check your credentials.');
            }
        } finally {
            setLoading(false);
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


                <div className="container">
                    {/* Left Panel - Dark Background #0F172B */}
                    <div className="left-panel dark-bg">
                        <div className="brand-content">
                            {/* Logo Container */}
                            <div className="logo-container">
                                <div className="logo-circle">
                                    <div className="logo-wrapper">
                                        <Image 
                                            src="/assets/sea-river-view.png" 
                                            alt="Sea & River View Resort" 
                                            width={120}
                                            height={120}
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
                            <div className="sea-river-title dark-title">Sea & River View</div>
                            
                            {/* Reduced size text below Sea & River View */}
                            <h1 className="brand-name dark-brand-name">Relax Where the Sea and River Meet</h1>
                            
                            {/* Simple feature indicators */}
                            <div className="features-simple dark-features">
                                <div className="feature-item dark-feature-item">
                                    <i className="fas fa-hotel"></i>
                                    <span>Luxury Rooms</span>
                                </div>
                                <div className="feature-item dark-feature-item">
                                    <i className="fas fa-calendar-alt"></i>
                                    <span>Event Venue</span>
                                </div>
                                <div className="feature-item dark-feature-item">
                                    <i className="fas fa-umbrella-beach"></i>
                                    <span>Beach Access</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Right Panel - Light Background */}
                    <div className="right-panel light-bg">
                        <div className="login-box">
                            <div className="login-header">
                                <h1 className="welcome-title dark-text">Welcome Back</h1>
                                <h2 className="dark-text-secondary">Sign in to your account</h2>
                            </div>
                            
                            {/* User Type Selection */}
                            <div className="user-type-selector">
                                <button
                                    type="button"
                                    className={`user-type-btn light-btn ${userType === 'staff' ? 'active' : ''}`}
                                    onClick={() => handleUserTypeChange('staff')}
                                >
                                    <i className="fas fa-users"></i>
                                    Staff
                                </button>
                                <button
                                    type="button"
                                    className={`user-type-btn light-btn ${userType === 'admin' ? 'active' : ''}`}
                                    onClick={() => handleUserTypeChange('admin')}
                                >
                                    <i className="fas fa-user-tie"></i>
                                    Admin
                                </button>
                            </div>
                            
                            {/* Role Badge */}
                            <div className={`role-badge light-role-badge ${userType}`}>
                                <i className={`fas ${userType === 'admin' ? 'fa-shield-alt' : 'fa-id-card'}`}></i>
                                <span>{userType === 'admin' ? 'Administrator' : 'Staff Member'}</span>
                            </div>
                            
                            {error && (
                                <div className="error-message light-error">
                                    <i className="fas fa-exclamation-circle"></i>
                                    <span>{error}</span>
                                </div>
                            )}
                            
                            <form onSubmit={loginUser}>
                                {/* Email Field */}
                                <div className="input-group light-input-group">
                                    <div className="input-icon light-icon">
                                        <i className="fas fa-envelope"></i>
                                    </div>
                                    <input 
                                        type="email" 
                                        placeholder="Email address" 
                                        required 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={loading}
                                        className="light-input"
                                    />
                                </div>
                                
                                {/* Password Field */}
                                <div className="input-group light-input-group">
                                    <div className="input-icon light-icon">
                                        <i className="fas fa-lock"></i>
                                    </div>
                                    <input 
                                        type={showPassword ? 'text' : 'password'} 
                                        placeholder="Password" 
                                        required 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={loading}
                                        className="light-input"
                                    />
                                    <button 
                                        type="button"
                                        className="password-toggle light-toggle"
                                        onClick={togglePassword}
                                    >
                                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                    </button>
                                </div>
                                
                                {/* Remember Me and Forgot Password */}
                                <div className="form-options light-options">
                                    <label className="remember-me light-remember">
                                        <input 
                                            type="checkbox" 
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                        />
                                        <span>Remember me</span>
                                    </label>
                                    <a href="#" className="forgot-password light-forgot">Forgot password?</a>
                                </div>
                                
                                {/* Sign In Button */}
                                <button type="submit" className="login-button light-login-btn" disabled={loading}>
                                    {loading ? (
                                        <span>
                                            <i className="fas fa-spinner fa-spin"></i> Signing in...
                                        </span>
                                    ) : (
                                        <span>Sign In</span>
                                    )}
                                </button>
                            </form>
                            
                            {/* Staff Note */}
                            {userType === 'staff' && (
                                <div className="staff-note light-staff-note">
                                    <i className="fas fa-info-circle"></i>
                                    <span>Contact admin for account issues</span>
                                </div>
                            )}
                            
                            {/* Footer */}
                            <div className="login-footer light-footer">
                                <p>© 2025 Sea & River View Resort</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}