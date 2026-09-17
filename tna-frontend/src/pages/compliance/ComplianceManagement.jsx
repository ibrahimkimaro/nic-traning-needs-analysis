import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Award, ShieldAlert, CheckCircle2, Clock, AlertTriangle, Plus,
  Search, Filter, ExternalLink, Calendar, RefreshCw, Loader2, Building, User, FileText
} from 'lucide-react';
import { api } from '../../auth/api';

const ComplianceManagement = () => {
  const [certifications, setCertifications] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [expiring, setExpiring] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [competencies, setCompetencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('certifications'); // 'certifications' | 'requirements' | 'expiring'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal states
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [isReqModalOpen, setIsReqModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [certForm, setCertForm] = useState({
    employee: '',
    requirement: '',
    issue_date: new Date().toISOString().split('T')[0],
    expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    certificate_url: ''
  });

  const [reqForm, setReqForm] = useState({
    requirement_name: '',
    validity_months: 12,
    program: '',
    competency: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [certsData, reqsData, expData, empsData, progsData, compsData] = await Promise.allSettled([
        api.compliance.getCertifications(),
        api.compliance.getRequirements(),
        api.compliance.getExpiring(),
        api.organizations.getEmployees(),
        api.training.getPrograms(),
        api.competencies.getCompetencies()
      ]);

      if (certsData.status === 'fulfilled') setCertifications(certsData.value || []);
      if (reqsData.status === 'fulfilled') setRequirements(reqsData.value || []);
      if (expData.status === 'fulfilled') setExpiring(expData.value || []);
      if (empsData.status === 'fulfilled') setEmployees(empsData.value || []);
      if (progsData.status === 'fulfilled') setPrograms(progsData.value || []);
      if (compsData.status === 'fulfilled') setCompetencies(compsData.value || []);
    } catch (err) {
      console.error('Error loading compliance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCert = async (e) => {
    e.preventDefault();
    if (!certForm.employee || !certForm.requirement) {
      alert('Please select both an employee and a compliance requirement.');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.compliance.createCertification(certForm);
      setIsCertModalOpen(false);
      setCertForm({
        employee: '',
        requirement: '',
        issue_date: new Date().toISOString().split('T')[0],
        expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        certificate_url: ''
      });
      await loadData();
    } catch (err) {
      alert('Failed to register certification: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateReq = async (e) => {
    e.preventDefault();
    if (!reqForm.requirement_name) {
      alert('Requirement name is required.');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.compliance.createRequirement({
        requirement_name: reqForm.requirement_name,
        validity_months: parseInt(reqForm.validity_months, 10) || 12,
        program: reqForm.program || null,
        competency: reqForm.competency || null
      });
      setIsReqModalOpen(false);
      setReqForm({ requirement_name: '', validity_months: 12, program: '', competency: '' });
      await loadData();
    } catch (err) {
      alert('Failed to add compliance requirement: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDaysRemaining = (expiryDate) => {
    if (!expiryDate) return 0;
    const diff = new Date(expiryDate) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const filteredCerts = certifications.filter((cert) => {
    const term = searchTerm.toLowerCase();
    const empMatch = (cert.employee_name || '').toLowerCase().includes(term);
    const reqMatch = (cert.requirement_name || '').toLowerCase().includes(term);
    const matchesSearch = empMatch || reqMatch;

    const days = getDaysRemaining(cert.expiry_date);
    if (statusFilter === 'EXPIRING_SOON') return matchesSearch && days <= 30 && days >= 0;
    if (statusFilter === 'EXPIRED') return matchesSearch && days < 0;
    if (statusFilter === 'VALID') return matchesSearch && days > 30;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#142d22] via-[#1b3d2f] to-[#25503e] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-emerald-800/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/25 text-xs font-bold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Statutory Insurance Governance &amp; Regulatory Standing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Certifications &amp; Compliance Hub
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            Connected to official TNA compliance endpoints. Manage TIRA accreditation, AML/CFT compliance, data privacy certifications, and early warning expirations.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            onClick={() => setIsCertModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-950/30 transition-all"
          >
            <Plus className="w-4 h-4" /> Issue Certification
          </button>
          <button
            onClick={() => setIsReqModalOpen(true)}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Requirement
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Active Certifications</span>
            <span className="text-2xl font-extrabold text-slate-900 font-mono">{certifications.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Mandatory Frameworks</span>
            <span className="text-2xl font-extrabold text-slate-900 font-mono">{requirements.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Expiring (&le; 30 Days)</span>
            <span className="text-2xl font-extrabold text-amber-700 font-mono">{expiring.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        {[
          { id: 'certifications', label: `Employee Certifications (${certifications.length})`, icon: Award },
          { id: 'requirements', label: `Compliance Requirements (${requirements.length})`, icon: FileText },
          { id: 'expiring', label: `Expiring Audits (${expiring.length})`, icon: AlertTriangle },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 pb-3 px-4 font-bold text-xs uppercase tracking-wider transition-all border-b-2 ${
              activeTab === tab.id
                ? 'border-[#1b3d2f] text-[#1b3d2f] bg-emerald-50/50 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-12 text-center flex justify-center items-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#264033]" />
        </div>
      ) : (
        <>
          {/* TAB 1: EMPLOYEE CERTIFICATIONS */}
          {activeTab === 'certifications' && (
            <div className="space-y-4">
              {/* Search & Filter Toolbar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search by employee or certification..."
                    className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#264033] transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <select
                    className="px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-xs font-semibold focus:outline-none"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="All">All Statuses</option>
                    <option value="VALID">Valid</option>
                    <option value="EXPIRING_SOON">Expiring Soon (&le; 30 Days)</option>
                    <option value="EXPIRED">Expired</option>
                  </select>
                  <button
                    onClick={loadData}
                    className="p-2 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600"
                    title="Refresh from API"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Certifications Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50/80 text-slate-500 text-[11px] uppercase tracking-widest font-bold">
                    <tr>
                      <th className="px-6 py-4">Employee</th>
                      <th className="px-6 py-4">Certification / Regulation</th>
                      <th className="px-6 py-4">Issue Date</th>
                      <th className="px-6 py-4">Expiry Date</th>
                      <th className="px-6 py-4">Validity Standing</th>
                      <th className="px-6 py-4 text-right">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCerts.length > 0 ? (
                      filteredCerts.map((cert) => {
                        const days = getDaysRemaining(cert.expiry_date);
                        const isExpired = days < 0;
                        const isExpiringSoon = days <= 30 && days >= 0;

                        return (
                          <tr key={cert.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-6 py-4">
                              <p className="text-sm font-bold text-slate-900">{cert.employee_name || 'Staff'}</p>
                              <span className="text-[10px] text-slate-400">TNA Reg Employee</span>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-xs font-bold text-slate-900">{cert.requirement_name}</p>
                            </td>
                            <td className="px-6 py-4 text-xs font-mono text-slate-600">
                              {cert.issue_date}
                            </td>
                            <td className="px-6 py-4 text-xs font-mono text-slate-600">
                              {cert.expiry_date}
                            </td>
                            <td className="px-6 py-4">
                              {isExpired ? (
                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-900 border border-red-200 flex items-center gap-1 w-fit">
                                  <AlertTriangle className="w-3 h-3 text-red-700" /> Expired
                                </span>
                              ) : isExpiringSoon ? (
                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1 w-fit">
                                  <Clock className="w-3 h-3 text-amber-700" /> {days} Days Left
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-200 flex items-center gap-1 w-fit">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Valid ({days} Days)
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              {cert.certificate_url ? (
                                <a
                                  href={cert.certificate_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs font-bold text-[#1b3d2f] hover:underline inline-flex items-center gap-1"
                                >
                                  Certificate <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : (
                                <span className="text-xs text-slate-400 italic">No URL</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                          No certifications registered matching current criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: COMPLIANCE REQUIREMENTS */}
          {activeTab === 'requirements' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {requirements.length > 0 ? (
                requirements.map((req) => (
                  <div key={req.id} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Regulatory Standard
                      </span>
                      <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 font-mono">
                        {req.validity_months} Months Validity
                      </span>
                    </div>

                    <h4 className="text-base font-extrabold text-slate-900">{req.requirement_name}</h4>

                    <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Mapped Competency:</span>
                        <span className="font-bold text-slate-800">{req.competency ? `Comp #${req.competency}` : 'General Insurance'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Training Program:</span>
                        <span className="font-bold text-slate-800">{req.program ? `Prog #${req.program}` : 'Mandatory Induction'}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
                  No compliance requirements currently defined. Click &ldquo;Add Requirement&rdquo; to establish standards.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: EXPIRING AUDITS */}
          {activeTab === 'expiring' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Certifications Expiring Within 30 Days</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Immediate operational risk. Employees below require scheduled refresher training to maintain organizational compliance standing.
                </p>
              </div>

              {expiring.length > 0 ? (
                <div className="space-y-3">
                  {expiring.map((cert) => (
                    <div key={cert.id} className="p-4 rounded-xl border border-amber-300 bg-amber-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{cert.employee_name} · {cert.requirement_name}</p>
                        <p className="text-xs text-amber-800 mt-0.5 font-mono">
                          Expires on: {cert.expiry_date} ({getDaysRemaining(cert.expiry_date)} days remaining)
                        </p>
                      </div>
                      <a
                        href="/admin/tna/request"
                        className="px-3 py-1.5 bg-[#264033] hover:bg-[#1a2d24] text-white text-xs font-bold rounded-lg transition-colors shrink-0 text-center"
                      >
                        Trigger Renewal Request
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-800">All Employee Certifications Are Up to Date</p>
                  <p className="text-xs text-slate-400">No regulatory certifications expiring within the next 30 days.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* MODAL: ISSUE CERTIFICATION */}
      {isCertModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto" role="dialog">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5 my-auto">
            <h3 className="text-lg font-bold text-slate-900">Record Employee Certification</h3>
            <form onSubmit={handleCreateCert} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-700">Select Employee</label>
                <select
                  required
                  value={certForm.employee}
                  onChange={(e) => setCertForm({ ...certForm, employee: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="">Select an employee...</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.full_name || `${emp.first_name} ${emp.last_name}`} ({emp.username})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-700">Compliance Requirement</label>
                <select
                  required
                  value={certForm.requirement}
                  onChange={(e) => setCertForm({ ...certForm, requirement: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="">Select a requirement standard...</option>
                  {requirements.map((req) => (
                    <option key={req.id} value={req.id}>{req.requirement_name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-700">Issue Date</label>
                  <input
                    type="date"
                    required
                    value={certForm.issue_date}
                    onChange={(e) => setCertForm({ ...certForm, issue_date: e.target.value })}
                    className="w-full mt-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-700">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={certForm.expiry_date}
                    onChange={(e) => setCertForm({ ...certForm, expiry_date: e.target.value })}
                    className="w-full mt-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-700">Certificate Document URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={certForm.certificate_url}
                  onChange={(e) => setCertForm({ ...certForm, certificate_url: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCertModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-[#264033] hover:bg-[#1a2d24] text-white disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Certification'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL: ADD COMPLIANCE REQUIREMENT */}
      {isReqModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto" role="dialog">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5 my-auto">
            <h3 className="text-lg font-bold text-slate-900">Create Compliance Requirement Standard</h3>
            <form onSubmit={handleCreateReq} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-700">Requirement Standard Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TIRA Annual Solvency Compliance"
                  value={reqForm.requirement_name}
                  onChange={(e) => setReqForm({ ...reqForm, requirement_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-700">Validity Period (Months)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  required
                  value={reqForm.validity_months}
                  onChange={(e) => setReqForm({ ...reqForm, validity_months: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsReqModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-[#264033] hover:bg-[#1a2d24] text-white disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Standard'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ComplianceManagement;
