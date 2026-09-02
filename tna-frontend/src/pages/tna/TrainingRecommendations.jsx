import React, { useState, useEffect } from 'react';
import { BookOpen, Loader2, Search, User, Sparkles } from 'lucide-react';
import { api } from '../../auth/api';

const TrainingRecommendations = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
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

  const fetchRecommendations = async (empId) => {
    setAnalysisLoading(true);
    setError(null);
    try {
      const data = await api.tna.getRecommendations(empId);
      setRecommendations(data.recommendations);
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
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Training Recommendations</h1>
          <p className="text-slate-500 text-sm mt-1">AI-driven program suggestions based on competency gaps.</p>
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
              />
            </div>
            <div className="overflow-y-auto max-h-[60vh] space-y-1 pr-2">
              {employees.map(emp => (
                <button
                  key={emp.id}
                  onClick={() => fetchRecommendations(emp.id)}
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
              <Sparkles className="w-12 h-12 text-slate-300 mb-4" />
              <p className="text-slate-900 font-semibold">No Employee Selected</p>
              <p className="text-slate-500 text-sm max-w-xs">Select an employee to see recommended training programs designed to bridge their skill gaps.</p>
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
                  <p className="text-sm text-slate-500">Recommended Programs to close gaps</p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                    {recommendations.length} Programs Found
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.length > 0 ? recommendations.map((rec, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:border-emerald-200 transition-colors group">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-100 transition-colors">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-slate-900">{rec.program}</h4>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Competency</p>
                        <p className="text-sm font-medium text-slate-700">{rec.competency}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Skill Gap</p>
                        <p className="text-sm font-medium text-slate-700">Level {rec.gap}</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        Provider: <span className="font-semibold text-slate-700">{rec.provider}</span>
                      </span>
                      <button className="bg-[#264033] text-white text-xs px-3 py-1.5 rounded-lg font-bold hover:bg-[#1a2d24] transition-all">
                        Recommend
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-2 text-center py-12 bg-white rounded-2xl border border-slate-200">
                    <p className="text-slate-500">No recommended programs found for current gaps.</p>
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

export default TrainingRecommendations;
