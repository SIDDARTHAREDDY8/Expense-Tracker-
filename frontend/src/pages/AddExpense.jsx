import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createExpense } from "../api/expenses";
import ExpenseForm from "../components/ExpenseForm";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

export default function AddExpense() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      await createExpense(data);
      toast.success("Expense added");
      navigate("/expenses");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft size={14} /> Back
      </button>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Add expense</h1>
        <p className="text-sm text-gray-400 mt-0.5">Record a new transaction</p>
      </div>
      <div className="card p-6">
        <ExpenseForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
}
