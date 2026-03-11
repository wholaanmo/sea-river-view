import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Waves, TreePalm, Sunset } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [userType, setUserType] = useState<"staff" | "admin">("staff");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    setLoading(true);
    setError("");
    // Simulate login
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="flex min-h-screen bg-secondary font-body">
      {/* Left Panel - Branding with wavy edge */}
      <motion.div
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="hidden lg:flex lg:w-[45%] relative overflow-hidden"
      >
        {/* Background */}
        <div className="absolute inset-0 bg-secondary" />
        
        {/* Wavy SVG edge */}
        <svg
          className="absolute right-0 top-0 h-full w-[120px]"
          viewBox="0 0 120 800"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M0,0 L60,0 C80,100 20,200 60,300 C100,400 20,500 60,600 C100,700 40,750 60,800 L0,800 Z"
            fill="hsl(var(--background))"
          />
        </svg>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-center"
          >
            {/* Logo circle */}
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary">
              <Waves className="h-10 w-10 text-primary-foreground" />
            </div>

            <p className="text-sm font-medium tracking-widest uppercase text-brand-slate mb-2">
              Welcome to
            </p>
            <h1 className="font-display text-4xl font-bold text-secondary-foreground mb-6">
              Sea & River View
            </h1>

            <p className="text-muted-foreground text-lg max-w-[280px] mx-auto leading-relaxed">
              Relax Where the Sea and River Meet
            </p>

            {/* Feature indicators */}
            <div className="mt-12 flex gap-8 justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Waves className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground">Luxury Rooms</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Sunset className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground">Event Venue</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <TreePalm className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground">Beach Access</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Panel - Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-1 items-center justify-center px-6 py-12 bg-background"
      >
        <div className="w-full max-w-[400px]">
          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold text-foreground">
              Welcome Back
            </h2>
            <p className="mt-2 text-muted-foreground">
              Sign in to your account
            </p>
          </div>

          {/* User Type Toggle */}
          <div className="mb-6 flex rounded-lg border border-border p-1 bg-muted/50">
            <button
              type="button"
              onClick={() => { setUserType("staff"); setError(""); }}
              className={`flex-1 rounded-md py-2.5 text-sm font-medium transition-all duration-200 ${
                userType === "staff"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Staff
            </button>
            <button
              type="button"
              onClick={() => { setUserType("admin"); setError(""); }}
              className={`flex-1 rounded-md py-2.5 text-sm font-medium transition-all duration-200 ${
                userType === "admin"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Admin
            </button>
          </div>

          {/* Role Badge */}
          <div className="mb-6 flex items-center gap-2 text-sm text-brand-cyan">
            <span className="inline-block h-2 w-2 rounded-full bg-primary" />
            {userType === "admin" ? "Administrator" : "Staff Member"}
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors disabled:opacity-50"
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                Remember me
              </label>
              <button type="button" className="text-sm font-medium text-accent hover:underline">
                Forgot password?
              </button>
            </div>

            {/* Sign In */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {userType === "staff" && (
            <p className="mt-6 text-center text-xs text-muted-foreground">
              Contact admin for account issues
            </p>
          )}

          <p className="mt-8 text-center text-xs text-muted-foreground">
            © 2025 Sea & River View Resort
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
