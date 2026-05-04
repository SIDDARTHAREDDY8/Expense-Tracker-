import { useState } from "react";
import { format } from "date-fns";

const CATEGORIES = [
  { value: "food",          label: "Food & Dining",  emoji: "🍔" },
  { value: "transport",     label: "Transport",       emoji: "🚗" },
  { value: "housing",       label: "Housing",         emoji: "🏠" },
  { value: "entertainment", label: "Entertainment",   emoji: "🎬" },
  { value: "healthcare",    label: "Healthcare",      emoji: "🏥" },
  { value: "shopping",      label: "Shopping",        emoji: "🛍️" },
  { value: "education",     label: "Education",       emoji: "📚" },
  { value: "utilities",     label: "Utilities",       emoji: "💡" },
  { value: "travel",        label: "Travel",          emoji: "✈️" },
  { value: "other",         label: "Other",           emoji: "📦" },
];

export default function ExpenseForm({ initialData, onSubmit, loading }) {
  const [form, setForm] = useState({
    title:       initialData?.title || "",
    amount:      initialData?.amount || "",
    description: initialData?.description || "",
    category:    initialData?.category || "food",
    date:        initialData?.date
      ? format(new Date(initialData.date), "yyyy-MM-dd'T'HH:mm")
      : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  });

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      amount: parseFloat(form.amount),
      date: new Date(form.date).toISOString(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="label">Title</label>
        <input
          className="input"
          value={form.title}
          onChange={set("title")}
          placeholder="e.g., Grocery run, Netflix subscription"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Amount (USD)</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
            <input
              className="input pl-7"
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={set("amount")}
              placeholder="0.00"
              required
            />
          </div>
        </div>
        <div>
          <label className="label">Category</label>
          <select className="input" value={form.category} onChange={set("category")} required>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Date & time</label>
        <input
          className="input"
          type="datetime-local"
          value={form.date}
          onChange={set("date")}
          required
        />
      </div>

      <div>
        <label className="label">Notes <span className="normal-case text-gray-400 font-normal">(optional)</span></label>
        <textarea
          className="input resize-none"
          rows={3}
          value={form.description}
          onChange={set("description")}
          placeholder="Add any details about this expense..."
        />
      </div>

      <button type="submit" className="btn-primary w-full py-2.5" disabled={loading}>
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Saving...
          </span>
        ) : initialData ? "Save changes" : "Add expense"}
      </button>
    </form>
  );
}
