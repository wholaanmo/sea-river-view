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
                {/* Decorative Elements */}
                <div className="bg-ornament ornament-1"></div>
                <div className="bg-ornament ornament-2"></div>
                
                <div className="container">
                    {/* Left Panel - Enhanced Branding */}
                    <div className="left-panel">
                        <div className="brand-content">
                            {/* Bigger Circular Logo */}
                            <div className="logo-container">
                                <div className="logo-circle">
                                    <Image 
                                        src="/assets/sea-river.png" 
                                        alt="Sea & River View Resort" 
                                        width={160}
                                        height={160}
                                        className="logo"
                                        priority
                                    />
                                </div>
                            </div>
                            
                            {/* Strong Headline */}
                            <h1 className="brand-name">Sea & River View</h1>
                            
                            {/* Short Tagline */}
                            <p className="brand-tagline">Where luxury meets nature</p>
                            
                            {/* Feature Icons with Labels */}
                            <div className="features-grid">
                                <div className="feature-card">
                                    <div className="feature-icon">🏨</div>
                                    <span className="feature-label">Luxury Rooms</span>
                                </div>
                                <div className="feature-card">
                                    <div className="feature-icon">🎉</div>
                                    <span className="feature-label">Event Venues</span>
                                </div>
                                <div className="feature-card">
                                    <div className="feature-icon">🌊</div>
                                    <span className="feature-label">Beach Access</span>
                                </div>
                            </div>
                            
                            {/* Decorative Quote */}
                            <div className="brand-quote">
                                <i className="fas fa-quote-right"></i>
                                <p>The perfect getaway with stunning sea and river views</p>
                            </div>
                            
                            {/* Mini Weather Display */}
                            <div className="weather-chip">
                                <i className="fas fa-sun"></i>
                                <span>24°C • Partly cloudy</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Right Panel - Enhanced Login Form */}
                    <div className="right-panel">
                        <div className="login-box">
                            <div className="login-header">
                                <h2>Welcome back</h2>
                                <p>Sign in to manage your resort</p>
                            </div>
                            
                            {/* Improved Staff/Admin Toggle */}
                            <div className="role-toggle">
                                <button
                                    type="button"
                                    className={`role-btn ${userType === 'staff' ? 'active' : ''}`}
                                    onClick={() => handleUserTypeChange('staff')}
                                >
                                    <i className="fas fa-user-clock"></i>
                                    <div className="role-info">
                                        <span className="role-title">Staff</span>
                                        <span className="role-desc">Team member access</span>
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    className={`role-btn ${userType === 'admin' ? 'active' : ''}`}
                                    onClick={() => handleUserTypeChange('admin')}
                                >
                                    <i className="fas fa-crown"></i>
                                    <div className="role-info">
                                        <span className="role-title">Admin</span>
                                        <span className="role-desc">Full system access</span>
                                    </div>
                                </button>
                            </div>
                            
                            {/* Error Message Display */}
                            {error && (
                                <div className="error-alert">
                                    <i className="fas fa-exclamation-circle"></i>
                                    <span>{error}</span>
                                </div>
                            )}
                            
                            <form onSubmit={loginUser} className="login-form">
                                {/* Email Field with Icon */}
                                <div className="form-group">
                                    <label htmlFor="email">
                                        <i className="fas fa-envelope"></i>
                                        Email address
                                    </label>
                                    <div className="input-wrapper">
                                        <input
                                            id="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            disabled={loading}
                                            className={error ? 'error' : ''}
                                        />
                                    </div>
                                </div>
                                
                                {/* Password Field with Icon and Toggle */}
                                <div className="form-group">
                                    <label htmlFor="password">
                                        <i className="fas fa-lock"></i>
                                        Password
                                    </label>
                                    <div className="input-wrapper">
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            disabled={loading}
                                            className={error ? 'error' : ''}
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={togglePassword}
                                            tabIndex="-1"
                                        >
                                            <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Forgot Password Link */}
                                <div className="form-actions">
                                    <a href="#" className="forgot-link">
                                        Forgot password?
                                    </a>
                                </div>
                                
                                {/* Enhanced Sign In Button */}
                                <button 
                                    type="submit" 
                                    className="signin-button" 
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin"></i>
                                            Signing in...
                                        </>
                                    ) : (
                                        <>
                                            <span>Sign in</span>
                                            <i className="fas fa-arrow-right"></i>
                                        </>
                                    )}
                                </button>
                                
                                {/* Staff Note */}
                                {userType === 'staff' && (
                                    <div className="staff-note">
                                        <i className="fas fa-info-circle"></i>
                                        <span>Staff accounts are created and managed by administrators</span>
                                    </div>
                                )}
                            </form>
                            
                            {/* Footer */}
                            <div className="login-footer">
                                <p>© 2025 Sea & River View Resort. All rights reserved.</p>
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
                    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                    font-family: 'Inter', sans-serif;
                    position: relative;
                    overflow: hidden;
                }

                /* Decorative Ornaments */
                .bg-ornament {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(80px);
                    z-index: 0;
                }

                .ornament-1 {
                    top: -10%;
                    right: -5%;
                    width: 500px;
                    height: 500px;
                    background: radial-gradient(circle, rgba(0, 184, 219, 0.1) 0%, rgba(0, 184, 219, 0) 70%);
                }

                .ornament-2 {
                    bottom: -10%;
                    left: -5%;
                    width: 500px;
                    height: 500px;
                    background: radial-gradient(circle, rgba(15, 23, 43, 0.08) 0%, rgba(15, 23, 43, 0) 70%);
                }

                .container {
                    display: flex;
                    width: 1100px;
                    max-width: 95%;
                    background: white;
                    border-radius: 40px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    overflow: hidden;
                    position: relative;
                    z-index: 10;
                }

                /* Left Panel - Enhanced Branding */
                .left-panel {
                    flex: 1.2;
                    background: linear-gradient(145deg, #0F172B 0%, #1a2a4a 100%);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 60px 40px;
                    position: relative;
                    overflow: hidden;
                }

                .left-panel::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: radial-gradient(circle at 30% 50%, rgba(0, 184, 219, 0.1) 0%, transparent 60%);
                    pointer-events: none;
                }

                .brand-content {
                    max-width: 380px;
                    text-align: center;
                    position: relative;
                    z-index: 2;
                }

                /* Bigger Circular Logo */
                .logo-container {
                    margin-bottom: 30px;
                }

                .logo-circle {
                    width: 160px;
                    height: 160px;
                    margin: 0 auto;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 3px solid rgba(0, 184, 219, 0.3);
                    box-shadow: 0 10px 30px rgba(0, 184, 219, 0.2);
                    transition: transform 0.3s ease;
                }

                .logo-circle:hover {
                    transform: scale(1.05);
                }

                .logo {
                    border-radius: 50%;
                    object-fit: cover;
                }

                /* Strong Headline */
                .brand-name {
                    font-size: 36px;
                    font-weight: 700;
                    margin-bottom: 8px;
                    color: white;
                    letter-spacing: -0.5px;
                    line-height: 1.2;
                }

                /* Short Tagline */
                .brand-tagline {
                    font-size: 16px;
                    color: #94a3b8;
                    margin-bottom: 40px;
                    font-weight: 400;
                }

                /* Feature Icons Grid */
                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                    margin-bottom: 40px;
                }

                .feature-card {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                    padding: 20px 12px;
                    transition: all 0.3s ease;
                }

                .feature-card:hover {
                    background: rgba(255, 255, 255, 0.06);
                    transform: translateY(-2px);
                    border-color: rgba(0, 184, 219, 0.3);
                }

                .feature-icon {
                    font-size: 32px;
                    margin-bottom: 12px;
                }

                .feature-label {
                    font-size: 13px;
                    font-weight: 500;
                    color: #e2e8f0;
                }

                /* Brand Quote */
                .brand-quote {
                    margin-bottom: 30px;
                    padding: 20px;
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }

                .brand-quote i {
                    color: #00B8DB;
                    font-size: 20px;
                    margin-bottom: 10px;
                    opacity: 0.7;
                }

                .brand-quote p {
                    font-size: 14px;
                    line-height: 1.6;
                    color: #cbd5e1;
                    font-style: italic;
                }

                /* Weather Chip */
                .weather-chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 20px;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 40px;
                    font-size: 14px;
                    color: #cbd5e1;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                }

                .weather-chip i {
                    color: #00B8DB;
                }

                /* Right Panel */
                .right-panel {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 60px 40px;
                    background: white;
                }

                .login-box {
                    width: 100%;
                    max-width: 380px;
                }

                .login-header {
                    margin-bottom: 32px;
                }

                .login-header h2 {
                    font-size: 32px;
                    font-weight: 700;
                    color: #0F172B;
                    margin-bottom: 8px;
                    letter-spacing: -0.5px;
                }

                .login-header p {
                    color: #64748b;
                    font-size: 15px;
                }

                /* Improved Role Toggle */
                .role-toggle {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 24px;
                }

                .role-btn {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 14px 16px;
                    border: 1.5px solid #e2e8f0;
                    background: white;
                    border-radius: 16px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-align: left;
                }

                .role-btn i {
                    font-size: 24px;
                    color: #94a3b8;
                    transition: color 0.2s ease;
                }

                .role-info {
                    display: flex;
                    flex-direction: column;
                }

                .role-title {
                    font-size: 15px;
                    font-weight: 600;
                    color: #0F172B;
                    margin-bottom: 2px;
                }

                .role-desc {
                    font-size: 11px;
                    color: #64748b;
                }

                .role-btn.active {
                    border-color: #00B8DB;
                    background: #f0f9ff;
                }

                .role-btn.active i {
                    color: #00B8DB;
                }

                .role-btn:hover:not(.active) {
                    border-color: #cbd5e1;
                    background: #f8fafc;
                }

                /* Error Alert */
                .error-alert {
                    background: #fee2e2;
                    border: 1px solid #fecaca;
                    border-radius: 12px;
                    padding: 12px 16px;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: #dc2626;
                    font-size: 13px;
                }

                /* Form Styles */
                .login-form {
                    margin-top: 20px;
                }

                .form-group {
                    margin-bottom: 20px;
                }

                .form-group label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    font-weight: 500;
                    color: #0F172B;
                    margin-bottom: 8px;
                }

                .form-group label i {
                    color: #00B8DB;
                    font-size: 16px;
                }

                .input-wrapper {
                    position: relative;
                }

                .input-wrapper input {
                    width: 100%;
                    padding: 14px 16px;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 14px;
                    font-size: 15px;
                    outline: none;
                    transition: all 0.2s ease;
                    background: white;
                    color: #0F172B;
                }

                .input-wrapper input:hover {
                    border-color: #cbd5e1;
                }

                .input-wrapper input:focus {
                    border-color: #00B8DB;
                    box-shadow: 0 0 0 4px rgba(0, 184, 219, 0.1);
                }

                .input-wrapper input.error {
                    border-color: #ef4444;
                }

                .password-toggle {
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    color: #94a3b8;
                    cursor: pointer;
                    padding: 8px;
                    font-size: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: color 0.2s ease;
                }

                .password-toggle:hover {
                    color: #00B8DB;
                }

                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    margin-bottom: 24px;
                }

                .forgot-link {
                    color: #00B8DB;
                    font-size: 13px;
                    font-weight: 500;
                    text-decoration: none;
                    transition: color 0.2s ease;
                }

                .forgot-link:hover {
                    color: #0F172B;
                    text-decoration: underline;
                }

                /* Enhanced Sign In Button */
                .signin-button {
                    width: 100%;
                    padding: 16px 24px;
                    background: linear-gradient(135deg, #0F172B, #1e2b4a);
                    color: white;
                    border: none;
                    border-radius: 16px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 8px 20px rgba(0, 184, 219, 0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    position: relative;
                    overflow: hidden;
                }

                .signin-button::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
                    transition: left 0.5s ease;
                }

                .signin-button:hover::before {
                    left: 100%;
                }

                .signin-button:hover:not(:disabled) {
                    background: linear-gradient(135deg, #1a2a4a, #2a3a5a);
                    transform: translateY(-2px);
                    box-shadow: 0 12px 28px rgba(0, 184, 219, 0.3);
                }

                .signin-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .signin-button i {
                    font-size: 16px;
                    transition: transform 0.2s ease;
                }

                .signin-button:hover i.fa-arrow-right {
                    transform: translateX(4px);
                }

                /* Staff Note */
                .staff-note {
                    margin-top: 20px;
                    padding: 12px;
                    background: #f8fafc;
                    border-radius: 12px;
                    color: #64748b;
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    border: 1px solid #e2e8f0;
                }

                .staff-note i {
                    color: #00B8DB;
                }

                /* Footer */
                .login-footer {
                    margin-top: 30px;
                    text-align: center;
                    color: #94a3b8;
                    font-size: 12px;
                }

                /* Responsive */
                @media (max-width: 900px) {
                    .container {
                        flex-direction: column;
                        max-width: 500px;
                    }
                    
                    .left-panel {
                        padding: 40px 24px;
                    }
                    
                    .features-grid {
                        gap: 12px;
                    }
                    
                    .feature-card {
                        padding: 16px 8px;
                    }
                    
                    .role-toggle {
                        flex-direction: column;
                    }
                }

                @media (max-width: 480px) {
                    .features-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .brand-name {
                        font-size: 28px;
                    }
                    
                    .logo-circle {
                        width: 120px;
                        height: 120px;
                    }
                }
            `}</style>
        </>
    );
}