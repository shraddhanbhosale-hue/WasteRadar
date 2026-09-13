import { useEffect, useRef, useState } from "react";
import {
  ShieldCheck,
  MapPin,
  Recycle,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);
  const googleInitializedRef = useRef(false);

  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const redirectUser = (user) => {
    if (!user) {
      console.error("Redirect failed: User object is null or undefined");
      navigate("/");
      return;
    }

    const userRole = user?.role ? String(user.role).toUpperCase() : "CITIZEN";

    if (userRole === "ADMIN") {
      navigate("/admin");
    } else if (userRole === "DRIVER") {
      navigate("/driver");
    } else {
      navigate("/citizen");
    }
  };

  const handleGoogleLogin = async (response) => {
    try {
      setError("");
      setGoogleLoading(true);

      const result = await api.post("/auth/google", {
        credential: response.credential,
      });

      const token = result.data?.token;
      const user = result.data?.user;

      if (!token || !user) {
        throw new Error("Invalid response received from authentication server.");
      }

      login(token, user);
      redirectUser(user);
    } catch (error) {
      console.error("Google login error:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Google login failed. Please try again."
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    let interval;

    const initializeGoogle = () => {
      if (
        googleInitializedRef.current ||
        !window.google ||
        !googleButtonRef.current
      ) {
        return;
      }

      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

      if (!clientId) {
        console.error("VITE_GOOGLE_CLIENT_ID is missing");
        setError("Google Client ID is not configured.");
        return;
      }

      googleInitializedRef.current = true;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleLogin,
      });

      googleButtonRef.current.innerHTML = "";

      // Mobile screen sathi google button dynamic width
      const btnWidth = window.innerWidth < 400 ? 280 : 350;

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        width: btnWidth,
        text: "continue_with",
        shape: "rectangular",
        logo_alignment: "left",
      });
    };

    if (window.google) {
      initializeGoogle();
    } else {
      interval = setInterval(() => {
        if (window.google) {
          clearInterval(interval);
          initializeGoogle();
        }
      }, 100);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error("Invalid response from server");
      }

      login(token, user);
      redirectUser(user);
    } catch (error) {
      console.error("Login error:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* =========================
          LEFT SECTION (Laptop View Same Rahnar)
      ========================== */}
      <div className="hidden lg:flex lg:w-1/2 bg-green-700 relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-green-800 via-green-700 to-emerald-600" />
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-white/10 rounded-full" />
        <div className="absolute -bottom-32 -right-20 w-96 h-96 bg-white/10 rounded-full" />

        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
              <Recycle size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">WasteRadar</h1>
              <p className="text-green-100 text-sm">Smart Waste Management</p>
            </div>
          </div>

          <h2 className="text-5xl xl:text-6xl font-bold leading-tight max-w-xl">
            Spot Waste.
            <br />
            Report It.
            <br />
            <span className="text-green-200">Get It Cleaned.</span>
          </h2>

          <p className="mt-6 text-lg text-green-100 max-w-lg leading-relaxed">
            Help make your village cleaner with AI-powered waste detection,
            real-time reporting and smart collection management.
          </p>

          <div className="mt-10 space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <MapPin size={20} />
              </div>
              <div>
                <p className="font-semibold">Location-based Reporting</p>
                <p className="text-sm text-green-100">
                  Report waste exactly where it is found.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="font-semibold">AI-Powered Verification</p>
                <p className="text-sm text-green-100">
                  Automatically analyze uploaded waste images.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================
          RIGHT SECTION (Mobile Optimized Padding)
      ========================== */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 py-6 sm:py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-6 sm:mb-10">
            <div className="w-11 h-11 rounded-xl bg-green-700 text-white flex items-center justify-center">
              <Recycle size={25} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">WasteRadar</h1>
          </div>

          <div className="mb-6 sm:mb-8 text-center sm:text-left">
            <p className="text-xs sm:text-sm font-semibold text-green-700 mb-1 sm:mb-2">
              WELCOME BACK
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Sign in to WasteRadar
            </h2>
            <p className="mt-1 sm:mt-2 text-sm text-slate-500">
              Access your waste management dashboard.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-5 sm:p-8">
            {error && (
              <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="mb-6">
              <div
                ref={googleButtonRef}
                className="flex justify-center min-h-[44px]"
              />

              {googleLoading && (
                <div className="mt-3 flex items-center justify-center gap-2 text-sm text-slate-500">
                  <Loader2 size={16} className="animate-spin" />
                  Signing in with Google...
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="h-px bg-slate-200 flex-1" />
              <span className="text-xs font-medium text-slate-400 uppercase">
                Or continue with email
              </span>
              <div className="h-px bg-slate-200 flex-1" />
            </div>

            <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-sm font-medium text-green-700 hover:text-green-800"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 accent-green-600"
                />
                <label htmlFor="remember" className="text-sm text-slate-600">
                  Remember me
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-green-700 hover:bg-green-800 disabled:bg-green-400 text-white font-semibold transition shadow-lg shadow-green-700/20"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="mt-7 pt-6 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-500">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/create-account")}
                  className="font-semibold text-green-700 hover:text-green-800"
                >
                  Create account
                </button>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6 sm:mt-8">
            © 2026 WasteRadar · Smart Community Waste Management
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;