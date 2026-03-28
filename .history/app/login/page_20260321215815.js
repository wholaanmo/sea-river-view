'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { auth, db } from '../../lib/firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

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
                        router.push('/dashboard/staff/front-desk');
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
        // 1️⃣ Sign in with Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const uid = user.uid;

        // 2️⃣ Check the user document in Firestore
        const userDoc = await getDoc(doc(db, "users", uid));

        if (!userDoc.exists()) {
            // User exists in Auth but not in Firestore (not approved)
            setError('Your account is not approved. Contact the system administrator.');
            
            // Sign out the user since they don't have a role
            await auth.signOut();
            setLoading(false);
            return;
        }

        const userData = userDoc.data();
        const role = userData.role;
        const status = userData.status;

        // 3️⃣ Check if account is deactivated
        if (status === 'inactive') {
            setError('This account has been deactivated by the admin.');
            
            // Sign out the user since their account is deactivated
            await auth.signOut();
            setLoading(false);
            return;
        }

        // 4️⃣ Verify that the selected user type matches the role in Firestore
        if (role !== userType) {
            setError(`This account is registered as ${role}.`);
            
            // Sign out the user since they selected wrong type
            await auth.signOut();
            setLoading(false);
            return;
        }

        // 5️⃣ Generate session token
        const sessionToken = generateSessionToken();
        const sessionExpiry = new Date().getTime() + (24 * 60 * 60 * 1000); // 24 hours
        
        console.log("Login successful!", user);
        
        // 6️⃣ Store session data
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
        
        // 7️⃣ Redirect based on role
        if (role === 'admin') {
            router.push('/dashboard/admin/overview');
        } else if (role === 'staff') {
            router.push('/dashboard/staff/front-desk');
        } else {
            setError('Invalid role. Contact the administrator.');
            await auth.signOut();
        }
        
    } catch (err) {
        console.error("Login Error:", err);
        
        // Handle Firebase auth errors with user-friendly messages
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
            setError('Invalid email or password. Please try again.');
        } else if (err.code === 'auth/invalid-email') {
            setError('Invalid email format.');
        } else if (err.code === 'auth/too-many-requests') {
            setError('Too many failed attempts. Try again later.');
        } else if (err.code === 'auth/network-request-failed') {
            setError('Network error. Please check your connection.');
        } else {
            setError('Invalid email or password. Please try again.');
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

            <div className="relative min-h-screen overflow-hidden">
                {/* Modern gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0F172B] via-[#1A2A3A] to-[#0F172B]">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00B8DB] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FF6B6B] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FFD93D] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000"></div>
                </div>
                
                {/* Subtle pattern overlay */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.4\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')", backgroundSize: "30px" }}></div>

                <div className="container mx-auto px-4 py-8 relative z-10">
                    {/* Left Panel - Enhanced Dark Background with Gradient */}
                    <div className="flex flex-col md:flex-row max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
                        <div className="w-full md:w-1/2 bg-gradient-to-br from-[#0F172B] via-[#1A2A3A] to-[#0F172B] p-8 md:p-12 flex items-center justify-center relative overflow-hidden">
                            <div className="relative z-10 text-center">
                                {/* Logo Container - Made Bigger */}
                                <div className="mb-8 flex justify-center">
                                    <div className="w-40 h-40 rounded-full bg-gradient-to-br from-[#00B8DB] to-[#0095b3] p-1 shadow-2xl">
                                        <div className="w-full h-full rounded-full bg-white p-1">
                                            <div className="w-full h-full rounded-full overflow-hidden">
                                                <Image 
                                                    src="/assets/Sea&RiverView.png" 
                                                    alt="Sea & River View Resort" 
                                                    width={160}
                                                    height={160}
                                                    className="w-full h-full object-cover"
                                                    priority
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Sea & River View text - below logo */}
                                <h2 className="text-3xl font-bold text-white mb-2 font-['Playfair_Display']">Sea & River View</h2>
                                
                                {/* Reduced size text below Sea & River View */}
                                <h1 className="text-xl text-gray-300 mb-8 font-['Poppins']">Relax Where the Sea and River Meet</h1>
                                
                                {/* Simple feature indicators with enhanced styling */}
                                <div className="flex justify-center gap-8 mb-12">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                            <i className="fas fa-hotel text-[#00B8DB] text-lg"></i>
                                        </div>
                                        <span className="text-sm text-gray-300">Luxury Rooms</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                            <i className="fas fa-calendar-alt text-[#00B8DB] text-lg"></i>
                                        </div>
                                        <span className="text-sm text-gray-300">Event Venue</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                            <i className="fas fa-umbrella-beach text-[#00B8DB] text-lg"></i>
                                        </div>
                                        <span className="text-sm text-gray-300">Beach Access</span>
                                    </div>
                                </div>
                                
                                {/* Decorative wave element */}
                                <div className="absolute bottom-0 left-0 right-0">
                                    <svg className="w-full h-12 opacity-20" viewBox="0 0 1200 120" preserveAspectRatio="none">
                                        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="white"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                        
                        {/* Right Panel - Enhanced Light Background */}
                        <div className="w-full md:w-1/2 bg-white p-8 md:p-12 overflow-hidden">
                            <div className="max-w-md mx-auto">
                                <div className="text-center mb-8">
                                    <h1 className="text-3xl font-bold text-[#0F172B] mb-2 font-['Playfair_Display']">Welcome Back</h1>
                                    <h2 className="text-gray-600 font-['Poppins']">Sign in to your account</h2>
                                </div>
                                
                                {/* User Type Selection */}
                                <div className="relative flex bg-gray-100 rounded-lg p-1 mb-6">
                                    <div className={`absolute top-1 bottom-1 w-1/2 bg-gradient-to-r from-[#00B8DB] to-[#0095b3] rounded-lg transition-all duration-300 ${userType === 'staff' ? 'left-1' : 'left-1/2'}`}></div>
                                    <button
                                        type="button"
                                        className={`relative flex-1 py-2 rounded-lg transition-all duration-300 z-10 ${userType === 'staff' ? 'text-white' : 'text-gray-700'}`}
                                        onClick={() => handleUserTypeChange('staff')}
                                    >
                                        <i className="fas fa-users mr-2"></i>
                                        Staff
                                    </button>
                                    <button
                                        type="button"
                                        className={`relative flex-1 py-2 rounded-lg transition-all duration-300 z-10 ${userType === 'admin' ? 'text-white' : 'text-gray-700'}`}
                                        onClick={() => handleUserTypeChange('admin')}
                                    >
                                        <i className="fas fa-user-tie mr-2"></i>
                                        Admin
                                    </button>
                                </div>
                                
                                {/* Role Badge */}
                                <div className={`flex items-center justify-center gap-2 mb-6 p-2 rounded-lg ${userType === 'admin' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600'}`}>
                                    <i className={`fas ${userType === 'admin' ? 'fa-shield-alt' : 'fa-id-card'}`}></i>
                                    <span className="text-sm font-medium">{userType === 'admin' ? 'Administrator' : 'Staff Member'}</span>
                                </div>
                                
                                {error && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600">
                                        <i className="fas fa-exclamation-circle"></i>
                                        <span className="text-sm">{error}</span>
                                    </div>
                                )}
                                
                                <form onSubmit={loginUser}>
                                    {/* Email Field */}
                                    <div className="mb-4">
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                                <i className="fas fa-envelope"></i>
                                            </div>
                                            <input 
                                                type="email" 
                                                placeholder="Email address" 
                                                required 
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                disabled={loading}
                                                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00B8DB] focus:ring-2 focus:ring-[#00B8DB]/20 transition-all duration-300"
                                            />
                                        </div>
                                    </div>
                                    
                                    {/* Password Field */}
                                    <div className="mb-4">
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                                <i className="fas fa-lock"></i>
                                            </div>
                                            <input 
                                                type={showPassword ? 'text' : 'password'} 
                                                placeholder="Password" 
                                                required 
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                disabled={loading}
                                                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00B8DB] focus:ring-2 focus:ring-[#00B8DB]/20 transition-all duration-300"
                                            />
                                            <button 
                                                type="button"
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#00B8DB] transition-colors"
                                                onClick={togglePassword}
                                            >
                                                <i className={`fas ${showPassword ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Remember Me and Forgot Password */}
                                    <div className="flex justify-between items-center mb-6">
                                        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={rememberMe}
                                                onChange={(e) => setRememberMe(e.target.checked)}
                                                className="rounded border-gray-300 text-[#00B8DB] focus:ring-[#00B8DB]"
                                            />
                                            <span>Remember me</span>
                                        </label>
                                        <a 
                                            href="#" 
                                            className="text-sm text-[#00B8DB] hover:text-[#0095b3] transition-colors"
                                            onClick={handleForgotPassword}
                                        >
                                            Forgot password?
                                        </a>
                                    </div>
                                    
                                    {/* Sign In Button */}
                                    <button 
                                        type="submit" 
                                        className="w-full py-3 bg-gradient-to-r from-[#00B8DB] to-[#0095b3] text-white rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <span>
                                                <i className="fas fa-spinner fa-spin mr-2"></i> Signing in...
                                            </span>
                                        ) : (
                                            <span>Sign In</span>
                                        )}
                                    </button>
                                </form>
                                
                                {/* Footer */}
                                <div className="text-center mt-8 pt-6 border-t border-gray-200">
                                    <p className="text-xs text-gray-500">© 2026 Sea & River View Resort</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Forgot Password Modal */}
            {showForgotModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowForgotModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-md mx-4 overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-6 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-[#0F172B] font-['Playfair_Display']">Reset Password</h3>
                            <button 
                                className="text-gray-400 hover:text-gray-600 transition-colors text-xl"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowForgotModal(false);
                                }}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <div className="p-6">
                            <p className="text-gray-600 mb-6">
                                Enter your email address and we'll send you a link to reset your password.
                            </p>
                            
                            {resetMessage && (
                                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-600">
                                    <i className="fas fa-check-circle"></i>
                                    <span className="text-sm">{resetMessage}</span>
                                </div>
                            )}
                            
                            {resetError && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600">
                                    <i className="fas fa-exclamation-circle"></i>
                                    <span className="text-sm">{resetError}</span>
                                </div>
                            )}
                            
                            <form onSubmit={handleResetPassword}>
                                <div className="mb-6">
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                            <i className="fas fa-envelope"></i>
                                        </div>
                                        <input
                                            type="email"
                                            placeholder="Your email address"
                                            value={resetEmail}
                                            onChange={(e) => setResetEmail(e.target.value)}
                                            disabled={resetLoading || resetMessage}
                                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00B8DB] focus:ring-2 focus:ring-[#00B8DB]/20"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowForgotModal(false);
                                        }}
                                        disabled={resetLoading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-gradient-to-r from-[#00B8DB] to-[#0095b3] text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-70"
                                        disabled={resetLoading || resetMessage}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {resetLoading ? (
                                            <>
                                                <i className="fas fa-spinner fa-spin mr-2"></i> Sending...
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