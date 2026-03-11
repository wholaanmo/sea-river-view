"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Waves, TreePalm, Sunset } from "lucide-react";
import WaveAnimation from "@/components/WaveAnimation";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [userType, setUserType] = useState("staff");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    setLoading(true);
    setError("");
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className="flex min-h-screen font-body">
      {/* Left Panel - Photo + Waves */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:flex lg:w-[45%] relative overflow-hidden"
      >
        {/* Background Image - Updated path */}
        <img
          src="/assets/background.jpg"  // Changed from resortBg import
          alt="Sea and River View Resort"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/70 via-secondary/50 to-secondary/90" />

        {/* Wave animation at bottom */}
        <WaveAnimation />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-center"
          >
            {/* Logo - Updated with sea-river.png */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
              className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-primary shadow-[0_0_40px_rgba(0,184,219,0.4)]"
            >
              <img 
                src="/assets/sea-river.png" 
                alt="Sea and River Logo" 
                className="h-12 w-12 object-contain"
              />
            </motion.div>

            {/* ... rest of your code remains the same ... */}

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-sm font-medium tracking-[0.3em] uppercase text-primary-foreground/70 mb-3"
            >
              Welcome to
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="font-display text-5xl font-bold text-primary-foreground mb-2 leading-tight"
            >
              Sea & River
            </motion.h1>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="font-display text-3xl font-bold text-primary mb-8"
            >
              View Resort
            </motion.h1>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 80 }}
              transition={{ delay: 1.1, duration: 0.6 }}
              className="h-[2px] bg-primary mx-auto mb-8"
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-primary-foreground/80 text-lg max-w-[280px] mx-auto leading-relaxed italic"
            >
              Relax Where the Sea and River Meet
            </motion.p>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
              className="mt-14 flex gap-10 justify-center"
            >
              {[
                { icon: Waves, label: "Luxury Rooms" },
                { icon: Sunset, label: "Event Venue" },
                { icon: TreePalm, label: "Beach Access" },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5 + i * 0.1 }}
                  className="flex flex-col items-center gap-3 group"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 group-hover:bg-primary/30 transition-colors duration-300">
                    <item.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="text-xs text-primary-foreground/60 font-medium tracking-wide">
                    {item.label}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Panel - Form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 bg-background relative overflow-hidden">
        {/* Subtle wave pattern in background */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/5 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-primary/5 translate-y-1/2 -translate-x-1/2" />

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full max-w-[400px] relative z-10"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary shadow-lg">
              <Waves className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>

          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold text-foreground">
              Welcome Back
            </h2>
            <p className="mt-2 text-muted-foreground">
              Sign in to your account
            </p>
          </div>

          {/* User Type Toggle */}
          <div className="mb-6 flex rounded-xl border border-border p-1.5 bg-muted/30">
            {["staff", "admin"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setUserType(type);
                  setError("");
                }}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-300 capitalize ${
                  userType === type
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Role Badge */}
          <motion.div
            key={userType}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6 flex items-center gap-2.5 text-sm"
          >
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
            <span className="text-brand-cyan font-medium">
              {userType === "admin" ? "Administrator" : "Staff Member"}
            </span>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive overflow-hidden"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full rounded-xl border-2 border-border bg-background px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:shadow-[0_0_0_3px_rgba(0,184,219,0.15)] transition-all duration-200 disabled:opacity-50"
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-xl border-2 border-border bg-background px-4 py-3.5 pr-12 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:shadow-[0_0_0_3px_rgba(0,184,219,0.15)] transition-all duration-200 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-primary"
                />
                Remember me
              </label>
              <button
                type="button"
                className="text-sm font-semibold text-accent hover:text-accent/80 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Sign In */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:shadow-primary/40 disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </motion.button>
          </form>

          {userType === "staff" && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 text-center text-xs text-muted-foreground"
            >
              Contact admin for account issues
            </motion.p>
          )}

          <p className="mt-8 text-center text-xs text-muted-foreground">
            © 2025 Sea & River View Resort
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
