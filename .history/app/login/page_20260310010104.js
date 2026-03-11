'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { auth } from '../../firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [userType, setUserType] = useState('staff'); // 'staff' or 'admin'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const router = useRouter();

    // Admin credentials (hardcoded - these would be the developer credentials)
    const ADMIN_EMAIL = 'admin@seariverview.com';
    const ADMIN_PASSWORD = 'Admin@123';

    const togglePassword = () => {
        setShowPassword(!showPassword);
    };

    const handleUserTypeChange = (type) => {
        setUserType(type);
        setError('');
        // Clear fields when switching
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
            // For Admin login - check hardcoded credentials first
            if (userType === 'admin') {
                if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
                    // Simulate successful admin login
                    console.log("Admin login successful!");
                    
                    // Store session info (in a real app, you'd use proper session management)
                    localStorage.setItem('userType', 'admin');
                    localStorage.setItem('userEmail', email);
                    
                    router.push('/dashboard/admin');
                    return;
                } else {
                    throw new Error('Invalid admin credentials');
                }
            } 
            
            // For Staff login - authenticate with Firebase
            else {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                
                console.log("Staff login successful!", user);
                
                // Store session info
                localStorage.setItem('userType', 'staff');
                localStorage.setItem('userEmail', user.email);
                localStorage.setItem('uid', user.uid);
                
                router.push('/dashboard/staff');
            }
            
        } catch (err) {
            console.error("Login Error:", err);
            
            // Handle specific Firebase errors
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

    useEffect(() => {
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

    return (
        <>
            <Head>
                <title>Login - Sea River View</title>
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
                <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
            </Head>

            <div className="flex justify-center items-center min-h-screen w-full p-5 bg-cover bg-center bg-no-repeat bg-fixed" style={{ backgroundImage: "url('/assets/background.png')" }}>
                <div className="container">
                    <div className="left-panel">
                        <div className="decoration-circle circle-1"></div>
                        <div className="decoration-circle circle-2"></div>
                        <div className="decoration-circle circle-3"></div>
                        <div className="decoration-circle circle-4"></div>
                        
                        <div>
                            <div className="logo-circle">
                                <Image 
                                    src="/assets/CommuniTrade.png" 
                                    alt="Sea River View Logo" 
                                    width={220}
                                    height={220}
                                    className="logo-circle"
                                />
                            </div>
                        </div>
                        <h1 className="brand-name">Sea River View</h1>
                        <p className="brand-tagline">Luxury by the Water</p>
                    </div>
                    
                    <div className="right-panel">
                        <div className="login-box">
                            <div className="login-header">
                                <h2>Welcome Back</h2>
                                <p>Select your role to continue</p>
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
                                    <p><i className="fas fa-shield-alt"></i> Admin access (Developer credentials)</p>
                                ) : (
                                    <p><i className="fas fa-id-card"></i> Staff access (Managed by Admin)</p>
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
                                        placeholder={userType === 'admin' ? "Admin Email" : "Staff Email"} 
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
                                
                                <button type="submit" className="login-button" disabled={loading}>
                                    {loading ? (
                                        <span>
                                            <i className="fas fa-spinner fa-spin"></i> Logging in...
                                        </span>
                                    ) : (
                                        <span>
                                            <i className="fas fa-sign-in-alt"></i> 
                                            Login as {userType === 'admin' ? 'Admin' : 'Staff'}
                                        </span>
                                    )}
                                </button>
                                
                                {userType === 'staff' && (
                                    <div className="info-message">
                                        <i className="fas fa-info-circle"></i>
                                        <span>Staff accounts must be created by an administrator</span>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .container {
                    display: flex;
                    width: 900px;
                    height: 650px;
                    background: rgba(255, 255, 255, 0.4);
                    border-radius: 30px;
                    box-shadow: 0 20px 40px rgba(15, 23, 43, 0.2), 
                                0 8px 20px rgba(0, 184, 219, 0.1);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 3px solid rgba(255, 255, 255, 0.7);
                    overflow: hidden;
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    margin: 0 auto;
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                }

                .left-panel {
                    flex: 1;
                    background: linear-gradient(145deg, #0F172B, #1a2542);
                    color: white;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    padding: 40px;
                    position: relative;
                    overflow: hidden;
                }

                .logo-circle {
                    width: 220px;
                    height: 220px;
                    background: rgba(255, 255, 255, 0.08);
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin-bottom: 20px;
                    backdrop-filter: blur(5px);
                    border: 2px solid rgba(0, 184, 219, 0.3);
                    box-shadow: 0 0 30px rgba(0, 184, 219, 0.2);
                }

                .brand-name {
                    font-size: 32px;
                    font-weight: 700;
                    margin-top: 5px;
                    text-align: center;
                    text-shadow: 0 2px 15px rgba(0, 184, 219, 0.3);
                    color: #FFFFFF;
                    letter-spacing: 1px;
                }

                .brand-tagline {
                    font-size: 14px;
                    color: #00B8DB;
                    margin-top: 5px;
                    font-weight: 300;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                }

                .right-panel {
                    flex: 1;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 40px;
                    background: rgba(255, 255, 255, 0.95);
                }

                .login-box {
                    width: 100%;
                    max-width: 380px;
                }

                .login-header {
                    margin-bottom: 25px;
                }

                .login-header h2 {
                    font-size: 38px;
                    font-weight: 600;
                    text-align: center;
                    background: linear-gradient(135deg, #0F172B, #00B8DB);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    color: transparent;
                    margin-bottom: 5px;
                }

                .login-header p {
                    color: #0F172B;
                    margin-top: 8px;
                    font-size: 16px;
                    text-align: center;
                    opacity: 0.7;
                }

                /* User Type Selector Styles */
                .user-type-selector {
                    display: flex;
                    gap: 15px;
                    margin-bottom: 15px;
                    padding: 5px;
                    background: rgba(15, 23, 43, 0.05);
                    border-radius: 15px;
                }

                .user-type-btn {
                    flex: 1;
                    padding: 12px;
                    border: none;
                    background: transparent;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    color: #0F172B;
                }

                .user-type-btn i {
                    font-size: 18px;
                }

                .user-type-btn.active {
                    background: #0F172B;
                    color: #FFFFFF;
                    box-shadow: 0 5px 15px rgba(0, 184, 219, 0.3);
                }

                .user-type-btn.active i {
                    color: #00B8DB;
                }

                .user-type-btn:hover:not(.active) {
                    background: rgba(0, 184, 219, 0.1);
                }

                .role-description {
                    margin-bottom: 20px;
                    padding: 10px;
                    background: rgba(0, 184, 219, 0.1);
                    border-radius: 10px;
                    border-left: 3px solid #00B8DB;
                }

                .role-description p {
                    color: #0F172B;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .role-description i {
                    color: #00B8DB;
                    font-size: 16px;
                }

                .error-message {
                    background: rgba(255, 87, 87, 0.1);
                    border: 1px solid #ff5757;
                    border-radius: 10px;
                    padding: 12px;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: #ff5757;
                    font-size: 14px;
                }

                .error-message i {
                    font-size: 18px;
                }

                .input-group {
                    margin-bottom: 25px;
                    position: relative;
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
                    color: #0F172B;
                    z-index: 2;
                    font-size: 18px;
                    opacity: 0.6;
                    transition: opacity 0.3s;
                }

                .toggle-eye:hover {
                    opacity: 1;
                    color: #00B8DB;
                }

                .input-group input {
                    width: 100%;
                    padding: 15px 45px 15px 45px;
                    border: 2px solid #e0e0e0;
                    border-radius: 12px;
                    font-size: 15px;
                    outline: none;
                    transition: all 0.3s ease;
                    background: #FFFFFF;
                    color: #0F172B;
                    box-sizing: border-box;
                }

                .input-group input:hover:not(:disabled) {
                    border-color: #00B8DB;
                }

                .input-group input:focus {
                    border-color: #00B8DB;
                    box-shadow: 0 0 0 4px rgba(0, 184, 219, 0.1);
                }

                .input-group input:disabled {
                    background-color: #f5f5f5;
                    cursor: not-allowed;
                    opacity: 0.7;
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

                .login-button {
                    width: 100%;
                    padding: 15px;
                    background: #0F172B;
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
                    background: #1a2542;
                }

                .login-button:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                    transform: none;
                }

                .info-message {
                    text-align: center;
                    margin-top: 20px;
                    padding: 10px;
                    background: rgba(15, 23, 43, 0.05);
                    border-radius: 10px;
                    color: #0F172B;
                    font-size: 13px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }

                .info-message i {
                    color: #00B8DB;
                }

                .fa-spin {
                    margin-right: 8px;
                }

                .decoration-circle {
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(0, 184, 219, 0.1);
                }

                .circle-1 {
                    width: 200px;
                    height: 200px;
                    top: -100px;
                    left: 20%;
                    background: rgba(0, 184, 219, 0.15);
                }

                .circle-2 {
                    width: 180px;
                    height: 180px;
                    bottom: -80px;
                    right: -50px;
                    background: rgba(255, 255, 255, 0.08);
                }

                .circle-3 {
                    width: 100px;
                    height: 100px;
                    top: 50%;
                    left: -50px;
                    background: rgba(0, 184, 219, 0.1);
                }

                .circle-4 {
                    width: 120px;
                    height: 120px;
                    top: 20%;
                    left: 380px;
                    background: rgba(255, 255, 255, 0.05);
                }

                @media (max-width: 992px) {
                    .container {
                        flex-direction: column;
                        max-width: 500px;
                        height: auto;
                        width: 90%;
                    }
                    
                    .left-panel {
                        padding: 30px;
                        min-height: 250px;
                    }
                    
                    .logo-circle {
                        width: 150px;
                        height: 150px;
                    }
                    
                    .brand-name {
                        font-size: 26px;
                    }
                    
                    .circle-4 {
                        left: 80%;
                    }
                }
                
                @media (max-width: 768px) {
                    .container {
                        border-radius: 20px;
                    }
                    
                    .left-panel, .right-panel {
                        padding: 25px;
                    }
                    
                    .login-header h2 {
                        font-size: 30px;
                    }
                    
                    .login-header p {
                        font-size: 14px;
                    }
                    
                    .user-type-btn {
                        padding: 10px;
                        font-size: 14px;
                    }
                    
                    .input-group input {
                        padding: 12px 40px 12px 40px;
                        font-size: 14px;
                    }
                    
                    .login-button {
                        padding: 12px;
                        font-size: 15px;
                    }
                    
                    .circle-1, .circle-2, .circle-3, .circle-4 {
                        display: none; 
                    }
                }
                
                @media (max-width: 480px) {
                    .container {
                        border-width: 2px;
                        border-radius: 15px;
                    }
                    
                    .left-panel, .right-panel {
                        padding: 20px;
                    }
                    
                    .logo-circle {
                        width: 120px;
                        height: 120px;
                        margin-bottom: 15px;
                    }
                    
                    .brand-name {
                        font-size: 22px;
                    }
                    
                    .brand-tagline {
                        font-size: 12px;
                    }
                    
                    .login-header h2 {
                        font-size: 26px;
                    }
                    
                    .user-type-selector {
                        gap: 10px;
                    }
                    
                    .user-type-btn {
                        font-size: 13px;
                        gap: 5px;
                    }
                    
                    .input-group {
                        margin-bottom: 20px;
                    }
                }
                
                @media (max-width: 360px) {
                    .left-panel {
                        min-height: 200px;
                    }
                    
                    .logo-circle {
                        width: 100px;
                        height: 100px;
                    }
                    
                    .login-header h2 {
                        font-size: 24px;
                    }
                    
                    .user-type-btn {
                        flex-direction: column;
                        padding: 8px;
                    }
                    
                    .input-group input {
                        padding: 10px 35px 10px 35px;
                    }
                    
                    .input-group i {
                        font-size: 16px;
                        left: 12px;
                    }
                }
            `}</style>
        </>
    );
}