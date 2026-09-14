import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, CheckCircle2, AlertCircle, Clock, Award,
  BookOpen, Plus, Search, ChevronRight, User, Shield, ArrowUpRight,
  TrendingUp, Calendar, AlertTriangle, Layers, Bell, LogOut, Globe,
  Briefcase, Building2, Check, Sparkles, Loader2, MessageSquare, Sun, Moon,
  ArrowRight, GraduationCap, Target, ShieldCheck, CheckCircle
} from 'lucide-react';
import { api } from '../auth/api';
import TrainingRequestForm from './tna/TrainingRequestForm';
import TrainingRequests from './tna/TrainingRequests';
import RequestApprovalQueue from './tna/RequestApprovalQueue';
import KnowledgeAssistant from './KnowledgeAssistant';

export const translations = {
  en: {
    portalTitle: 'Training Needs Analysis Portal',
    welcomeBack: 'Welcome back',
    greetingMorning: 'Good morning',
    greetingAfternoon: 'Good afternoon',
    greetingEvening: 'Good evening',
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
    complianceStat: 'Compliance Standing',
    submitNewRequest: 'Submit Training Request',
    tabOverview: 'Workspace Overview',
    tabRequests: 'My Training Requests',
    tabRequestsApproval: 'Requests Approval',
    tabCompetencies: 'Skill & Gap Analysis',
    tabEnrollments: 'My Enrollments',
    tabCompliance: 'Certifications & Compliance',
    tabAssistant: 'Knowledge Assistant',
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
    greetingMorning: 'Habari za asubuhi',
    greetingAfternoon: 'Habari za mchana',
    greetingEvening: 'Habari za jioni',
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
    complianceStat: 'Uzingatiaji wa Vyeti',
    submitNewRequest: 'Wasilisha Ombi Jipya la Mafunzo',
    tabOverview: 'Muhtasari wa Eneo-kazi',
    tabRequests: 'Maombi Yangu ya Mafunzo',
    tabRequestsApproval: 'Maombi Yanayoidhinishwa',
    tabCompetencies: 'Uchambuzi wa Pengo la Ujuzi',
    tabEnrollments: 'Mafunzo Yangu',
    tabCompliance: 'Vyeti & Uzingatiaji',
    tabAssistant: 'Msaidizi wa Maarifa',
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
  const [certifications, setCertifications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  // Modal State for New Training Request
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestInitialData, setRequestInitialData] = useState({});

  const t = translations[lang] || translations.en;

  useEffect(() => {
    loadUserAndData();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const loadUserAndData = async () => {
    setLoading(true);
    try {
      // 1. Load User Profile
      let currentUser = null;
      try {
        currentUser = await api.auth.me();
      } catch {
        const storedUser = localStorage.getItem('user');
        if (storedUser) currentUser = JSON.parse(storedUser);
      }
      setUser(currentUser);

      // 2. Load Requests & Programs
      const [requests, enrollments, programs, employeeCertifications, userNotifications] = await Promise.all([
        api.tna.getMyRequests().catch(() => []),
        api.training.getEnrollments().catch(() => []),
        api.training.getPrograms().catch(() => []),
        api.compliance.getCertifications().catch(() => []),
        api.notifications.getMine().catch(() => []),
      ]);

      setMyRequests(requests || []);
      setMyEnrollments(enrollments || []);
      setRecommendedPrograms(programs || []);
      setCertifications(employeeCertifications || []);
      setNotifications(userNotifications || []);

      // 3. Load Gap analysis if user ID is available
      if (currentUser?.id) {
        try {
          const gapRes = await api.tna.getGapAnalysis(currentUser.id);
          if (gapRes && gapRes.gaps) {
            setGapData(gapRes.gaps);
          }
        } catch {
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
    setLang(prev => (prev === 'en' ? 'sw' : 'en'));
  };

  // Get dynamic time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t.greetingMorning;
    if (hour < 17) return t.greetingAfternoon;
    return t.greetingEvening;
  };

  // Check roles
  const userRoles = user?.roles?.map(r => r.role_name) || [];
  const isAdmin = user?.is_superuser || user?.is_staff || userRoles.includes('ADMIN');
  const isHR = userRoles.includes('HR_MANAGER');
  const isDeptHead = userRoles.includes('DEPT_HEAD');
  const isFinance = userRoles.includes('FINANCE');
  const isDirector = userRoles.includes('DIRECTOR');
  const hasElevatedAccess = isAdmin;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
          </span>
        );
      case 'PENDING_DEPT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/40">
            <Clock className="w-3.5 h-3.5" /> Dept Approval
          </span>
        );
      case 'PENDING_BUDGET':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300/40">
            <Clock className="w-3.5 h-3.5" /> Budget Review
          </span>
        );
      case 'HR_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300/40">
            <Clock className="w-3.5 h-3.5" /> HR Planning
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300/40">
            <AlertCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      case 'CHANGES_REQUESTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border border-orange-300/40">
            <AlertTriangle className="w-3.5 h-3.5" /> Changes Needed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {status || 'Submitted'}
          </span>
        );
    }
  };

  const getCertificationState = (expiryDate) => {
    const daysLeft = Math.ceil((new Date(expiryDate) - new Date()) / 86400000);
    if (daysLeft < 0) return { label: 'Expired', className: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900' };
    if (daysLeft <= 30) return { label: 'Expiring soon', className: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900' };
    return { label: 'Valid', className: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900' };
  };

  const validCertificationCount = certifications.filter((cert) => (
    new Date(cert.expiry_date) >= new Date()
  )).length;

  const unreadNotifications = notifications.filter((n) => !n.is_read).length;

  const toggleNotifications = async () => {
    const nextOpen = !showNotifications;
    setShowNotifications(nextOpen);
    if (nextOpen && unreadNotifications > 0) {
      await api.notifications.markRead().catch(() => { });
      setNotifications((current) => current.map((n) => ({ ...n, is_read: true })));
    }
  };

  const clearNotifications = async () => {
    await api.notifications.clear().catch(() => { });
    setNotifications([]);
    setShowNotifications(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen  bg-[#0d1a14] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-950/50">
            <img src="/logo/logo-light-streamline.png" alt="NIC" className="h-10 w-10 object-contain animate-pulse" />
          </div>
          <Loader2 className="w-7 h-7 animate-spin text-emerald-400" />
          <p className="text-emerald-200/80 font-medium text-sm">Opening Employee Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#f6f8fa] dark:bg-[#0b1410] text-slate-800 dark:text-slate-100 font-sans flex flex-col transition-colors duration-200">
      {/* Top Executive Header - Full Width */}
      <header className="bg-[#172d23] dark:bg-[#0f1d16] text-white border-b border-emerald-900/40 sticky top-0 z-40 shadow-lg backdrop-blur-md w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 h-16 flex items-center justify-between">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-28 items-center justify-center rounded-xl bg-white px-2 shadow-sm">
              <img src="/logo/logo-light-full.png" alt="National Insurance Corporation" className="max-h-8 w-full object-contain" />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-sm tracking-tight block leading-tight text-white">
                National Insurance Corporation
              </span>
              <span className="text-[11px] text-emerald-300 font-medium tracking-wide">
                {t.portalTitle}
              </span>
            </div>
          </div>

          {/* Header Controls & Profile */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-emerald-200/80 hover:text-white hover:bg-emerald-900/50 rounded-xl transition-all"
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              aria-label="Theme toggle"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Notifications Popover */}
            <div className="relative">
              <button
                onClick={toggleNotifications}
                className="relative p-2 text-emerald-200/80 hover:text-white hover:bg-emerald-900/50 rounded-xl transition-all"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-400 ring-2 ring-[#172d23]" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-slate-900 dark:text-slate-100 shadow-2xl animate-in fade-in slide-in-from-top-8">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-2 pb-2.5">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Notifications ({notifications.length})
                    </p>
                    {notifications.length > 0 && (
                      <button
                        type="button"
                        onClick={clearNotifications}
                        className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {notifications.length > 0 ? (
                      notifications.slice(0, 5).map((n) => (
                        <div key={n.id} className={`px-2 py-3 text-xs leading-5 ${!n.is_read ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                          {n.message}
                        </div>
                      ))
                    ) : (
                      <p className="px-2 py-6 text-xs text-center text-slate-400">No new notifications.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-900/40 hover:bg-emerald-900/70 text-xs font-bold text-emerald-200 border border-emerald-700/40 transition-all"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang.toUpperCase()}</span>
            </button>

            {/* Elevated Admin Hub Shortcut */}
            {hasElevatedAccess && (
              <button
                onClick={() => navigate('/admin')}
                className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition-all shadow-sm active:scale-95"
              >
                <Shield className="w-3.5 h-3.5 text-emerald-300" />
                <span>Admin Suite</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
              </button>
            )}

            {/* User Profile Pill */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-emerald-800/60">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-[#0f2118] flex items-center justify-center text-xs font-extrabold shadow-sm">
                {(user?.first_name || user?.username || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold leading-tight text-white truncate max-w-[140px]">
                  {user?.full_name || user?.username}
                </p>
                <p className="text-[10px] text-emerald-300/90 leading-tight truncate max-w-[140px]">
                  {user?.position_title || user?.dept_name || 'Staff Member'}
                </p>
              </div>
            </div>

            {/* Logout Action */}
            <button
              onClick={handleLogout}
              className="p-2 text-emerald-200/80 hover:text-white hover:bg-rose-900/30 hover:border-rose-700/40 rounded-xl transition-all"
              title={t.signOut}
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container - Full Screen Expansion */}
      <main className="flex-1 w-full px-4 bg-white  sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8 space-y-8">
        {/* Modern Curved Hero Banner */}
        <div className="relative rounded-3xl p-6 sm:p-8 md:p-10 text-white shadow-xl overflow-hidden bg-gradient-to-r from-[#142d22] via-[#1b3d2f] to-[#25503e] border border-emerald-800/30 w-full">
          {/* Subtle Ambient Mesh & Decorative Glow */}
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-emerald-400/5 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3.5 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/25 text-xs font-bold backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                <span>NIC Competency & Human Capital Development</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                {getGreeting()}, {user?.first_name || user?.username}!
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-normal max-w-2xl">
                Access tailored training programs, submit institutional skill requests, and monitor your career competency progress.
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-xs text-emerald-200/90 font-medium">
                <span className="flex items-center gap-1.5 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-800/40">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  {user?.dept_name || 'Department of ICT & Systems'}
                </span>
                <span className="flex items-center gap-1.5 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-800/40">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                  {user?.position_title || 'Software Developer'}
                </span>
                {user?.employee_number && (
                  <span className="font-mono bg-emerald-950/70 px-2.5 py-1 rounded-lg text-emerald-300 text-xs border border-emerald-700/40">
                    {t.employeeId}: {user.employee_number}
                  </span>
                )}
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => setIsRequestModalOpen(true)}
                className="bg-emerald-400 hover:bg-emerald-300 text-[#0c1f15] font-extrabold px-6 py-3.5 rounded-2xl text-sm transition-all shadow-xl shadow-emerald-950/40 flex items-center gap-2.5 active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>{t.submitNewRequest}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Privileged Management Command Hub - Expanded Full Width */}
        {hasElevatedAccess && (
          <div className="space-y-3.5 w-full ">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span className='dark:text-slate-400'>Authorized Management Command Hub</span>
              </h2>
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/60 px-3 py-0.5 rounded-full border border-emerald-300/40">
                Privileged Access Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 w-full">
              {/* Admin Suite Card */}
              {(isAdmin || isHR) && (
                <div
                  onClick={() => navigate('/admin')}
                  className="bg-white dark:bg-[#13221b] p-5.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-emerald-600 dark:hover:border-emerald-500 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-[#1b3d2f] dark:text-emerald-300 rounded-xl group-hover:bg-[#1b3d2f] group-hover:text-white transition-colors">
                      <LayoutDashboard className="w-5 h-5" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-emerald-800 dark:group-hover:text-emerald-300 transition-colors">
                      {t.adminSuiteCard}
                    </h3>
                    <p className="text-xs text-emerald-600 dark:text-slate-400 mt-1 line-clamp-2">
                      {t.adminSuiteDesc}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-400">
                    <span>Staff, Org, & Systems</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              )}

              {/* Supervisor Queue Card */}
              {(isDeptHead || isHR || isAdmin) && (
                <div
                  onClick={() => navigate('/admin/tna/approvals')}
                  className="bg-white dark:bg-[#13221b] p-5.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-amber-500 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-700 transition-colors" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-amber-800 dark:group-hover:text-amber-300 transition-colors">
                      {t.supervisorQueueCard}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {t.supervisorQueueDesc}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-amber-800 dark:text-amber-400">
                    <span>{t.viewApprovals}</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              )}

              {/* TNA Gap Analysis Strategic Card */}
              {(isHR || isAdmin || isFinance) && (
                <div
                  onClick={() => navigate(isFinance ? '/admin/budget' : '/admin/tna/gap-analysis')}
                  className="bg-white dark:bg-[#13221b] p-5.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-blue-500 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 transition-colors" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-blue-800 dark:group-hover:text-blue-300 transition-colors">
                      {isFinance ? 'Budget & Spend Oversight' : 'TNA Competency Matrix'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {isFinance ? 'Track departmental training expenditure and evaluate budget availability.' : 'Analyze institutional skill gaps, department heatmaps, and prioritize training budgets.'}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-blue-800 dark:text-blue-400">
                    <span>{isFinance ? 'Review Budget Accounts' : 'Open Strategic TNA Engine'}</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Stats Grid - Expanded Full Width */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
          <div className="bg-white dark:bg-[#13221b] p-5.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 text-[#1b3d2f] dark:text-emerald-300 rounded-2xl border border-emerald-100 dark:border-emerald-800/40 shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-800 dark:text-white">{myRequests.length}</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.requestsStat}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#13221b] p-5.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
            <div className="p-3.5 bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 rounded-2xl border border-blue-100 dark:border-blue-800/40 shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-800 dark:text-white">{myEnrollments.length}</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.enrolledStat}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#13221b] p-5.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
            <div className="p-3.5 bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 rounded-2xl border border-purple-100 dark:border-purple-800/40 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-800 dark:text-white">{gapData.length || '—'}</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.competencyStat}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#13221b] p-5.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
            <div className="p-3.5 bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 rounded-2xl border border-teal-100 dark:border-teal-800/40 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-800 dark:text-white">
                {certifications.length ? `${Math.round((validCertificationCount / certifications.length) * 100)}%` : '—'}
              </p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.complianceStat}</p>
            </div>
          </div>
        </div>

        {/* Tabbed Employee Workspace - Full Width */}
        <div className="space-y-6 w-full">
          <div className="flex border-b border-slate-200/80 dark:border-slate-800 overflow-x-auto custom-scrollbar gap-2 pb-px w-full">
            {[
              { id: 'overview', label: t.tabOverview, icon: Layers },
              { id: 'requests', label: t.tabRequests, icon: FileText },
              (isDirector || isDeptHead) && { id: 'requests-approval', label: t.tabRequestsApproval, icon: MessageSquare },
              { id: 'competencies', label: t.tabCompetencies, icon: TrendingUp },
              { id: 'enrollments', label: t.tabEnrollments, icon: BookOpen },
              { id: 'compliance', label: t.tabCompliance, icon: Award },
              { id: 'assistant', label: t.tabAssistant, icon: Sparkles },
            ].filter(Boolean).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-4.5 font-bold text-xs uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${activeTab === tab.id
                  ? 'border-[#1b3d2f] dark:border-emerald-400 text-[#1b3d2f] dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-t-xl'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 rounded-t-xl'}`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full">
              {/* Left 2 Cols: Recommended Programs & Recent Requests */}
              <div className="xl:col-span-2 space-y-6">
                {/* Recommended Programs */}
                <div className="bg-white dark:bg-[#13221b] p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-800 dark:text-white">{t.recommendedPrograms}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Courses tailored to enhance your core job responsibilities.</p>
                    </div>
                    <button
                      onClick={() => navigate('/admin/training/programs')}
                      className="text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      {t.viewAllPrograms} <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {recommendedPrograms.slice(0, 4).map((prog) => (
                      <div
                        key={prog.id}
                        className="p-4.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-[#0f1a14] hover:bg-slate-50 dark:hover:bg-[#15251d] hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
                      >
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                            <span className="truncate max-w-[150px]">{prog.provider_name || 'NIC Internal Academy'}</span>
                            <span className="flex items-center gap-1 shrink-0"><Clock className="w-3 h-3 text-slate-400" /> {prog.duration_hours || 16} hrs</span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-800 dark:text-white line-clamp-1">{prog.title}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{prog.description}</p>
                        </div>
                        <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {prog.cost_per_person ? `${Number(prog.cost_per_person).toLocaleString()} TZS` : 'Sponsored'}
                          </span>
                          <button
                            onClick={() => {
                              setRequestInitialData({
                                title: `Training Request: ${prog.title}`,
                                reason: `Professional skill advancement through ${prog.title}`,
                                desired_outcome: 'Enhance operational capability and close competency gap.',
                                estimated_cost: prog.cost_per_person || '0',
                              });
                              setIsRequestModalOpen(true);
                            }}
                            className="px-3.5 py-1.5 bg-[#1b3d2f] hover:bg-[#132e23] text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95"
                          >
                            Apply Now
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Training Requests */}
                <div className="bg-white dark:bg-[#13221b] p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-800 dark:text-white">{t.recentRequests}</h3>
                    <button
                      onClick={() => setActiveTab('requests')}
                      className="text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:underline"
                    >
                      View All ({myRequests.length})
                    </button>
                  </div>

                  {myRequests.length > 0 ? (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {myRequests.slice(0, 3).map((req) => (
                        <div key={req.id} className="py-3.5 flex items-center justify-between gap-4">
                          <div>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white">{req.title}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{req.reason}</p>
                            <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                              Est. Cost: {Number(req.estimated_cost || 0).toLocaleString()} TZS
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            {getStatusBadge(req.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      {t.noRequestsYet}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Skill Radar & Profile Card */}
              <div className="space-y-6">
                {/* Employee Profile Summary Card */}
                <div className="bg-white dark:bg-[#13221b] p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1b3d2f] to-[#12221a] text-emerald-300 flex items-center justify-center font-extrabold text-lg shadow-md border border-emerald-500/20">
                      {(user?.first_name || user?.username || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white">{user?.full_name || user?.username}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email || 'staff@nic.co.tz'}</p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500 dark:text-slate-400">Employee ID:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{user?.employee_number || 'NIC-1001'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500 dark:text-slate-400">Department:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.dept_name || 'ICT'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500 dark:text-slate-400">Position:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.position_title || 'Developer'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500 dark:text-slate-400">Supervisor:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.supervisor_name || 'System Admin'}</span>
                    </div>
                  </div>
                </div>

                {/* Competency Snapshot */}
                <div className="bg-white dark:bg-[#13221b] p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                    <span>Core Skills Benchmark</span>
                  </h3>
                  <div className="space-y-3">
                    {gapData.length > 0 ? (
                      gapData.slice(0, 4).map((skill, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-700 dark:text-slate-300">{skill.competency}</span>
                            <span className="text-slate-500 dark:text-slate-400">{skill.current}/{skill.required}</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${skill.gap > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${Math.min(100, (skill.current / Math.max(skill.required, 1)) * 100)}%` }}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 dark:text-slate-400">No competency assessment data recorded yet.</p>
                    )}
                  </div>
                  <button
                    onClick={() => setActiveTab('competencies')}
                    className="w-full py-2.5 mt-2 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl border border-slate-200/80 dark:border-slate-700 transition-all"
                  >
                    View Complete Gap Analysis
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY TRAINING REQUESTS */}
          {activeTab === 'requests' && (
            <TrainingRequests />
          )}

          {/* TAB: REQUESTS APPROVAL */}
          {activeTab === 'requests-approval' && (isDeptHead || isDirector) && (
            <RequestApprovalQueue />
          )}

          {/* TAB 4: COMPETENCY & GAP ANALYSIS */}
          {activeTab === 'competencies' && (
            <div className="bg-white dark:bg-[#13221b] p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 w-full">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Position Competency & Skill Gap Analysis</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Comparison between required competency levels for your position vs current assessed proficiency.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {gapData.length > 0 ? (
                  gapData.map((comp, idx) => {
                    const gap = Math.max(0, comp.gap || comp.required - comp.current);
                    return (
                      <div key={idx} className="p-4.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0f1a14] space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {comp.importance || 'STANDARD'} PRIORITY
                            </span>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white mt-1.5">{comp.competency}</h4>
                          </div>
                          {gap > 0 ? (
                            <span className="text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-300/30">
                              Gap: -{gap}
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-300/30">
                              Proficient
                            </span>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                            <span>Current: Level {comp.current}</span>
                            <span>Required: Level {comp.required}</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                            <div
                              className={`h-full ${gap > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${(comp.current / 5) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-2 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No competency assessment data</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Your position requirements or assessment results have not been recorded yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: ENROLLMENTS */}
          {activeTab === 'enrollments' && (
            <div className="bg-white dark:bg-[#13221b] p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 w-full">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">My Active & Completed Enrollments</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">View enrolled training courses, participation dates, and submit Kirkpatrick evaluations.</p>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {myEnrollments.length > 0 ? (
                  myEnrollments.map((enrol) => (
                    <div key={enrol.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-white">{enrol.program_title || 'Professional Development Program'}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Enrolled Date: {enrol.enrollment_date || 'Active'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300/30">
                          {enrol.completion_status || 'ENROLLED'}
                        </span>
                        <button
                          onClick={() => alert('Evaluation form (Kirkpatrick Level 1 Feedback) submitted.')}
                          className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all"
                        >
                          Provide Feedback
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    {t.noEnrollmentsYet}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: COMPLIANCE & CERTIFICATIONS */}
          {activeTab === 'compliance' && (
            <div className="bg-white dark:bg-[#13221b] p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 w-full">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Mandatory Certifications & Expiry Tracking</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Track regulatory certifications, validity dates, and trigger renewal training before expiration.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {certifications.length > 0 ? (
                  certifications.map((cert) => {
                    const state = getCertificationState(cert.expiry_date);
                    return (
                      <div key={cert.id} className="p-4.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0f1a14] flex flex-col justify-between space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${state.className}`}>
                              {state.label}
                            </span>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white">{cert.requirement_name}</h4>
                          </div>
                          <Award className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                        </div>

                        <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
                          <div>
                            <p className="text-slate-400 text-[10px]">Expires On</p>
                            <p className="font-mono font-bold text-slate-800 dark:text-slate-200">{cert.expiry_date}</p>
                          </div>
                          <button
                            onClick={() => {
                              setRequestInitialData({
                                title: `Renewal: ${cert.requirement_name}`,
                                reason: `Renewal required for ${cert.requirement_name}.`,
                                desired_outcome: 'Maintain continuous regulatory compliance accreditation.',
                                estimated_cost: '350000',
                              });
                              setIsRequestModalOpen(true);
                            }}
                            className="px-3.5 py-1.5 bg-[#1b3d2f] hover:bg-[#132e23] text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                          >
                            Request Renewal
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-2 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No certification records</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Your compliance certificates will appear here when HR records them.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: APPROVED KNOWLEDGE ASSISTANT */}
          {activeTab === 'assistant' && (
            <KnowledgeAssistant />
          )}
        </div>
      </main>

      {/* Modal: Submit New Training Request (UC-01) */}
      <TrainingRequestForm
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        initialData={requestInitialData}
        translations={t}
        onSuccess={() => loadUserAndData()}
      />
    </div>
  );
};

export default HomePage;
