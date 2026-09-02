import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, PieChart, Loader2, Search } from 'lucide-react';
import { api } from '../auth/api';

const BudgetOversight = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const data = await api.budget.getBudgets();
      setBudgets(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredBudgets = budgets.filter(b =>
    (b.dept?.dept_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="h-full w-full flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#264033]" />
    </div>
  );

  if (error) return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-red-200 shadow-xl text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Error loading budget</h2>
        <p className="text-slate-500 mb-6">{error}</p>
        <button onClick={fetchBudgets} className="w-full bg-[#264033] text-white py-2 rounded-lg font-medium hover:bg-[#1a2d24] transition-colors">
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Budget Oversight</h1>
          <p className="text-slate-500 text-sm mt-1">Monitor training expenditure across organizational departments.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Allocated</p>
          <p className="text-2xl font-black text-slate-900">
            TZS {budgets.reduce((acc, b) => acc + Number(b.total_amount), 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Spent</p>
          <p className="text-2xl font-black text-red-600">
            TZS {budgets.reduce((acc, b) => acc + Number(b.spent_amount), 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Remaining Balance</p>
          <p className="text-2xl font-black text-emerald-600">
            TZS { (budgets.reduce((acc, b) => acc + Number(b.total_amount), 0) - budgets.reduce((acc, b) => acc + Number(b.spent_amount), 0)).toLocaleString() }
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center">
        <div className="relative w-full max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search departments..."
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#264033] transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 text-slate-500 text-[11px] uppercase tracking-widest font-bold">
              <tr>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Fiscal Year</th>
                <th className="px-6 py-4">Total Budget</th>
                <th className="px-6 py-4">Spent</th>
                <th className="px-6 py-4">Remaining</th>
                <th className="px-6 py-4">Utilization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBudgets.length > 0 ? (
                filteredBudgets.map((b) => {
                  const remaining = Number(b.total_amount) - Number(b.spent_amount);
                  const utilization = (Number(b.spent_amount) / Number(b.total_amount)) * 100;
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">{b.dept?.dept_name || 'Unknown'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{b.fiscal_year}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-700">TZS {Number(b.total_amount).toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm font-medium text-red-600">TZS {Number(b.spent_amount).toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm font-medium text-emerald-600">TZS {remaining.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden max-w-[100px]">
                            <div
                              className={`h-full transition-all duration-500 ${utilization > 90 ? 'bg-red-500' : utilization > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${Math.min(100, utilization)}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-600">{utilization.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    No budget records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BudgetOversight;
