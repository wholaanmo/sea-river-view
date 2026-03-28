'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { auth, db } from '../../lib/firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
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
                const now = new Date().getTime();
                if (now < parseInt(sessionExpiry)) {
                    if (userType === 'admin') {
                        router.push('/dashboard/admin/overview');
                    } else {
                        router.push('/dashboard/staff/front-desk');
                    }
                } else {
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
        
        // Animation for login box
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
    }, [router]);

    const togglePassword = () => {
        setShowPassword(!showPassword);
    };

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
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const uid = user.uid;

            const userDoc = await getDoc(doc(db, "users", uid));

            if (!userDoc.exists()) {
                setError('Your account is not approved. Contact the system administrator.');
                await auth.signOut();
                setLoading(false);
                return;
            }

            const userData = userDoc.data();
            const role = userData.role;
            const status = userData.status;

            if (status === 'inactive') {
                setError('This account has been deactivated by the admin.');
                await auth.signOut();
                setLoading(false);
                return;
            }

            const sessionToken = generateSessionToken();
            const sessionExpiry = new Date().getTime() + (24 * 60 * 60 * 1000);
            
            localStorage.setItem('userType', role);
            localStorage.setItem('userEmail', user.email);
            localStorage.setItem('uid', user.uid);
            localStorage.setItem('sessionToken', sessionToken);
            localStorage.setItem('sessionExpiry', sessionExpiry.toString());
            
            if (rememberMe) {
                localStorage.setItem('rememberMe', 'true');
            }
            
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
        setResetEmail(email);
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

    if (!isClient) {
        return null;
    }

    return (
        <>
            <div className="min-h-screen w-full relative bg-gradient-to-br from-ocean-pale to-ocean-ice flex items-center justify-center overflow-hidden">
                {/* Animated gradient orbs */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-ocean-light/20 blur-[80px] animate-pulse"></div>
                    <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-ocean-deep/15 blur-[80px] animate-pulse delay-1000"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-ocean-lighter/10 blur-[80px] animate-pulse delay-2000"></div>
                </div>
                
                {/* Pattern overlay */}
                <div className="absolute inset-0 z-0 opacity-30" style={{
                    backgroundImage: `repeating-linear-gradient(45deg, rgba(0, 184, 219, 0.02) 0px, rgba(0, 184, 219, 0.02) 2px, transparent 2px, transparent 10px),
                                      repeating-linear-gradient(135deg, rgba(15, 23, 43, 0.02) 0px, rgba(15, 23, 43, 0.02) 2px, transparent 2px, transparent 10px)`,
                    backgroundSize: '20px 20px'
                }}></div>

                {/* Main Container */}
                <div className="w-[900px] max-w-[90%] h-[560px] bg-white rounded-[40px] flex overflow-hidden shadow-2xl border border-white/20 z-10 backdrop-blur-sm">
                    
                    {/* Left Panel - Ocean Gradient */}
                    <div className="w-[45%] bg-gradient-to-br from-ocean-deep via-ocean-mid to-ocean-light p-8 flex items-center justify-center relative overflow-hidden rounded-r-[30px]">
                        <div className="absolute inset-0 bg-gradient-radial from-ocean-lighter/20 via-transparent to-transparent animate-gradientShift"></div>
                        
                        <div className="text-center max-w-[280px] relative z-10">
                            {/* Logo Container */}
                            <div className="mb-4 flex justify-center relative">
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150px] h-[150px] bg-ocean-lighter/40 rounded-full animate-pulse-glow"></div>
                                <div className="w-[120px] h-[120px] rounded-full bg-gradient-to-br from-ocean-lighter via-ocean-light to-ocean-mid p-[4px] relative z-10 shadow-2xl">
                                    <div className="w-full h-full rounded-full overflow-hidden bg-ocean-deep border-2 border-white/30 shadow-inner">
                                        <Image 
                                            src="/assets/Sea&RiverView.png" 
                                            alt="SandyFeet Reservation" 
                                            width={112}
                                            height={112}
                                            className="object-cover w-full h-full"
                                            priority
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            {/* Title */}
                            <div className="text-white font-playfair text-2xl font-bold tracking-wider mb-2 px-4 py-1 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full inline-block">
                                SandyFeet Reservation
                            </div>
                            
                            {/* Tagline */}
                            <p className="text-white/90 font-poppins text-sm mb-8 max-w-[260px] mx-auto italic">
                                Plan Your SandyFeet Escape with Ease
                            </p>
                            
                            {/* Features */}
                            <div className="flex justify-center gap-6">
                                <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                    <div className="w-[42px] h-[42px] rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/40 shadow-lg group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110">
                                        <i className="fas fa-umbrella-beach text-white text-xl"></i>
                                    </div>
                                    <span className="text-white text-xs font-medium">Rooms & Camping</span>
                                </div>
                                <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                    <div className="w-[42px] h-[42px] rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/40 shadow-lg group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110">
                                        <i className="fas fa-sun text-white text-xl"></i>
                                    </div>
                                    <span className="text-white text-xs font-medium">Day Tour</span>
                                </div>
                                <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                    <div className="w-[42px] h-[42px] rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/40 shadow-lg group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110">
                                        <i className="fas fa-water text-white text-xl"></i>
                                    </div>
                                    <span className="text-white text-xs font-medium">Beach Access</span>
                                </div>
                            </div>
                            
                            {/* Decorative Waves */}
                            <div className="absolute bottom-0 left-0 w-full h-[50px] overflow-hidden pointer-events-none">
                                <div className="absolute bottom-0 left-0 w-[200%] h-full bg-gradient-to-t from-white/10 to-transparent rounded-t-full animate-wave"></div>
                                <div className="absolute bottom-[-5px] left-0 w-[200%] h-full bg-gradient-to-t from-white/5 to-transparent rounded-t-full animate-wave-reverse"></div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Right Panel - White Background */}
                    <div className="w-[55%] p-10 flex items-center justify-center bg-white overflow-y-auto no-scrollbar">
                        <div className="w-full max-w-[320px] login-box">
                            {/* Header */}
                            <div className="text-center mb-8">
                                <h1 className="font-playfair text-3xl font-bold text-ocean-deep mb-2">Welcome Back</h1>
                                <p className="font-poppins text-sm text-ocean-mid/70">Sign in to your account</p>
                            </div>
                            
                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-5 flex items-center gap-2">
                                    <i className="fas fa-exclamation-circle text-red-500 text-sm"></i>
                                    <span className="text-red-600 text-xs font-poppins">{error}</span>
                                </div>
                            )}
                            
                            {/* Login Form */}
                            <form onSubmit={loginUser}>
                                {/* Email Field */}
                                <div className="mb-4">
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ocean-light/50">
                                            <i className="fas fa-envelope text-sm"></i>
                                        </div>
                                        <input 
                                            type="email" 
                                            placeholder="Email address" 
                                            required 
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            disabled={loading}
                                            className="w-full pl-9 pr-3 py-3 bg-ocean-ice/30 border border-ocean-light/20 rounded-xl text-ocean-deep font-poppins text-sm placeholder:text-ocean-light/40 focus:outline-none focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 transition-all duration-300"
                                        />
                                    </div>
                                </div>
                                
                                {/* Password Field */}
                                <div className="mb-5">
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ocean-light/50">
                                            <i className="fas fa-lock text-sm"></i>
                                        </div>
                                        <input 
                                            type={showPassword ? 'text' : 'password'} 
                                            placeholder="Password" 
                                            required 
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            disabled={loading}
                                            className="w-full pl-9 pr-10 py-3 bg-ocean-ice/30 border border-ocean-light/20 rounded-xl text-ocean-deep font-poppins text-sm placeholder:text-ocean-light/40 focus:outline-none focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 transition-all duration-300"
                                        />
                                        <button 
                                            type="button"
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ocean-light/50 hover:text-ocean-light transition-colors"
                                            onClick={togglePassword}
                                        >
                                            <i className={`fas ${showPassword ? 'fa-eye' : 'fa-eye-slash'} text-sm`}></i>
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Remember Me and Forgot Password */}
                                <div className="flex items-center justify-between mb-6">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input 
                                            type="checkbox" 
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className="w-4 h-4 accent-ocean-light rounded cursor-pointer"
                                        />
                                        <span className="text-xs text-ocean-mid/70 group-hover:text-ocean-light transition-colors">Remember me</span>
                                    </label>
                                    <a 
                                        href="#" 
                                        className="text-xs text-ocean-light font-medium hover:text-ocean-mid transition-colors"
                                        onClick={handleForgotPassword}
                                    >
                                        Forgot password?
                                    </a>
                                </div>
                                
                                {/* Sign In Button */}
                                <button 
                                    type="submit" 
                                    className="w-full py-3 bg-gradient-to-r from-ocean-mid to-ocean-light text-white font-poppins font-semibold text-sm rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
                            <div className="text-center mt-8 pt-4 border-t border-ocean-light/10">
                                <p className="text-xs text-ocean-light/50">© 2026 SandyFeet Reservation</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Forgot Password Modal */}
            {showForgotModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowForgotModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-slideUp" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-ocean-deep to-ocean-mid p-5 rounded-t-2xl flex items-center justify-between">
                            <h3 className="font-playfair text-xl font-semibold text-white">Reset Password</h3>
                            <button 
                                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all duration-300 flex items-center justify-center"
                                onClick={() => setShowForgotModal(false)}
                            >
                                <i className="fas fa-times text-sm"></i>
                            </button>
                        </div>
                        
                        <div className="p-6">
                            <p className="text-ocean-mid text-sm mb-5">
                                Enter your email address and we'll send you a link to reset your password.
                            </p>
                            
                            {resetMessage && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-center gap-2">
                                    <i className="fas fa-check-circle text-green-500 text-sm"></i>
                                    <span className="text-green-700 text-xs">{resetMessage}</span>
                                </div>
                            )}
                            
                            {resetError && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-2">
                                    <i className="fas fa-exclamation-circle text-red-500 text-sm"></i>
                                    <span className="text-red-600 text-xs">{resetError}</span>
                                </div>
                            )}
                            
                            <form onSubmit={handleResetPassword}>
                                <div className="relative mb-5">
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ocean-light/50">
                                        <i className="fas fa-envelope text-sm"></i>
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="Your email address"
                                        value={resetEmail}
                                        onChange={(e) => setResetEmail(e.target.value)}
                                        disabled={resetLoading || resetMessage}
                                        className="w-full pl-9 pr-3 py-3 bg-ocean-ice/30 border border-ocean-light/20 rounded-xl text-ocean-deep font-poppins text-sm placeholder:text-ocean-light/40 focus:outline-none focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 transition-all duration-300"
                                    />
                                </div>
                                
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        className="flex-1 py-2 rounded-xl border-2 border-ocean-light/30 text-ocean-mid font-poppins text-sm hover:bg-ocean-light/10 transition-all duration-300"
                                        onClick={() => setShowForgotModal(false)}
                                        disabled={resetLoading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-2 rounded-xl bg-gradient-to-r from-ocean-mid to-ocean-light text-white font-poppins text-sm font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                                        disabled={resetLoading || resetMessage}
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
            
            <style jsx>{`
                @keyframes pulse-glow {
                    0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
                    50% { opacity: 0.9; transform: translate(-50%, -50%) scale(1.08); }
                }
                .animate-pulse-glow {
                    animation: pulse-glow 4s infinite ease-in-out;
                }
                @keyframes gradientShift {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 0.75; }
                }
                .animate-gradientShift {
                    animation: gradientShift 15s infinite alternate;
                }
                @keyframes wave {
                    0% { transform: translateX(-30%) scaleX(1.2); }
                    100% { transform: translateX(-10%) scaleX(1.2); }
                }
                .animate-wave {
                    animation: wave 15s infinite linear;
                }
                .animate-wave-reverse {
                    animation: wave 20s infinite linear reverse;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease;
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slideUp {
                    animation: slideUp 0.3s ease;
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 0.1; }
                    50% { opacity: 0.2; }
                }
                .animate-pulse {
                    animation: pulse 4s infinite;
                }
                .delay-1000 {
                    animation-delay: 1s;
                }
                .delay-2000 {
                    animation-delay: 2s;
                }
            `}</style>
        </>
    );
}