import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Receipt,
  PlusCircle,
  BarChart3,
  LogOut,
  ChevronRight,
} from "lucide-react";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/expenses", label: "Expenses", icon: Receipt },
  { to: "/add", label: "Add Expense", icon: PlusCircle },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.username?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="flex min-h-screen bg-[#F5F6FA]">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 flex w-60 flex-col bg-white border-r border-gray-100">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2.5 px-5 border-b border-gray-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-white" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125H18M15 10.5h1.875a1.875 1.875 0 000-3.75H15m0 3.75v-3.75m0 3.75h-1.875a1.875 1.875 0 010-3.75H15" />
            </svg>
          </div>
          <span className="text-sm font-bold text-gray-900 tracking-tight">ExpenseTrack</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname === to || (to !== "/dashboard" && pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
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
            onClick={() => { logout(); navigate("/login"); }}
            className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Page */}
      <main className="flex-1 ml-60 min-h-screen">
        <div className="mx-auto max-w-5xl px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
