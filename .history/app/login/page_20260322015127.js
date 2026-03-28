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
    
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const [resetMessage, setResetMessage] = useState('');
    const [resetError, setResetError] = useState('');
    
    const router = useRouter();

    useEffect(() => {
        setIsClient(true);
        
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
        
        const loginBox = document.querySelector('.login-box');
        if (loginBox) {
            loginBox.style.transform = 'translateY(20px)';
            loginBox.style.opacity = '0';
            setTimeout(() => {
                loginBox.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
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
            <div className="min-h-screen w-full relative bg-gradient-to-br from-ocean-ice via-white to-ocean-pale flex items-center justify-center overflow-hidden">
                {/* Animated gradient orbs */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-ocean-light/10 to-ocean-mid/5 blur-[80px] animate-float-slow"></div>
                    <div className="absolute bottom-[-15%] left-[-10%] w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-ocean-mid/8 to-ocean-deep/5 blur-[80px] animate-float-delay"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-ocean-lighter/5 blur-[100px]"></div>
                </div>
                
                {/* Subtle grid pattern */}
                <div className="absolute inset-0 z-0 opacity-[0.015]" style={{
                    backgroundImage: `linear-gradient(to right, #0B3B4F 1px, transparent 1px),
                                      linear-gradient(to bottom, #0B3B4F 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}></div>

                {/* Main Container - Slightly Smaller */}
                <div className="w-[880px] max-w-[90%] h-[560px] bg-white/95 backdrop-blur-sm rounded-[40px] flex overflow-hidden shadow-2xl border border-white/40 z-10">
                    
                    {/* Left Panel - Ocean Gradient */}
                    <div className="w-[42%] bg-gradient-to-br from-ocean-deep via-ocean-mid to-ocean-light p-8 flex items-center justify-center relative overflow-hidden rounded-r-[32px]">
                        {/* Subtle pattern overlay */}
                        <div className="absolute inset-0 opacity-5" style={{
                            backgroundImage: `radial-gradient(circle at 20% 30%, white 1px, transparent 1px)`,
                            backgroundSize: '25px 25px'
                        }}></div>
                        
                        <div className="text-center max-w-[260px] relative z-10">
                            {/* Logo with elegant glow */}
                            <div className="mb-5 flex justify-center relative">
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[140px] h-[140px] rounded-full bg-ocean-lighter/20 blur-xl animate-pulse-glow"></div>
                                <div className="relative">
                                    <div className="w-[110px] h-[110px] rounded-full bg-gradient-to-br from-white/20 to-white/5 p-[2px] relative z-10 shadow-xl">
                                        <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-ocean-deep to-ocean-mid">
                                            <Image 
                                                src="/assets/Sea&RiverView.png" 
                                                alt="SandyFeet Reservation" 
                                                width={106}
                                                height={106}
                                                className="object-cover w-full h-full"
                                                priority
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Title - No underline */}
                            <h2 className="text-white font-playfair text-2xl font-bold tracking-wide mb-2">
                                SandyFeet rE
                            </h2>
                            <p className="text-white/75 font-poppins text-xs mb-7 max-w-[220px] mx-auto font-light tracking-wide leading-relaxed">
                                Plan Your SandyFeet Escape with Ease
                            </p>
                            
                            {/* Features with elegant circular design */}
                            <div className="flex justify-center gap-6">
                                {[
                                    { icon: 'fa-umbrella-beach', label: 'Rooms & Camping' },
                                    { icon: 'fa-sun', label: 'Day Tour' },
                                    { icon: 'fa-water', label: 'Beach Access' }
                                ].map((feature, idx) => (
                                    <div key={idx} className="flex flex-col items-center gap-2 group">
                                        <div className="w-[44px] h-[44px] rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/25 shadow-md group-hover:bg-white/20 group-hover:border-white/40 group-hover:shadow-lg transition-all duration-300">
                                            <i className={`fas ${feature.icon} text-white/90 text-lg group-hover:scale-110 transition-transform duration-300`}></i>
                                        </div>
                                        <span className="text-white/80 text-[10px] font-medium tracking-wide uppercase group-hover:text-white transition-colors">
                                            {feature.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Simple decorative element instead of waves */}
                            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-1">
                                <div className="w-1 h-1 rounded-full bg-white/30"></div>
                                <div className="w-1 h-1 rounded-full bg-white/30"></div>
                                <div className="w-1 h-1 rounded-full bg-white/30"></div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Right Panel - Clean White */}
                    <div className="w-[58%] p-10 flex items-center justify-center bg-white overflow-y-auto no-scrollbar">
                        <div className="w-full max-w-[320px] login-box">
                            {/* Header with refined spacing */}
                            <div className="text-center mb-8">
                                <div className="inline-block mb-3">
                                    <div className="w-10 h-[2px] bg-gradient-to-r from-ocean-light to-ocean-mid rounded-full mx-auto"></div>
                                </div>
                                <h1 className="font-playfair text-2xl font-bold text-ocean-deep mb-2 tracking-tight">
                                    Welcome Back
                                </h1>
                                <p className="font-poppins text-xs text-ocean-mid/60 font-light">
                                    Sign in to continue your journey
                                </p>
                            </div>
                            
                            {/* Error Message */}
                            {error && (
                                <div className="bg-gradient-to-r from-red-50 to-red-50/50 border-l-4 border-red-400 rounded-lg p-3 mb-5 flex items-center gap-3 animate-shake">
                                    <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                        <i className="fas fa-exclamation-circle text-red-500 text-xs"></i>
                                    </div>
                                    <span className="text-red-700 text-xs font-poppins flex-1">{error}</span>
                                </div>
                            )}
                            
                            {/* Login Form */}
                            <form onSubmit={loginUser}>
                                {/* Email Field */}
                                <div className="mb-4">
                                    <label className="block text-ocean-mid text-[11px] font-medium mb-1.5 tracking-wide">
                                        Email Address
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ocean-light/40 group-focus-within:text-ocean-light transition-colors duration-300">
                                            <i className="fas fa-envelope text-xs"></i>
                                        </div>
                                        <input 
                                            type="email" 
                                            placeholder="your@email.com" 
                                            required 
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            disabled={loading}
                                            className="w-full pl-9 pr-3 py-2.5 bg-ocean-ice/20 border border-ocean-light/15 rounded-xl text-ocean-deep font-poppins text-sm placeholder:text-ocean-light/30 focus:outline-none focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 focus:bg-white transition-all duration-300"
                                        />
                                    </div>
                                </div>
                                
                                {/* Password Field */}
                                <div className="mb-5">
                                    <label className="block text-ocean-mid text-[11px] font-medium mb-1.5 tracking-wide">
                                        Password
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ocean-light/40 group-focus-within:text-ocean-light transition-colors duration-300">
                                            <i className="fas fa-lock text-xs"></i>
                                        </div>
                                        <input 
                                            type={showPassword ? 'text' : 'password'} 
                                            placeholder="••••••••" 
                                            required 
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            disabled={loading}
                                            className="w-full pl-9 pr-9 py-2.5 bg-ocean-ice/20 border border-ocean-light/15 rounded-xl text-ocean-deep font-poppins text-sm placeholder:text-ocean-light/30 focus:outline-none focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 focus:bg-white transition-all duration-300"
                                        />
                                        <button 
                                            type="button"
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ocean-light/40 hover:text-ocean-light transition-colors duration-300"
                                            onClick={togglePassword}
                                        >
                                            <i className={`fas ${showPassword ? 'fa-eye' : 'fa-eye-slash'} text-xs`}></i>
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
                                            className="w-3.5 h-3.5 rounded border-ocean-light/30 text-ocean-light focus:ring-ocean-light focus:ring-offset-0 cursor-pointer"
                                        />
                                        <span className="text-[11px] text-ocean-mid/60 group-hover:text-ocean-light transition-colors">Remember me</span>
                                    </label>
                                    <a 
                                        href="#" 
                                        className="text-[11px] text-ocean-light font-medium hover:text-ocean-mid transition-colors relative group"
                                        onClick={handleForgotPassword}
                                    >
                                        Forgot password?
                                        <span className="absolute bottom-0 left-0 w-0 h-px bg-ocean-light group-hover:w-full transition-all duration-300"></span>
                                    </a>
                                </div>
                                
                                {/* Sign In Button */}
                                <button 
                                    type="submit" 
                                    className="w-full py-2.5 bg-gradient-to-r from-ocean-mid to-ocean-light text-white font-poppins font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transform hover:scale-[1.01] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                                    disabled={loading}
                                >
                                    <span className="relative z-10">
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <i className="fas fa-spinner fa-spin"></i> Signing in...
                                            </span>
                                        ) : (
                                            'Sign In'
                                        )}
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-ocean-light to-ocean-lighter opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </button>
                            </form>
                            
                            {/* Footer */}
                            <div className="text-center mt-8 pt-5 border-t border-ocean-light/10">
                                <p className="text-[10px] text-ocean-light/40 font-light tracking-wide">
                                    © 2026 SandyFeet Reservation
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Forgot Password Modal */}
            {showForgotModal && (
                <div className="fixed inset-0 bg-gradient-to-br from-ocean-deep/80 to-ocean-mid/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowForgotModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-slideUp" onClick={(e) => e.stopPropagation()}>
                        <div className="relative p-5 border-b border-ocean-light/10">
                            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-ocean-light via-ocean-mid to-ocean-light rounded-t-2xl"></div>
                            <h3 className="font-playfair text-xl font-bold text-ocean-deep text-center">
                                Reset Password
                            </h3>
                            <button 
                                className="absolute top-5 right-5 w-7 h-7 rounded-full bg-ocean-ice/50 hover:bg-ocean-light/10 text-ocean-mid hover:text-ocean-light transition-all duration-300 flex items-center justify-center"
                                onClick={() => setShowForgotModal(false)}
                            >
                                <i className="fas fa-times text-xs"></i>
                            </button>
                        </div>
                        
                        <div className="p-5">
                            <p className="text-ocean-mid/70 text-xs text-center mb-5 leading-relaxed">
                                Enter your email address and we'll send you a link to reset your password.
                            </p>
                            
                            {resetMessage && (
                                <div className="bg-gradient-to-r from-green-50 to-green-50/50 border-l-4 border-green-400 rounded-lg p-2.5 mb-4 flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                        <i className="fas fa-check-circle text-green-500 text-xs"></i>
                                    </div>
                                    <span className="text-green-700 text-xs flex-1">{resetMessage}</span>
                                </div>
                            )}
                            
                            {resetError && (
                                <div className="bg-gradient-to-r from-red-50 to-red-50/50 border-l-4 border-red-400 rounded-lg p-2.5 mb-4 flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                        <i className="fas fa-exclamation-circle text-red-500 text-xs"></i>
                                    </div>
                                    <span className="text-red-700 text-xs flex-1">{resetError}</span>
                                </div>
                            )}
                            
                            <form onSubmit={handleResetPassword}>
                                <div className="relative mb-5">
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ocean-light/40">
                                        <i className="fas fa-envelope text-xs"></i>
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="your@email.com"
                                        value={resetEmail}
                                        onChange={(e) => setResetEmail(e.target.value)}
                                        disabled={resetLoading || resetMessage}
                                        className="w-full pl-9 pr-3 py-2.5 bg-ocean-ice/20 border border-ocean-light/15 rounded-xl text-ocean-deep font-poppins text-sm placeholder:text-ocean-light/30 focus:outline-none focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 transition-all duration-300"
                                    />
                                </div>
                                
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        className="flex-1 py-2 rounded-xl border border-ocean-light/20 text-ocean-mid font-poppins text-xs font-medium hover:bg-ocean-light/5 hover:border-ocean-light/40 transition-all duration-300"
                                        onClick={() => setShowForgotModal(false)}
                                        disabled={resetLoading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-2 rounded-xl bg-gradient-to-r from-ocean-mid to-ocean-light text-white font-poppins text-xs font-medium hover:shadow-md transform hover:scale-[1.01] transition-all duration-300 disabled:opacity-50"
                                        disabled={resetLoading || resetMessage}
                                    >
                                        {resetLoading ? (
                                            <>
                                                <i className="fas fa-spinner fa-spin mr-1"></i> Sending...
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
                    0%, 100% { opacity: 0.2; transform: translate(-50%, -50%) scale(1); }
                    50% { opacity: 0.4; transform: translate(-50%, -50%) scale(1.08); }
                }
                .animate-pulse-glow {
                    animation: pulse-glow 4s infinite ease-in-out;
                }
                @keyframes float-slow {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(-15px, 15px); }
                }
                .animate-float-slow {
                    animation: float-slow 20s infinite ease-in-out;
                }
                @keyframes float-delay {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(15px, -15px); }
                }
                .animate-float-delay {
                    animation: float-delay 18s infinite ease-in-out;
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-4px); }
                    75% { transform: translateX(4px); }
                }
                .animate-shake {
                    animation: shake 0.3s ease-in-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; backdrop-filter: blur(0px); }
                    to { opacity: 1; backdrop-filter: blur(8px); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease;
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slideUp {
                    animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }
            `}</style>
        </>
    );
}