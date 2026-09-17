import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../../auth/api';
import {
    FileText, CheckCircle2, AlertCircle, Clock, Plus, Search,
    ChevronDown, ChevronUp, Calendar, AlertTriangle, Layers,
    Paperclip, X, Loader2, Download, ExternalLink, Sparkles,
    Check, ArrowRight, ShieldCheck, User, Building2, HelpCircle
} from 'lucide-react';
import TrainingRequestForm from './TrainingRequestForm';
import { translations } from '../HomePage';

const getFileUrl = (filePath) => {
    if (!filePath) return '#';
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath;
    const cleanPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
    return `http://${window.location.hostname}:8081${cleanPath}`;
};

const TrainingRequests = () => {
    const [myRequests, setMyRequests] = useState([]);
    const [lang, setLang] = useState('en');
    const [loading, setLoading] = useState(true);
    const t = translations[lang] || translations.en;

    // Search and filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    // Accordion expansion state: set of expanded request IDs
    const [expandedRequestIds, setExpandedRequestIds] = useState(new Set());

    // Modal State for New Training Request
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [requestInitialData, setRequestInitialData] = useState({});

    // Attachment Modal State
    const [showAttachmentModal, setShowAttachmentModal] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState(null);
    const [selectedItemId, setSelectedItemId] = useState(''); // empty = request level
    const [selectedFile, setSelectedFile] = useState(null);
    const [attachmentType, setAttachmentType] = useState('TRAINING_DOCUMENT');
    const [uploadingAttachment, setUploadingAttachment] = useState(false);

    const loadMyrequests = async () => {
        setLoading(true);
        try {
            const response = await api.tna.getMyRequests();
            setMyRequests(response || []);
        } catch (error) {
            console.error('Error fetching my requests:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMyrequests();
    }, []);

    const toggleExpand = (id) => {
        setExpandedRequestIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const openAttachmentModal = (requestId, itemId = '') => {
        setSelectedRequestId(requestId);
        setSelectedItemId(itemId ? String(itemId) : '');
        setSelectedFile(null);
        setAttachmentType('TRAINING_DOCUMENT');
        setShowAttachmentModal(true);
    };

    const handleUploadAttachment = async () => {
        if (!selectedFile || !selectedRequestId) return;
        setUploadingAttachment(true);
        try {
            await api.tna.uploadAttachment(
                selectedRequestId,
                selectedFile,
                attachmentType,
                selectedItemId || null
            );
            setShowAttachmentModal(false);
            setSelectedFile(null);
            setSelectedItemId('');
            await loadMyrequests();
        } catch (error) {
            alert(`Upload failed: ${error.message}`);
        } finally {
            setUploadingAttachment(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'APPROVED':
            case 'COMPLETED':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approved / Complete
                    </span>
                );
            case 'STRATEGIC_APPROVED':
            case 'FULFILLMENT_ACTIVE':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Strategic Approved / Scheduling
                    </span>
                );
            case 'HRO_PROCESSED':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                        <ShieldCheck className="w-3.5 h-3.5" /> HRO Nominated / Strategic Review
                    </span>
                );
            case 'HOD_APPROVED':
            case 'DEPARTMENT_APPROVED':
            case 'HRO_REVIEW':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                        <Clock className="w-3.5 h-3.5" /> HOD Approved / Pending HRO Selection
                    </span>
                );
            case 'PENDING_DEPT':
            case 'SUBMITTED':
            case 'DRAFT':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        <Clock className="w-3.5 h-3.5" /> Pending Dept Approval
                    </span>
                );
            case 'REJECTED':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        <AlertCircle className="w-3.5 h-3.5" /> Rejected
                    </span>
                );
            case 'CHANGES_REQUESTED':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200">
                        <AlertTriangle className="w-3.5 h-3.5" /> Changes Needed
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {status || 'Submitted'}
                    </span>
                );
        }
    };

    // Filter requests
    const filteredRequests = myRequests.filter((req) => {
        const matchesTerm =
            (req.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (req.reason || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (req.items || []).some(item =>
                (item.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.justification || '').toLowerCase().includes(searchTerm.toLowerCase())
            );

        if (!matchesTerm) return false;
        if (filterStatus === 'ALL') return true;
        if (filterStatus === 'ACTIVE') return !['APPROVED', 'COMPLETED', 'REJECTED'].includes(req.status);
        if (filterStatus === 'APPROVED') return ['APPROVED', 'COMPLETED', 'STRATEGIC_APPROVED'].includes(req.status);
        if (filterStatus === 'PENDING') return ['SUBMITTED', 'PENDING_DEPT', 'HOD_APPROVED', 'HRO_REVIEW', 'HRO_PROCESSED'].includes(req.status);
        return true;
    });

    // Currently selected request object for attachment modal dropdown
    const activeRequestForAttachment = myRequests.find(r => r.id === selectedRequestId);

    return (
        <div className="space-y-6">
            {/* Search & Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search requests or training needs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#264033] focus:ring-1 focus:ring-[#264033] outline-none transition"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                    <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Filter:</span>
                    {['ALL', 'ACTIVE', 'PENDING', 'APPROVED'].map((st) => (
                        <button
                            key={st}
                            onClick={() => setFilterStatus(st)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${filterStatus === st
                                ? 'bg-[#264033] text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {st === 'ALL' ? 'All Requests' : st}
                        </button>
                    ))}
                </div>
            </div>

            {/* Requests List */}
            {loading ? (
                <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-3 text-slate-500">
                    <Loader2 className="w-7 h-7 animate-spin text-[#264033]" />
                    <p className="text-xs font-semibold">Loading your training requests...</p>
                </div>
            ) : filteredRequests.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h4 className="text-base font-bold text-slate-800">No training requests found</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        {searchTerm || filterStatus !== 'ALL'
                            ? 'Try clearing your search or filter to see more training requests.'
                            : 'You have not submitted any training requests yet. Click "Create New Request" above to get started.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredRequests.map((req) => {
                        const isExpanded = expandedRequestIds.has(req.id);
                        const itemsCount = (req.items && req.items.length) || 0;
                        const requestAttachmentsCount = (req.attachments && req.attachments.length) || 0;
                        const totalItemAttachmentsCount = (req.items || []).reduce(
                            (acc, item) => acc + (item.attachments?.length || 0),
                            0
                        );
                        const totalAttachments = requestAttachmentsCount + totalItemAttachmentsCount;

                        return (
                            <div
                                key={req.id}
                                className={`bg-white rounded-2xl border transition shadow-sm overflow-hidden ${isExpanded ? 'border-[#264033]/40 ring-1 ring-[#264033]/15' : 'border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                {/* Request Header / Summary Row */}
                                <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white">
                                    <div
                                        className="flex-1 cursor-pointer select-none"
                                        onClick={() => toggleExpand(req.id)}
                                    >
                                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                            {getStatusBadge(req.status)}
                                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                                                TR-{String(req.id).slice(0, 8).toUpperCase()}
                                            </span>
                                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1">
                                                <Layers className="w-3 h-3" />
                                                {itemsCount > 0 ? `${itemsCount} Proposed Training ${itemsCount === 1 ? 'Need' : 'Needs'}` : '1 Training Need'}
                                            </span>
                                            {totalAttachments > 0 && (
                                                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 flex items-center gap-1">
                                                    <Paperclip className="w-3 h-3" />
                                                    {totalAttachments} {totalAttachments === 1 ? 'Document' : 'Documents'}
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="text-base font-bold text-slate-900 hover:text-[#264033] transition-colors">
                                            {req.title || 'Untitled Training Request'}
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                                            {req.reason || 'No description provided'}
                                        </p>

                                        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-3 text-xs text-slate-500">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                Submitted: {req.created_at ? new Date(req.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recent'}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <User className="w-3.5 h-3.5 text-slate-400" />
                                                Current Stage: <strong className="text-slate-700 font-semibold">{req.current_approver_name || 'HRO Evaluation'}</strong>
                                            </span>
                                            {Number(req.estimated_cost || 0) > 0 && (
                                                <span className="font-semibold text-slate-700">
                                                    Est. Budget: {Number(req.estimated_cost).toLocaleString()} TZS
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 justify-end">
                                        <button
                                            type="button"
                                            onClick={() => openAttachmentModal(req.id)}
                                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#264033] bg-[#264033]/10 hover:bg-[#264033]/20 transition"
                                        >
                                            <Paperclip className="w-3.5 h-3.5" /> Attach Document
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => toggleExpand(req.id)}
                                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                                        >
                                            {isExpanded ? (
                                                <>
                                                    Hide Details <ChevronUp className="w-4 h-4 text-slate-500" />
                                                </>
                                            ) : (
                                                <>
                                                    View Needs & Files ({itemsCount}) <ChevronDown className="w-4 h-4 text-slate-500" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Slide-down Accordion Container */}
                                {isExpanded && (
                                    <div className="border-t border-slate-200 bg-slate-50/70 p-5 space-y-6 transition-all duration-300">
                                        {/* Sub-Items (Training Needs) Section */}
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <Layers className="w-4 h-4 text-[#264033]" />
                                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                                                        Submitted Training Needs ({itemsCount})
                                                    </h4>
                                                </div>
                                                <span className="text-[11px] text-slate-500 font-medium">
                                                    All items valid until HRO nominates final study option
                                                </span>
                                            </div>

                                            {itemsCount === 0 ? (
                                                <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs text-slate-500 italic">
                                                    Single direct training request. (No sub-needs registered).
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {req.items.map((item, idx) => {
                                                        const isSelected = !!item.is_selected;
                                                        return (
                                                            <div
                                                                key={item.id}
                                                                className={`rounded-xl p-4.5 bg-white border shadow-xs flex flex-col justify-between transition ${isSelected
                                                                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20'
                                                                    : 'border-slate-200'
                                                                    }`}
                                                            >
                                                                <div className="space-y-3">
                                                                    <div className="flex items-center justify-between gap-2">
                                                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                                                            Need #{idx + 1}
                                                                        </span>
                                                                        {isSelected ? (
                                                                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                                                                <Sparkles className="w-3 h-3 text-emerald-600" />
                                                                                Selected by HRO
                                                                            </span>
                                                                        ) : (
                                                                            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                                                                <Clock className="w-3 h-3 text-slate-400" />
                                                                                Option under evaluation
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    <div>
                                                                        <h5 className="text-sm font-bold text-slate-900 leading-snug">
                                                                            {item.title}
                                                                        </h5>
                                                                    </div>

                                                                    <div className="text-xs space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                                        <div>
                                                                            <span className="font-semibold text-slate-700 block mb-0.5">
                                                                                Justification:
                                                                            </span>
                                                                            <p className="text-slate-600 line-clamp-3 leading-relaxed">
                                                                                {item.justification || 'No justification specified'}
                                                                            </p>
                                                                        </div>

                                                                        <div>
                                                                            <span className="font-semibold text-slate-700 block mb-0.5">
                                                                                Desired Learning Outcome:
                                                                            </span>
                                                                            <p className="text-slate-600 line-clamp-3 leading-relaxed">
                                                                                {item.desired_outcome || 'No outcome specified'}
                                                                            </p>
                                                                        </div>

                                                                        {(item.planned_year || item.training_place || item.estimated_cost) && (
                                                                            <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-600 space-y-1">
                                                                                {item.planned_year && (
                                                                                    <p>
                                                                                        <strong>Timeline:</strong> {item.planned_month ? `Month ${item.planned_month}/` : ''}{item.planned_year}
                                                                                    </p>
                                                                                )}
                                                                                {item.training_place && (
                                                                                    <p>
                                                                                        <strong>Venue:</strong> {item.training_place}
                                                                                    </p>
                                                                                )}
                                                                                {item.estimated_cost && (
                                                                                    <p>
                                                                                        <strong>Est. Cost:</strong> {Number(item.estimated_cost).toLocaleString()} TZS
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* Item Documents */}
                                                                    <div className="space-y-1.5 pt-1">
                                                                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                                                                            <span className="flex items-center gap-1">
                                                                                <Paperclip className="w-3 h-3 text-slate-400" /> Attached Documents ({item.attachments?.length || 0})
                                                                            </span>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => openAttachmentModal(req.id, item.id)}
                                                                                className="text-[11px] font-bold text-[#264033] hover:underline"
                                                                            >
                                                                                + Add File
                                                                            </button>
                                                                        </div>

                                                                        {item.attachments && item.attachments.length > 0 ? (
                                                                            <div className="space-y-1">
                                                                                {item.attachments.map((att) => (
                                                                                    <div
                                                                                        key={att.id}
                                                                                        className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs"
                                                                                    >
                                                                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                                                                            <FileText className="w-3.5 h-3.5 text-[#264033] shrink-0" />
                                                                                            <span className="truncate text-slate-800 font-medium" title={att.file_name}>
                                                                                                {att.file_name || 'Document'}
                                                                                            </span>
                                                                                        </div>
                                                                                        <a
                                                                                            href={getFileUrl(att.file)}
                                                                                            target="_blank"
                                                                                            rel="noopener noreferrer"
                                                                                            className="shrink-0 p-1 text-slate-400 hover:text-[#264033] transition"
                                                                                            title="Open document"
                                                                                        >
                                                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                                                        </a>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        ) : (
                                                                            <p className="text-[11px] text-slate-400 italic">
                                                                                No files attached to this specific need.
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => openAttachmentModal(req.id, item.id)}
                                                                    className="mt-3 w-full py-1.5 px-3 rounded-lg border border-dashed border-slate-300 text-slate-600 hover:border-[#264033] hover:text-[#264033] text-xs font-semibold flex items-center justify-center gap-1.5 transition bg-slate-50/50 hover:bg-white"
                                                                >
                                                                    <Plus className="w-3.5 h-3.5" /> Attach Document to Need #{idx + 1}
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* General Request Attachments */}
                                        <div className="bg-white p-4.5 rounded-xl border border-slate-200 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Paperclip className="w-4 h-4 text-[#264033]" />
                                                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                                                        General Request Supporting Documents ({requestAttachmentsCount})
                                                    </h5>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => openAttachmentModal(req.id, '')}
                                                    className="inline-flex items-center gap-1 text-xs font-bold text-[#264033] hover:underline"
                                                >
                                                    <Plus className="w-3.5 h-3.5" /> Add General Attachment
                                                </button>
                                            </div>

                                            {requestAttachmentsCount > 0 ? (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                                                    {req.attachments.map((att) => (
                                                        <div
                                                            key={att.id}
                                                            className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white transition text-xs"
                                                        >
                                                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                                                <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="truncate font-semibold text-slate-800" title={att.file_name}>
                                                                        {att.file_name || 'Document'}
                                                                    </p>
                                                                    <p className="text-[10px] text-slate-400">
                                                                        {att.document_type || 'General'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <a
                                                                href={getFileUrl(att.file)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="shrink-0 p-1.5 text-slate-500 hover:text-[#264033] hover:bg-slate-100 rounded-md transition"
                                                                title="View / Download Document"
                                                            >
                                                                <ExternalLink className="w-3.5 h-3.5" />
                                                            </a>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-slate-400 italic">
                                                    No general request documents uploaded yet. You can attach quotation letters, syllabus PDFs, or department endorsements.
                                                </p>
                                            )}
                                        </div>

                                        {/* Approval Timeline / Audit Trail */}
                                        {req.approvals && req.approvals.length > 0 && (
                                            <div className="bg-white p-4.5 rounded-xl border border-slate-200 space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <ShieldCheck className="w-4 h-4 text-[#264033]" />
                                                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                                                        Approval History & Decision Trail ({req.approvals.length})
                                                    </h5>
                                                </div>

                                                <div className="divide-y divide-slate-100 text-xs">
                                                    {req.approvals.map((app) => (
                                                        <div key={app.id} className="py-2.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-bold text-slate-800">
                                                                        {app.approver_name || 'Reviewer'}
                                                                    </span>
                                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                                                                        {app.action}
                                                                    </span>
                                                                </div>
                                                                {app.comments && (
                                                                    <p className="text-slate-600 mt-1 italic">
                                                                        "{app.comments}"
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <span className="text-[11px] font-mono text-slate-400 shrink-0">
                                                                {app.action_date ? new Date(app.action_date).toLocaleString() : ''}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Attachment Modal */}
            {showAttachmentModal && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto" role="dialog" aria-modal="true">
                    <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl my-auto overflow-hidden animate-in fade-in duration-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 bg-slate-50/50">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                    <Paperclip className="w-4 h-4 text-[#264033]" />
                                    Add Supporting Attachment
                                </h3>
                                <p className="mt-0.5 text-xs text-gray-500">
                                    Upload course outlines, quotations, or certification documents.
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowAttachmentModal(false);
                                    setSelectedFile(null);
                                    setSelectedItemId('');
                                }}
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-5 space-y-4">
                            {/* Attachment Target Dropdown */}
                            {activeRequestForAttachment && activeRequestForAttachment.items && activeRequestForAttachment.items.length > 0 && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Attach Document To:
                                    </label>
                                    <select
                                        value={selectedItemId}
                                        onChange={(e) => setSelectedItemId(e.target.value)}
                                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-800 outline-none focus:border-[#264033] focus:ring-1 focus:ring-[#264033]"
                                    >
                                        <option value="">General Request Level</option>
                                        {activeRequestForAttachment.items.map((it, idx) => (
                                            <option key={it.id} value={it.id}>
                                                Need #{idx + 1}: {it.title.slice(0, 45)}{it.title.length > 45 ? '...' : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Document Type Dropdown */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Document Category:
                                </label>
                                <select
                                    value={attachmentType}
                                    onChange={(e) => setAttachmentType(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-800 outline-none focus:border-[#264033] focus:ring-1 focus:ring-[#264033]"
                                >
                                    <option value="TRAINING_DOCUMENT">Course Syllabus / Training Brochure</option>
                                    <option value="QUOTATION">Fee Quotation / Invoice</option>
                                    <option value="OTHER">Other Supporting Document</option>
                                </select>
                            </div>

                            {/* File Drag/Drop Picker */}
                            {!selectedFile ? (
                                <label
                                    htmlFor="attachment"
                                    className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 px-6 py-8 transition hover:border-[#264033]/60 hover:bg-slate-50"
                                >
                                    <div className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                                        <Paperclip className="h-5 w-5" />
                                    </div>
                                    <p className="text-xs font-bold text-gray-800">
                                        Click to browse or drop file here
                                    </p>
                                    <p className="mt-1 text-[11px] text-gray-400 text-center">
                                        PDF, DOC, DOCX, PPT, PPTX, XLS or XLSX (max 20 MB)
                                    </p>
                                    <input
                                        id="attachment"
                                        type="file"
                                        className="hidden"
                                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setSelectedFile(file);
                                            }
                                        }}
                                    />
                                </label>
                            ) : (
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 text-lg">
                                            📄
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-xs font-bold text-gray-800">
                                                {selectedFile.name}
                                            </p>
                                            <p className="mt-0.5 text-[11px] text-gray-400">
                                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedFile(null)}
                                            className="text-xs font-semibold text-rose-500 hover:text-rose-700"
                                        >
                                            Remove
                                        </button>
                                    </div>

                                    {/* Image preview */}
                                    {selectedFile.type.startsWith("image/") && (
                                        <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white">
                                            <img
                                                src={URL.createObjectURL(selectedFile)}
                                                alt="Attachment preview"
                                                className="max-h-48 w-full object-contain"
                                            />
                                        </div>
                                    )}

                                    {/* PDF preview */}
                                    {selectedFile.type === "application/pdf" && (
                                        <div className="mt-3">
                                            <iframe
                                                src={URL.createObjectURL(selectedFile)}
                                                title="PDF Preview"
                                                className="h-48 w-full rounded-lg border border-slate-200"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-3.5 bg-slate-50/50">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAttachmentModal(false);
                                    setSelectedFile(null);
                                    setSelectedItemId('');
                                }}
                                className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={!selectedFile || uploadingAttachment}
                                onClick={handleUploadAttachment}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-[#264033] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#1a2d24] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {uploadingAttachment ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...
                                    </>
                                ) : (
                                    'Upload Document'
                                )}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Create Request Modal */}
            <TrainingRequestForm
                isOpen={isRequestModalOpen}
                onClose={() => setIsRequestModalOpen(false)}
                initialData={requestInitialData}
                translations={t}
                onSuccess={() => {
                    setIsRequestModalOpen(false);
                    loadMyrequests();
                }}
            />
        </div>
    );
};

export default TrainingRequests;