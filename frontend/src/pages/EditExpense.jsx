import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getExpense, updateExpense } from "../api/expenses";
import ExpenseForm from "../components/ExpenseForm";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

export default function EditExpense() {
  const { id } = useParams();
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getExpense(id)
      .then((r) => setExpense(r.data))
      .catch(() => { toast.error("Expense not found"); navigate("/expenses"); })
      .finally(() => setFetching(false));
  }, [id]);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      await updateExpense(id, data);
      toast.success("Changes saved");
      navigate("/expenses");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
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
    <div className="max-w-xl">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft size={14} /> Back
      </button>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Edit expense</h1>
        <p className="text-sm text-gray-400 mt-0.5">{expense?.title}</p>
      </div>
      <div className="card p-6">
        {expense && <ExpenseForm initialData={expense} onSubmit={handleSubmit} loading={loading} />}
      </div>
    </div>
  );
}
