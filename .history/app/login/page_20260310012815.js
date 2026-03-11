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
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
                <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
                <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
            </Head>

            <div className="login-container">
                {/* Animated waves background */}
                <div className="waves">
                    <div className="wave wave1"></div>
                    <div className="wave wave2"></div>
                    <div className="wave wave3"></div>
                </div>
                
                {/* Floating elements */}
                <div className="floating-elements">
                    <div className="floating-element sun">
                        <i className="fas fa-sun"></i>
                    </div>
                    <div className="floating-element cloud cloud1">
                        <i className="fas fa-cloud"></i>
                    </div>
                    <div className="floating-element cloud cloud2">
                        <i className="fas fa-cloud"></i>
                    </div>
                    <div className="floating-element boat">
                        <i className="fas fa-ship"></i>
                    </div>
                    <div className="floating-element palm">
                        <i className="fas fa-palm-tree"></i>
                    </div>
                </div>

                <div className="container">
                    {/* Left Panel - Branding */}
                    <div className="left-panel">
                        <div className="brand-content">
                            <div className="logo-wrapper">
                                <div className="logo-circle">
                                    <Image 
                                        src="/assets/CommuniTrade.png" 
                                        alt="Sea & River View Resort Logo" 
                                        width={200}
                                        height={200}
                                        className="logo"
                                        priority
                                    />
                                </div>
                            </div>
                            
                            <h1 className="brand-name">Sea & River View</h1>
                            <p className="brand-tagline">Where Luxury Meets Nature</p>
                            
                            <div className="brand-features">
                                <div className="feature">
                                    <i className="fas fa-hotel"></i>
                                    <span>Luxury Rooms</span>
                                </div>
                                <div className="feature">
                                    <i className="fas fa-calendar-alt"></i>
                                    <span>Event Venues</span>
                                </div>
                                <div className="feature">
                                    <i className="fas fa-umbrella-beach"></i>
                                    <span>Beach Access</span>
                                </div>
                            </div>
                            
                            <div className="testimonial">
                                <i className="fas fa-quote-left"></i>
                                <p>The perfect getaway destination with stunning sea and river views</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Right Panel - Login Form */}
                    <div className="right-panel">
                        <div className="login-box">
                            <div className="login-header">
                                <h2>Welcome Back</h2>
                                <p>Sign in to manage your resort experience</p>
                            </div>
                            
                            {/* User Type Selection */}
                            <div className="user-type-selector">
                                <button
                                    type="button"
                                    className={`user-type-btn ${userType === 'staff' ? 'active' : ''}`}
                                    onClick={() => handleUserTypeChange('staff')}
                                >
                                    <i className="fas fa-users"></i>
                                    <span>Staff</span>
                                </button>
                                <button
                                    type="button"
                                    className={`user-type-btn ${userType === 'admin' ? 'active' : ''}`}
                                    onClick={() => handleUserTypeChange('admin')}
                                >
                                    <i className="fas fa-user-tie"></i>
                                    <span>Admin</span>
                                </button>
                            </div>
                            
                            {/* Role Description */}
                            <div className="role-description">
                                {userType === 'admin' ? (
                                    <p><i className="fas fa-shield-alt"></i> Administrator access (Developer credentials)</p>
                                ) : (
                                    <p><i className="fas fa-id-card"></i> Staff access (Managed by Administrator)</p>
                                )}
                            </div>
                            
                            {error && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    <span>{error}</span>
                                </div>
                            )}
                            
                            <form onSubmit={loginUser}>
                                <div className="input-group">
                                    <i className="fas fa-envelope"></i> 
                                    <input 
                                        type="email" 
                                        placeholder={userType === 'admin' ? "Admin Email Address" : "Staff Email Address"} 
                                        required 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={loading}
                                    /> 
                                </div>
                                
                                <div className="input-group password-container">
                                    <i className="fas fa-lock"></i>
                                    <input 
                                        type={showPassword ? 'text' : 'password'} 
                                        placeholder={userType === 'admin' ? "Admin Password" : "Staff Password"} 
                                        required 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={loading}
                                    /> 
                                    <i 
                                        className={`fas ${showPassword ? 'fa-eye' : 'fa-eye-slash'} toggle-eye`}
                                        onClick={togglePassword}
                                    ></i>
                                </div>
                                
                                <div className="form-options">
                                    <label className="remember-me">
                                        <input type="checkbox" /> 
                                        <span>Remember me</span>
                                    </label>
                                    <a href="#" className="forgot-password">Forgot Password?</a>
                                </div>
                                
                                <button type="submit" className="login-button" disabled={loading}>
                                    {loading ? (
                                        <span>
                                            <i className="fas fa-spinner fa-spin"></i> Logging in...
                                        </span>
                                    ) : (
                                        <span>
                                            <i className="fas fa-sign-in-alt"></i> 
                                            Sign In as {userType === 'admin' ? 'Administrator' : 'Staff'}
                                        </span>
                                    )}
                                </button>
                                
                                {userType === 'staff' && (
                                    <div className="info-message">
                                        <i className="fas fa-info-circle"></i>
                                        <span>Staff accounts are created and managed by the Administrator</span>
                                    </div>
                                )}
                            </form>
                            
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
                    position: relative;
                    background: linear-gradient(145deg, #0a1a2f 0%, #1c3a5a 50%, #2b5c7c 100%);
                    overflow: hidden;
                    font-family: 'Poppins', sans-serif;
                }

                /* Animated Waves */
                .waves {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 200px;
                    overflow: hidden;
                }

                .wave {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 100px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 100% 100% 0 0;
                    animation: wave 8s infinite linear;
                }

                .wave1 {
                    background: rgba(0, 184, 219, 0.2);
                    animation: wave 10s infinite linear;
                    bottom: 0;
                }

                .wave2 {
                    background: rgba(255, 255, 255, 0.15);
                    animation: wave 15s infinite linear;
                    bottom: 20px;
                    opacity: 0.7;
                }

                .wave3 {
                    background: rgba(0, 184, 219, 0.1);
                    animation: wave 12s infinite linear;
                    bottom: 40px;
                    opacity: 0.5;
                }

                @keyframes wave {
                    0% { transform: translateX(0) scale(1); }
                    25% { transform: translateX(-25px) scale(1.02); }
                    50% { transform: translateX(-50px) scale(1.05); }
                    75% { transform: translateX(-25px) scale(1.02); }
                    100% { transform: translateX(0) scale(1); }
                }

                /* Floating Elements */
                .floating-elements {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                }

                .floating-element {
                    position: absolute;
                    color: rgba(255, 255, 255, 0.15);
                    font-size: 3rem;
                    animation: float 6s infinite ease-in-out;
                }

                .sun {
                    top: 15%;
                    right: 15%;
                    color: #FFD700;
                    font-size: 5rem;
                    animation: float 8s infinite ease-in-out;
                }

                .cloud {
                    color: rgba(255, 255, 255, 0.3);
                    font-size: 4rem;
                }

                .cloud1 {
                    top: 10%;
                    left: 10%;
                    animation: float 7s infinite ease-in-out;
                }

                .cloud2 {
                    top: 25%;
                    right: 25%;
                    animation: float 9s infinite ease-in-out;
                }

                .boat {
                    bottom: 20%;
                    left: 10%;
                    color: rgba(255, 255, 255, 0.2);
                    font-size: 3.5rem;
                    animation: float 12s infinite ease-in-out;
                }

                .palm {
                    bottom: 15%;
                    right: 10%;
                    color: #2ecc71;
                    font-size: 3.5rem;
                    animation: float 10s infinite ease-in-out;
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(5deg); }
                }

                .container {
                    display: flex;
                    width: 1000px;
                    height: 650px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 40px;
                    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3), 
                                0 0 0 2px rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    overflow: hidden;
                    position: relative;
                    z-index: 10;
                }

                /* Left Panel */
                .left-panel {
                    flex: 1.2;
                    background: linear-gradient(135deg, rgba(15, 23, 43, 0.9), rgba(26, 37, 66, 0.8));
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 40px;
                    position: relative;
                    overflow: hidden;
                    border-right: 1px solid rgba(255, 255, 255, 0.1);
                }

                .left-panel::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: radial-gradient(circle at 20% 50%, rgba(0, 184, 219, 0.15), transparent 50%);
                    pointer-events: none;
                }

                .brand-content {
                    text-align: center;
                    position: relative;
                    z-index: 2;
                }

                .logo-wrapper {
                    margin-bottom: 30px;
                }

                .logo-circle {
                    width: 180px;
                    height: 180px;
                    margin: 0 auto;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 3px solid rgba(0, 184, 219, 0.3);
                    box-shadow: 0 0 50px rgba(0, 184, 219, 0.3);
                    animation: pulse 3s infinite;
                }

                @keyframes pulse {
                    0%, 100% { box-shadow: 0 0 50px rgba(0, 184, 219, 0.3); }
                    50% { box-shadow: 0 0 70px rgba(0, 184, 219, 0.5); }
                }

                .logo {
                    border-radius: 50%;
                    object-fit: cover;
                }

                .brand-name {
                    font-size: 36px;
                    font-weight: 700;
                    margin-bottom: 10px;
                    background: linear-gradient(135deg, #FFFFFF, #00B8DB);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    text-shadow: 0 2px 10px rgba(0, 184, 219, 0.3);
                }

                .brand-tagline {
                    font-size: 16px;
                    color: rgba(255, 255, 255, 0.8);
                    margin-bottom: 40px;
                    font-weight: 300;
                    letter-spacing: 2px;
                }

                .brand-features {
                    display: flex;
                    justify-content: center;
                    gap: 25px;
                    margin-bottom: 40px;
                }

                .feature {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    color: rgba(255, 255, 255, 0.9);
                    font-size: 14px;
                }

                .feature i {
                    font-size: 24px;
                    color: #00B8DB;
                    background: rgba(0, 184, 219, 0.2);
                    width: 50px;
                    height: 50px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    border: 1px solid rgba(0, 184, 219, 0.3);
                }

                .testimonial {
                    background: rgba(255, 255, 255, 0.05);
                    padding: 20px;
                    border-radius: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .testimonial i {
                    color: #00B8DB;
                    font-size: 20px;
                    margin-bottom: 10px;
                    opacity: 0.7;
                }

                .testimonial p {
                    font-size: 14px;
                    line-height: 1.6;
                    color: rgba(255, 255, 255, 0.8);
                    font-style: italic;
                }

                /* Right Panel */
                .right-panel {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 40px;
                    background: rgba(255, 255, 255, 0.95);
                }

                .login-box {
                    width: 100%;
                    max-width: 380px;
                    opacity: 0;
                    transform: translateY(20px);
                }

                .login-header {
                    margin-bottom: 30px;
                }

                .login-header h2 {
                    font-size: 36px;
                    font-weight: 700;
                    color: #0F172B;
                    margin-bottom: 8px;
                }

                .login-header p {
                    color: #64748b;
                    font-size: 15px;
                }

                /* User Type Selector */
                .user-type-selector {
                    display: flex;
                    gap: 15px;
                    margin-bottom: 20px;
                    padding: 5px;
                    background: #f1f5f9;
                    border-radius: 15px;
                }

                .user-type-btn {
                    flex: 1;
                    padding: 12px;
                    border: none;
                    background: transparent;
                    border-radius: 12px;
                    font-size: 15px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    color: #64748b;
                }

                .user-type-btn i {
                    font-size: 16px;
                }

                .user-type-btn.active {
                    background: #0F172B;
                    color: #FFFFFF;
                    box-shadow: 0 5px 15px rgba(0, 184, 219, 0.3);
                }

                .user-type-btn.active i {
                    color: #00B8DB;
                }

                .role-description {
                    margin-bottom: 20px;
                    padding: 12px;
                    background: rgba(0, 184, 219, 0.08);
                    border-radius: 10px;
                    border-left: 3px solid #00B8DB;
                }

                .role-description p {
                    color: #0F172B;
                    font-size: 13px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .role-description i {
                    color: #00B8DB;
                }

                .error-message {
                    background: #fee2e2;
                    border: 1px solid #ef4444;
                    border-radius: 10px;
                    padding: 12px;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: #dc2626;
                    font-size: 14px;
                }

                .input-group {
                    margin-bottom: 20px;
                    position: relative;
                }

                .input-group input {
                    width: 100%;
                    padding: 15px 45px;
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    font-size: 15px;
                    outline: none;
                    transition: all 0.3s ease;
                    background: #FFFFFF;
                    color: #0F172B;
                }

                .input-group input:hover:not(:disabled) {
                    border-color: #00B8DB;
                }

                .input-group input:focus {
                    border-color: #00B8DB;
                    box-shadow: 0 0 0 4px rgba(0, 184, 219, 0.1);
                }

                .input-group i:not(.toggle-eye) {
                    position: absolute;
                    left: 15px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #00B8DB;
                    font-size: 18px;
                    z-index: 2;
                }

                .password-container {
                    position: relative;
                }

                .toggle-eye {
                    position: absolute;
                    right: 15px;
                    top: 50%;
                    transform: translateY(-50%);
                    cursor: pointer;
                    color: #94a3b8;
                    z-index: 2;
                    font-size: 18px;
                    transition: color 0.3s;
                }

                .toggle-eye:hover {
                    color: #00B8DB;
                }

                .form-options {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 25px;
                }

                .remember-me {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #64748b;
                    font-size: 14px;
                    cursor: pointer;
                }

                .remember-me input[type="checkbox"] {
                    width: 16px;
                    height: 16px;
                    accent-color: #00B8DB;
                }

                .forgot-password {
                    color: #00B8DB;
                    font-size: 14px;
                    text-decoration: none;
                    transition: color 0.3s;
                }

                .forgot-password:hover {
                    color: #0F172B;
                    text-decoration: underline;
                }

                .login-button {
                    width: 100%;
                    padding: 15px;
                    background: linear-gradient(135deg, #0F172B, #1a2a4a);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                    box-shadow: 0 8px 20px rgba(0, 184, 219, 0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                }

                .login-button i {
                    color: #00B8DB;
                }

                .login-button:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 25px rgba(0, 184, 219, 0.4);
                    background: linear-gradient(135deg, #1a2a4a, #0F172B);
                }

                .login-button:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .info-message {
                    margin-top: 20px;
                    padding: 12px;
                    background: #f8fafc;
                    border-radius: 10px;
                    color: #64748b;
                    font-size: 13px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    border: 1px solid #e2e8f0;
                }

                .info-message i {
                    color: #00B8DB;
                }

                .login-footer {
                    margin-top: 25px;
                    text-align: center;
                    color: #94a3b8;
                    font-size: 12px;
                }

                /* Responsive Design */
                @media (max-width: 1024px) {
                    .container {
                        width: 90%;
                        height: auto;
                        flex-direction: column;
                    }
                    
                    .left-panel {
                        padding: 40px 20px;
                    }
                    
                    .brand-features {
                        flex-wrap: wrap;
                    }
                }

                @media (max-width: 768px) {
                    .floating-elements {
                        display: none;
                    }
                    
                    .container {
                        border-radius: 20px;
                    }
                    
                    .login-header h2 {
                        font-size: 28px;
                    }
                }
            `}</style>
        </>
    );
}