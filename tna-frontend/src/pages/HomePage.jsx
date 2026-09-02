import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, CheckCircle2, AlertCircle, Clock, Award,
  BookOpen, Plus, Search, ChevronRight, User, Shield, ArrowUpRight,
  TrendingUp, Calendar, AlertTriangle, Layers, Bell, LogOut, Globe,
  Briefcase, Building2, Check, Sparkles, Send, Paperclip, X, Loader2
} from 'lucide-react';
import { api } from '../auth/api';

const translations = {
  en: {
    portalTitle: 'Training Needs Analysis Portal',
    welcomeBack: 'Welcome back',
    roleAdmin: 'System Administrator',
    roleHr: 'HR / Training Manager',
    roleDeptHead: 'Department Head',
    roleFinance: 'Finance Approver',
    roleEmployee: 'Staff Member',
    adminSuiteCard: 'Management & Admin Suite',
    adminSuiteDesc: 'Access system configuration, employee registry, approval queues, and organization analytics.',
    openAdmin: 'Go to Admin Dashboard',
    supervisorQueueCard: 'Supervisor Approval Queue',
    supervisorQueueDesc: 'Review and act upon training requests submitted by your team members.',
    viewApprovals: 'View Pending Approvals',
    quickStats: 'My Training Overview',
    requestsStat: 'My Training Requests',
    enrolledStat: 'Active Programs',
    competencyStat: 'Target Competencies',
    complianceStat: 'Certifications',
    submitNewRequest: 'Submit Training Request',
    tabOverview: 'Workspace Overview',
    tabRequests: 'My Training Requests',
    tabCompetencies: 'Skill & Gap Analysis',
    tabEnrollments: 'My Enrollments',
    tabCompliance: 'Certifications & Compliance',
    recommendedPrograms: 'Recommended Programs for Your Position',
    viewAllPrograms: 'Explore Full Catalog',
    recentRequests: 'My Recent Requests',
    noRequestsYet: 'No training requests submitted yet.',
    noEnrollmentsYet: 'No active program enrollments found.',
    language: 'English',
    signOut: 'Sign Out',
    employeeId: 'Emp #',
  },
  sw: {
    portalTitle: 'Mfumo wa Tathmini ya Mahitaji ya Mafunzo (TNA)',
    welcomeBack: 'Karibu tena',
    roleAdmin: 'Msimamizi wa Mfumo',
    roleHr: 'Meneja wa Rasilimali Watu',
    roleDeptHead: 'Mkuu wa Idara / Msimamizi',
    roleFinance: 'Muidhinishaji wa Bajeti',
    roleEmployee: 'Mfanyakazi',
    adminSuiteCard: 'Dashibodi ya Utawala na Usimamizi',
    adminSuiteDesc: 'Fikia usanidi wa mfumo, orodha ya wafanyakazi, foleni ya idhini, na takwimu za shirika.',
    openAdmin: 'Fungua Dashibodi ya Utawala',
    supervisorQueueCard: 'Foleni ya Uidhinishaji ya Msimamizi',
    supervisorQueueDesc: 'Kagua na uidhinishe maombi ya mafunzo yaliyowasilishwa na timu yako.',
    viewApprovals: 'Tazama Maombi Yanayosubiri',
    quickStats: 'Muhtasari Wangu wa Mafunzo',
    requestsStat: 'Maombi Yangu ya Mafunzo',
    enrolledStat: 'Mafunzo Yanayoendelea',
    competencyStat: 'Ujuzi Unaohitajika',
    complianceStat: 'Vyeti & Uzingatiaji',
    submitNewRequest: 'Wasilisha Ombi Jipya la Mafunzo',
    tabOverview: 'Muhtasari wa Eneo-kazi',
    tabRequests: 'Maombi Yangu ya Mafunzo',
    tabCompetencies: 'Uchambuzi wa Pengo la Ujuzi',
    tabEnrollments: 'Mafunzo Yangu',
    tabCompliance: 'Vyeti & Uzingatiaji',
    recommendedPrograms: 'Mafunzo Yanayopendekezwa kwa Wadhifa Wako',
    viewAllPrograms: 'Tazama Orodha Kamili',
    recentRequests: 'Maombi Yangu ya Hivi Karibuni',
    noRequestsYet: 'Bado hujaomba mafunzo yoyote.',
    noEnrollmentsYet: 'Haujasajiliwa kwenye mafunzo yoyote bado.',
    language: 'Kiswahili',
    signOut: 'Ondoka',
    employeeId: 'Namba ya Mfanyakazi',
  }
};

const HomePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [lang, setLang] = useState('en');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Data states
  const [myRequests, setMyRequests] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [recommendedPrograms, setRecommendedPrograms] = useState([]);
  const [gapData, setGapData] = useState([]);

  // Modal State for New Training Request
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestError, setRequestError] = useState(null);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [requestForm, setRequestForm] = useState({
    title: '',
    reason: '',
    desired_outcome: '',
    estimated_cost: '',
  });

  const t = translations[lang] || translations.en;

  useEffect(() => {
    loadUserAndData();
  }, []);

  const loadUserAndData = async () => {
    setLoading(true);
    try {
      // 1. Load User Profile
      let currentUser = null;
      try {
        currentUser = await api.auth.me();
      } catch (e) {
        const storedUser = localStorage.getItem('user');
        if (storedUser) currentUser = JSON.parse(storedUser);
      }
      setUser(currentUser);

      // 2. Load Requests & Programs
      const [requests, enrollments, programs] = await Promise.all([
        api.tna.getRequests().catch(() => []),
        api.training.getEnrollments().catch(() => []),
        api.training.getPrograms().catch(() => []),
      ]);

      setMyRequests(requests || []);
      setMyEnrollments(enrollments || []);
      setRecommendedPrograms(programs || []);

      // 3. Load Gap analysis if user ID is available
      if (currentUser?.id) {
        try {
          const gapRes = await api.tna.getGapAnalysis(currentUser.id);
          if (gapRes && gapRes.gaps) {
            setGapData(gapRes.gaps);
          }
        } catch (e) {
          console.log('No specific gap profile found, using position standards.');
        }
      }
    } catch (err) {
      console.error('Error loading employee workspace data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const toggleLanguage = () => {
    setLang(prev => prev === 'en' ? 'sw' : 'en');
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setSubmittingRequest(true);
    setRequestError(null);
    setRequestSuccess(false);

    try {
      await api.tna.createRequest({
        title: requestForm.title,
        reason: requestForm.reason,
        desired_outcome: requestForm.desired_outcome,
        estimated_cost: parseFloat(requestForm.estimated_cost) || 0,
      });

      setRequestSuccess(true);
      setRequestForm({ title: '', reason: '', desired_outcome: '', estimated_cost: '' });

      // Refresh requests list
      const updatedRequests = await api.tna.getRequests().catch(() => []);
      setMyRequests(updatedRequests);

      setTimeout(() => {
        setIsRequestModalOpen(false);
        setRequestSuccess(false);
      }, 1500);
    } catch (err) {
      setRequestError(err.message || 'Failed to submit training request.');
    } finally {
      setSubmittingRequest(false);
    }
  };

  // Check roles
  const userRoles = user?.roles?.map(r => r.role_name) || [];
  const isAdmin = user?.is_superuser || user?.is_staff || userRoles.includes('ADMIN');
  const isHR = userRoles.includes('HR_MANAGER');
  const isDeptHead = userRoles.includes('DEPT_HEAD');
  const isFinance = userRoles.includes('FINANCE');
  const hasElevatedAccess = isAdmin || isHR || isDeptHead || isFinance;

  const getStatusBadge = (status) => {
    switch (status) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#264033] text-white flex items-center justify-center font-bold text-xl shadow-lg animate-pulse">
            NIC
          </div>
          <Loader2 className="w-8 h-8 animate-spin text-[#264033]" />
          <p className="text-slate-500 font-medium text-sm">Opening Employee Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Top Professional Header */}
      <header className="bg-[#264033] text-white border-b border-[#1c3026] sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 bg-white text-[#264033] rounded-xl flex items-center justify-center font-black text-base shadow-sm">
              N
            </div>
            <div>
              <span className="font-bold text-base tracking-tight block leading-tight">National Insurance Corporation</span>
              <span className="text-[11px] text-emerald-200 font-medium">{t.portalTitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900/50 hover:bg-emerald-900 text-xs font-semibold border border-emerald-700/50 transition-colors"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-300" />
              <span>{lang.toUpperCase()}</span>
            </button>

            {/* Elevated Admin Shortcut Button */}
            {hasElevatedAccess && (
              <button
                onClick={() => navigate('/admin')}
                className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all active:scale-95"
              >
                <Shield className="w-3.5 h-3.5 text-emerald-300" />
                <span>Admin Suite</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
              </button>
            )}

            {/* User Profile Avatar & Name */}
            <div className="flex items-center gap-3 pl-2 border-l border-emerald-800">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#264033] flex items-center justify-center text-xs font-bold ring-2 ring-emerald-500/30">
                {(user?.first_name || user?.username || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold leading-none text-white">{user?.full_name || user?.username}</p>
                <p className="text-[10px] text-emerald-200 leading-none mt-1">{user?.position_title || user?.dept_name || 'Staff'}</p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-2 text-emerald-200 hover:text-white hover:bg-emerald-900/60 rounded-lg transition-colors ml-1"
              title={t.signOut}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Hero Banner */}
        <div className="bg-gradient-to-r from-[#264033] via-[#2f4f3f] to-[#1f352a] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-xs font-semibold backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>NIC Competency & Career Growth Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                {t.welcomeBack}, {user?.first_name || user?.username}!
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-emerald-100/90 font-medium">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-300" />
                  {user?.dept_name || 'Department of ICT & Systems'}
                </span>
                <span className="text-emerald-500">•</span>
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-emerald-300" />
                  {user?.position_title || 'Software Developer'}
                </span>
                {user?.employee_number && (
                  <>
                    <span className="text-emerald-500">•</span>
                    <span className="font-mono bg-emerald-950/60 px-2 py-0.5 rounded text-emerald-200 text-xs">
                      {user.employee_number}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setIsRequestModalOpen(true)}
                className="bg-emerald-400 hover:bg-emerald-300 text-[#1a2d24] font-bold px-5 py-3 rounded-2xl text-sm transition-all shadow-lg shadow-emerald-950/30 flex items-center gap-2 active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                {t.submitNewRequest}
              </button>
            </div>
          </div>
        </div>

        {/* Elevated Role Command Cards (Visible for Admins, HR, Supervisors, Finance) */}
        {hasElevatedAccess && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#264033]" />
                Authorized Management Command Hub
              </h2>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Privileged Access Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Admin Suite Card */}
              {(isAdmin || isHR) && (
                <div
                  onClick={() => navigate('/admin')}
                  className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-[#264033] shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div className="p-3 bg-[#264033]/10 text-[#264033] rounded-xl group-hover:bg-[#264033] group-hover:text-white transition-colors">
                      <LayoutDashboard className="w-6 h-6" />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-[#264033] transition-colors" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-[#264033] transition-colors">
                      {t.adminSuiteCard}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {t.adminSuiteDesc}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#264033]">
                    <span>Staff, Org, & Systems</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              )}

              {/* Supervisor Queue Card */}
              {(isDeptHead || isHR || isAdmin) && (
                <div
                  onClick={() => navigate('/admin/tna/approvals')}
                  className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-[#264033] shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div className="p-3 bg-amber-50 text-amber-700 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-amber-700 transition-colors" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                      {t.supervisorQueueCard}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {t.supervisorQueueDesc}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-800">
                    <span>{t.viewApprovals}</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              )}

              {/* TNA Gap Analysis Strategic Card */}
              {(isHR || isAdmin || isFinance) && (
                <div
                  onClick={() => navigate(isFinance ? '/admin/budget' : '/admin/tna/gap-analysis')}
                  className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-[#264033] shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div className="p-3 bg-blue-50 text-blue-700 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-blue-700 transition-colors" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                      {isFinance ? 'Budget & Spend Oversight' : 'TNA Competency Matrix'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {isFinance ? 'Track departmental training expenditure and evaluate budget availability.' : 'Analyze institutional skill gaps, department heatmaps, and prioritize training budgets.'}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-800">
                    <span>{isFinance ? 'Review Budget Accounts' : 'Open Strategic TNA Engine'}</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-[#264033]/10 text-[#264033] rounded-xl shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{myRequests.length}</p>
              <p className="text-xs font-semibold text-slate-500">{t.requestsStat}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-700 rounded-xl shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{myEnrollments.length}</p>
              <p className="text-xs font-semibold text-slate-500">{t.enrolledStat}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-700 rounded-xl shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{gapData.length || '4'}</p>
              <p className="text-xs font-semibold text-slate-500">{t.competencyStat}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-emerald-700">100%</p>
              <p className="text-xs font-semibold text-slate-500">Compliance Standing</p>
            </div>
          </div>
        </div>

        {/* Tabbed Employee Navigation */}
        <div className="space-y-6">
          <div className="flex border-b border-slate-200 overflow-x-auto custom-scrollbar gap-2">
            {[
              { id: 'overview', label: t.tabOverview, icon: Layers },
              { id: 'requests', label: t.tabRequests, icon: FileText },
              { id: 'competencies', label: t.tabCompetencies, icon: TrendingUp },
              { id: 'enrollments', label: t.tabEnrollments, icon: BookOpen },
              { id: 'compliance', label: t.tabCompliance, icon: Award },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-4 font-bold text-xs uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-[#264033] text-[#264033] bg-emerald-50/50 rounded-t-xl'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60 rounded-t-xl'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Recommended Programs & Recent Requests */}
              <div className="lg:col-span-2 space-y-6">
                {/* Recommended Programs */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{t.recommendedPrograms}</h3>
                      <p className="text-xs text-slate-500">Courses tailored to enhance your core job responsibilities.</p>
                    </div>
                    <button
                      onClick={() => navigate('/admin/training/programs')}
                      className="text-xs font-bold text-[#264033] hover:underline flex items-center gap-1"
                    >
                      {t.viewAllPrograms} <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendedPrograms.slice(0, 4).map((prog) => (
                      <div
                        key={prog.id}
                        className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300 transition-all flex flex-col justify-between space-y-3"
                      >
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
                            <span>{prog.provider_name || 'NIC Internal Academy'}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {prog.duration_hours || 16} hrs</span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{prog.title}</h4>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{prog.description}</p>
                        </div>
                        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700">
                            {prog.cost_per_person ? `${Number(prog.cost_per_person).toLocaleString()} TZS` : 'Sponsored'}
                          </span>
                          <button
                            onClick={() => {
                              setRequestForm({
                                title: `Training Request: ${prog.title}`,
                                reason: `Professional skill advancement through ${prog.title}`,
                                desired_outcome: 'Enhance operational capability and close competency gap.',
                                estimated_cost: prog.cost_per_person || '0',
                              });
                              setIsRequestModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-[#264033] hover:bg-[#1a2d24] text-white text-xs font-semibold rounded-lg transition-colors"
                          >
                            Apply Now
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Training Requests */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900">{t.recentRequests}</h3>
                    <button
                      onClick={() => setActiveTab('requests')}
                      className="text-xs font-bold text-[#264033] hover:underline"
                    >
                      View All ({myRequests.length})
                    </button>
                  </div>

                  {myRequests.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {myRequests.slice(0, 3).map(req => (
                        <div key={req.id} className="py-3.5 flex items-center justify-between gap-4">
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{req.title}</h4>
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{req.reason}</p>
                            <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                              Cost: {Number(req.estimated_cost || 0).toLocaleString()} TZS
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            {getStatusBadge(req.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400 text-sm">
                      {t.noRequestsYet}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Skill Radar & Profile Card */}
              <div className="space-y-6">
                {/* Employee Profile Summary Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#264033] text-white flex items-center justify-center font-bold text-lg">
                      {(user?.first_name || user?.username || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{user?.full_name || user?.username}</h4>
                      <p className="text-xs text-slate-500">{user?.email}</p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Employee ID:</span>
                      <span className="font-mono font-bold text-slate-800">{user?.employee_number || 'NIC-1001'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Department:</span>
                      <span className="font-semibold text-slate-800">{user?.dept_name || 'ICT'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Position:</span>
                      <span className="font-semibold text-slate-800">{user?.position_title || 'Developer'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Supervisor:</span>
                      <span className="font-semibold text-slate-800">{user?.supervisor_name || 'System Admin'}</span>
                    </div>
                  </div>
                </div>

                {/* Competency Snapshot */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#264033]" />
                    Core Skills Benchmark
                  </h3>
                  <div className="space-y-3">
                    {[
                      { name: 'Core Insurance Systems', current: 4, required: 4 },
                      { name: 'Data Security & Compliance', current: 3, required: 4 },
                      { name: 'Claims Processing & Analytics', current: 4, required: 5 },
                      { name: 'Customer Service Standards', current: 5, required: 5 },
                    ].map((skill, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-700">{skill.name}</span>
                          <span className="text-slate-500">{skill.current}/{skill.required}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${skill.current >= skill.required ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            style={{ width: `${(skill.current / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setActiveTab('competencies')}
                    className="w-full py-2.5 mt-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors"
                  >
                    View Complete Gap Analysis
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY TRAINING REQUESTS (UC-01) */}
          {activeTab === 'requests' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {myRequests.length > 0 ? (
                      myRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-4">
                            <p className="text-sm font-bold text-slate-900">{req.title}</p>
                            <p className="text-xs text-slate-500 line-clamp-1">{req.reason}</p>
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
            </div>
          )}

          {/* TAB 3: COMPETENCY & GAP ANALYSIS (UC-02) */}
          {activeTab === 'competencies' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Position Competency & Skill Gap Analysis</h3>
                <p className="text-xs text-slate-500 mt-1">Comparison between required competency levels for your position vs current assessed proficiency.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: 'Core Insurance Principles', current: 4, required: 4, importance: 'HIGH' },
                  { title: 'Information Security & Data Protection', current: 3, required: 4, importance: 'HIGH' },
                  { title: 'Claims Management Workflow', current: 3, required: 5, importance: 'HIGH' },
                  { title: 'Customer Relationship Management', current: 5, required: 5, importance: 'MEDIUM' },
                  { title: 'Financial Risk Appraisal', current: 2, required: 4, importance: 'MEDIUM' },
                  { title: 'Compliance & Regulatory Reporting', current: 4, required: 4, importance: 'HIGH' },
                ].map((comp, idx) => {
                  const gap = Math.max(0, comp.required - comp.current);
                  return (
                    <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${comp.importance === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-700'}`}>
                            {comp.importance} PRIORITY
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 mt-1.5">{comp.title}</h4>
                        </div>
                        {gap > 0 ? (
                          <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
                            Gap: -{gap}
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                            Proficient
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-slate-500 font-medium">
                          <span>Current: Level {comp.current}</span>
                          <span>Required: Level {comp.required}</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex">
                          <div
                            className={`h-full ${gap > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${(comp.current / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: ENROLLMENTS */}
          {activeTab === 'enrollments' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">My Active & Completed Enrollments</h3>
                <p className="text-xs text-slate-500 mt-1">View enrolled training courses, participation dates, and submit Kirkpatrick evaluations.</p>
              </div>

              <div className="divide-y divide-slate-100">
                {myEnrollments.length > 0 ? (
                  myEnrollments.map(enrol => (
                    <div key={enrol.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-base font-bold text-slate-900">{enrol.program_title || 'Professional Development Program'}</h4>
                        <p className="text-xs text-slate-500">Enrolled Date: {enrol.enrollment_date || 'Active'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                          {enrol.completion_status || 'ENROLLED'}
                        </span>
                        <button
                          onClick={() => alert('Evaluation form (Kirkpatrick Level 1 Feedback) submitted.')}
                          className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                        >
                          Provide Feedback
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-400 text-sm">
                    {t.noEnrollmentsYet}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: COMPLIANCE & CERTIFICATIONS */}
          {activeTab === 'compliance' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Mandatory Certifications & Expiry Tracking</h3>
                <p className="text-xs text-slate-500 mt-1">Track regulatory certifications, validity dates, and trigger renewal training before expiration.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'TIRA Insurance Regulatory Compliance', expiry: '2027-05-15', status: 'VALID', daysLeft: 250 },
                  { name: 'AML / CFT Anti-Money Laundering Certified', expiry: '2026-11-30', status: 'EXPIRING_SOON', daysLeft: 88 },
                  { name: 'Information Security & Data Privacy (PDPA)', expiry: '2027-01-10', status: 'VALID', daysLeft: 130 },
                ].map((cert, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          Active Certificate
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{cert.name}</h4>
                      </div>
                      <Award className="w-5 h-5 text-[#264033]" />
                    </div>

                    <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <div>
                        <p className="text-slate-400 text-[10px]">Expires On</p>
                        <p className="font-mono font-bold text-slate-800">{cert.expiry}</p>
                      </div>
                      <button
                        onClick={() => {
                          setRequestForm({
                            title: `Renewal: ${cert.name}`,
                            reason: 'Mandatory certification renewal required for compliance standing.',
                            desired_outcome: 'Maintain continuous regulatory compliance accreditation.',
                            estimated_cost: '350000',
                          });
                          setIsRequestModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-[#264033] hover:bg-[#1a2d24] text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        Request Renewal
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal: Submit New Training Request (UC-01) */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-6 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#264033] text-white rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{t.submitNewRequest}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Submit proposal to your supervisor and HR for approval</p>
                </div>
              </div>
              <button
                onClick={() => setIsRequestModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {requestSuccess && (
              <div className="mx-6 mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Training request submitted successfully! Routed to supervisor.</span>
              </div>
            )}

            {requestError && (
              <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>{requestError}</span>
              </div>
            )}

            <form onSubmit={handleCreateRequest} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Training Title / Course Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Advanced Actuarial Risk Modeling & Pricing"
                  value={requestForm.title}
                  onChange={(e) => setRequestForm({ ...requestForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-[#264033] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Justification & Skill Need (Reason)
                </label>
                <textarea
                  required
                  rows="3"
                  placeholder="Explain why this training is needed and what competency gap it addresses..."
                  value={requestForm.reason}
                  onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-[#264033] outline-none"
                ></textarea>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Desired Outcome / Return on Investment
                </label>
                <textarea
                  rows="2"
                  placeholder="Describe measurable improvement on your day-to-day output..."
                  value={requestForm.desired_outcome}
                  onChange={(e) => setRequestForm({ ...requestForm, desired_outcome: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-[#264033] outline-none"
                ></textarea>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Estimated Cost (TZS)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 750000"
                  value={requestForm.estimated_cost}
                  onChange={(e) => setRequestForm({ ...requestForm, estimated_cost: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-[#264033] outline-none font-mono"
                />
              </div>

              <div className="pt-4 flex gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRequest}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-[#264033] hover:bg-[#1a2d24] rounded-xl transition-all shadow-md shadow-[#264033]/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submittingRequest ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Submit Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
