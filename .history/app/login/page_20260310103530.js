'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
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
                <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
            </Head>

            <div className="login-container">
                {/* Simplified background with subtle waves */}
                <div className="simple-bg"></div>
                <div className="simple-bg-2"></div>
                
                {/* Minimal floating elements */}
                <div className="minimal-elements">
                    <div className="element sun">☀️</div>
                    <div className="element cloud">☁️</div>
                </div>

                <div className="container">
                    {/* Left Panel - Enhanced Branding */}
                    <div className="left-panel">
                        <div className="brand-content">
                            {/* Square logo properly fitted in circle */}
                            <div className="logo-container">
                                <div className="logo-circle">
                                    <div className="logo-wrapper">
                                        <Image 
                                            src="/assets/sea-river.png" 
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
                            
                            <h1 className="brand-name">Sea & River View</h1>
                            <p className="brand-tagline">Where luxury meets nature</p>
                            
                            {/* Feature icons in circles */}
                            <div className="features-grid">
                                <div className="feature-item">
                                    <div className="feature-icon-circle">
                                        <i className="fas fa-hotel"></i>
                                    </div>
                                    <span className="feature-label">Luxury Rooms</span>
                                </div>
                                <div className="feature-item">
                                    <div className="feature-icon-circle">
                                        <i className="fas fa-calendar-alt"></i>
                                    </div>
                                    <span className="feature-label">Event Venues</span>
                                </div>
                                <div className="feature-item">
                                    <div className="feature-icon-circle">
                                        <i className="fas fa-umbrella-beach"></i>
                                    </div>
                                    <span className="feature-label">Beach Access</span>
                                </div>
                            </div>
                            
                            {/* Testimonial */}
                            <div className="testimonial">
                                <i className="fas fa-quote-left"></i>
                                <p>The perfect getaway destination with stunning sea and river views</p>
                            </div>
                            
                            {/* Weather */}
                            <div className="weather-chip">
                                <i className="fas fa-sun"></i>
                                <span>24°C Partly cloudy</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Right Panel - Improved Readability */}
                    <div className="right-panel">
                        <div className="login-box">
                            <div className="login-header">
                                <h2>Welcome Back</h2>
                                <p>Sign in to your account</p>
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
                                <span>{userType === 'admin' ? 'Administrator Access' : 'Staff Access'}</span>
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
                                    <span>Staff accounts are managed by administrator</span>
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
                    background: linear-gradient(145deg, #f0f4f8 0%, #e6ecf3 100%);
                    font-family: 'Poppins', sans-serif;
                    overflow: hidden;
                }

                /* Simplified background */
                .simple-bg {
                    position: absolute;
                    top: -20%;
                    right: -10%;
                    width: 70%;
                    height: 70%;
                    background: radial-gradient(circle, rgba(0, 184, 219, 0.05) 0%, transparent 70%);
                    border-radius: 50%;
                    pointer-events: none;
                }

                .simple-bg-2 {
                    position: absolute;
                    bottom: -20%;
                    left: -10%;
                    width: 70%;
                    height: 70%;
                    background: radial-gradient(circle, rgba(15, 23, 43, 0.03) 0%, transparent 70%);
                    border-radius: 50%;
                    pointer-events: none;
                }

                /* Minimal floating elements */
                .minimal-elements {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                }

                .element {
                    position: absolute;
                    font-size: 2rem;
                    opacity: 0.1;
                    animation: float 10s infinite ease-in-out;
                }

                .element.sun {
                    top: 15%;
                    right: 15%;
                    animation: float 8s infinite ease-in-out;
                }

                .element.cloud {
                    top: 20%;
                    left: 15%;
                    animation: float 12s infinite ease-in-out;
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-15px); }
                }

                .container {
                    display: flex;
                    width: 1000px;
                    max-width: 95%;
                    height: 650px;
                    background: white;
                    border-radius: 40px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    overflow: hidden;
                    position: relative;
                    z-index: 10;
                }

                /* Left Panel */
                .left-panel {
                    flex: 1.2;
                    background: linear-gradient(145deg, #0F172B, #1e2b4a);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 40px;
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
                    background: radial-gradient(circle at 30% 50%, rgba(0, 184, 219, 0.15), transparent 60%);
                    pointer-events: none;
                }

                .brand-content {
                    text-align: center;
                    position: relative;
                    z-index: 2;
                    max-width: 380px;
                }

                /* Logo container - properly handles square images */
                .logo-container {
                    margin-bottom: 24px;
                }

                .logo-circle {
                    width: 140px;
                    height: 140px;
                    margin: 0 auto;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 3px solid rgba(0, 184, 219, 0.4);
                    box-shadow: 0 10px 30px rgba(0, 184, 219, 0.2);
                    overflow: hidden;
                    padding: 3px;
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

                .logo {
                    object-fit: cover;
                    width: 100%;
                    height: 100%;
                }

                .brand-name {
                    font-size: 32px;
                    font-weight: 700;
                    margin-bottom: 5px;
                    background: linear-gradient(135deg, #FFFFFF, #00B8DB);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .brand-tagline {
                    font-size: 14px;
                    color: #94a3b8;
                    margin-bottom: 35px;
                    font-weight: 300;
                    letter-spacing: 1px;
                }

                /* Features grid with icons in circles */
                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 15px;
                    margin-bottom: 35px;
                }

                .feature-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                }

                .feature-icon-circle {
                    width: 55px;
                    height: 55px;
                    background: rgba(0, 184, 219, 0.15);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid rgba(0, 184, 219, 0.3);
                    transition: all 0.3s ease;
                }

                .feature-item:hover .feature-icon-circle {
                    background: rgba(0, 184, 219, 0.25);
                    transform: scale(1.05);
                    border-color: #00B8DB;
                }

                .feature-icon-circle i {
                    font-size: 24px;
                    color: #00B8DB;
                }

                .feature-label {
                    font-size: 12px;
                    font-weight: 500;
                    color: #e2e8f0;
                }

                .testimonial {
                    background: rgba(255, 255, 255, 0.03);
                    padding: 18px;
                    border-radius: 18px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    margin-bottom: 20px;
                }

                .testimonial i {
                    color: #00B8DB;
                    font-size: 16px;
                    margin-bottom: 8px;
                    opacity: 0.7;
                }

                .testimonial p {
                    font-size: 13px;
                    line-height: 1.5;
                    color: #cbd5e1;
                    font-style: italic;
                }

                .weather-chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 40px;
                    font-size: 13px;
                    color: #cbd5e1;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .weather-chip i {
                    color: #00B8DB;
                }

                /* Right Panel - Improved readability */
                .right-panel {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 40px;
                    background: white;
                }

                .login-box {
                    width: 100%;
                    max-width: 360px;
                }

                .login-header {
                    margin-bottom: 30px;
                }

                .login-header h2 {
                    font-size: 32px;
                    font-weight: 700;
                    color: #0F172B;
                    margin-bottom: 5px;
                }

                .login-header p {
                    color: #64748b;
                    font-size: 15px;
                }

                /* User Type Selector */
                .user-type-selector {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 15px;
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
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                }

                .user-type-btn.active {
                    background: #0F172B;
                    color: white;
                }

                .user-type-btn.active i {
                    color: #00B8DB;
                }

                /* Role Badge */
                .role-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 14px;
                    border-radius: 30px;
                    font-size: 12px;
                    font-weight: 500;
                    margin-bottom: 20px;
                }

                .role-badge.admin {
                    background: rgba(15, 23, 43, 0.08);
                    color: #0F172B;
                }

                .role-badge.staff {
                    background: rgba(0, 184, 219, 0.08);
                    color: #00B8DB;
                }

                .role-badge i {
                    font-size: 14px;
                }

                .error-message {
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

                /* Input fields with icons */
                .input-group {
                    position: relative;
                    margin-bottom: 18px;
                }

                .input-icon {
                    position: absolute;
                    left: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #94a3b8;
                    font-size: 16px;
                    z-index: 2;
                }

                .input-group input {
                    width: 100%;
                    padding: 14px 45px 14px 48px;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 14px;
                    font-size: 14px;
                    outline: none;
                    transition: all 0.2s ease;
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

                .password-toggle {
                    position: absolute;
                    right: 16px;
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
                    transition: color 0.2s;
                }

                .password-toggle:hover {
                    color: #00B8DB;
                }

                .forgot-password {
                    text-align: right;
                    margin-bottom: 25px;
                }

                .forgot-password a {
                    color: #00B8DB;
                    font-size: 13px;
                    font-weight: 500;
                    text-decoration: none;
                    transition: color 0.2s;
                }

                .forgot-password a:hover {
                    color: #0F172B;
                    text-decoration: underline;
                }

                .login-button {
                    width: 100%;
                    padding: 14px;
                    background: #0F172B;
                    color: white;
                    border: none;
                    border-radius: 14px;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 8px 16px rgba(0, 184, 219, 0.15);
                }

                .login-button:hover:not(:disabled) {
                    background: #1e2b4a;
                    transform: translateY(-2px);
                    box-shadow: 0 12px 20px rgba(0, 184, 219, 0.25);
                }

                .login-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .staff-note {
                    margin-top: 20px;
                    padding: 10px;
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

                .login-footer {
                    margin-top: 25px;
                    text-align: center;
                    color: #94a3b8;
                    font-size: 12px;
                }

                /* Responsive */
                @media (max-width: 900px) {
                    .container {
                        flex-direction: column;
                        height: auto;
                        max-width: 450px;
                    }
                    
                    .left-panel {
                        padding: 40px 20px;
                    }
                    
                    .features-grid {
                        gap: 10px;
                    }
                    
                    .feature-icon-circle {
                        width: 45px;
                        height: 45px;
                    }
                    
                    .feature-icon-circle i {
                        font-size: 20px;
                    }
                }

                @media (max-width: 480px) {
                    .logo-circle {
                        width: 120px;
                        height: 120px;
                    }
                    
                    .brand-name {
                        font-size: 28px;
                    }
                    
                    .features-grid {
                        grid-template-columns: 1fr;
                        gap: 15px;
                    }
                    
                    .feature-item {
                        flex-direction: row;
                        justify-content: center;
                    }
                }
            `}</style>
        </>
    );
}