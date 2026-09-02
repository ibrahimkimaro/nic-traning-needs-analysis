import React, { useState, useEffect } from 'react';
import { Send, FileText, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { api } from '../../auth/api';

const TrainingRequestForm = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    reason: '',
    desired_outcome: '',
    estimated_cost: '',
  });
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const emps = await api.organizations.getEmployees();
        setEmployees(emps);
      } catch (err) {
        setError('Failed to load employees');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.tna.createRequest(formData);
      setSuccess(true);
      setFormData({ title: '', reason: '', desired_outcome: '', estimated_cost: '' });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="h-full w-full flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#264033]" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Submit Training Request</h1>
        <p className="text-slate-500">Request professional development or specialized certification training.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#264033] text-white rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Request Details</h3>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {success && (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="w-5 h-5" /> Your training request has been submitted successfully!
            </div>
          )}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5" /> {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Training Title / Course Name</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-[#264033] outline-none transition-all"
              placeholder="e.g. Advanced Project Management Certification"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Justification / Reason</label>
            <textarea
              rows="4"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-[#264033] outline-none transition-all"
              placeholder="Explain why this training is necessary for your role or the organization..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Desired Outcome / Goal</label>
            <textarea
              rows="3"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-[#264033] outline-none transition-all"
              placeholder="What specific skills or certifications will be acquired?"
              value={formData.desired_outcome}
              onChange={(e) => setFormData({ ...formData, desired_outcome: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimated Cost (TZS)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm">TZS</span>
              <input
                type="number"
                className="w-full pl-12 pr-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-[#264033] outline-none transition-all"
                placeholder="0.00"
                value={formData.estimated_cost}
                onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#264033] hover:bg-[#1a2d24] text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 active:scale-[0.98]"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              {submitting ? 'Submitting Request...' : 'Submit Training Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrainingRequestForm;
