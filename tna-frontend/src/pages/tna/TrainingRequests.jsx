import { useState, useEffect } from 'react';
import { api } from '../../auth/api';
import {
    CheckCircle2, AlertCircle, Clock, Plus, AlertTriangle, X, Loader2, MessageSquare, Users
} from 'lucide-react';
import TrainingRequestForm from './TrainingRequestForm';
import { translations } from '../HomePage';

const TrainingRequests = () => {

    const [myRequests, setMyRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequestId, setSelectedRequestId] = useState(null);


    // Modal State for New Training Request
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [showAttachmentModal, setShowAttachmentModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [attachmentType, setAttachmentType] = useState('TRAINING_DOCUMENT');
    const [uploadingAttachment, setUploadingAttachment] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [comment, setComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [learning, setLearning] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const t = translations.en;



    const loadMyrequests = async () => {
        setLoading(true);
        try {
            const [response, notificationResponse] = await Promise.all([
                api.tna.getMyRequests(),
                api.notifications.getMine().catch(() => []),
            ]);
            setMyRequests(response || []);
            setNotifications(notificationResponse || []);
        } catch (error) {
            console.error('Error fetching my requests:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const loadInitialRequests = async () => {
            const [userResponse] = await Promise.all([
                api.auth.me().catch(() => null),
                loadMyrequests(),
            ]);
            setCurrentUser(userResponse);
        };
        loadInitialRequests();
    }, []);

    useEffect(() => {
        if (!selectedRequest) return;
        api.tna.getRequestLearning(selectedRequest.id)
            .then(setLearning)
            .catch(() => setLearning(null));
    }, [selectedRequest]);

    if (loading) {
        return (
            <div className="flex min-h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#264033]" />
            </div>
        );
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case 'ATTACHMENT_WAIT':
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800"><Clock className="w-3.5 h-3.5" /> Waiting for Attachment</span>;
            case 'APPROVED':
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800"><CheckCircle2 className="w-3.5 h-3.5" /> Approved</span>;
            case 'PENDING_DEPT':
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800"><Clock className="w-3.5 h-3.5" /> Dept Approval</span>;
            case 'PENDING_BUDGET':
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800"><Clock className="w-3.5 h-3.5" /> Budget Review</span>;
            case 'HR_REVIEW':
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800"><Clock className="w-3.5 h-3.5" /> HR Planning</span>;
            case 'REJECTED':
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800"><AlertCircle className="w-3.5 h-3.5" /> Rejected</span>;
            case 'CHANGES_REQUESTED':
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800"><AlertTriangle className="w-3.5 h-3.5" /> Changes Needed</span>;
            default:
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{status || 'Submitted'}</span>;
        }
    };

    return (

        <div className="bg- p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            {notifications.length > 0 && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-emerald-900">
                        <MessageSquare className="h-4 w-4" /> Notifications
                    </div>
                    <div className="mt-2 space-y-1">
                        {notifications.slice(0, 3).map((notification) => (
                            <p key={notification.id} className="text-xs leading-5 text-emerald-800">{notification.message}</p>
                        ))}
                    </div>
                </div>
            )}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold text-slate-900">My Training Request Log</h3>
                    <p className="text-xs text-slate-500 mt-1">Track request progress through department approval, budget check, and scheduling.</p>
                </div>
                <button
                    onClick={() => setIsRequestModalOpen(true)}
                    className="bg-[#264033] hover:bg-[#1a2d24] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm"
                >
                    <Plus className="w-4 h-4" /> Create Request
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                        <tr>
                            <th className="px-5 py-3.5">Training Title</th>
                            <th className="px-5 py-3.5">Estimated Cost</th>
                            <th className="px-5 py-3.5">Current Approver</th>
                            <th className="px-5 py-3.5">Status</th>
                            <th className="px-5 py-3.5">Date</th>
                            <th className='px-5 py-3.5'>Attachments</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {myRequests.length > 0 ? (
                            myRequests.map((req) => (
                                <tr key={req.id} className="hover:bg-slate-50 transition-colors">

                                    <td className="px-5 py-4">
                                        <p className="text-sm font-bold text-slate-900">{req.title}</p>
                                        <p className="text-xs text-slate-500 line-clamp-1">{req.reason}</p>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedRequest(req)}
                                            className="mt-2 text-xs font-bold text-[#264033] hover:underline"
                                        >
                                            View tracking and comments
                                        </button>
                                    </td>
                                    <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                                        {Number(req.estimated_cost || 0).toLocaleString()} TZS
                                    </td>
                                    <td className="px-5 py-4 text-xs font-medium text-slate-600">
                                        {req.current_approver_name || 'Completed / None'}
                                    </td>
                                    <td className="px-5 py-4">
                                        {getStatusBadge(req.status)}
                                    </td>
                                    <td className="px-5 py-4 text-xs text-slate-400 font-mono">
                                        {req.created_at ? new Date(req.created_at).toLocaleDateString() : 'Recent'}
                                    </td>

                                    <td className="px-5 py-4 text-xs text-slate-400 font-mono">
                                        {currentUser?.id && String(req.employee) === String(currentUser.id) && <button onClick={
                                            () => {
                                                setSelectedRequestId(req.id);
                                                setSelectedFile(null);
                                                setAttachmentType('TRAINING_DOCUMENT');
                                                setShowAttachmentModal(true);
                                            }
                                        } className='bg-[#264033] hover:bg-[#1a2d24] text-white px-1 py-1 rounded text-xs font-bold flex items-center gap-1' >
                                            add
                                            attachment
                                        </button>}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center py-12 text-slate-400 text-sm">
                                    No training requests submitted yet. Click "Create Request" above to submit one.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true">
                    <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-4">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">Request tracking</p>
                                <h2 className="mt-1 text-lg font-bold text-slate-900">{selectedRequest.title}</h2>
                            </div>
                            <button type="button" onClick={() => setSelectedRequest(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-200" aria-label="Close request tracking">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5">
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] uppercase text-slate-400">Status</p><div className="mt-2">{getStatusBadge(selectedRequest.status)}</div></div>
                                <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] uppercase text-slate-400">Created</p><p className="mt-2 text-sm font-semibold text-slate-700">{new Date(selectedRequest.created_at).toLocaleDateString()}</p></div>
                                <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] uppercase text-slate-400">Approver</p><p className="mt-2 text-sm font-semibold text-slate-700">{selectedRequest.current_approver_name || 'Completed'}</p></div>
                                <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] uppercase text-slate-400">Participants</p><p className="mt-2 text-sm font-semibold text-slate-700">{selectedRequest.participant_names?.length || 0}</p></div>
                            </div>
                            <div className="space-y-2"><h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Request details</h3><p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{selectedRequest.reason}</p>{selectedRequest.desired_outcome && <p className="text-sm leading-6 text-slate-600"><strong>Desired outcome:</strong> {selectedRequest.desired_outcome}</p>}</div>
                            <div className="space-y-2"><h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400"><Users className="h-4 w-4" /> Participants</h3><p className="text-sm text-slate-600">{selectedRequest.participant_names?.length ? selectedRequest.participant_names.join(', ') : 'No additional participants.'}</p></div>
                            {learning?.overview && (
                                <div className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-800">Learning overview</h3>
                                    <p className="whitespace-pre-wrap text-sm leading-6 text-emerald-950">{learning.overview}</p>
                                    {learning.daily_question && (
                                        <div className="mt-3 border-t border-emerald-200 pt-3">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">Today&apos;s question</p>
                                            <p className="mt-1 text-sm font-semibold text-emerald-950">{learning.daily_question.question}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Participant responses</h3>
                                {selectedRequest.participant_responses?.length ? selectedRequest.participant_responses.map((participantResponse) => (
                                    <div key={participantResponse.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">{participantResponse.participant_name}</p>
                                            <p className="text-xs text-slate-500">Response: {participantResponse.response}</p>
                                        </div>
                                        {currentUser?.id && String(participantResponse.participant) === String(currentUser.id) && participantResponse.response === 'PENDING' && (
                                            <div className="flex gap-2">
                                                <button type="button" onClick={async () => { const updated = await api.tna.respondToRequest(selectedRequest.id, 'REJECTED'); setSelectedRequest({ ...selectedRequest, participant_responses: selectedRequest.participant_responses.map((item) => item.id === updated.id ? updated : item) }); }} className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50">Reject</button>
                                                <button type="button" onClick={async () => { const updated = await api.tna.respondToRequest(selectedRequest.id, 'ACCEPTED'); setSelectedRequest({ ...selectedRequest, participant_responses: selectedRequest.participant_responses.map((item) => item.id === updated.id ? updated : item) }); }} className="rounded-lg bg-[#264033] px-2.5 py-1.5 text-xs font-bold text-white hover:bg-[#1a2d24]">Accept</button>
                                            </div>
                                        )}
                                    </div>
                                )) : <p className="text-sm text-slate-500">No participants were assigned.</p>}
                            </div>
                            <div className="space-y-3"><h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400"><MessageSquare className="h-4 w-4" /> Comments</h3>{selectedRequest.comments?.length ? selectedRequest.comments.map((item) => <div key={item.id} className="rounded-xl border border-slate-200 p-3"><p className="text-xs font-bold text-slate-800">{item.author_name}</p><p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{item.body}</p><p className="mt-2 text-[10px] text-slate-400">{new Date(item.created_at).toLocaleString()}</p></div>) : <p className="text-sm text-slate-500">No comments yet.</p>}</div>
                            <form onSubmit={async (event) => { event.preventDefault(); if (!comment.trim()) return; setSubmittingComment(true); try { const created = await api.tna.addRequestComment(selectedRequest.id, comment.trim()); setSelectedRequest({ ...selectedRequest, comments: [...(selectedRequest.comments || []), created] }); setComment(''); } finally { setSubmittingComment(false); } }} className="space-y-2 border-t border-slate-100 pt-4">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Add comment</label>
                                <textarea value={comment} onChange={(event) => setComment(event.target.value)} rows="3" placeholder="Share information about this training request..." className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:ring-2 focus:ring-[#264033]" />
                                <button type="submit" disabled={!comment.trim() || submittingComment} className="rounded-xl bg-[#264033] px-4 py-2 text-xs font-bold text-white disabled:opacity-50">{submittingComment ? 'Posting...' : 'Post comment'}</button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {showAttachmentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">

                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                            <div>
                                <h2 className="text-sm font-semibold text-gray-900">
                                    Add attachment
                                </h2>

                                <p className="mt-0.5 text-xs text-gray-500">
                                    Attach a supporting document to this request.
                                </p>
                            </div>

                            <button
                                onClick={() => setShowAttachmentModal(false)}
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-5">
                            {!selectedFile ? (
                                <label
                                    htmlFor="attachment"
                                    className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 px-6 py-10 transition hover:border-[#264033]/40 hover:bg-gray-50"
                                >
                                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                                        <svg
                                            className="h-5 w-5 text-gray-500"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1.8}
                                                d="M12 16V4m0 0L8 8m4-4l4 4M5 20h14"
                                            />
                                        </svg>
                                    </div>

                                    <p className="text-sm font-medium text-gray-700">
                                        Choose a file
                                    </p>

                                    <p className="mt-1 text-xs text-gray-400">
                                        PDF, DOC, DOCX, PPT, PPTX, XLS or XLSX (max 20 MB)
                                    </p>

                                    <input
                                        id="attachment"
                                        type="file"
                                        className="hidden"
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];

                                            if (file) {
                                                setSelectedFile(file);
                                            }
                                        }}
                                    />
                                </label>
                            ) : (
                                /* Preview */
                                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

                                    <div className="flex items-start gap-3">

                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white border border-gray-200">
                                            📄
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-gray-800">
                                                {selectedFile.name}
                                            </p>

                                            <p className="mt-1 text-xs text-gray-400">
                                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => setSelectedFile(null)}
                                            className="text-xs text-gray-400 hover:text-red-500"
                                        >
                                            Remove
                                        </button>

                                    </div>

                                    {/* Image preview */}
                                    {selectedFile.type.startsWith("image/") && (
                                        <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white">
                                            <img
                                                src={URL.createObjectURL(selectedFile)}
                                                alt="Attachment preview"
                                                className="max-h-64 w-full object-contain"
                                            />
                                        </div>
                                    )}

                                    {/* PDF preview */}
                                    {selectedFile.type === "application/pdf" && (
                                        <div className="mt-4">
                                            <iframe
                                                src={URL.createObjectURL(selectedFile)}
                                                title="PDF Preview"
                                                className="h-64 w-full rounded-lg border border-gray-200"
                                            />
                                        </div>
                                    )}

                                </div>
                            )}

                            <label className="mt-4 block text-xs font-semibold text-gray-600">
                                Document type
                                <select
                                    value={attachmentType}
                                    onChange={(event) => setAttachmentType(event.target.value)}
                                    className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-normal text-gray-800 outline-none focus:border-[#264033]"
                                >
                                    <option value="TRAINING_DOCUMENT">Training document</option>
                                    <option value="QUOTATION">Quotation</option>
                                    <option value="OTHER">Other supporting document</option>
                                </select>
                            </label>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4">

                            <button
                                onClick={() => {
                                    setShowAttachmentModal(false);
                                    setSelectedFile(null);
                                }}
                                className="rounded-lg px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100"
                            >
                                Cancel
                            </button>

                            <button
                                disabled={!selectedFile || uploadingAttachment}
                                onClick={async () => {
                                    setUploadingAttachment(true);
                                    try {
                                        await api.tna.uploadAttachment(selectedRequestId, selectedFile, attachmentType);
                                        setShowAttachmentModal(false);
                                        setSelectedFile(null);
                                        await loadMyrequests();
                                    } catch (error) {
                                        alert(`Upload failed: ${error.message}`);
                                    } finally {
                                        setUploadingAttachment(false);
                                    }
                                }}
                                className="rounded-lg bg-[#264033] px-4 py-2 text-xs font-medium text-white transition hover:bg-[#1a2d24] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {uploadingAttachment ? 'Uploading...' : 'Upload'}
                            </button>

                        </div>
                    </div>
                </div>
            )}
            <TrainingRequestForm
                isOpen={isRequestModalOpen}
                onClose={() => setIsRequestModalOpen(false)}
                initialData={{}}
                translations={t}
                onSuccess={() => loadMyrequests()}
            />

        </div>


    )
}


export default TrainingRequests