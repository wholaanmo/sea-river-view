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
                <title>Login - Sea & River View Resort</title>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
                <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
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
                    {/* Left Panel - Simplified Branding */}
                    <div className="left-panel">
                        <div className="brand-content">
                            {/* Square logo in minimal circle */}
                            <div className="logo-container">
                                <div className="logo-circle">
                                    <div className="logo-wrapper">
                                        <Image 
                                            src="/assets/sea-river.png" 
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
                            
                            <h1 className="brand-name">Sea & River View</h1>
                            <p className="brand-tagline">Luxury resort & spa</p>
                            
                            {/* Simple feature indicators */}
                            <div className="features-simple">
                                <div className="feature-dot">
                                    <i className="fas fa-hotel"></i>
                                </div>
                                <div className="feature-dot">
                                    <i className="fas fa-calendar-alt"></i>
                                </div>
                                <div className="feature-dot">
                                    <i className="fas fa-umbrella-beach"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Right Panel - Enhanced Typography */}
                    <div className="right-panel">
                        <div className="login-box">
                            <div className="login-header">
                                <span className="welcome-badge">Welcome back</span>
                                <h2>Sign in to your account</h2>
                                <p className="welcome-subtitle">Continue your journey with us</p>
                            </div>
                            
                            {/* User Type Selection */}
                            <div className="user-type-selector">
                                <button
                                    type="button"
                                    className={`user-type-btn ${userType === 'staff' ? 'active' : ''}`}
                                    onClick={() => handleUserTypeChange('staff')}
                                >
                                    <i className="fas fa-users"></i>
                                    Staff
                                </button>
                                <button
                                    type="button"
                                    className={`user-type-btn ${userType === 'admin' ? 'active' : ''}`}
                                    onClick={() => handleUserTypeChange('admin')}
                                >
                                    <i className="fas fa-user-tie"></i>
                                    Admin
                                </button>
                            </div>
                            
                            {/* Role Badge */}
                            <div className={`role-badge ${userType}`}>
                                <i className={`fas ${userType === 'admin' ? 'fa-shield-alt' : 'fa-id-card'}`}></i>
                                <span>{userType === 'admin' ? 'Administrator' : 'Staff Member'}</span>
                            </div>
                            
                            {error && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    <span>{error}</span>
                                </div>
                            )}
                            
                            <form onSubmit={loginUser}>
                                {/* Email Field */}
                                <div className="input-group">
                                    <div className="input-icon">
                                        <i className="fas fa-envelope"></i>
                                    </div>
                                    <input 
                                        type="email" 
                                        placeholder="Email address" 
                                        required 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                                
                                {/* Password Field */}
                                <div className="input-group">
                                    <div className="input-icon">
                                        <i className="fas fa-lock"></i>
                                    </div>
                                    <input 
                                        type={showPassword ? 'text' : 'password'} 
                                        placeholder="Password" 
                                        required 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={loading}
                                    />
                                    <button 
                                        type="button"
                                        className="password-toggle"
                                        onClick={togglePassword}
                                    >
                                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                    </button>
                                </div>
                                
                                {/* Forgot Password */}
                                <div className="forgot-password">
                                    <a href="#">Forgot password?</a>
                                </div>
                                
                                {/* Sign In Button */}
                                <button type="submit" className="login-button" disabled={loading}>
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
                                <div className="staff-note">
                                    <i className="fas fa-info-circle"></i>
                                    <span>Contact admin for account issues</span>
                                </div>
                            )}
                            
                            {/* Footer */}
                            <div className="login-footer">
                                <p>© 2025 Sea & River View Resort</p>
                            </div>
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
                    position: relative;
                    font-family: 'Inter', sans-serif;
                    overflow: hidden;
                    background: #0B1120;
                }

                /* Modern gradient background */
                .gradient-bg {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    top: 0;
                    left: 0;
                    overflow: hidden;
                }

                .gradient-orb {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(80px);
                    opacity: 0.4;
                }

                .orb-1 {
                    width: 600px;
                    height: 600px;
                    background: radial-gradient(circle, #00B8DB 0%, #0066B8 100%);
                    top: -200px;
                    right: -200px;
                    animation: orbFloat 20s ease-in-out infinite;
                }

                .orb-2 {
                    width: 500px;
                    height: 500px;
                    background: radial-gradient(circle, #4F46E5 0%, #7C3AED 100%);
                    bottom: -200px;
                    left: -200px;
                    animation: orbFloat 25s ease-in-out infinite reverse;
                }

                .orb-3 {
                    width: 400px;
                    height: 400px;
                    background: radial-gradient(circle, #0891B2 0%, #0F172A 100%);
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    opacity: 0.2;
                    filter: blur(100px);
                }

                @keyframes orbFloat {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(50px, 50px); }
                }

                .pattern-overlay {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    background-image: radial-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px);
                    background-size: 50px 50px;
                    pointer-events: none;
                }

                .container {
                    display: flex;
                    width: 820px;
                    max-width: 90%;
                    height: 550px;
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                    border-radius: 32px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    overflow: hidden;
                    position: relative;
                    z-index: 10;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                /* Left Panel - Minimal Design */
                .left-panel {
                    flex: 1;
                    background: linear-gradient(145deg, #0F172A, #1A2442);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 30px;
                    position: relative;
                    overflow: hidden;
                }

                .left-panel::before {
                    content: '';
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    background: radial-gradient(circle at 30% 50%, rgba(0, 184, 219, 0.15), transparent 70%);
                }

                .brand-content {
                    text-align: center;
                    position: relative;
                    z-index: 2;
                }

                .logo-container {
                    margin-bottom: 16px;
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
                    border: 2px solid rgba(0, 184, 219, 0.4);
                    box-shadow: 0 10px 30px rgba(0, 184, 219, 0.2);
                    overflow: hidden;
                    padding: 2px;
                }

                .logo-wrapper {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: white;
                }

                .brand-name {
                    font-size: 24px;
                    font-weight: 700;
                    margin-bottom: 4px;
                    background: linear-gradient(135deg, #FFFFFF, #00B8DB);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .brand-tagline {
                    font-size: 12px;
                    color: #94a3b8;
                    margin-bottom: 24px;
                    font-weight: 400;
                    letter-spacing: 0.5px;
                }

                .features-simple {
                    display: flex;
                    justify-content: center;
                    gap: 16px;
                }

                .feature-dot {
                    width: 40px;
                    height: 40px;
                    background: rgba(0, 184, 219, 0.15);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid rgba(0, 184, 219, 0.3);
                    transition: all 0.3s ease;
                }

                .feature-dot:hover {
                    background: rgba(0, 184, 219, 0.25);
                    transform: scale(1.05);
                }

                .feature-dot i {
                    font-size: 18px;
                    color: #00B8DB;
                }

                /* Right Panel - Enhanced Typography */
                .right-panel {
                    flex: 1.2;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 30px;
                    background: white;
                }

                .login-box {
                    width: 100%;
                    max-width: 320px;
                }

                .login-header {
                    margin-bottom: 24px;
                }

                .welcome-badge {
                    display: inline-block;
                    font-size: 13px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    color: #00B8DB;
                    margin-bottom: 8px;
                    background: rgba(0, 184, 219, 0.1);
                    padding: 4px 12px;
                    border-radius: 20px;
                }

                .login-header h2 {
                    font-size: 28px;
                    font-weight: 700;
                    color: #0F172A;
                    margin-bottom: 4px;
                    line-height: 1.2;
                    letter-spacing: -0.5px;
                }

                .welcome-subtitle {
                    color: #64748b;
                    font-size: 14px;
                    font-weight: 400;
                }

                /* User Type Selector */
                .user-type-selector {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 16px;
                    background: #f8fafc;
                    padding: 4px;
                    border-radius: 30px;
                    border: 1px solid #e2e8f0;
                }

                .user-type-btn {
                    flex: 1;
                    padding: 8px;
                    border: none;
                    background: transparent;
                    border-radius: 26px;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    color: #64748b;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                }

                .user-type-btn.active {
                    background: #0F172A;
                    color: white;
                }

                .user-type-btn.active i {
                    color: #00B8DB;
                }

                /* Role Badge */
                .role-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 11px;
                    font-weight: 500;
                    margin-bottom: 16px;
                }

                .role-badge.admin {
                    background: rgba(15, 23, 42, 0.08);
                    color: #0F172A;
                }

                .role-badge.staff {
                    background: rgba(0, 184, 219, 0.08);
                    color: #00B8DB;
                }

                .error-message {
                    background: #fee2e2;
                    border: 1px solid #fecaca;
                    border-radius: 10px;
                    padding: 10px 14px;
                    margin-bottom: 16px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #dc2626;
                    font-size: 12px;
                }

                .input-group {
                    position: relative;
                    margin-bottom: 14px;
                }

                .input-icon {
                    position: absolute;
                    left: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #94a3b8;
                    font-size: 14px;
                    z-index: 2;
                }

                .input-group input {
                    width: 100%;
                    padding: 12px 40px 12px 42px;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 12px;
                    font-size: 13px;
                    outline: none;
                    transition: all 0.2s ease;
                    background: white;
                    color: #0F172A;
                }

                .input-group input:hover {
                    border-color: #cbd5e1;
                }

                .input-group input:focus {
                    border-color: #00B8DB;
                    box-shadow: 0 0 0 3px rgba(0, 184, 219, 0.1);
                }

                .password-toggle {
                    position: absolute;
                    right: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    color: #94a3b8;
                    cursor: pointer;
                    padding: 5px;
                    font-size: 14px;
                }

                .forgot-password {
                    text-align: right;
                    margin-bottom: 20px;
                }

                .forgot-password a {
                    color: #00B8DB;
                    font-size: 12px;
                    font-weight: 500;
                    text-decoration: none;
                    transition: color 0.2s;
                }

                .forgot-password a:hover {
                    color: #0F172A;
                }

                .login-button {
                    width: 100%;
                    padding: 12px;
                    background: #0F172A;
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 12px rgba(0, 184, 219, 0.2);
                }

                .login-button:hover:not(:disabled) {
                    background: #1A2442;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 16px rgba(0, 184, 219, 0.3);
                }

                .staff-note {
                    margin-top: 16px;
                    padding: 8px;
                    background: #f8fafc;
                    border-radius: 10px;
                    color: #64748b;
                    font-size: 11px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    border: 1px solid #e2e8f0;
                }

                .staff-note i {
                    color: #00B8DB;
                }

                .login-footer {
                    margin-top: 20px;
                    text-align: center;
                    color: #94a3b8;
                    font-size: 11px;
                }

                @media (max-width: 700px) {
                    .container {
                        flex-direction: column;
                        height: auto;
                        max-width: 400px;
                    }
                    
                    .left-panel {
                        padding: 30px 20px;
                    }
                    
                    .brand-name {
                        font-size: 22px;
                    }
                }
            `}</style>
        </>
    );
}