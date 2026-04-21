import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  Zap,
  ArrowRight,
  MotorbikeIcon
} from "lucide-react";


export default function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    if (isLoading) return;

    setError("");
    setIsLoading(true);

    try {
      const res = await api.post("/auth/admin-login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);

      setTimeout(() => navigate("/"), 400);
    } catch (error) {
      setError(error.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    show: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.12,
        duration: 0.55
      }
    })
  };

  return (

    <motion.div
      initial="hidden"
      animate="show"
      className="h-screen w-screen bg-gray-50 text-gray-900 flex flex-col lg:flex-row overflow-hidden font-sans selection:bg-blue-100"
    >



      <div className="hidden lg:flex relative w-full lg:w-1/2 h-full flex-col justify-center px-10 xl:px-20 overflow-hidden bg-white border-r border-gray-200 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">

        {/* Ambient Color Glows (Blue and Orange based on Logo) */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-400/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-orange-400/15 rounded-full blur-[120px]"
        />

        {/* Subtle Grid Pattern overlay (Dark dots for light theme) */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4wMykiLz48L3N2Zz4=')] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)] pointer-events-none"></div>

        <div className="relative z-10 max-w-xl w-full">

          {/* Logo Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-4 mb-12"
          >
            <div className="h-14 w-14">
              <img src="logo.png" alt="Logo" className="scale-150 object-contain drop-shadow-sm" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-wide ml-2">
              <span className="text-blue-600">Repair </span><span className="text-orange-500">Saathi</span>
            </h1>
          </motion.div>

          {/* Headings */}
          <motion.h2
            variants={fadeUp}
            custom={2}
            className="text-4xl xl:text-5xl font-bold leading-[1.15] mb-6 text-gray-900"
          >
            Manage Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-500">
              Service Business
            </span> Easily
          </motion.h2>

          <motion.p
            variants={fadeUp}
            custom={3}
            className="text-gray-500 text-base xl:text-lg leading-relaxed mb-12 max-w-md"
          >
            Powerful dashboard for  admin control, service tracking, bookings and customer management.
          </motion.p>

          {/* Feature Grid */}
          <div className="grid grid-cols-2 gap-5">
            {/* Secure Feature Card (Blue Theme) */}
            <motion.div
              variants={fadeUp}
              custom={4}
              whileHover={{ y: -6, scale: 1.02 }}
              className="group p-5 rounded-2xl bg-white border border-gray-100 shadow-sm"
            >
              <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-300">
                <ShieldCheck className="text-blue-600" size={24} />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Secure</h3>
              <p className="text-sm text-gray-500">Protected Login System</p>
            </motion.div>

            {/* Fast Feature Card (Orange Theme) */}
            <motion.div
              variants={fadeUp}
              custom={5}
              whileHover={{ y: -6, scale: 1.02 }}
              className="group p-5 rounded-2xl bg-white border border-gray-100 shadow-sm"
            >
              <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-orange-100 transition-all duration-300">
                <Zap className="text-orange-500" size={24} />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Fast</h3>
              <p className="text-sm text-gray-500">Smooth Dashboard Access</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* =========================================
          RIGHT SIDE: LOGIN FORM 
          Takes full width on mobile, half on large
          ========================================= */}
      <div className="relative w-full lg:w-1/2 h-full flex items-center justify-center px-6 py-10 bg-gray-50 overflow-y-auto lg:overflow-hidden">

        {/* Subtle Form Background Glow (Blue) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-400/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 w-full max-w-[400px]">

          {/* Mobile Branding (Only visible on small screens) */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="lg:hidden flex flex-col items-center justify-center mb-5"
          >
            <div className="h-12 w-12 mb-2 flex items-center justify-center">
              <img src="logo.png" alt="LOGO" className="scale-125 object-contain drop-shadow-sm" />
            </div>
            <h1 className="text-2xl font-bold tracking-wide mt-2">
              <span className="text-blue-600">Repair </span><span className="text-orange-500">Saathi</span>
            </h1>
          </motion.div>

          {/* Form Card */}
          <motion.div
            variants={fadeUp}
            custom={2}
            className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-3xl p-8 sm:p-10 shadow-xl shadow-gray-200/50"
          >

            {/* Form Header */}
            <div className="text-center lg:text-left mb-8">
              <motion.h2
                variants={fadeUp}
                custom={2}
                className="text-3xl xl:text-3xl font-bold leading-[1.15] mb-6 text-gray-900"
              >
                Admin Login
              </motion.h2>
              <p className="text-gray-500 text-sm">
                Enter your email and password to continue
              </p>
            </div>
            {error && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-5">

              {/* EMAIL FIELD */}
              <motion.div variants={fadeUp} custom={3}>
                <label className="block text-[13px] font-medium mb-2 text-gray-600">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300"
                  />
                  <input
                    type="email"
                    placeholder="admin@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 pl-11 pr-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-300 shadow-sm"
                  />
                </div>
              </motion.div>

              {/* PASSWORD FIELD */}
              <motion.div variants={fadeUp} custom={4}>
                <label className="block text-[13px] font-medium mb-2 text-gray-600">
                  Password
                </label>
                <div className="relative group">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-12 pl-11 pr-11 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-300 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </motion.div>

              {/* SUBMIT BUTTON */}
              <motion.div variants={fadeUp} custom={5} className="pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={isLoading}
                  className="group w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin text-white/70" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Login to Dashboard</span>
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform opacity-90" />
                    </>
                  )}
                </motion.button>
              </motion.div>
            </form>

            <p className="text-center text-gray-400 text-xs mt-8 font-medium tracking-wide uppercase">
              Secure Admin Access Portal
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div >
  );
}