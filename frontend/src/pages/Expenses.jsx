import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getExpenses, deleteExpense } from "../api/expenses";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { Plus, Search, SlidersHorizontal, Pencil, Trash2, X } from "lucide-react";

const CATEGORIES = ["food","transport","housing","entertainment","healthcare","shopping","education","utilities","travel","other"];
const CATEGORY_ICONS = {
  food:"🍔", transport:"🚗", housing:"🏠", entertainment:"🎬",
  healthcare:"🏥", shopping:"🛍️", education:"📚", utilities:"💡",
  travel:"✈️", other:"📦",
};
const CATEGORY_COLORS = {
  food:"bg-orange-50 text-orange-700 ring-orange-100",
  transport:"bg-sky-50 text-sky-700 ring-sky-100",
  housing:"bg-violet-50 text-violet-700 ring-violet-100",
  entertainment:"bg-pink-50 text-pink-700 ring-pink-100",
  healthcare:"bg-red-50 text-red-700 ring-red-100",
  shopping:"bg-amber-50 text-amber-700 ring-amber-100",
  education:"bg-emerald-50 text-emerald-700 ring-emerald-100",
  utilities:"bg-cyan-50 text-cyan-700 ring-cyan-100",
  travel:"bg-indigo-50 text-indigo-700 ring-indigo-100",
  other:"bg-gray-50 text-gray-600 ring-gray-100",
};

function fmt(n) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n ?? 0);
}

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", category: "", start_date: "", end_date: "" });
  const [showFilters, setShowFilters] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    getExpenses(params)
      .then((r) => setExpenses(r.data))
      .catch(() => toast.error("Failed to load expenses"))
      .finally(() => setLoading(false));
  }, [filters]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    setDeleting(id);
    try {
      await deleteExpense(id);
      setExpenses((p) => p.filter((e) => e.id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(null);
    }
  };

  const hasFilters = filters.category || filters.start_date || filters.end_date;
  const clear = () => setFilters({ search: "", category: "", start_date: "", end_date: "" });
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
        <h1 className="text-lg sm:text-xl font-bold text-gray-900">Expenses</h1>
        <Link to="/add" className="btn-primary w-full sm:w-auto justify-center">
          <Plus size={15} />
          Add expense
        </Link>
      </div>

      {/* Search + filter bar */}
      <div className="card p-4 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input pl-9 py-2"
              placeholder="Search by title..."
              value={filters.search}
              onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary gap-1.5 ${hasFilters ? "ring-2 ring-indigo-400 text-indigo-700" : ""}`}
          >
            <SlidersHorizontal size={14} />
            Filter
            {hasFilters && (
              <span className="ml-1 h-4 w-4 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center">
                {[filters.category, filters.start_date, filters.end_date].filter(Boolean).length}
              </span>
            )}
          </button>
          {hasFilters && (
            <button onClick={clear} className="btn-ghost text-xs gap-1">
              <X size={13} /> Clear
            </button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <label className="label">Category</label>
              <select
                className="input py-2 text-sm"
                value={filters.category}
                onChange={(e) => setFilters((p) => ({ ...p, category: e.target.value }))}
              >
                <option value="">All categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">From date</label>
              <input
                type="date"
                className="input py-2 text-sm"
                value={filters.start_date}
                onChange={(e) => setFilters((p) => ({ ...p, start_date: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">To date</label>
              <input
                type="date"
                className="input py-2 text-sm"
                value={filters.end_date}
                onChange={(e) => setFilters((p) => ({ ...p, end_date: e.target.value }))}
              />
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <svg className="animate-spin h-6 w-6 text-indigo-600" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
      ) : expenses.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-sm font-medium text-gray-600 mb-1">No expenses found</p>
          <p className="text-xs text-gray-400">{hasFilters ? "Try clearing your filters" : "Start adding expenses"}</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Title</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Category</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Date</th>
                <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Amount</th>
                <th className="px-5 py-3 w-20" />
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => (
                <tr
                  key={exp.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors last:border-0"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm flex-shrink-0">
                        {CATEGORY_ICONS[exp.category]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{exp.title}</p>
                        {exp.description && (
                          <p className="text-xs text-gray-400 truncate max-w-[200px]">{exp.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`badge ring-1 capitalize ${CATEGORY_COLORS[exp.category] || CATEGORY_COLORS.other}`}>
                      {exp.category}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">
                    {format(new Date(exp.date), "MMM d, yyyy")}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="text-sm font-semibold text-gray-900">{fmt(exp.amount)}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => navigate(`/expenses/${exp.id}/edit`)}
                        className="h-7 w-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(exp.id)}
                        disabled={deleting === exp.id}
                        className="h-7 w-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/30">
            <p className="text-xs text-gray-400">
              {expenses.length} transaction{expenses.length !== 1 ? "s" : ""}
            </p>
            <p className="text-xs font-semibold text-gray-900">
              Total: {fmt(total)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
