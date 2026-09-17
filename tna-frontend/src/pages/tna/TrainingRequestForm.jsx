import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Send, FileText, AlertCircle, CheckCircle2, Loader2, X, Plus, Trash2, Paperclip, UserCheck, Search, ChevronDown, Check } from 'lucide-react';
import { api } from '../../auth/api';

/**
 * TrainingRequestForm
 *
 * One employee submits ONE Training Request containing 1 to 3 Training Needs to their HOD.
 */
const TrainingRequestForm = ({
  isOpen,
  onClose,
  initialData = {},
  onSuccess,
  translations = {},
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Recipient / HOD
  const [recipients, setRecipients] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [recipientSearch, setRecipientSearch] = useState('');
  const [isRecipientDropdownOpen, setIsRecipientDropdownOpen] = useState(false);

  // Training Needs: 1 to 3 items (each with its own specific supporting document)
  const [items, setItems] = useState([
    { title: '', justification: '', desired_outcome: '', file: null, document_type: 'TRAINING_DOCUMENT' }
  ]);

  useEffect(() => {
    if (isOpen) {
      // Initialize with 1 item or prefilled from initialData
      const initialItem = {
        title: initialData.title || '',
        justification: initialData.reason || initialData.justification || '',
        desired_outcome: initialData.desired_outcome || '',
        file: null,
        document_type: 'TRAINING_DOCUMENT'
      };
      setItems([initialItem]);
      setRecipientSearch('');
      setIsRecipientDropdownOpen(false);
      setSuccess(false);
      setError(null);

      // Load available HODs / supervisors
      setLoadingRecipients(true);
      api.tna.getRecipients()
        .then((data) => {
          setRecipients(data || []);
          // Preselect supervisor or first recipient
          const supervisor = data.find((r) => r.is_supervisor);
          if (supervisor) {
            setSelectedRecipient(supervisor.id);
          } else if (data.length > 0) {
            setSelectedRecipient(data[0].id);
          }
        })
        .catch(() => {
          setRecipients([]);
        })
        .finally(() => setLoadingRecipients(false));
    }
  }, [isOpen, initialData]);

  // Item field change handler
  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Add another Training Need (max 3)
  const handleAddItem = () => {
    if (items.length >= 3) return;
    setItems((prev) => [
      ...prev,
      { title: '', justification: '', desired_outcome: '', file: null, document_type: 'TRAINING_DOCUMENT' }
    ]);
  };

  // Remove a Training Need
  const handleRemoveItem = (index) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (items.length < 1 || items.length > 3) {
      setError('You must provide between 1 and 3 training needs.');
      return;
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.title.trim()) {
        setError(`Please enter a title for Training Need ${i + 1}.`);
        return;
      }
      if (!item.justification.trim()) {
        setError(`Please provide a justification for Training Need ${i + 1}.`);
        return;
      }
      if (!item.desired_outcome.trim()) {
        setError(`Please describe the desired outcome for Training Need ${i + 1}.`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        recipient: selectedRecipient || null,
        items: items.map((it) => ({
          title: it.title.trim(),
          justification: it.justification.trim(),
          desired_outcome: it.desired_outcome.trim()
        }))
      };

      const created = await api.tna.createRequest(payload);

      // Upload supporting document specifically for each individual training need
      if (created?.items && Array.isArray(created.items)) {
        for (let i = 0; i < items.length; i++) {
          const itemFile = items[i]?.file;
          const createdItemId = created.items[i]?.id;
          if (itemFile && createdItemId) {
            try {
              await api.tna.uploadAttachment(created.id, itemFile, items[i].document_type || 'TRAINING_DOCUMENT', createdItemId);
            } catch (itemUploadErr) {
              console.warn(`Attachment upload failed for training need ${i + 1}:`, itemUploadErr);
            }
          }
        }
      }

      setSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        setSuccess(false);
        onClose?.();
      }, 1800);
    } catch (err) {
      setError(err.message || 'Failed to submit training request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const label = translations.submitNewRequest || 'Submit Training Request';

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-6 duration-200 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#264033] text-white rounded-xl shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{label}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Submit up to 3 priority training needs to your HOD for review</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full transition-all hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alerts */}
        {success && (
          <div className="mx-6 mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Training request with {items.length} need{items.length > 1 ? 's' : ''} submitted successfully to your HOD!</span>
          </div>
        )}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-semibold flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">

          {/* Recipient / HOD Routing */}
          {(() => {
            const storedUser = localStorage.getItem('user');
            const currentUser = storedUser ? JSON.parse(storedUser) : null;
            const isHRO = currentUser?.roles?.some((r) => ['HR_MANAGER', 'HRO', 'ADMIN'].includes(r.role_name)) || currentUser?.is_superuser;
            const sel = recipients.find((r) => String(r.id) === String(selectedRecipient)) || recipients[0];

            if (!isHRO) {
              return (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-[#264033]" />
                      Endorsement Authority (HOD)
                    </label>
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Direct HOD Routing
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-[#264033] text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {sel?.full_name?.charAt(0) || 'H'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {sel?.full_name || 'Department Head / Direct Supervisor'}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {sel?.position_title || sel?.role_name || 'Head of Department'} {sel?.department ? `• ${sel.department}` : ''}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/80">
                      Auto Assigned
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Your training request is automatically addressed to your Head of Department for review and endorsement.
                  </p>
                </div>
              );
            }

            return (
              <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3 relative">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-[#264033]" />
                    Recipient / Head of Department (HOD) *
                  </label>
                  {sel ? (
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                      {sel.is_supervisor ? '★ Direct Supervisor' : 'Selected HOD'}
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-slate-500">
                  Select the supervisor or HOD who will review and endorse this training request. Search by name, department, or role.
                </p>

                {loadingRecipients ? (
                  <div className="flex items-center gap-2 text-xs text-slate-500 py-3 px-3 bg-white rounded-xl border border-slate-200">
                    <Loader2 className="w-4 h-4 animate-spin text-[#264033]" /> Loading department heads...
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={recipientSearch}
                        onChange={(e) => {
                          setRecipientSearch(e.target.value);
                          if (!isRecipientDropdownOpen) setIsRecipientDropdownOpen(true);
                        }}
                        onFocus={() => setIsRecipientDropdownOpen(true)}
                        placeholder={
                          sel ? `Selected: ${sel.full_name} (type to search & switch)...` : "Search HOD by name, department, or role..."
                        }
                        className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#264033] focus:border-[#264033] transition-all shadow-sm"
                      />
                      {recipientSearch ? (
                        <button
                          type="button"
                          onClick={() => setRecipientSearch('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsRecipientDropdownOpen(!isRecipientDropdownOpen)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                        >
                          <ChevronDown className={`w-4 h-4 transition-transform ${isRecipientDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                      )}
                    </div>

                    {sel && !isRecipientDropdownOpen && (
                      <div className="p-3 bg-white rounded-xl border border-emerald-200/90 flex items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-[#264033] text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {sel.full_name?.charAt(0) || 'H'}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-slate-900 truncate">{sel.full_name}</p>
                              {sel.is_supervisor && (
                                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                                  Your Supervisor
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 truncate">
                              {sel.role_name} {sel.department ? `• ${sel.department}` : ''}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsRecipientDropdownOpen(true)}
                          className="text-xs font-bold text-[#264033] hover:underline shrink-0 px-2 py-1"
                        >
                          Change
                        </button>
                      </div>
                    )}

                    {isRecipientDropdownOpen && (
                      <div className="border border-slate-200 rounded-xl bg-white shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1">
                        <div className="p-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                          <span>
                            {(() => {
                              const q = recipientSearch.toLowerCase().trim();
                              const matches = recipients.filter((r) => {
                                if (!q) return true;
                                return (
                                  (r.full_name && r.full_name.toLowerCase().includes(q)) ||
                                  (r.department && r.department.toLowerCase().includes(q)) ||
                                  (r.role_name && r.role_name.toLowerCase().includes(q)) ||
                                  (r.username && r.username.toLowerCase().includes(q)) ||
                                  (r.email && r.email.toLowerCase().includes(q))
                                );
                              });
                              return `Found ${matches.length} recipient${matches.length !== 1 ? 's' : ''}`;
                            })()}
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsRecipientDropdownOpen(false)}
                            className="text-slate-400 hover:text-slate-700 font-bold"
                          >
                            Close [✕]
                          </button>
                        </div>
                        <div className="max-h-56 overflow-y-auto divide-y divide-slate-100">
                          {recipients.map((r) => {
                            const isSelected = String(r.id) === String(selectedRecipient);
                            return (
                              <button
                                key={r.id}
                                type="button"
                                onClick={() => {
                                  setSelectedRecipient(r.id);
                                  setIsRecipientDropdownOpen(false);
                                  setRecipientSearch('');
                                }}
                                className={`w-full text-left p-3 flex items-center justify-between gap-3 hover:bg-emerald-50/60 transition-colors ${isSelected ? 'bg-emerald-50/80 border-l-4 border-[#264033]' : ''}`}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${isSelected ? 'bg-[#264033] text-white' : 'bg-slate-100 text-slate-700'}`}>
                                    {r.full_name?.charAt(0) || 'H'}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-xs font-bold text-slate-900">{r.full_name}</span>
                                      {r.is_supervisor && (
                                        <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200">
                                          ★ Your Supervisor
                                        </span>
                                      )}
                                      <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                                        {r.role_name}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                      {r.department || 'Department'}{r.email ? ` • ${r.email}` : ''}
                                    </p>
                                  </div>
                                </div>
                                {isSelected && (
                                  <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Training Needs Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Training Needs ({items.length}/3)
                </h4>
                <p className="text-xs text-slate-500">List 1 to 3 training needs in order of personal and organizational priority.</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full">
                {items.length === 1 ? '1 Need' : `${items.length} Needs`}
              </span>
            </div>

            {items.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3 relative hover:border-emerald-700/40 transition-all"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-[#264033] uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-lg">
                    Training Need {index + 1}
                  </span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                      title={`Remove Training Need ${index + 1}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  )}
                </div>

                {/* Title */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Title / Course Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Advanced Excel & Financial Modeling"
                    value={item.title}
                    onChange={(e) => handleItemChange(index, 'title', e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-[#264033] outline-none transition-all focus:bg-white"
                  />
                </div>

                {/* Justification */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Justification &amp; Business Reason *
                  </label>
                  <textarea
                    required
                    rows="4"
                    placeholder="Why is this training needed and what gap does it address?..."
                    value={item.justification}
                    onChange={(e) => handleItemChange(index, 'justification', e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-[#264033] outline-none transition-all resize-y min-h-[95px] focus:bg-white leading-relaxed"
                  />
                </div>

                {/* Desired Outcome */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Desired Outcome / Deliverable *
                  </label>
                  <textarea
                    required
                    rows="4"
                    placeholder="Describe measurable improvement or results on your day-to-day duties..."
                    value={item.desired_outcome}
                    onChange={(e) => handleItemChange(index, 'desired_outcome', e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-[#264033] outline-none transition-all resize-y min-h-[95px] focus:bg-white leading-relaxed"
                  />
                </div>

                {/* Supporting Document / PDF for this specific Training Need */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5 text-[#264033]" />
                      Attach Document for Need #{index + 1} (PDF / Course Syllabus / Quotation)
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">Optional • Max 20MB</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Attach course outline, syllabus, or fee quotation provided by the training institution for this specific need.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors border border-slate-200">
                      <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                      <span>{item.file ? 'Change file' : 'Choose PDF / Document'}</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 20 * 1024 * 1024) {
                              setError(`File for Need #${index + 1} exceeds 20 MB.`);
                              return;
                            }
                            handleItemChange(index, 'file', file);
                            setError(null);
                          }
                        }}
                      />
                    </label>
                    {item.file && (
                      <div className="flex items-center gap-2 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200 text-xs font-medium text-emerald-800">
                        <span className="max-w-[240px] truncate font-semibold">{item.file.name}</span>
                        <span className="text-[10px] text-emerald-600">({(item.file.size / 1024 / 1024).toFixed(2)} MB)</span>
                        <button
                          type="button"
                          onClick={() => handleItemChange(index, 'file', null)}
                          className="text-slate-400 hover:text-red-600 p-0.5 ml-1 transition-colors"
                          title="Remove document"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Add Another Training Need Button */}
            {items.length < 3 && (
              <button
                type="button"
                onClick={handleAddItem}
                className="w-full py-3 px-4 border-2 border-dashed border-[#264033]/40 hover:border-[#264033] bg-emerald-50/40 hover:bg-emerald-50 rounded-xl text-xs font-bold text-[#264033] flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                <Plus className="w-4 h-4" />
                + Add Another Training Need ({items.length + 1} of 3)
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="pt-4 flex gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-[#264033] hover:bg-[#1a2d24] rounded-xl transition-all shadow-md shadow-[#264033]/20 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {submitting ? 'Submitting Request...' : `Submit Request (${items.length} Need${items.length > 1 ? 's' : ''})`}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default TrainingRequestForm;