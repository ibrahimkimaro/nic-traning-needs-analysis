import { useState, useEffect } from 'react';
import { Send, FileText, AlertCircle, CheckCircle2, Loader2, X, Calendar, MapPin, Users } from 'lucide-react';
import { api } from '../../auth/api';

/**
 * TrainingRequestForm
 *
 * When used as a modal (from HomePage):
 *   <TrainingRequestForm isOpen={...} onClose={...} initialData={...} translations={...} onSuccess={...} />
 *
 * Props:
 *  - isOpen       : boolean   — controls modal visibility
 *  - onClose      : function  — dismiss the modal
 *  - initialData  : object    — pre-fills form (e.g. "Request Renewal")
 *  - onSuccess    : function  — called after successful submission
 *  - translations : object    — i18n strings (uses submitNewRequest key)
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
  const [participantCandidates, setParticipantCandidates] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [participantSearch, setParticipantSearch] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    reason: '',
    desired_outcome: '',
    estimated_cost: '',
    start_date: '',
    end_date: '',
    training_place: '',
  });

  // Sync initialData each time the modal opens (handles pre-fills from "Apply Now" / "Request Renewal")
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: initialData.title || '',
        reason: initialData.reason || '',
        desired_outcome: initialData.desired_outcome || '',
        estimated_cost: initialData.estimated_cost || '',
        start_date: initialData.start_date || '',
        end_date: initialData.end_date || '',
        training_place: initialData.training_place || '',
      });
      setSuccess(false);
      setError(null);
      setParticipants([]);
      setParticipantSearch('');
      api.tna.getParticipantCandidates().then(setParticipantCandidates).catch(() => setParticipantCandidates([]));
    }
  }, [isOpen]);

  const set = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const selectedParticipants = participantCandidates.filter((candidate) => participants.includes(candidate.id));
  const matchingParticipants = participantCandidates
    .filter((candidate) => !participants.includes(candidate.id))
    .filter((candidate) => {
      const search = participantSearch.trim().toLowerCase();
      if (!search) return false;
      const name = candidate.full_name || `${candidate.first_name} ${candidate.last_name}`;
      return `${name} ${candidate.employee_number || ''}`.toLowerCase().includes(search);
    })
    .slice(0, 8);

  const addParticipant = (candidate) => {
    setParticipants((selected) => [...selected, candidate.id]);
    setParticipantSearch('');
  };

  const removeParticipant = (candidateId) => {
    setParticipants((selected) => selected.filter((id) => id !== candidateId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await console.log("data", formData)
      await api.tna.createRequest({ ...formData, participants });
      setSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        setSuccess(false);
        onClose?.();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const label = translations.submitNewRequest || 'Submit Training Request';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-6 duration-200">

        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#264033] text-white rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{label}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Submit proposal to your supervisor and HR for approval</p>
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
          <div className="mx-6 mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Training request submitted successfully! Routed to supervisor.</span>
          </div>
        )}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">

          {/* Training Title */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Training Title / Course Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Advanced Actuarial Risk Modeling & Pricing"
              value={formData.title}
              onChange={set('title')}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-[#264033] outline-none transition-all"
            />
          </div>

          {/* Justification */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Justification &amp; Skill Need (Reason)
            </label>
            <textarea
              required
              rows="3"
              placeholder="Explain why this training is needed and what competency gap it addresses..."
              value={formData.reason}
              onChange={set('reason')}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-[#264033] outline-none transition-all resize-none"
            />
          </div>

          {/* Desired Outcome */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Desired Outcome / Return on Investment
            </label>
            <textarea
              rows="2"
              placeholder="Describe measurable improvement on your day-to-day output..."
              value={formData.desired_outcome}
              onChange={set('desired_outcome')}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-[#264033] outline-none transition-all resize-none"
            />
          </div>

          {/* Estimated Cost */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Estimated Cost (TZS)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 text-xs font-bold pointer-events-none">TZS</span>
              <input
                type="number"
                placeholder="e.g. 750000"
                value={formData.estimated_cost}
                onChange={set('estimated_cost')}
                className="w-full pl-12 pr-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-[#264033] outline-none transition-all font-mono"
              />
            </div>
          </div>

          {/* Start & End Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Start Date
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={set('start_date')}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-[#264033] outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3" /> End Date
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={set('end_date')}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-[#264033] outline-none transition-all"
              />
            </div>
          </div>

          {/* Training Place */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Training Venue / Place
            </label>
            <input
              type="text"
              placeholder="e.g. Dar es Salaam Convention Centre"
              value={formData.training_place}
              onChange={set('training_place')}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-[#264033] outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-600">
              <Users className="h-3.5 w-3.5" /> Training participants
            </label>
            <p className="text-xs text-slate-500">Select employees who should track this request and comment on it.</p>
            <div className="relative">
              <Users className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="search"
                value={participantSearch}
                onChange={(event) => setParticipantSearch(event.target.value)}
                placeholder="Search by first name, last name, or employee number"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-[#264033] focus:ring-2 focus:ring-emerald-100"
              />
              {participantSearch.trim() && (
                <div className="absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                  {matchingParticipants.length > 0 ? matchingParticipants.map((candidate) => {
                    const name = candidate.full_name || `${candidate.first_name} ${candidate.last_name}`;
                    return (
                      <button
                        key={candidate.id}
                        type="button"
                        onClick={() => addParticipant(candidate)}
                        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-emerald-50"
                      >
                        <span className="text-sm font-semibold text-slate-800">{name}</span>
                        {candidate.employee_number && <span className="text-xs text-slate-400">{candidate.employee_number}</span>}
                      </button>
                    );
                  }) : (
                    <p className="px-4 py-3 text-sm text-slate-500">No employees found.</p>
                  )}
                </div>
              )}
            </div>
            {selectedParticipants.length > 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Selected participants</p>
                <div className="flex flex-wrap gap-2">
                  {selectedParticipants.map((candidate) => (
                    <span key={candidate.id} className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 py-1.5 pl-3 pr-1.5 text-xs font-semibold text-emerald-900">
                      {candidate.full_name || `${candidate.first_name} ${candidate.last_name}`}
                      <button type="button" onClick={() => removeParticipant(candidate.id)} className="rounded-full p-0.5 text-emerald-700 hover:bg-emerald-200" aria-label={`Remove ${candidate.full_name || candidate.first_name}`}>
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-slate-300 px-3 py-3 text-xs text-slate-500">No participants selected yet.</p>
            )}
            <p className="text-[11px] text-slate-400">Participants can view and comment. Only the creator and authorized approvers can change the request.</p>
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
              {submitting ? 'Submitting...' : 'Submit Proposal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrainingRequestForm;
