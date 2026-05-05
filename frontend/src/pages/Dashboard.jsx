import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSummary, getExpenses } from "../api/expenses";
import { useAuth } from "../context/AuthContext";
import { TrendingUp, TrendingDown, DollarSign, Calendar, Plus, ArrowUpRight } from "lucide-react";
import { format } from "date-fns";

const CATEGORY_META = {
  food:          { color: "bg-orange-100 text-orange-700", dot: "bg-orange-400" },
  transport:     { color: "bg-sky-100 text-sky-700",       dot: "bg-sky-400" },
  housing:       { color: "bg-violet-100 text-violet-700", dot: "bg-violet-400" },
  entertainment: { color: "bg-pink-100 text-pink-700",     dot: "bg-pink-400" },
  healthcare:    { color: "bg-red-100 text-red-700",       dot: "bg-red-400" },
  shopping:      { color: "bg-amber-100 text-amber-700",   dot: "bg-amber-400" },
  education:     { color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-400" },
  utilities:     { color: "bg-cyan-100 text-cyan-700",     dot: "bg-cyan-400" },
  travel:        { color: "bg-indigo-100 text-indigo-700", dot: "bg-indigo-400" },
  other:         { color: "bg-gray-100 text-gray-600",     dot: "bg-gray-400" },
};

const CATEGORY_ICONS = {
  food:"🍔", transport:"🚗", housing:"🏠", entertainment:"🎬",
  healthcare:"🏥", shopping:"🛍️", education:"📚", utilities:"💡",
  travel:"✈️", other:"📦",
};

function fmt(n) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n ?? 0);
}

function StatCard({ label, value, trend, trendLabel, icon: Icon, iconBg }) {
  const up = trend > 0;
  return (
    <div className="stat-card flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</span>
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon size={15} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {trendLabel && (
          <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${up ? "text-red-500" : "text-emerald-500"}`}>
            {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trendLabel}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSummary(), getExpenses({ limit: 6 })])
      .then(([s, e]) => { setSummary(s.data); setRecent(e.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const monthPct = summary?.last_month > 0
    ? (((summary.this_month - summary.last_month) / summary.last_month) * 100).toFixed(1)
    : null;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <svg className="animate-spin h-6 w-6 text-indigo-600" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-0">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"},{" "}
            {user?.full_name?.split(" ")[0] || user?.username}
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
        </div>
        <Link to="/add" className="btn-primary w-full sm:w-auto justify-center">
          <Plus size={15} />
          Add expense
        </Link>
      </div>

      {/* Stat cards — 3 cards, removed "top category" */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Total spent"
          value={fmt(summary?.total_expenses)}
          icon={DollarSign}
          iconBg="bg-indigo-50 text-indigo-600"
          trendLabel={`${summary?.total_count ?? 0} transactions`}
          trend={0}
        />
        <StatCard
          label="This month"
          value={fmt(summary?.this_month)}
          icon={Calendar}
          iconBg={monthPct && parseFloat(monthPct) > 0 ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600"}
          trendLabel={monthPct !== null ? `${parseFloat(monthPct) > 0 ? "+" : ""}${monthPct}% vs last month` : "No prior data"}
          trend={monthPct ? parseFloat(monthPct) : 0}
        />
        <StatCard
          label="Last month"
          value={fmt(summary?.last_month)}
          icon={TrendingDown}
          iconBg="bg-gray-100 text-gray-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Category breakdown */}
        <div className="card lg:col-span-3 p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-gray-900">Spending by category</h2>
            <Link to="/analytics" className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700">
              View analytics <ArrowUpRight size={12} />
            </Link>
          </div>
          {(summary?.by_category?.length ?? 0) === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No data yet</p>
          ) : (
            <div className="space-y-3">
              {summary.by_category.slice(0, 6).map((cat) => {
                const meta = CATEGORY_META[cat.category] || CATEGORY_META.other;
                return (
                  <div key={cat.category} className="flex items-center gap-3">
                    <div className={`h-1.5 w-1.5 rounded-full ${meta.dot} flex-shrink-0`} />
                    <span className="text-sm text-gray-700 w-28 capitalize flex-shrink-0">
                      {CATEGORY_ICONS[cat.category]} {cat.category}
                    </span>
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-500 transition-all duration-700"
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 text-right w-20 flex-shrink-0">
                      {fmt(cat.total)}
                    </span>
                    <span className="text-xs text-gray-400 w-9 text-right flex-shrink-0">{cat.percentage}%</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent transactions */}
        <div className="card lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-gray-900">Recent</h2>
            <Link to="/expenses" className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700">
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-400">No transactions yet</p>
              <Link to="/add" className="mt-3 text-xs text-indigo-600 font-medium hover:underline block">
                Add your first expense
              </Link>
            </div>
          ) : (
            <div className="space-y-1">
              {recent.map((exp) => {
                const meta = CATEGORY_META[exp.category] || CATEGORY_META.other;
                return (
                  <div key={exp.id} className="flex items-center gap-3 py-2 rounded-lg hover:bg-gray-50 -mx-2 px-2 transition-colors">
                    <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center text-base flex-shrink-0">
                      {CATEGORY_ICONS[exp.category]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{exp.title}</p>
                      <p className="text-xs text-gray-400">{format(new Date(exp.date), "MMM d")}</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 flex-shrink-0">
                      {fmt(exp.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Empty state */}
      {summary?.total_count === 0 && (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-3">💸</div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">No expenses yet</h3>
          <p className="text-sm text-gray-400 mb-4">Add your first expense to start tracking</p>
          <Link to="/add" className="btn-primary mx-auto">
            <Plus size={14} /> Add expense
          </Link>
        </div>
      )}
    </div>
  );
}
