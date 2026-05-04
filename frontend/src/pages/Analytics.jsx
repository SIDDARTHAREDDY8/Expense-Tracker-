import { useEffect, useState } from "react";
import { getSummary } from "../api/expenses";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

const PALETTE = [
  "#6366f1","#f59e0b","#10b981","#f97316",
  "#06b6d4","#ec4899","#8b5cf6","#84cc16","#ef4444","#64748b",
];

const CATEGORY_ICONS = {
  food:"🍔", transport:"🚗", housing:"🏠", entertainment:"🎬",
  healthcare:"🏥", shopping:"🛍️", education:"📚", utilities:"💡",
  travel:"✈️", other:"📦",
};

function fmt(n) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n ?? 0);
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-900">{payload[0]?.name || payload[0]?.payload?.month}</p>
      <p className="text-gray-600 mt-0.5">{fmt(payload[0]?.value)}</p>
    </div>
  );
}

function CustomLegend({ data }) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4">
      {data.map((d, i) => (
        <div key={d.category} className="flex items-center gap-2 text-xs">
          <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PALETTE[i % PALETTE.length] }} />
          <span className="text-gray-600 capitalize truncate">{CATEGORY_ICONS[d.category]} {d.category}</span>
          <span className="ml-auto font-semibold text-gray-900">{d.percentage}%</span>
        </div>
      ))}
    </div>
  );
}

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSummary().then((r) => setSummary(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

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

  if (!summary || summary.total_count === 0) {
    return (
      <div className="card p-16 text-center">
        <div className="text-4xl mb-3">📊</div>
        <h2 className="text-base font-semibold text-gray-900 mb-1">No data yet</h2>
        <p className="text-sm text-gray-400">Add some expenses to see your analytics</p>
      </div>
    );
  }

  const pieData = summary.by_category.map((c, i) => ({
    name: `${CATEGORY_ICONS[c.category]} ${c.category}`,
    value: c.total,
    category: c.category,
    percentage: c.percentage,
    fill: PALETTE[i % PALETTE.length],
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Analytics</h1>

      {/* Monthly trend */}
      {summary.monthly_trend.length > 0 && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-5">Monthly spending</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={summary.monthly_trend} barSize={32} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f5f6fa" }} />
              <Bar dataKey="total" name="Total" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Donut chart — NO labels on slices, legend below */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">By category</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v, n) => [fmt(v), n]}
                contentStyle={{ borderRadius: 8, border: "1px solid #f3f4f6", fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <CustomLegend data={summary.by_category} />
        </div>

        {/* Breakdown table */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Detailed breakdown</h2>
          <div className="space-y-1">
            <div className="grid grid-cols-3 text-xs font-semibold uppercase tracking-wide text-gray-400 pb-2 border-b border-gray-100">
              <span>Category</span>
              <span className="text-center">Txns</span>
              <span className="text-right">Total</span>
            </div>
            {summary.by_category.map((cat, i) => (
              <div key={cat.category} className="grid grid-cols-3 items-center py-2.5 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: PALETTE[i % PALETTE.length] }} />
                  <span className="text-sm text-gray-700 capitalize">
                    {CATEGORY_ICONS[cat.category]} {cat.category}
                  </span>
                </div>
                <span className="text-sm text-gray-500 text-center">{cat.count}</span>
                <div className="text-right">
                  <span className="text-sm font-semibold text-gray-900">{fmt(cat.total)}</span>
                  <span className="text-xs text-gray-400 ml-1.5">{cat.percentage}%</span>
                </div>
              </div>
            ))}
            <div className="grid grid-cols-3 pt-2.5 items-center">
              <span className="text-sm font-bold text-gray-900">Total</span>
              <span className="text-sm font-bold text-gray-900 text-center">{summary.total_count}</span>
              <span className="text-sm font-bold text-gray-900 text-right">{fmt(summary.total_expenses)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
