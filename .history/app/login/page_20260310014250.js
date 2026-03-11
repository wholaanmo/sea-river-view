'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { auth } from '../../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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
                <title>Login - Sea & River View</title>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
                <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
                <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
            </Head>

            <div className="login-container">
                {/* Simple decorative elements */}
                <div className="bg-accent-1"></div>
                <div className="bg-accent-2"></div>
                
                <div className="container">
                    {/* Left Panel - Simple Branding */}
                    <div className="left-panel">
                        <div className="brand-content">
                            <div className="logo-wrapper">
                                <div className="logo-circle">
                                    <Image 
                                        src="/assets/sea-ri.png" 
                                        alt="Sea & River View Logo" 
                                        width={120}
                                        height={120}
                                        className="logo"
                                        priority
                                    />
                                </div>
                            </div>
                            
                            <h1 className="brand-name">Sea & River View</h1>
                            <p className="brand-tagline">Where Luxury Meets Nature</p>
                            
                            <div className="features">
                                <div className="feature-item">
                                    <i className="fas fa-hotel"></i>
                                    <span>Luxury Rooms</span>
                                </div>
                                <div className="feature-item">
                                    <i className="fas fa-calendar-alt"></i>
                                    <span>Event Venues</span>
                                </div>
                                <div className="feature-item">
                                    <i className="fas fa-umbrella-beach"></i>
                                    <span>Beach Access</span>
                                </div>
                            </div>
                            
                            <div className="quote">
                                <i className="fas fa-quote-right"></i>
                                <p>The perfect getaway destination with stunning sea and river views</p>
                            </div>
                            
                            <div className="weather">
                                <i className="fas fa-sun"></i>
                                <span>24°C Partly cloudy</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Right Panel - Clean Login Form */}
                    <div className="right-panel">
                        <div className="login-box">
                            <div className="login-header">
                                <h2>Welcome back</h2>
                                <p>Please enter your details to sign in</p>
                            </div>
                            
                            {/* Simple User Type Selection */}
                            <div className="user-type-selector">
                                <button
                                    type="button"
                                    className={`user-type-btn ${userType === 'staff' ? 'active' : ''}`}
                                    onClick={() => handleUserTypeChange('staff')}
                                >
                                    Staff
                                </button>
                                <button
                                    type="button"
                                    className={`user-type-btn ${userType === 'admin' ? 'active' : ''}`}
                                    onClick={() => handleUserTypeChange('admin')}
                                >
                                    Admin
                                </button>
                            </div>
                            
                            {/* Simple Role Indicator */}
                            {userType === 'admin' && (
                                <div className="role-badge admin">
                                    <i className="fas fa-shield-alt"></i>
                                    <span>Administrator Access</span>
                                </div>
                            )}
                            {userType === 'staff' && (
                                <div className="role-badge staff">
                                    <i className="fas fa-user"></i>
                                    <span>Staff Access</span>
                                </div>
                            )}
                            
                            {error && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    <span>{error}</span>
                                </div>
                            )}
                            
                            <form onSubmit={loginUser}>
                                <div className="input-group">
                                    <label>Email</label>
                                    <input 
                                        type="email" 
                                        placeholder="Enter your email" 
                                        required 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={loading}
                                    /> 
                                </div>
                                
                                <div className="input-group">
                                    <div className="password-header">
                                        <label>Password</label>
                                        <button type="button" className="forgot-link">Forgot?</button>
                                    </div>
                                    <div className="password-wrapper">
                                        <input 
                                            type={showPassword ? 'text' : 'password'} 
                                            placeholder="Enter your password" 
                                            required 
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            disabled={loading}
                                        /> 
                                        <button 
                                            type="button"
                                            className="toggle-btn"
                                            onClick={togglePassword}
                                        >
                                            <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                        </button>
                                    </div>
                                </div>
                                
                                <button type="submit" className="login-button" disabled={loading}>
                                    {loading ? (
                                        <span>
                                            <i className="fas fa-spinner fa-spin"></i> Signing in...
                                        </span>
                                    ) : (
                                        <span>Sign in</span>
                                    )}
                                </button>
                            </form>
                            
                            {userType === 'staff' && (
                                <p className="staff-note">
                                    <i className="fas fa-info-circle"></i>
                                    Staff accounts are managed by administrator
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .login-container {
                    min-height: 100vh;
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f5f7fa;
                    font-family: 'Inter', sans-serif;
                    position: relative;
                    overflow: hidden;
                }

                /* Simple decorative backgrounds */
                .bg-accent-1 {
                    position: absolute;
                    top: -20%;
                    right: -10%;
                    width: 60%;
                    height: 80%;
                    background: linear-gradient(135deg, rgba(0, 184, 219, 0.03) 0%, rgba(15, 23, 43, 0.02) 100%);
                    border-radius: 50%;
                    pointer-events: none;
                }

                .bg-accent-2 {
                    position: absolute;
                    bottom: -20%;
                    left: -10%;
                    width: 60%;
                    height: 80%;
                    background: linear-gradient(135deg, rgba(15, 23, 43, 0.02) 0%, rgba(0, 184, 219, 0.03) 100%);
                    border-radius: 50%;
                    pointer-events: none;
                }

                .container {
                    display: flex;
                    width: 1000px;
                    max-width: 90%;
                    background: white;
                    border-radius: 32px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
                    overflow: hidden;
                    position: relative;
                    z-index: 10;
                }

                /* Left Panel - Clean & Simple */
                .left-panel {
                    flex: 1;
                    background: #0F172B;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 48px 32px;
                }

                .brand-content {
                    max-width: 320px;
                    text-align: center;
                }

                .logo-wrapper {
                    margin-bottom: 24px;
                }

                .logo-circle {
                    width: 100px;
                    height: 100px;
                    margin: 0 auto;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid rgba(0, 184, 219, 0.3);
                }

                .logo {
                    border-radius: 50%;
                    object-fit: cover;
                }

                .brand-name {
                    font-size: 28px;
                    font-weight: 700;
                    margin-bottom: 8px;
                    color: white;
                    letter-spacing: -0.5px;
                }

                .brand-tagline {
                    font-size: 14px;
                    color: #94a3b8;
                    margin-bottom: 40px;
                    font-weight: 400;
                }

                .features {
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                    margin-bottom: 40px;
                }

                .feature-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    color: #cbd5e1;
                    font-size: 12px;
                }

                .feature-item i {
                    font-size: 20px;
                    color: #00B8DB;
                }

                .quote {
                    margin-bottom: 30px;
                    padding: 16px;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }

                .quote i {
                    color: #00B8DB;
                    font-size: 16px;
                    margin-bottom: 8px;
                    opacity: 0.7;
                }

                .quote p {
                    font-size: 13px;
                    line-height: 1.5;
                    color: #cbd5e1;
                    font-style: italic;
                }

                .weather {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 40px;
                    font-size: 13px;
                    color: #cbd5e1;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .weather i {
                    color: #00B8DB;
                }

                /* Right Panel - Minimal Form */
                .right-panel {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 48px 40px;
                    background: white;
                }

                .login-box {
                    width: 100%;
                    max-width: 360px;
                }

                .login-header {
                    margin-bottom: 32px;
                }

                .login-header h2 {
                    font-size: 28px;
                    font-weight: 700;
                    color: #0F172B;
                    margin-bottom: 8px;
                    letter-spacing: -0.5px;
                }

                .login-header p {
                    color: #64748b;
                    font-size: 14px;
                }

                /* Simple User Type Selector */
                .user-type-selector {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 20px;
                    background: #f1f5f9;
                    padding: 4px;
                    border-radius: 40px;
                }

                .user-type-btn {
                    flex: 1;
                    padding: 10px;
                    border: none;
                    background: transparent;
                    border-radius: 40px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    color: #64748b;
                }

                .user-type-btn.active {
                    background: #0F172B;
                    color: white;
                    box-shadow: 0 2px 8px rgba(0, 184, 219, 0.2);
                }

                /* Simple Role Badges */
                .role-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 12px;
                    border-radius: 20px;
                    font-size: 13px;
                    font-weight: 500;
                    margin-bottom: 20px;
                }

                .role-badge.admin {
                    background: rgba(15, 23, 43, 0.05);
                    color: #0F172B;
                }

                .role-badge.staff {
                    background: rgba(0, 184, 219, 0.05);
                    color: #00B8DB;
                }

                .role-badge i {
                    font-size: 14px;
                }

                .error-message {
                    background: #fee2e2;
                    color: #dc2626;
                    padding: 12px 16px;
                    border-radius: 12px;
                    font-size: 13px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 20px;
                }

                .input-group {
                    margin-bottom: 20px;
                }

                .input-group label {
                    display: block;
                    font-size: 13px;
                    font-weight: 500;
                    color: #0F172B;
                    margin-bottom: 6px;
                }

                .password-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 6px;
                }

                .forgot-link {
                    background: none;
                    border: none;
                    color: #00B8DB;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    padding: 0;
                }

                .forgot-link:hover {
                    text-decoration: underline;
                }

                .input-group input {
                    width: 100%;
                    padding: 12px 16px;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 12px;
                    font-size: 14px;
                    outline: none;
                    transition: all 0.2s;
                    background: white;
                    color: #0F172B;
                }

                .input-group input:hover {
                    border-color: #cbd5e1;
                }

                .input-group input:focus {
                    border-color: #00B8DB;
                    box-shadow: 0 0 0 3px rgba(0, 184, 219, 0.1);
                }

                .password-wrapper {
                    position: relative;
                }

                .password-wrapper input {
                    padding-right: 45px;
                }

                .toggle-btn {
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    color: #94a3b8;
                    cursor: pointer;
                    padding: 5px;
                    font-size: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .toggle-btn:hover {
                    color: #0F172B;
                }

                .login-button {
                    width: 100%;
                    padding: 12px;
                    background: #0F172B;
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 12px rgba(0, 184, 219, 0.2);
                }

                .login-button:hover:not(:disabled) {
                    background: #1a2542;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 16px rgba(0, 184, 219, 0.3);
                }

                .login-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .staff-note {
                    margin-top: 20px;
                    text-align: center;
                    font-size: 12px;
                    color: #94a3b8;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                }

                .staff-note i {
                    color: #00B8DB;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .container {
                        flex-direction: column;
                        max-width: 450px;
                    }
                    
                    .left-panel {
                        padding: 40px 24px;
                    }
                    
                    .right-panel {
                        padding: 40px 24px;
                    }
                    
                    .features {
                        flex-wrap: wrap;
                    }
                }
            `}</style>
        </>
    );
}