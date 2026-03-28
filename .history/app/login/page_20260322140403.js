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
            {/* Changed background color to lighter soft blue-white tone */}
            <div className="min-h-screen w-full relative bg-linear-to-br from-[#F0F7FF] via-[#F5FAFF] to-[#FAFDFF] flex items-center justify-center overflow-hidden">
                {/* Animated gradient orbs with lighter tones */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-15%] right-[-10%] w-150 h-150 rounded-full bg-gradient-to-r from-[#2C7A7A]/20 to-[#4A9B9B]/15 blur-[100px] animate-floatOrb"></div>
                    <div className="absolute bottom-[-15%] left-[-10%] w-137.5 h-137.5 rounded-full bg-linear-to-l from-[#0B3B4F]/15 to-[#1B5E6B]/15 blur-[100px] animate-floatOrb delay-2000"></div>
                    <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-[#4FB3B3]/15 to-[#E0F2FE]/20 blur-[90px] animate-floatOrb delay-4000"></div>
                    <div className="absolute bottom-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-linear-to-bl from-[#9CA3AF]/10 to-[#2C7A7A]/15 blur-[80px] animate-floatOrb delay-6000"></div>
                </div>
                
                {/* Pattern overlay */}
                <div className="absolute inset-0 z-0 opacity-10" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0 L30 60 M0 30 L60 30' stroke='rgba(43, 108, 108, 0.1)' stroke-width='1' fill='none'/%3E%3Ccircle cx='30' cy='30' r='2' fill='rgba(43, 108, 108, 0.1)'/%3E%3C/svg%3E")`,
                    backgroundSize: '40px 40px'
                }}></div>

                {/* Main Container */}
                <div className="w-[840px] max-w-[90%] h-[540px] bg-white/95 backdrop-blur-sm rounded-[48px] flex overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border border-white/40 z-10">
                    
                    {/* Left Panel - Ocean Gradient */}
                    <div className="w-[45%] bg-gradient-to-br from-[#0B3B4F] via-[#146B6B] to-[#2C9B9B] p-6 flex items-center justify-center relative overflow-hidden rounded-r-[40px]">
                        {/* Animated gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#4FB3B3]/30 via-transparent to-[#E0F2FE]/20 animate-gradientShift"></div>
                        {/* Shimmer effect overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer"></div>
                        
                        <div className="text-center max-w-[260px] relative z-10">
                            {/* Logo Container */}
                            <div className="mb-4 flex justify-center relative">
                                <div className="w-[110px] h-[110px] rounded-full bg-gradient-to-br from-[#6DC5C5] via-[#4A9B9B] to-[#2C7A7A] p-[3px] relative z-10 shadow-2xl ring-4 ring-white/30">
                                    <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-[#0B3B4F] to-[#1B5E6B] shadow-inner">
                                        <Image 
                                            src="/assets/Sea&RiverView.png" 
                                            alt="SandyFeet Reservation" 
                                            width={104}
                                            height={104}
                                            className="object-cover w-full h-full"
                                            priority
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            {/* Title - Removed underline below Reservation */}
                            <div className="mb-2">
                                <h2 className="font-playfair text-2xl font-bold tracking-wide">
                                    <span className="bg-gradient-to-r from-white via-[#E0F2FE] to-white bg-clip-text text-transparent drop-shadow-lg">
                                        SandyFeet
                                    </span>
                                    <br />
                                    <span className="text-white/90 text-lg font-medium tracking-wider">
                                        Reservation
                                    </span>
                                </h2>
                            </div>
                            
                            {/* Tagline - Added spacing below this text */}
                            <p className="text-white/90 font-poppins text-xs mb-8 max-w-[240px] mx-auto italic">
                                Plan Your SandyFeet Escape with Ease
                            </p>
                            
                            {/* Features */}
                            <div className="flex justify-center gap-6">
                                {[
                                    { icon: 'fa-umbrella-beach', label: 'Rooms & Camping' },
                                    { icon: 'fa-sun', label: 'Day Tour' },
                                    { icon: 'fa-water', label: 'Beach Access' }
                                ].map((feature, idx) => (
                                    <div key={idx} className="flex flex-col items-center gap-1.5">
                                        <div className="w-[42px] h-[42px] rounded-full bg-gradient-to-br from-white/25 to-white/10 backdrop-blur-sm flex items-center justify-center border border-white/40 shadow-md">
                                            <i className={`fas ${feature.icon} text-white text-base drop-shadow`}></i>
                                        </div>
                                        <span className="text-white/80 text-[11px] font-medium">{feature.label}</span>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Decorative Waves */}
                            <div className="absolute bottom-0 left-0 w-full h-[50px] overflow-hidden pointer-events-none">
                                <div className="absolute bottom-0 left-0 w-[200%] h-full bg-gradient-to-t from-white/20 via-white/10 to-transparent rounded-t-full animate-wave"></div>
                                <div className="absolute bottom-[-8px] left-0 w-[200%] h-full bg-gradient-to-t from-white/10 via-transparent to-transparent rounded-t-full animate-wave-reverse"></div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Right Panel */}
                    <div className="w-[55%] p-8 flex items-center justify-center bg-gradient-to-br from-white via-[#FEFEFE] to-[#F8FDFF] overflow-y-auto no-scrollbar">
                        <div className="w-full max-w-[300px] login-box">
                            {/* Header */}
                            <div className="text-center mb-6">
                                <h1 className="font-playfair text-2xl font-bold bg-gradient-to-r from-[#0B3B4F] to-[#2C7A7A] bg-clip-text text-transparent mb-1">Welcome Back</h1>
                                <p className="font-poppins text-xs text-[#2C7A7A]/80">Sign in to your account</p>
                            </div>
                            
                            {/* Error Message */}
                            {error && (
                                <div className="bg-gradient-to-r from-red-50 to-red-100/50 rounded-xl p-3 mb-4 flex items-center gap-2 shadow-sm">
                                    <i className="fas fa-exclamation-circle text-red-500 text-sm"></i>
                                    <span className="text-red-600 text-xs font-poppins flex-1">{error}</span>
                                </div>
                            )}
                            
                            {/* Login Form */}
                            <form onSubmit={loginUser}>
                                {/* Email Field */}
                                <div className="mb-3">
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#2C7A7A]/50 group-focus-within:text-[#2C7A7A] transition-colors duration-300">
                                            <i className="fas fa-envelope text-sm"></i>
                                        </div>
                                        <input 
                                            type="email" 
                                            placeholder="Email address" 
                                            required 
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            disabled={loading}
                                            className="w-full pl-9 pr-3 py-2.5 bg-gradient-to-r from-[#F0F9FF]/50 to-white border border-[#2C7A7A]/20 rounded-xl text-[#0B3B4F] font-poppins text-sm placeholder:text-[#2C7A7A]/40 focus:outline-none focus:border-[#2C7A7A] focus:ring-2 focus:ring-[#2C7A7A]/30 transition-all duration-300 shadow-sm"
                                        />
                                    </div>
                                </div>
                                
                                {/* Password Field */}
                                <div className="mb-4">
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#2C7A7A]/50 group-focus-within:text-[#2C7A7A] transition-colors duration-300">
                                            <i className="fas fa-lock text-sm"></i>
                                        </div>
                                        <input 
                                            type={showPassword ? 'text' : 'password'} 
                                            placeholder="Password" 
                                            required 
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            disabled={loading}
                                            className="w-full pl-9 pr-10 py-2.5 bg-gradient-to-r from-[#F0F9FF]/50 to-white border border-[#2C7A7A]/20 rounded-xl text-[#0B3B4F] font-poppins text-sm placeholder:text-[#2C7A7A]/40 focus:outline-none focus:border-[#2C7A7A] focus:ring-2 focus:ring-[#2C7A7A]/30 transition-all duration-300 shadow-sm"
                                        />
                                        <button 
                                            type="button"
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#2C7A7A]/50 hover:text-[#2C7A7A] transition-colors"
                                            onClick={togglePassword}
                                        >
                                            <i className={`fas ${showPassword ? 'fa-eye' : 'fa-eye-slash'} text-sm`}></i>
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Remember Me and Forgot Password */}
                                <div className="flex items-center justify-between mb-5">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input 
                                            type="checkbox" 
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className="w-3.5 h-3.5 accent-[#2C7A7A] rounded cursor-pointer"
                                        />
                                        <span className="text-xs text-[#2C7A7A]/70 group-hover:text-[#2C7A7A] transition-colors">Remember me</span>
                                    </label>
                                    <a 
                                        href="#" 
                                        className="text-xs text-[#2C7A7A] font-medium hover:text-[#0B3B4F] transition-all duration-300 hover:underline underline-offset-2"
                                        onClick={handleForgotPassword}
                                    >
                                        Forgot password?
                                    </a>
                                </div>
                                
                                {/* Sign In Button */}
                                <button 
                                    type="submit" 
                                    className="w-full py-2.5 bg-gradient-to-r from-[#1B5E6B] via-[#2C7A7A] to-[#4A9B9B] bg-[length:200%_auto] text-white font-poppins font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group relative overflow-hidden"
                                    disabled={loading}
                                >
                                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                                    {loading ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin"></i> Signing in...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-arrow-right-to-bracket text-sm"></i> Sign In
                                        </>
                                    )}
                                </button>
                            </form>
                            
                            {/* Footer */}
                            <div className="text-center mt-6 pt-4 border-t border-[#2C7A7A]/10">
                                <p className="text-xs text-[#2C7A7A]/50 flex items-center justify-center gap-1">
                                    <i className="fas fa-umbrella-beach text-[10px]"></i> © 2026 SandyFeet Reservation
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Forgot Password Modal - Kept exactly as is */}
            {showForgotModal && (
                <div className="fixed inset-0 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowForgotModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-slideUp border border-white/20" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-[#0B3B4F] via-[#1B5E6B] to-[#2C7A7A] p-5 rounded-t-2xl flex items-center justify-between relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
                            <h3 className="font-playfair text-xl font-semibold text-white relative z-10">
                                <i className="fas fa-key mr-2"></i> Reset Password
                            </h3>
                            <button 
                                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all duration-300 flex items-center justify-center backdrop-blur-sm"
                                onClick={() => setShowForgotModal(false)}
                            >
                                <i className="fas fa-times text-sm"></i>
                            </button>
                        </div>
                        
                        <div className="p-6">
                            <p className="text-[#1B5E6B] text-sm mb-5 flex items-start gap-2">
                                <i className="fas fa-envelope-open-text text-[#4A9B9B] mt-0.5"></i>
                                Enter your email address and we'll send you a link to reset your password.
                            </p>
                            
                            {resetMessage && (
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400 rounded-lg p-3 mb-4 flex items-center gap-2">
                                    <i className="fas fa-check-circle text-green-500 text-sm"></i>
                                    <span className="text-green-700 text-xs">{resetMessage}</span>
                                </div>
                            )}
                            
                            {resetError && (
                                <div className="bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-400 rounded-lg p-3 mb-4 flex items-center gap-2">
                                    <i className="fas fa-exclamation-circle text-red-500 text-sm"></i>
                                    <span className="text-red-600 text-xs">{resetError}</span>
                                </div>
                            )}
                            
                            <form onSubmit={handleResetPassword}>
                                <div className="relative mb-5 group">
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#2C7A7A]/50 group-focus-within:text-[#2C7A7A] transition-colors">
                                        <i className="fas fa-envelope text-sm"></i>
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="Your email address"
                                        value={resetEmail}
                                        onChange={(e) => setResetEmail(e.target.value)}
                                        disabled={resetLoading || resetMessage}
                                        className="w-full pl-9 pr-3 py-3 bg-gradient-to-r from-[#F0F9FF]/50 to-white border border-[#2C7A7A]/20 rounded-xl text-[#0B3B4F] font-poppins text-sm placeholder:text-[#2C7A7A]/40 focus:outline-none focus:border-[#2C7A7A] focus:ring-2 focus:ring-[#2C7A7A]/20 transition-all duration-300"
                                    />
                                </div>
                                
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        className="flex-1 py-2 rounded-xl border-2 border-[#2C7A7A]/30 text-[#1B5E6B] font-poppins text-sm hover:bg-[#2C7A7A]/5 hover:border-[#2C7A7A]/50 transition-all duration-300"
                                        onClick={() => setShowForgotModal(false)}
                                        disabled={resetLoading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#1B5E6B] to-[#4A9B9B] text-white font-poppins text-sm font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                                        disabled={resetLoading || resetMessage}
                                    >
                                        {resetLoading ? (
                                            <>
                                                <i className="fas fa-spinner fa-spin mr-2"></i> Sending...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-paper-plane mr-2"></i> Send Reset Link
                                            </>
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
                    50% { opacity: 0.9; transform: translate(-50%, -50%) scale(1.12); }
                }
                .animate-pulse-glow {
                    animation: pulse-glow 4s infinite ease-in-out;
                }
                @keyframes gradientShift {
                    0%, 100% { opacity: 0.4; background-position: 0% 50%; }
                    50% { opacity: 0.7; background-position: 100% 50%; }
                }
                .animate-gradientShift {
                    animation: gradientShift 3s ease infinite;
                    background-size: 200% auto;
                }
                @keyframes wave {
                    0% { transform: translateX(-30%) scaleX(1.2); }
                    100% { transform: translateX(10%) scaleX(1.2); }
                }
                .animate-wave {
                    animation: wave 18s infinite linear;
                }
                .animate-wave-reverse {
                    animation: wave 22s infinite linear reverse;
                }
                @keyframes fadeIn {
                    from { opacity: 0; backdrop-filter: blur(0px); }
                    to { opacity: 1; backdrop-filter: blur(4px); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease forwards;
                }
                @keyframes slideUp {
                    from { transform: translateY(30px); opacity: 0; filter: blur(2px); }
                    to { transform: translateY(0); opacity: 1; filter: blur(0); }
                }
                .animate-slideUp {
                    animation: slideUp 0.3s ease;
                }
                @keyframes floatOrb {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(30px, -20px) scale(1.05); }
                }
                .animate-floatOrb {
                    animation: floatOrb 12s infinite ease-in-out;
                }
                @keyframes shimmer {
                    0% { transform: translateX(-100%) skewX(-12deg); }
                    100% { transform: translateX(200%) skewX(-12deg); }
                }
                .animate-shimmer {
                    animation: shimmer 8s infinite;
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }
                .delay-2000 {
                    animation-delay: 2s;
                }
                .delay-4000 {
                    animation-delay: 4s;
                }
                .delay-6000 {
                    animation-delay: 6s;
                }
            `}</style>
        </>
    );
}