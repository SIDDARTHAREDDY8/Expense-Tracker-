import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMe } from "../api/auth";
import toast from "react-hot-toast";

export default function OAuthCallback() {
  const [params] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get("token");
    if (!token) { navigate("/login?error=oauth_failed"); return; }

    localStorage.setItem("token", token);
    getMe()
      .then((res) => {
        login(token, res.data);
        toast.success(`Welcome, ${res.data.full_name || res.data.username}!`);
        navigate("/dashboard");
      })
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login?error=oauth_failed");
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-3">
        <svg className="animate-spin h-8 w-8 text-indigo-600 mx-auto" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <p className="text-sm font-medium text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}
