import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, Search, User, TrendingUp } from 'lucide-react';
import { api } from '../../auth/api';

const GapAnalysisView = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [gaps, setGaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await api.organizations.getEmployees();
        setEmployees(data);
      } catch (err) {
        setError('Failed to load employees');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const fetchAnalysis = async (empId) => {
    setAnalysisLoading(true);
    setError(null);
    try {
      const data = await api.tna.getGapAnalysis(empId);
      setGaps(data.gaps);
      setSelectedEmployee(employees.find(e => e.id === empId));
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalysisLoading(false);
    }
  };

  if (loading) return (
    <div className="h-full w-full flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#264033]" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Competency Gap Analysis</h1>
          <p className="text-slate-500 text-sm mt-1">Identify skill deficiencies compared to position requirements.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Select Employee</h3>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search employee..."
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#264033] transition-all"
                onChange={(e) => {
                  const term = e.target.value.toLowerCase();
                  const filtered = employees.filter(emp =>
                    (emp.full_name || `${emp.first_name} ${emp.last_name}`).toLowerCase().includes(term)
                  );
                  // This is a simple implementation, normally we'd have a separate list
                }}
              />
            </div>
            <div className="overflow-y-auto max-h-[60vh] space-y-1 pr-2">
              {employees.map(emp => (
                <button
                  key={emp.id}
                  onClick={() => fetchAnalysis(emp.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${selectedEmployee?.id === emp.id ? 'bg-emerald-50 text-emerald-700 font-semibold ring-1 ring-emerald-200' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <User className="w-3 h-3" />
                  {emp.full_name || `${emp.first_name} ${emp.last_name}`}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {!selectedEmployee ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-2xl border border-slate-200 border-dashed">
              <TrendingUp className="w-12 h-12 text-slate-300 mb-4" />
              <p className="text-slate-900 font-semibold">No Employee Selected</p>
              <p className="text-slate-500 text-sm max-w-xs">Select an employee from the sidebar to analyze their competency gaps against their position requirements.</p>
            </div>
          ) : analysisLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#264033]" />
            </div>
          ) : error ? (
            <div className="p-6 bg-red-50 text-red-700 rounded-2xl border border-red-200 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5" /> {error}
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedEmployee.full_name || `${selectedEmployee.first_name} ${selectedEmployee.last_name}`}</h2>
                  <p className="text-sm text-slate-500">Position: {selectedEmployee.position?.title || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Gaps</p>
                  <p className="text-2xl font-black text-[#264033]">{gaps.filter(g => g.gap > 0).length}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gaps.length > 0 ? gaps.map((gap, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:border-emerald-200 transition-colors">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 truncate">{gap.competency}</h4>
                      {gap.gap === 0 ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 uppercase">
                          <CheckCircle2 className="w-3 h-3" /> Met
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md bg-amber-100 text-amber-700 uppercase">
                          <AlertTriangle className="w-3 h-3" /> Gap: {gap.gap}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-500">Current Level</span>
                        <span className="text-slate-900">{gap.current}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${gap.gap === 0 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          style={{ width: `${(gap.current / gap.required) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-500">Required Level</span>
                        <span className="text-slate-900">{gap.required}</span>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Priority: {gap.priority}</span>
                      <button className="text-[#264033] text-xs font-bold hover:underline">Get Recommendations</button>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-2 text-center py-12 bg-white rounded-2xl border border-slate-200">
                    <p className="text-slate-500">No competency requirements defined for this position.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GapAnalysisView;
