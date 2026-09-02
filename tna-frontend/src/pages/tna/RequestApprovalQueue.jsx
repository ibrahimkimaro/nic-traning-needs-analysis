import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, MessageSquare, Loader2, Search, Filter, ArrowLeft } from 'lucide-react';
import { api } from '../../auth/api';

const RequestApprovalQueue = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approvalAction, setApprovalAction] = useState({ action: '', comments: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await api.tna.getRequests();
      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    setIsSubmitting(true);
    try {
      await api.tna.approveRequest(selectedRequest.id, approvalAction);
      setSelectedRequest(null);
      setApprovalAction({ action: '', comments: '' });
      await fetchRequests();
    } catch (err) {
      alert('Approval failed: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = (req.title + (req.employee?.full_name || '')).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || req.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) return (
    <div className="h-full w-full flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#264033]" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Approval Queue</h1>
          <p className="text-slate-500 text-sm mt-1">Review and process pending training requests.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:w-72">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search requests or employees..."
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#264033] transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative w-full sm:w-64">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Filter className="w-4 h-4" />
          </span>
          <select
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#264033] transition-all appearance-none"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="PENDING_DEPT">Pending Dept</option>
            <option value="PENDING_BUDGET">Pending Budget</option>
            <option value="HR_REVIEW">HR Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/80 text-slate-500 text-[11px] uppercase tracking-widest font-bold">
                <tr>
                  <th className="px-6 py-4">Request</th>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Cost</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((req) => (
                    <tr key={req.id} className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${selectedRequest?.id === req.id ? 'bg-emerald-50/50' : ''}`} onClick={() => setSelectedRequest(req)}>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-900 truncate max-w-[200px]">{req.title}</p>
                        <p className="text-[10px] text-slate-400">{new Date(req.created_at).toLocaleDateString()}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {req.employee?.full_name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-700">
                        {req.estimated_cost?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md bg-slate-100 text-slate-600">
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-[#264033] text-xs font-bold hover:underline">Review</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                      No requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Review Panel</h3>
            {selectedRequest && (
              <button onClick={() => setSelectedRequest(null)} className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="p-6 flex-1">
            {!selectedRequest ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-slate-900 font-semibold">No Request Selected</p>
                  <p className="text-slate-500 text-sm">Select a training request from the list to review and take action.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Title</p>
                  <p className="text-lg font-bold text-slate-900">{selectedRequest.title}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Employee</p>
                  <p className="text-sm font-medium text-slate-700">{selectedRequest.employee?.full_name || 'Unknown'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Justification</p>
                  <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg italic">"{selectedRequest.reason}"</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Desired Outcome</p>
                  <p className="text-sm text-slate-600">{selectedRequest.desired_outcome || 'Not specified'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Estimated Cost</p>
                  <p className="text-lg font-bold text-[#264033]">{selectedRequest.estimated_cost?.toLocaleString()} TZS</p>
                </div>

                <div className="pt-6 border-t border-slate-100 space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Decision Comments</label>
                    <textarea
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-[#264033] outline-none transition-all"
                      rows="3"
                      placeholder="Provide feedback or reasons for your decision..."
                      value={approvalAction.comments}
                      onChange={(e) => setApprovalAction({ ...approvalAction, comments: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setApprovalAction({ action: 'REJECTED', comments: approvalAction.comments })}
                      className={`py-2 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${approvalAction.action === 'REJECTED' ? 'bg-red-600 text-white ring-2 ring-red-200' : 'bg-white text-red-600 border border-red-200 hover:bg-red-50'}`}
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                    <button
                      onClick={() => setApprovalAction({ action: 'APPROVED', comments: approvalAction.comments })}
                      className={`py-2 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${approvalAction.action === 'APPROVED' ? 'bg-emerald-600 text-white ring-2 ring-emerald-200' : 'bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50'}`}
                    >
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                  </div>

                  <button
                    onClick={handleApprove}
                    disabled={!approvalAction.action || isSubmitting}
                    className="w-full bg-[#264033] hover:bg-[#1a2d24] text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    Submit Decision
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestApprovalQueue;
