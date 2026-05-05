import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Receipt,
  PlusCircle,
  BarChart3,
  LogOut,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/expenses", label: "Expenses", icon: Receipt },
  { to: "/add", label: "Add Expense", icon: PlusCircle },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
];

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.username?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="flex min-h-screen bg-[#F5F6FA]">
      {/* Mobile backdrop */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-10 bg-black/50 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-20 flex w-60 flex-col bg-white border-r border-gray-100 transition-transform lg:translate-x-0 ${
        menuOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        {/* Logo */}
        <div className="flex h-16 items-center gap-2.5 px-5 border-b border-gray-100">
          <img src="/logo.png" alt="VYBE Logo" className="h-8 w-8 object-contain" />
          <span className="text-sm font-bold text-gray-900 tracking-tight">VYBE</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname === to || (to !== "/dashboard" && pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors group ${
                  active
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon
                  size={16}
                  className={active ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"}
                />
                {label}
                {active && (
                  <ChevronRight size={14} className="ml-auto text-indigo-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t border-gray-100 p-3">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.username}
                className="h-8 w-8 rounded-full object-cover ring-2 ring-gray-100"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">
                {user?.full_name || user?.username}
              </p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => { setMenuOpen(false); logout(); navigate("/login"); }}
            className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Page */}
      <main className="flex-1 lg:ml-60 min-h-screen w-full">
        {/* Mobile header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between lg:hidden">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="VYBE Logo" className="h-8 w-8 object-contain" />
            <span className="text-sm font-bold text-gray-900">VYBE</span>
          </div>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div className="mx-auto max-w-5xl px-4 sm:px-8 py-4 sm:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
