import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { login as loginApi } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const BASE = import.meta.env.VITE_API_URL?.replace("/api/v1", "") || "http://localhost:8000";
const GITHUB_OAUTH_URL = `${BASE}/api/v1/auth/github`;
const GOOGLE_OAUTH_URL = `${BASE}/api/v1/auth/google`;

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    const err = params.get("error");
    if (err === "oauth_not_configured") toast.error("OAuth provider is not configured.");
    if (err === "oauth_failed") toast.error("Sign in failed. Please try again.");
    if (err === "no_email") toast.error("Could not retrieve your email. Check provider permissions.");
  }, []);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginApi(form);
      login(res.data.access_token, res.data.user);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 400 400" className="w-full h-full">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="400" height="400" fill="url(#grid)" />
          </svg>
        </div>
        <div className="relative">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="VYBE Logo" className="h-8 w-8 object-contain rounded-lg bg-white/20 p-1" />
            <span className="text-white font-bold text-sm">VYBE</span>
          </div>
        </div>
        <div className="relative space-y-4">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Take control of your finances
          </h1>
          <p className="text-indigo-200 text-base leading-relaxed">
            Track every dollar, understand your spending patterns, and make smarter financial decisions.
          </p>
          <div className="flex items-center gap-6 pt-4">
            {["20 categories", "Real-time analytics", "Secure & private"].map((f) => (
              <div key={f} className="flex items-center gap-1.5 text-indigo-200 text-sm">
                <svg className="h-4 w-4 text-indigo-300" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
                {f}
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-indigo-300 text-xs">© 2026 VYBE. All rights reserved.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-8 sm:py-12 bg-gray-50 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Sign in to your account to continue</p>
          </div>

          {/* OAuth buttons */}
          <div className="space-y-2.5 mb-6">
            <a
              href={GOOGLE_OAUTH_URL}
              className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </a>
            <a
              href={GITHUB_OAUTH_URL}
              className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-gray-800">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              Continue with GitHub
            </a>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-gray-50 px-3 text-gray-400 font-medium">or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                className="input"
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                value={form.password}
                onChange={set("password")}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full py-2.5 mt-2" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing in...
                </span>
              ) : "Sign in"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-indigo-600 font-semibold hover:text-indigo-700">
              Create one
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
