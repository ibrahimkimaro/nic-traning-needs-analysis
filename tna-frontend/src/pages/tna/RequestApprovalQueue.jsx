import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  CheckCircle, XCircle, ChevronDown,
  FileText, X, Send, ExternalLink, Paperclip,
  Loader2, Search, Filter, Award, AlertTriangle, CheckSquare, Square,
  Layers, Users, ShieldCheck, Calendar, MapPin, Building, RefreshCw,
  BarChart3, Clock, CheckCircle2, ArrowRight, Trash2
} from 'lucide-react';
import { api } from '../../auth/api';

const getFileUrl = (filePath) => {
  if (!filePath) return '#';
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  const backendHost = window.location.hostname;
  return `http://${backendHost}:8081${filePath.startsWith('/') ? '' : '/'}${filePath}`;
};

const RequestApprovalQueue = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [activeTab, setActiveTab] = useState('individual'); // 'individual' | 'macro-anonymized'
  const [macroNeeds, setMacroNeeds] = useState(null);
  const [loadingMacro, setLoadingMacro] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem('user');
    if (!stored || stored === 'undefined' || stored === 'null') return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  });

  const userRoles = Array.isArray(currentUser?.roles)
    ? currentUser.roles.map(r => (typeof r === 'object' ? r?.role_name || r?.name : r))
    : (typeof currentUser?.roles === 'string' ? [currentUser.roles] : []);

  const isAdmin = Boolean(
    currentUser?.is_superuser ||
    currentUser?.is_staff ||
    userRoles.includes('ADMIN') ||
    currentUser?.role === 'ADMIN' ||
    currentUser?.role_name === 'ADMIN'
  );

  const isHRO = Boolean(
    userRoles.includes('HRO') ||
    currentUser?.role === 'HRO' ||
    currentUser?.role_name === 'HRO'
  );

  const isHRManager = Boolean(
    userRoles.includes('HR_MANAGER') ||
    userRoles.includes('HR') ||
    currentUser?.role === 'HR_MANAGER' ||
    currentUser?.role_name === 'HR_MANAGER'
  );

  const isDeptHead = Boolean(
    userRoles.includes('DEPT_HEAD') ||
    currentUser?.role === 'DEPT_HEAD' ||
    currentUser?.role_name === 'DEPT_HEAD'
  );

  // Approval Modal States
  const [approvalAction, setApprovalAction] = useState({ action: 'APPROVED', comments: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Per-item selection and nomination state for modal review
  const [itemStates, setItemStates] = useState({});

  // HRO Administrative Verification & Anonymization fields
  const [hroVerification, setHroVerification] = useState({
    eligibility_verified: true,
    budget_line_item: 'NIC-TRN-2026-01',
    is_anonymized: true,
    anonymized_reference: ''
  });

  // Logistics Fulfillment fields
  const [logistics, setLogistics] = useState({
    logistics_vendor: '',
    logistics_venue: '',
    logistics_dates: '',
    calendar_invites_sent: false
  });

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await api.tna.getRequests();
      setRequests(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMacroNeeds = async () => {
    setLoadingMacro(true);
    try {
      const data = await api.tna.macro.getAnonymizedMacroNeeds();
      setMacroNeeds(data);
    } catch (err) {
      console.error('Error fetching anonymized macro needs:', err);
    } finally {
      setLoadingMacro(false);
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (!window.confirm("Are you sure you want to permanently delete this training request and all its associated items? This action cannot be undone.")) {
      return;
    }
    try {
      await api.tna.deleteRequest(requestId);
      if (selectedRequest?.id === requestId) {
        setSelectedRequest(null);
      }
      await fetchRequests();
      if (activeTab === 'macro-anonymized') {
        await fetchMacroNeeds();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete training request.');
    }
  };

  useEffect(() => {
    api.auth.me().then(setCurrentUser).catch(() => null);
    fetchRequests();
  }, []);

  useEffect(() => {
    if (activeTab === 'macro-anonymized') {
      fetchMacroNeeds();
    }
  }, [activeTab]);

  // When a request is opened, initialize item states and role-specific fields
  useEffect(() => {
    if (selectedRequest && selectedRequest.items) {
      const initial = {};
      selectedRequest.items.forEach((item) => {
        initial[item.id] = {
          is_selected: item.is_selected ?? true,
          planned_year: item.planned_year || new Date().getFullYear(),
          planned_month: item.planned_month || (new Date().getMonth() + 2),
          training_place: item.training_place || 'NIC Training Center',
          estimated_cost: item.estimated_cost || 450000
        };
      });
      setItemStates(initial);

      // Initialize HRO Verification fields
      setHroVerification({
        eligibility_verified: selectedRequest.eligibility_verified ?? true,
        budget_line_item: selectedRequest.budget_line_item || 'NIC-TRN-2026-01',
        is_anonymized: selectedRequest.is_anonymized ?? true,
        anonymized_reference: selectedRequest.anonymized_reference || `ANON-${selectedRequest.id?.slice(0, 6)?.toUpperCase() || 'REQ'}`
      });

      // Initialize Logistics fields
      setLogistics({
        logistics_vendor: selectedRequest.logistics_vendor || 'Institute of Risk & Insurance Management',
        logistics_venue: selectedRequest.logistics_venue || selectedRequest.training_place || 'Dar es Salaam Executive Hall',
        logistics_dates: selectedRequest.logistics_dates || 'Q3 2026 (15 - 19 Oct)',
        calendar_invites_sent: selectedRequest.calendar_invites_sent ?? false
      });

      // Tailor default action to current stage in the state machine
      const current = selectedRequest.status;
      if (current === 'SUBMITTED' || current === 'PENDING_DEPT') {
        setApprovalAction({ action: 'HOD_APPROVE', comments: 'Endorsed for departmental task alignment. Forwarding to HRO.' });
      } else if (current === 'HOD_APPROVED' || current === 'DEPARTMENT_APPROVED') {
        setApprovalAction({ action: 'HRO_PROCESS', comments: 'Eligibility verified, budget item validated, data anonymized for executive sign-off.' });
      } else if (current === 'HRO_PROCESSED') {
        setApprovalAction({ action: 'STRATEGIC_APPROVE', comments: 'Macro organizational alignment and budget validated. Strategic approval granted.' });
      } else if (current === 'STRATEGIC_APPROVED') {
        setApprovalAction({ action: 'FULFILL_LOGISTICS', comments: 'Vendors confirmed, venue reserved, calendar invitations issued.' });
      } else if (current === 'FULFILLMENT_ACTIVE') {
        setApprovalAction({ action: 'COMPLETE', comments: 'Training delivery and employee attendance confirmed.' });
      } else {
        setApprovalAction({ action: 'APPROVED', comments: '' });
      }
    }
  }, [selectedRequest]);

  const handleToggleSelect = (itemId) => {
    setItemStates((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        is_selected: !prev[itemId]?.is_selected
      }
    }));
  };

  const handleItemFieldChange = (itemId, field, value) => {
    setItemStates((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }));
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    setIsSubmitting(true);
    try {
      const selectedItemIds = Object.keys(itemStates).filter(
        (id) => itemStates[id]?.is_selected
      );

      const itemNominations = Object.keys(itemStates).map((id) => ({
        item_id: id,
        is_selected: !!itemStates[id]?.is_selected,
        planned_year: itemStates[id]?.planned_year ? parseInt(itemStates[id].planned_year, 10) : null,
        planned_month: itemStates[id]?.planned_month ? parseInt(itemStates[id].planned_month, 10) : null,
        training_place: itemStates[id]?.training_place || null,
        estimated_cost: itemStates[id]?.estimated_cost ? parseFloat(itemStates[id].estimated_cost) : null,
      }));

      await api.tna.approveRequest(selectedRequest.id, {
        action: approvalAction.action,
        comments: approvalAction.comments,
        selected_item_ids: selectedItemIds,
        item_nominations: itemNominations,
        eligibility_verified: hroVerification.eligibility_verified,
        budget_line_item: hroVerification.budget_line_item,
        is_anonymized: hroVerification.is_anonymized,
        anonymized_reference: hroVerification.anonymized_reference,
        logistics_vendor: logistics.logistics_vendor,
        logistics_venue: logistics.logistics_venue,
        logistics_dates: logistics.logistics_dates,
        calendar_invites_sent: logistics.calendar_invites_sent
      });

      setSelectedRequest(null);
      await fetchRequests();
      if (activeTab === 'macro-anonymized') {
        await fetchMacroNeeds();
      }
    } catch (err) {
      alert('Action failed: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRequests = requests.filter((req) => {
    const titleMatch = (req.title || '').toLowerCase();
    const empMatch = (req.employee_name || '').toLowerCase();
    const anonMatch = (req.anonymized_reference || '').toLowerCase();
    const itemsMatch = (req.items || []).map((i) => i.title.toLowerCase()).join(' ');
    const term = searchTerm.toLowerCase();

    const matchesSearch = titleMatch.includes(term) || empMatch.includes(term) || anonMatch.includes(term) || itemsMatch.includes(term);
    const matchesStatus = selectedStatus === 'All' ||
      req.status === selectedStatus ||
      (selectedStatus === 'HOD_APPROVED' && req.status === 'DEPARTMENT_APPROVED') ||
      (selectedStatus === 'SUBMITTED' && (req.status === 'PENDING_DEPT' || req.status === 'DRAFT'));
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SUBMITTED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1"><Clock className="w-3 h-3" /> 1. Submitted (To HOD)</span>;
      case 'HOD_APPROVED':
      case 'DEPARTMENT_APPROVED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> 2. HOD Approved (To HRO)</span>;
      case 'HRO_PROCESSED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-900 border border-indigo-200 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> 3. HRO Processed (To HR Mgr)</span>;
      case 'STRATEGIC_APPROVED':
      case 'PENDING_HR_DIRECTOR':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-200 flex items-center gap-1"><Award className="w-3 h-3" /> 4. Strategic Approved (To HRO)</span>;
      case 'FULFILLMENT_ACTIVE':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-900 border border-teal-200 flex items-center gap-1"><Calendar className="w-3 h-3" /> 5. Logistics Active</span>;
      case 'COMPLETED':
      case 'APPROVED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-200 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> 6. Completed</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-900 border border-red-200">Rejected</span>;
      case 'CHANGES_REQUESTED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-900 border border-orange-200">Changes Requested</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#264033]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Training Governance &amp; Nomination Workflow
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-2xl">
            State machine routing each request through HOD task alignment, HRO eligibility verification &amp; data anonymization, HR Manager strategic sign-off, and logistics execution.
          </p>
        </div>
      </div>

      {/* State Machine Flowchart Banner - Normal White / Soft Gray, Zero Eye Strain */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
        {/* Subtle Faint NIC Watermark Kwa Mbali */}
        <div className="pointer-events-none absolute -bottom-8 -right-8 select-none opacity-[0.035] transition-opacity">
          <img
            src="/logo/logo-light-full.png"
            alt=""
            className="w-72 h-auto object-contain filter grayscale"
          />
        </div>

        <div className="relative z-10 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#264033]" />
              <span>Workflow State Machine Stages</span>
            </p>
            <span className="text-[11px] text-slate-500 font-medium">6-Stage Endorsement Lifecycle</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-center text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/60 transition-colors">
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">1. Initiation</span>
              <span className="font-bold text-slate-800 text-xs block mt-0.5">Staff Request</span>
              <span className="text-[10px] font-mono text-slate-500 block mt-1 px-1.5 py-0.5 rounded bg-white border border-slate-200/80">Submitted</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/60 transition-colors">
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">2. First Gate</span>
              <span className="font-bold text-slate-800 text-xs block mt-0.5">HOD Review</span>
              <span className="text-[10px] font-mono text-slate-500 block mt-1 px-1.5 py-0.5 rounded bg-white border border-slate-200/80">HOD_Approved</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/60 transition-colors">
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">3. Verification</span>
              <span className="font-bold text-slate-800 text-xs block mt-0.5">HRO Anonymizes</span>
              <span className="text-[10px] font-mono text-slate-500 block mt-1 px-1.5 py-0.5 rounded bg-white border border-slate-200/80">HRO_Processed</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/60 transition-colors">
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">4. Strategic</span>
              <span className="font-bold text-slate-800 text-xs block mt-0.5">HR Mgr Endorse</span>
              <span className="text-[10px] font-mono text-slate-500 block mt-1 px-1.5 py-0.5 rounded bg-white border border-slate-200/80">Strategic_Approved</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/60 transition-colors">
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">5. Logistics</span>
              <span className="font-bold text-slate-800 text-xs block mt-0.5">HRO Setup</span>
              <span className="text-[10px] font-mono text-slate-500 block mt-1 px-1.5 py-0.5 rounded bg-white border border-slate-200/80">Fulfillment_Active</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/60 transition-colors">
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">6. Delivery</span>
              <span className="font-bold text-slate-800 text-xs block mt-0.5">Staff Attends</span>
              <span className="text-[10px] font-mono text-slate-500 block mt-1 px-1.5 py-0.5 rounded bg-white border border-slate-200/80">Completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Individual Queue vs. Unbiased Anonymized Macro View */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('individual')}
          className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${activeTab === 'individual'
            ? 'border-[#1b3d2f] text-[#1b3d2f] bg-emerald-50/50 rounded-t-xl'
            : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
        >
          <Users className="w-4 h-4" />
          <span>Operational Queue ({requests.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('macro-anonymized')}
          className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${activeTab === 'macro-anonymized'
            ? 'border-[#1b3d2f] text-[#1b3d2f] bg-emerald-50/50 rounded-t-xl'
            : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Unbiased Macro View (HR Strategic Sign-off)</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold">
            Anonymized Trends
          </span>
        </button>
      </div>

      {/* VIEW 1: INDIVIDUAL REQUESTS QUEUE */}
      {activeTab === 'individual' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative w-full sm:w-80">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search by course, employee, ref or need..."
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#264033] transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Filter className="w-4 h-4" />
              </span>
              <select
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#264033] transition-all appearance-none"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="SUBMITTED">1. Submitted (To HOD)</option>
                <option value="HOD_APPROVED">2. HOD Approved (To HRO)</option>
                <option value="HRO_PROCESSED">3. HRO Processed (To HR Mgr)</option>
                <option value="STRATEGIC_APPROVED">4. Strategic Approved (To HRO)</option>
                <option value="FULFILLMENT_ACTIVE">5. Fulfillment Active</option>
                <option value="COMPLETED">6. Completed</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Queue Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/80 text-slate-500 text-[11px] uppercase tracking-widest font-bold">
                  <tr>
                    <th className="px-6 py-4">Employee / Ref</th>
                    <th className="px-6 py-4">Training Needs (1-3)</th>
                    <th className="px-6 py-4">HOD / Recipient</th>
                    <th className="px-6 py-4">Lifecycle Stage</th>
                    <th className="px-6 py-4">Eligibility / Budget</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRequests.length > 0 ? (
                    filteredRequests.map((req) => (
                      <tr
                        key={req.id}
                        className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${selectedRequest?.id === req.id ? 'bg-emerald-50/40' : ''
                          }`}
                        onClick={() => setSelectedRequest(req)}
                      >
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-slate-900">{req.employee_name || 'Staff Member'}</p>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold inline-block mt-0.5">
                            {req.anonymized_reference || `ANON-${req.id?.slice(0, 6)?.toUpperCase()}`}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {req.items && req.items.length > 0 ? (
                            <div className="space-y-1">
                              {req.items.map((item, idx) => (
                                <div key={item.id || idx} className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-bold px-1 rounded bg-slate-100 text-slate-700">
                                    {idx + 1}
                                  </span>
                                  <span className="text-xs font-semibold text-slate-800 truncate max-w-xs">
                                    {item.title}
                                  </span>
                                  {item.is_selected && (
                                    <span className="text-[10px] font-bold px-1 rounded bg-emerald-100 text-emerald-800">
                                      ✓ Nominated
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs font-semibold text-slate-800">{req.title || 'Training Request'}</p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-600">
                          {req.recipient_name || 'Dept HOD'}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(req.status)}
                        </td>
                        <td className="px-6 py-4 text-xs">
                          <div className="space-y-0.5">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${req.eligibility_verified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                              {req.eligibility_verified ? '✓ Eligible' : 'Eligibility Pending'}
                            </span>
                            <p className="text-[10px] text-slate-400 font-mono">{req.budget_line_item || 'Line Item: Pending'}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedRequest(req)}
                              className="bg-[#264033] hover:bg-[#1a2d24] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                            >
                              {isAdmin ? 'View Details' : 'Process Stage'}
                            </button>
                            {isAdmin && (
                              <button
                                type="button"
                                onClick={() => handleDeleteRequest(req.id)}
                                title="Delete Request (Admin Only)"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                        No requests found matching your filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: UNBIASED ANONYMIZED MACRO VIEW */}
      {activeTab === 'macro-anonymized' && (
        <div className="space-y-6">
          <div className="bg-indigo-50/70 border border-indigo-200 p-5 rounded-2xl text-indigo-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-700" />
                <h3 className="text-sm font-bold text-indigo-900">Unbiased Executive Governance Notice</h3>
              </div>
              <p className="text-xs text-indigo-800 leading-relaxed max-w-3xl">
                Personal names have been stripped by the HRO administrative engine. As HR Manager or Executive Director, you review aggregated training topics across departments (e.g. &ldquo;5 employees in Engineering require Python Optimization&rdquo;) to make unbiased, macro-level strategic decisions and optimize group budgets.
              </p>
            </div>
            <button
              onClick={fetchMacroNeeds}
              className="px-3.5 py-2 rounded-xl bg-white border border-indigo-300 text-indigo-900 font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-sm hover:bg-indigo-50 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingMacro ? 'animate-spin' : ''}`} />
              Sync Macro Needs
            </button>
          </div>

          {loadingMacro ? (
            <div className="p-12 text-center flex justify-center items-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#264033]" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {macroNeeds?.macro_clusters?.length > 0 ? (
                macroNeeds.macro_clusters.map((cluster, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4 hover:border-emerald-600/40 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {cluster.department}
                      </span>
                      <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 font-mono">
                        {cluster.headcount} Candidate{cluster.headcount > 1 ? 's' : ''}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-extrabold text-slate-900">{cluster.training_topic}</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Combined organizational training demand compiled across {cluster.anonymized_refs?.length || 1} team request(s).
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Total Est. Cost</span>
                        <span className="font-extrabold text-slate-900">
                          {cluster.total_estimated_cost ? `${cluster.total_estimated_cost.toLocaleString()} TZS` : 'Budget Line Item'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Eligibility Check</span>
                        <span className="font-extrabold text-emerald-700">
                          {cluster.eligibility_verified_count} / {cluster.headcount} Verified
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Anonymized Audit References:</span>
                      <div className="flex flex-wrap gap-1">
                        {cluster.anonymized_refs?.map((ref, rIdx) => (
                          <span key={rIdx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px]">
                            {ref}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Stage: {cluster.current_stage}</span>
                      <button
                        onClick={() => {
                          const targetReq = requests.find((r) => cluster.request_ids?.includes(r.id));
                          if (targetReq) setSelectedRequest(targetReq);
                        }}
                        className="text-xs font-bold text-[#1b3d2f] hover:underline flex items-center gap-1"
                      >
                        Review Master Batch <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
                  No compiled macro training requests currently awaiting strategic review.
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {/* Review & Transition Dialog - Mounted directly on document.body to ensure true full-screen overlay */}
      {selectedRequest && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 p-3 sm:p-6 backdrop-blur-sm overflow-y-auto overflow-x-hidden"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-md shadow-2xl my-auto">
            {/* Centered Watermark in Dialog - Centered in the middle of the dialog frame */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center select-none opacity-[0.045] overflow-hidden z-0">
              <img
                src="/logo/logo-light-full.png"
                alt=""
                className="w-[380px] sm:w-[520px] max-w-[70%] h-auto object-contain filter grayscale"
              />
            </div>

            {/* Modal Header */}
            <div className="relative z-10 flex shrink-0 items-center justify-between border-b border-slate-200/90 bg-white/70 backdrop-blur-xs px-6 py-4">
              <div>
                <h3 className="mt-0.5 text-base sm:text-lg font-bold text-slate-900">
                  {selectedRequest.is_anonymized ? (
                    <span>Request [{selectedRequest.anonymized_reference || `ANON-${selectedRequest.id?.slice(0, 6)?.toUpperCase()}`}]</span>
                  ) : (
                    <span>Request by {selectedRequest.employee_name}</span>
                  )}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => handleDeleteRequest(selectedRequest.id)}
                    className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 flex items-center gap-1.5 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Request
                  </button>
                )}
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                  aria-label="Close review dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Modal Content */}
            <div className="relative z-10 min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-6">
              {/* Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/80 p-4 rounded-xl border border-slate-200 shadow-2xs">
                <div>
                  <p className="text-[10px] uppercase font-semibold text-slate-500">Employee / Ref</p>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 mt-1">
                    {selectedRequest.is_anonymized ? (selectedRequest.anonymized_reference || 'Anonymized Candidate') : selectedRequest.employee_name}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-slate-500">Target HOD</p>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 mt-1">{selectedRequest.recipient_name || 'HOD'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-slate-500">Current Stage</p>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-slate-500">Submitted On</p>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 mt-1">{new Date(selectedRequest.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {/* STAGE-SPECIFIC ACTION PANELS - Calm, Eye-Friendly Tones */}
              {/* Stage 1: HOD Gate */}
              {(selectedRequest.status === 'SUBMITTED' || selectedRequest.status === 'PENDING_DEPT') && (
                <div className="p-4 rounded-2xl bg-amber-50/75 border border-amber-200 space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-amber-700" />
                    <span>Stage 1: HOD Review Gate</span>
                  </div>
                  <p className="text-xs text-amber-900/90 font-normal leading-relaxed">
                    As Head of Department, ensure the 1–3 requested training needs align with immediate departmental tasks and operational objectives before forwarding to the HRO.
                  </p>
                </div>
              )}

              {/* HOD Endorsement Status Badge (Shown to HOD when request has already been forwarded to HRO) */}
              {!isHRO && !isAdmin && (selectedRequest.status === 'HOD_APPROVED' || selectedRequest.status === 'DEPARTMENT_APPROVED' || selectedRequest.status === 'HRO_REVIEW') && (
                <div className="p-4 rounded-2xl bg-emerald-50/75 border border-emerald-200 space-y-1 shadow-2xs">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>Department Head Endorsement Granted</span>
                  </div>
                  <p className="text-xs text-emerald-800 font-normal leading-relaxed">
                    This request has been endorsed and forwarded. It is currently with the Human Resources Officer (HRO) for eligibility verification, budgeting, and course nomination.
                  </p>
                </div>
              )}

              {/* Stage 2: HRO Administrative Engine & Anonymization (Strictly HRO / Admin only) */}
              {(isHRO || isAdmin) && (selectedRequest.status === 'HOD_APPROVED' || selectedRequest.status === 'DEPARTMENT_APPROVED' || selectedRequest.status === 'HRO_REVIEW') && (
                <div className="p-5 rounded-2xl bg-white/80 border border-slate-200 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                      <ShieldCheck className="w-4 h-4 text-[#264033]" />
                      <span>Stage 2: HRO Data Verification &amp; Anonymization Engine</span>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                      Administrative Action
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-normal leading-relaxed">
                    Verify eligibility against HR records, validate the company budget line code, and set anonymized tags so the HR Manager reviews unbiased trends.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <label className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between select-none cursor-pointer hover:border-slate-300 transition">
                      <span className="text-xs font-medium text-slate-800">Employee Eligibility Verified</span>
                      <input
                        type="checkbox"
                        disabled={!isHRO}
                        checked={hroVerification.eligibility_verified}
                        onChange={(e) => setHroVerification({ ...hroVerification, eligibility_verified: e.target.checked })}
                        className="w-4 h-4 accent-[#264033] rounded cursor-pointer disabled:cursor-not-allowed"
                      />
                    </label>

                    <label className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between select-none cursor-pointer hover:border-slate-300 transition">
                      <span className="text-xs font-medium text-slate-800">Anonymize for Strategic Review</span>
                      <input
                        type="checkbox"
                        disabled={!isHRO}
                        checked={hroVerification.is_anonymized}
                        onChange={(e) => setHroVerification({ ...hroVerification, is_anonymized: e.target.checked })}
                        className="w-4 h-4 accent-[#264033] rounded cursor-pointer disabled:cursor-not-allowed"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-medium text-slate-600">Budget Line Item Code</label>
                      <input
                        type="text"
                        disabled={!isHRO}
                        value={hroVerification.budget_line_item}
                        onChange={(e) => setHroVerification({ ...hroVerification, budget_line_item: e.target.value })}
                        placeholder="e.g. NIC-ICT-TRN-2026"
                        className="w-full mt-1 px-3 py-1.5 text-xs font-normal text-slate-800 border border-slate-200 rounded-lg bg-white font-mono disabled:bg-slate-100 disabled:text-slate-500 focus:border-[#264033] focus:ring-1 focus:ring-[#264033] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-600">Anonymized Reference Tag</label>
                      <input
                        type="text"
                        disabled={!isHRO}
                        value={hroVerification.anonymized_reference}
                        onChange={(e) => setHroVerification({ ...hroVerification, anonymized_reference: e.target.value })}
                        placeholder="e.g. ANON-ICT-0042"
                        className="w-full mt-1 px-3 py-1.5 text-xs font-normal text-slate-800 border border-slate-200 rounded-lg bg-white font-mono disabled:bg-slate-100 disabled:text-slate-500 focus:border-[#264033] focus:ring-1 focus:ring-[#264033] outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Stage 3: HR Manager Strategic Sign-off */}
              {(selectedRequest.status === 'HRO_PROCESSED') && (
                <div className="p-4 rounded-2xl bg-white/80 border border-slate-200 space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                    <Award className="w-4 h-4 text-[#264033]" />
                    <span>Stage 3: HR Manager Strategic Sign-off</span>
                  </div>
                  <p className="text-xs text-slate-600 font-normal leading-relaxed">
                    Review compiled training needs against broader company budget and organizational competency targets. Granting strategic approval routes the master list to the HRO for vendor procurement and logistics setup.
                  </p>
                </div>
              )}

              {/* Stage 4: Logistics Fulfillment Setup (Strictly HRO / Admin only) */}
              {(isHRO || isAdmin) && (selectedRequest.status === 'STRATEGIC_APPROVED') && (
                <div className="p-5 rounded-2xl bg-white/80 border border-slate-200 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                      <Calendar className="w-4 h-4 text-[#264033]" />
                      <span>Stage 4: HRO Logistics &amp; Fulfillment Setup</span>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                      Logistics Desk
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-normal leading-relaxed">
                    Strategic approval is locked. Select approved vendors, reserve venue/platform, coordinate calendar invites, and lock in execution dates.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-medium text-slate-600">Training Vendor / Institute</label>
                      <input
                        type="text"
                        disabled={!isHRO}
                        value={logistics.logistics_vendor}
                        onChange={(e) => setLogistics({ ...logistics, logistics_vendor: e.target.value })}
                        placeholder="e.g. Tanzania Institute of Bankers"
                        className="w-full mt-1 px-3 py-1.5 text-xs font-normal text-slate-800 border border-slate-200 rounded-lg bg-white disabled:bg-slate-100 disabled:text-slate-500 focus:border-[#264033] focus:ring-1 focus:ring-[#264033] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-600">Execution Venue / Platform</label>
                      <input
                        type="text"
                        disabled={!isHRO}
                        value={logistics.logistics_venue}
                        onChange={(e) => setLogistics({ ...logistics, logistics_venue: e.target.value })}
                        placeholder="e.g. NIC Executive Training Hall"
                        className="w-full mt-1 px-3 py-1.5 text-xs font-normal text-slate-800 border border-slate-200 rounded-lg bg-white disabled:bg-slate-100 disabled:text-slate-500 focus:border-[#264033] focus:ring-1 focus:ring-[#264033] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-600">Execution Dates</label>
                      <input
                        type="text"
                        disabled={!isHRO}
                        value={logistics.logistics_dates}
                        onChange={(e) => setLogistics({ ...logistics, logistics_dates: e.target.value })}
                        placeholder="e.g. 15 Oct 2026 - 19 Oct 2026"
                        className="w-full mt-1 px-3 py-1.5 text-xs font-normal text-slate-800 border border-slate-200 rounded-lg bg-white font-mono disabled:bg-slate-100 disabled:text-slate-500 focus:border-[#264033] focus:ring-1 focus:ring-[#264033] outline-none"
                      />
                    </div>
                    <div className="flex items-end">
                      <label className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between w-full select-none cursor-pointer hover:border-slate-300 transition">
                        <span className="text-xs font-medium text-slate-800">Calendar Invites Issued</span>
                        <input
                          type="checkbox"
                          disabled={!isHRO}
                          checked={logistics.calendar_invites_sent}
                          onChange={(e) => setLogistics({ ...logistics, calendar_invites_sent: e.target.checked })}
                          className="w-4 h-4 accent-[#264033] rounded cursor-pointer disabled:cursor-not-allowed"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Stage 5: Employee Attends & Final Delivery */}
              {(selectedRequest.status === 'FULFILLMENT_ACTIVE') && (
                <div className="p-4 rounded-2xl bg-emerald-50/75 border border-emerald-200 space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                    <CheckCircle className="w-4 h-4 text-emerald-700" />
                    <span>Stage 5: Attendance Verification &amp; Completion</span>
                  </div>
                  <p className="text-xs text-emerald-800 font-normal leading-relaxed">
                    Logistics are in place ({selectedRequest.logistics_vendor || 'Vendor confirmed'}, {selectedRequest.logistics_venue || 'Venue confirmed'}). Confirm attendance and delivery to mark request as Completed.
                  </p>
                </div>
              )}

              {/* Training Needs Review & Nomination Cards */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#264033]" />
                    {isHRO ? 'Review & Nominate Training Needs' : 'Proposed Training Needs'} ({selectedRequest.items?.length || 0})
                  </h4>
                  <span className="text-[11px] font-medium text-slate-500">
                    {isHRO ? 'Select the single training need to approve for study' : 'All proposed needs remain valid for departmental review'}
                  </span>
                </div>

                {selectedRequest.items && selectedRequest.items.length > 0 ? (
                  selectedRequest.items.map((item, idx) => {
                    const st = itemStates[item.id] || {};
                    return (
                      <div
                        key={item.id || idx}
                        className={`p-5 rounded-2xl border transition-all ${st.is_selected && isHRO
                          ? 'bg-white/95 border-emerald-500/50 ring-1 ring-emerald-500/20 shadow-xs'
                          : 'bg-white/70 border-slate-200/90 shadow-2xs'
                          }`}
                      >
                        {/* Header with role-aware indicator */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                          <div className="flex items-center gap-3">
                            {isHRO ? (
                              <button
                                type="button"
                                onClick={() => handleToggleSelect(item.id)}
                                className="text-[#264033] hover:scale-105 transition-transform"
                                title="Nominate this training need"
                              >
                                {st.is_selected ? (
                                  <CheckSquare className="w-5 h-5 text-[#264033]" />
                                ) : (
                                  <Square className="w-5 h-5 text-slate-400" />
                                )}
                              </button>
                            ) : (
                              <span className="w-2.5 h-2.5 rounded-full bg-[#264033]"></span>
                            )}
                            <span className="text-sm font-semibold text-slate-800">
                              Need #{idx + 1}: {item.title}
                            </span>
                          </div>

                          <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${isHRO
                              ? (st.is_selected ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-700')
                              : (item.is_selected ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-700')
                            }`}>
                            {isHRO
                              ? (st.is_selected ? '✓ Selected for Nomination' : 'Unselected')
                              : (item.is_selected ? '✓ Nominated by HRO' : 'Option Proposed')}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="mt-3 space-y-2 text-xs">
                          <div>
                            <strong className="text-slate-700 font-semibold">Justification / Skill Gap:</strong>
                            <p className="text-slate-600 font-normal mt-0.5 whitespace-pre-wrap break-words">{item.justification}</p>
                          </div>
                          <div>
                            <strong className="text-slate-700 font-semibold">Desired Outcome / Deliverable:</strong>
                            <p className="text-slate-600 font-normal mt-0.5 whitespace-pre-wrap break-words">{item.desired_outcome}</p>
                          </div>
                        </div>

                        {/* Per-Need Supporting Documents */}
                        {item.attachments && item.attachments.length > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                              Attached Document:
                            </span>
                            {item.attachments.map((att) => (
                              <a
                                key={att.id}
                                href={getFileUrl(att.file)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium transition-colors shadow-2xs"
                              >
                                <Paperclip className="w-3.5 h-3.5 text-[#264033]" />
                                <span className="max-w-[200px] truncate">{att.file_name}</span>
                                <ExternalLink className="w-3 h-3 text-slate-500" />
                              </a>
                            ))}
                          </div>
                        )}

                        {/* Schedule display for non-HRO (Read-only summary) */}
                        {!isHRO && item.is_selected && (item.planned_year || item.training_place || item.estimated_cost) && (
                          <div className="mt-3 pt-2.5 border-t border-slate-200/80 text-[11px] text-slate-700 flex flex-wrap items-center gap-3">
                            <span className="font-semibold text-slate-800 uppercase">Schedule:</span>
                            {item.planned_year && (
                              <span>{item.planned_month ? `Month ${item.planned_month}/` : ''}{item.planned_year}</span>
                            )}
                            {item.training_place && (
                              <span>Venue: {item.training_place}</span>
                            )}
                            {item.estimated_cost && (
                              <span>Est. Cost: {Number(item.estimated_cost).toLocaleString()} TZS</span>
                            )}
                          </div>
                        )}

                        {/* HRO Nomination Scheduling Fields (Strictly HRO only) */}
                        {isHRO && st.is_selected && (
                          <div className="mt-4 pt-3 border-t border-slate-200 space-y-3">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-800">
                              Nomination Schedule (Administered by HRO)
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                              <div>
                                <label className="text-[10px] font-semibold text-slate-600 uppercase">Year</label>
                                <input
                                  type="number"
                                  disabled={!isHRO}
                                  value={st.planned_year || ''}
                                  onChange={(e) => handleItemFieldChange(item.id, 'planned_year', e.target.value)}
                                  placeholder="e.g. 2026"
                                  className="w-full mt-1 px-2.5 py-1.5 text-xs font-normal text-slate-800 border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-[#264033] outline-none font-mono"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-semibold text-slate-600 uppercase">Month (1-12)</label>
                                <input
                                  type="number"
                                  min="1"
                                  max="12"
                                  disabled={!isHRO}
                                  value={st.planned_month || ''}
                                  onChange={(e) => handleItemFieldChange(item.id, 'planned_month', e.target.value)}
                                  placeholder="Month (1-12)"
                                  className="w-full mt-1 px-2.5 py-1.5 text-xs font-normal text-slate-800 border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-[#264033] outline-none font-mono"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-semibold text-slate-600 uppercase">Venue / Place</label>
                                <input
                                  type="text"
                                  disabled={!isHRO}
                                  value={st.training_place || ''}
                                  onChange={(e) => handleItemFieldChange(item.id, 'training_place', e.target.value)}
                                  placeholder="e.g. NIC Training Center"
                                  className="w-full mt-1 px-2.5 py-1.5 text-xs font-normal text-slate-800 border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-[#264033] outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-semibold text-slate-600 uppercase">Estimated Cost (TZS)</label>
                                <input
                                  type="number"
                                  disabled={!isHRO}
                                  value={st.estimated_cost || ''}
                                  onChange={(e) => handleItemFieldChange(item.id, 'estimated_cost', e.target.value)}
                                  placeholder="e.g. 500000"
                                  className="w-full mt-1 px-2.5 py-1.5 text-xs font-normal text-slate-800 border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-[#264033] outline-none font-mono"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-500 font-medium">No items found.</p>
                )}
              </div>

              {/* Comprehensive Supporting Documents & Attachments Panel */}
              {(() => {
                const allAttachments = [];
                const seenIds = new Set();

                (selectedRequest.attachments || []).forEach(att => {
                  if (!seenIds.has(att.id)) {
                    seenIds.add(att.id);
                    allAttachments.push(att);
                  }
                });

                (selectedRequest.items || []).forEach(item => {
                  (item.attachments || []).forEach(att => {
                    if (!seenIds.has(att.id)) {
                      seenIds.add(att.id);
                      allAttachments.push({ ...att, itemTitle: item.title });
                    }
                  });
                });
              })()}
            </div>


            {/* Pinned Modal Footer: Decision Section (Never overlaps or gets buried) */}
            <div className="relative z-10 shrink-0 border-t border-slate-200/90 bg-white/80 backdrop-blur-xs px-6 py-4 overflow-x-hidden">
              {isAdmin ? (
                <div className="p-3.5 rounded-xl bg-white/90 border border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <ShieldCheck className="w-4 h-4 text-[#264033] shrink-0" />
                    <span>
                      <strong className="text-slate-900">Administrator Privileges:</strong> View-only inspection and record deletion mode. Workflow transitions are authorized for HOD, HRO, and HR Manager.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteRequest(selectedRequest.id)}
                    className="px-3.5 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl flex items-center gap-1.5 transition-all shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Request
                  </button>
                </div>
              ) : (() => {
                const currentStatus = selectedRequest.status;
                const canUserTransition =
                  (['SUBMITTED', 'PENDING_DEPT', 'DRAFT'].includes(currentStatus) && (isDeptHead || isHRO || isHRManager || currentUser?.id === selectedRequest.recipient)) ||
                  (['HOD_APPROVED', 'DEPARTMENT_APPROVED', 'HRO_REVIEW'].includes(currentStatus) && (isHRO || isHRManager)) ||
                  (['HRO_PROCESSED', 'PENDING_HR_DIRECTOR'].includes(currentStatus) && (isHRManager || isHRO)) ||
                  (['STRATEGIC_APPROVED'].includes(currentStatus) && isHRO) ||
                  (['FULFILLMENT_ACTIVE'].includes(currentStatus) && (isHRO || isHRManager));

                const advanceLabel = (() => {
                  if (['SUBMITTED', 'PENDING_DEPT', 'DRAFT'].includes(currentStatus)) return 'Endorse to HRO';
                  if (['HOD_APPROVED', 'DEPARTMENT_APPROVED', 'HRO_REVIEW'].includes(currentStatus)) return 'Nominate & Process';
                  if (['HRO_PROCESSED', 'PENDING_HR_DIRECTOR'].includes(currentStatus)) return 'Strategic Approve';
                  if (['STRATEGIC_APPROVED'].includes(currentStatus)) return 'Lock Logistics';
                  if (['FULFILLMENT_ACTIVE'].includes(currentStatus)) return 'Complete Delivery';
                  return `Advance (${approvalAction.action})`;
                })();

                if (!canUserTransition) {
                  return (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Clock className="w-4 h-4 text-[#264033] shrink-0" />
                        <span>
                          <strong>Inspection Mode:</strong> This request has been processed at your stage and is currently with <strong>{selectedRequest.current_approver_name || 'HRO / Next Approver'}</strong> ({selectedRequest.status}).
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedRequest(null)}
                        className="px-4 py-1.5 text-xs font-bold text-slate-600 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-all self-end sm:self-auto shrink-0"
                      >
                        Close
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Governance Notes &amp; Decision Feedback
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs sm:text-sm font-normal text-slate-800 focus:ring-2 focus:ring-[#264033] outline-none transition-all placeholder:text-slate-400"
                        rows="2"
                        placeholder="Enter governance notes, departmental endorsement, or fulfillment instructions..."
                        value={approvalAction.comments}
                        onChange={(e) => setApprovalAction({ ...approvalAction, comments: e.target.value })}
                      />
                    </div>

                    {/* Action Suggestion Buttons + Submit */}
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <div className="grid grid-cols-3 gap-2 w-full sm:w-auto sm:flex-1">
                        <button
                          type="button"
                          onClick={() => {
                            let nextAct = 'APPROVED';
                            if (currentStatus === 'SUBMITTED' || currentStatus === 'PENDING_DEPT') nextAct = 'HOD_APPROVE';
                            else if (currentStatus === 'HOD_APPROVED' || currentStatus === 'DEPARTMENT_APPROVED') nextAct = 'HRO_PROCESS';
                            else if (currentStatus === 'HRO_PROCESSED') nextAct = 'STRATEGIC_APPROVE';
                            else if (currentStatus === 'STRATEGIC_APPROVED') nextAct = 'FULFILL_LOGISTICS';
                            else if (currentStatus === 'FULFILLMENT_ACTIVE') nextAct = 'COMPLETE';
                            setApprovalAction((prev) => ({ ...prev, action: nextAct }));
                          }}
                          className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${approvalAction.action !== 'REJECTED' && approvalAction.action !== 'CHANGES_REQUESTED'
                            ? 'bg-[#264033] text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                            }`}
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="truncate">{advanceLabel}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setApprovalAction((prev) => ({ ...prev, action: 'CHANGES_REQUESTED' }))}
                          className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${approvalAction.action === 'CHANGES_REQUESTED'
                            ? 'bg-amber-800 text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-300 hover:bg-amber-50'
                            }`}
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span className="truncate">Changes</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setApprovalAction((prev) => ({ ...prev, action: 'REJECTED' }))}
                          className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${approvalAction.action === 'REJECTED'
                            ? 'bg-rose-800 text-white shadow-xs'
                            : 'bg-white text-rose-800 border border-rose-300 hover:bg-rose-50'
                            }`}
                        >
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span className="truncate">Reject</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleApprove}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-5 py-2.5 bg-[#264033] hover:bg-[#1a2d24] text-white text-xs sm:text-sm rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 shrink-0"
                      >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        <span>Confirm: {approvalAction.action}</span>
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default RequestApprovalQueue;
