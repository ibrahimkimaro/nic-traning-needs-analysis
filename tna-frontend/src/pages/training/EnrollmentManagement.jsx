import React, { useState, useEffect } from 'react';
import { Search, Filter, UserPlus, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { api } from '../../auth/api';

const EnrollmentManagement = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [formData, setFormData] = useState({ employee: '', program: '' });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [enrols, emps, progs] = await Promise.all([
        api.training.getEnrollments(),
        api.organizations.getEmployees(),
        api.training.getPrograms()
      ]);
      setEnrollments(enrols);
      setEmployees(emps);
      setPrograms(progs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError(null);
    setModalSuccess(false);
    try {
      await api.training.createEnrollment(formData);
      setModalSuccess(true);
      await fetchInitialData();
      setTimeout(() => {
        setIsModalOpen(false);
        setFormData({ employee: '', program: '' });
        setModalSuccess(false);
      }, 1500);
    } catch (err) {
      setModalError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEnrollments = enrollments.filter(en =>
    (en.employee?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (en.program?.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="h-full w-full flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#264033]" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Training Enrollments</h1>
          <p className="text-slate-500 text-sm mt-1">Manage employee assignments to training programs.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#264033] hover:bg-[#1a2d24] text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
        >
          <UserPlus className="w-4 h-4" /> Enroll Employee
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:w-72">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search by employee or program..."
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
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Program</th>
                <th className="px-6 py-4">Enrollment Date</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEnrollments.length > 0 ? (
                filteredEnrollments.map((en) => (
                  <tr key={en.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${en.employee?.id}`} className="w-8 h-8 rounded-full bg-slate-100 ring-2 ring-white shadow-sm" alt="" />
                        <p className="text-sm font-semibold text-slate-900">{en.employee?.full_name || 'Unknown'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {en.program?.title || 'Unknown Program'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(en.enrollment_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md ${en.completion_status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                          en.completion_status === 'FAILED' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                        }`}>
                        {en.completion_status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                    No enrollments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enrollment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-8 duration-300 ease-out">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#264033] text-white rounded-lg">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Enroll Employee</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEnroll} className="p-6 space-y-4">
              {modalSuccess && (
                <div className="flex items-center gap-3 p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-top-2">
                  <CheckCircle2 className="w-4 h-4" /> Enrolled successfully!
                </div>
              )}
              {modalError && (
                <div className="flex items-center gap-3 p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="w-4 h-4" /> {modalError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Employee</label>
                <select
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-[#264033] outline-none"
                  value={formData.employee}
                  onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
                  required
                >
                  <option value="">Choose Employee...</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.full_name || `${emp.first_name} ${emp.last_name}`}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Program</label>
                <select
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-[#264033] outline-none"
                  value={formData.program}
                  onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                  required
                >
                  <option value="">Choose Program...</option>
                  {programs.map(prog => (
                    <option key={prog.id} value={prog.id}>{prog.title}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#264033] hover:bg-[#1a2d24] rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Enrolling...' : 'Confirm Enrollment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrollmentManagement;
