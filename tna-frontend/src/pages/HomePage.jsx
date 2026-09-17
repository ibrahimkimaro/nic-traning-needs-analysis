import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, CheckCircle2, AlertCircle, Clock, Award,
  BookOpen, Plus, Search, ChevronRight, User, Shield, ArrowUpRight,
  TrendingUp, Calendar, AlertTriangle, Layers, Bell, LogOut, Globe,
  Briefcase, Building2, KeyRound, Check, ChevronDown, Sparkles, Send, Paperclip, X, Loader2, MessageSquare, ArrowLeft
} from 'lucide-react';
import { api } from '../auth/api';
import TrainingRequestForm from './tna/TrainingRequestForm';
import TrainingRequests from './tna/TrainingRequests';
import RequestApprovalQueue from './tna/RequestApprovalQueue';
import ChangePasswordDialog from './changepassword'


export const translations = {
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
    tabOverviewDesc: 'Summary & Key Metrics',
    tabRequests: 'My Training Requests',
    tabRequestsDesc: 'Personal Submissions',
    tabRequestsApproval: 'Requests Approval',
    tabRequestsApprovalDesc: 'Supervisory Review',
    tabCompetencies: 'Skill & Gap Analysis',
    tabCompetenciesDesc: 'Proficiency Gap Profile',
    tabEnrollments: 'My Enrollments',
    tabEnrollmentsDesc: 'Active Program Tracks',
    tabCompliance: 'Certifications & Compliance',
    tabComplianceDesc: 'TIRA & Regulatory Standing',
    modulesTitle: 'Operational Workspaces & Modules',
    modulesSubtitle: 'Select a government module to review records, evaluate competencies, or endorse training workflows.',
    currentModule: 'Active Module',
    openModule: 'Open Module',
    backToHome: 'Back to Workspace Overview',
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
    tabOverviewDesc: 'Muhtasari & Vipimo Muhimu',
    tabRequests: 'Maombi Yangu ya Mafunzo',
    tabRequestsDesc: 'Maombi Yaliyowasilishwa',
    tabRequestsApproval: 'Maombi Yanayoidhinishwa',
    tabRequestsApprovalDesc: 'Ukaguzi wa Wasimamizi',
    tabCompetencies: 'Uchambuzi wa Pengo la Ujuzi',
    tabCompetenciesDesc: 'Wasifu wa Pengo la Ujuzi',
    tabEnrollments: 'Mafunzo Yangu',
    tabEnrollmentsDesc: 'Mafunzo Yanayoendelea',
    tabCompliance: 'Vyeti & Uzingatiaji',
    tabComplianceDesc: 'Uzingatiaji wa TIRA & Kisheria',
    modulesTitle: 'Vituo vya Kazi & Moduli za Kiutendaji',
    modulesSubtitle: 'Chagua moduli ili kukagua kumbukumbu, kupima mapengo ya ujuzi, au kuidhinisha mafunzo.',
    currentModule: 'Moduli Iliyopo',
    openModule: 'Fungua Moduli',
    backToHome: 'Rudi Kwenye Muhtasari',
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
  const params = useParams();
  const location = useLocation();

  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    if (!stored || stored === 'undefined' || stored === 'null') return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  });

  const validTabs = ['overview', 'requests', 'requests-approval', 'competencies', 'enrollments', 'compliance'];

  const getInitialTab = () => {
    if (params.tab && validTabs.includes(params.tab)) {
      return params.tab;
    }
    const queryTab = new URLSearchParams(window.location.search).get('tab');
    if (queryTab && validTabs.includes(queryTab)) {
      return queryTab;
    }
    const saved = localStorage.getItem('tna_home_active_tab');
    if (saved && validTabs.includes(saved)) {
      return saved;
    }
    return 'overview';
  };

  const [activeTab, setActiveTabState] = useState(getInitialTab);

  // Sync state if URL changes (e.g. browser refresh, back/forward, direct URL)
  useEffect(() => {
    if (params.tab && validTabs.includes(params.tab)) {
      setActiveTabState(params.tab);
      localStorage.setItem('tna_home_active_tab', params.tab);
    } else if (location.pathname === '/home') {
      const queryTab = new URLSearchParams(location.search).get('tab');
      if (queryTab && validTabs.includes(queryTab)) {
        setActiveTabState(queryTab);
        localStorage.setItem('tna_home_active_tab', queryTab);
      } else {
        const saved = localStorage.getItem('tna_home_active_tab');
        if (saved && validTabs.includes(saved) && saved !== 'overview' && !location.state?.fromOverviewClick) {
          navigate(`/home/${saved}`, { replace: true });
          setActiveTabState(saved);
        } else {
          setActiveTabState('overview');
        }
      }
    }
  }, [params.tab, location.pathname, location.search]);

  const setActiveTab = (tabId) => {
    setActiveTabState(tabId);
    if (tabId === 'overview') {
      localStorage.removeItem('tna_home_active_tab');
      navigate('/home', { state: { fromOverviewClick: true } });
    } else {
      localStorage.setItem('tna_home_active_tab', tabId);
      navigate(`/home/${tabId}`);
    }
  };

  const [lang, setLang] = useState('en');
  const [loading, setLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showChangePassword, setshowChangePassword] = useState(false);

  // Data states
  const [myRequests, setMyRequests] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [recommendedPrograms, setRecommendedPrograms] = useState([]);
  const [gapData, setGapData] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dismissedToastIds, setDismissedToastIds] = useState(new Set());

  // Modal State for New Training Request
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestInitialData, setRequestInitialData] = useState({});

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

      // 2. Load Requests, Enrollments, Programs, Certifications, and Notifications
      const [requests, enrollments, programs, certs, notifs] = await Promise.all([
        api.tna.getMyRequests().catch(() => []),
        api.training.getEnrollments().catch(() => []),
        api.training.getPrograms().catch(() => []),
        api.compliance.getCertifications().catch(() => []),
        api.notifications.getMine().catch(() => []),
      ]);

      setMyRequests(requests || []);
      setMyEnrollments(enrollments || []);
      setRecommendedPrograms(programs || []);
      setCertifications(certs || []);
      setNotifications(notifs || []);

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

  const toggleNotifications = async () => {
    const nextOpen = !showNotifications;
    setShowNotifications(nextOpen);
    if (nextOpen && notifications.some((n) => !n.is_read)) {
      await api.notifications.markRead().catch(() => { });
      setNotifications((current) => current.map((n) => ({ ...n, is_read: true })));
    }
  };

  const clearNotifications = async () => {
    await api.notifications.clear().catch(() => { });
    setNotifications([]);
    setDismissedToastIds(new Set());
  };

  const dismissToast = (id) => {
    setDismissedToastIds((prev) => new Set([...prev, id]));
  };

  const dismissAllToasts = () => {
    setDismissedToastIds(new Set(notifications.map((n) => n.id)));
  };

  const toastNotifications = notifications.filter((n) => !dismissedToastIds.has(n.id)).slice(0, 3);



  // Check roles
  const userRoles = Array.isArray(user?.roles)
    ? user.roles.map(r => (typeof r === 'object' ? r?.role_name || r?.name : r))
    : (typeof user?.roles === 'string' ? [user.roles] : []);
  const isAdmin = Boolean(user?.is_superuser || user?.is_staff || userRoles.includes('ADMIN') || user?.role === 'ADMIN');
  const isHR = userRoles.includes('HR_MANAGER') || userRoles.includes('HR') || user?.role === 'HR_MANAGER';
  const isHRO = userRoles.includes('HRO') || user?.role === 'HRO';
  const isDeptHead = userRoles.includes('DEPT_HEAD') || user?.role === 'DEPT_HEAD';
  const isFinance = userRoles.includes('FINANCE');
  const isDirector = userRoles.includes('DIRECTOR');
  const canApprove = isHR || isHRO || isDeptHead || isDirector || isAdmin;
  // const hasElevatedAccess = isAdmin || isHR || isHRO || isDeptHead || isDirector || isFinance;
  const hasElevatedAccess = isAdmin
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

  const getTabInfo = (tabId) => {
    switch (tabId) {
      case 'requests':
        return {
          title: t.tabRequests,
          desc: lang === 'sw' ? 'Fuatilia na usimamie maombi yako binafsi ya mafunzo na maoni ya Mkuu wa Idara.' : 'Track and manage your submitted individual training needs and HOD review status.',
          icon: FileText
        };
      case 'requests-approval':
        return {
          title: t.tabRequestsApproval,
          desc: lang === 'sw' ? 'Kagua na uidhinishe maombi ya mafunzo yaliyowasilishwa na wafanyakazi wa idara yako.' : 'Review, evaluate, and endorse training requests submitted by departmental staff members.',
          icon: MessageSquare
        };
      case 'competencies':
        return {
          title: t.tabCompetencies,
          desc: lang === 'sw' ? 'Ulinganisho kati ya viwango vya ujuzi vinavyohitajika kwa wadhifa wako na uwezo uliopo sasa.' : 'Comparison between required competency standards for your position vs current assessed proficiency.',
          icon: TrendingUp
        };
      case 'enrollments':
        return {
          title: t.tabEnrollments,
          desc: lang === 'sw' ? 'Tazama mafunzo unayoshiriki, tarehe zake, na utoe maoni ya tathmini ya Kirkpatrick.' : 'View enrolled training courses, participation dates, and submit Kirkpatrick evaluations.',
          icon: BookOpen
        };
      case 'compliance':
        return {
          title: t.tabCompliance,
          desc: lang === 'sw' ? 'Fuatilia vyeti vya lazima vya kisheria na uzingatiaji wa TIRA kabla ya muda kuisha.' : 'Track regulatory certifications, validity dates, and trigger renewal training before expiration.',
          icon: Award
        };
      default:
        return {
          title: t.tabOverview,
          desc: lang === 'sw' ? 'Muhtasari wa Eneo-kazi' : 'Corporate Workspace Overview',
          icon: Layers
        };
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col relative overflow-x-hidden">
      {/* Grand Centered Background Watermark ("kwa mbali") */}
      <div className="fixed inset-0 pointer-events-none select-none z-0 flex items-center justify-center overflow-hidden">
        <img
          src="/logo/logo-light-full.png"
          alt=""
          className="w-[520px] sm:w-[660px] md:w-[780px] max-w-[85vw] h-auto object-contain grayscale opacity-[0.035] transition-opacity"
        />
      </div>

      {/* Top Professional Header */}
      <header className="bg-[#264033] text-white border-b border-[#1c3026] sticky top-0 z-30 shadow-md">
        <div className=" px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 p-4">
            {/* <div className="w-9 h-9 bg-white text-[#264033] rounded-xl flex items-center justify-center font-black text-base shadow-sm">
              N
            </div> */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-25 border border-transparent bg-[#264033]/10">
              <img
                src="/logo/logo-light-full.png"
                alt="Profile Logo"
                className="h-full w-full object-cover"
              />
            </div>

            <div>
              <span className="font-bold text-base tracking-tight block leading-tight">National Insurance Corporation</span>
              <span className="text-[11px] text-emerald-200 font-medium">{t.portalTitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Notification Bell Button & Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={toggleNotifications}
                className="relative rounded-xl p-2 text-emerald-100 hover:bg-emerald-900/80 hover:text-white transition-all border border-emerald-700/50 flex items-center justify-center shadow-xs"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {notifications.some((n) => !n.is_read) && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full ring-2 ring-[#264033] animate-pulse" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-3 text-slate-800 shadow-2xl animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between border-b border-slate-100 px-3 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#264033]" />
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-700">Notifications</p>
                      {notifications.some((n) => !n.is_read) && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800">New</span>
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <button
                        type="button"
                        onClick={clearNotifications}
                        className="text-[11px] font-bold text-emerald-800 hover:underline"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length > 0 ? (
                      notifications.slice(0, 10).map((n) => (
                        <div key={n.id} className="p-3 text-xs text-slate-600 hover:bg-slate-50 transition-colors">
                          <p className="font-semibold text-slate-900 leading-snug">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                            {n.created_at ? new Date(n.created_at).toLocaleString() : 'Recent update'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-xs text-slate-400">
                        <Bell className="w-6 h-6 mx-auto text-slate-300 mb-1" />
                        <p>No new notifications at this time.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

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
            {/* <div className="flex items-center gap-3 pl-2 border-l border-emerald-800">
              <img
                src="/userAvatar.jpeg"
                alt="User Avatar"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/30 shrink-0 border border-white/20"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold leading-none text-white">{user?.full_name || user?.username}</p>
                <p className="text-[10px] text-emerald-200 leading-none mt-1">{user?.position_title || user?.dept_name || 'Staff'}</p>
              </div>
            </div> */}
            <div className="relative ">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 p-1 hover:bg-green-100 dark:hover:bg-[#274043] rounded-full transition-all"
              >
                <img
                  src="/userAvatar.jpeg"
                  alt="User Avatar"
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/30 shrink-0 border border-white/20"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold leading-none text-white">{user?.full_name || user?.username}</p>
                  <p className="text-[10px] text-emerald-200 leading-none mt-1">{user?.position_title || user?.dept_name || 'Staff'}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#264033] border border-[#3b5e4c] rounded-2xl shadow-xl py-2 z-30 ring-1 ring-black ring-opacity-5 animate-in fade-in slide-in-from-top-8">
                  <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-800 dark:text-white">{user?.full_name || user?.username}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { setIsProfileOpen(false); setshowChangePassword(true); }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:hover:bg-[#264033]/15 transition-colors"
                  >
                    <KeyRound className="w-4 h-4 text-emerald-700 dark:text-emerald-400" /> Change Password
                  </button>
                  <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>
                  <button
                    onClick={handleLogout}
                    title={t.signOut}
                    className="flex items-center gap-2 w-full px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Logout Button */}
            {/* <button
              onClick={handleLogout}
              className="p-2 text-emerald-200 hover:text-white hover:bg-emerald-900/60 rounded-lg transition-colors ml-1"
              title={t.signOut}
            >
              <LogOut className="w-4 h-4" />
            </button> */}
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* VIEW 1: OVERVIEW DASHBOARD */}
        {activeTab === 'overview' ? (
          <div className="space-y-8">


            <div className="bg-[#264033]/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden border border-[#1e342a] group transition-transform duration-300 ease-out hover:-translate-y-1">
              {/* Watermark Crest - Pure White Silhouette, Centered in the Distance ("kwa mbali") */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.08] overflow-hidden">
                <img
                  src="/logo/logo-light-full.png"
                  alt=""
                  className="w-80 sm:w-96 md:w-[460px] object-contain filter brightness-0 invert transition-transform duration-500 ease-out group-hover:scale-105"
                />
              </div>



              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-100 border border-white/20 text-xs font-semibold backdrop-blur-sm">

                    <span>NIC Competency & Career Growth Portal</span>
                  </div>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white/90">
                    {t.welcomeBack}, {user?.first_name || user?.username}!
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-slate-200 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-emerald-300" />
                      {user?.dept_name || 'Department of ICT & Systems'}
                    </span>
                    <span className="text-emerald-300/40">•</span>
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-emerald-300" />
                      {user?.position_title || 'Staff Member'}
                    </span>
                    {user?.employee_number && (
                      <>
                        <span className="text-emerald-300/40">•</span>
                        <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-emerald-100 text-xs">
                          {user.employee_number}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Quick Action Button - Soft White, Dignified */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setIsRequestModalOpen(true)}
                    className="bg-white hover:bg-slate-100 text-[#264033] font-bold px-5 py-3 rounded-2xl text-xs sm:text-sm transition-all shadow-sm flex items-center gap-2 active:scale-95"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    {t.submitNewRequest}
                  </button>
                </div>
              </div>
            </div>

            {/* Floating Notification Toast Dialog Overlay (Top Right Corner) */}
            {toastNotifications.length > 0 && (
              <div className="fixed top-20 right-4 sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none px-2 sm:px-0">
                {toastNotifications.map((n) => (
                  <div
                    key={n.id}
                    className="pointer-events-auto bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-4 shadow-xl flex items-start gap-3.5 transition-all animate-in slide-in-from-right-8 duration-300 hover:border-slate-300 group"
                  >
                    <div className="p-2.5 rounded-xl bg-slate-100 text-[#264033] shrink-0 mt-0.5 shadow-xs">
                      <Bell className="w-4 h-4 text-[#264033]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                            Workflow Alert
                          </p>
                          <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            New
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-3">
                        {n.message}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => dismissToast(n.id)}
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                      title="Dismiss notification"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {toastNotifications.length > 1 && (
                  <div className="pointer-events-auto self-end">
                    <button
                      type="button"
                      onClick={dismissAllToasts}
                      className="text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl px-3 py-1.5 shadow-md hover:bg-slate-50 transition-all flex items-center gap-1.5"
                    >
                      Dismiss All ({toastNotifications.length})
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Elevated Role Command Hub (Admins, HR, HRO, Supervisors, Finance) */}
            {hasElevatedAccess && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#264033]" />
                    Authorized Management Command Hub
                  </h2>
                  <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                    Privileged Access Active
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-3 gap-4">
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

                  {/* Supervisor & HRO Queue Card */}
                  {canApprove && (
                    <div
                      onClick={() => setActiveTab('requests-approval')}
                      className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-[#264033] shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between">
                        <div className="p-3 bg-transparent text-gray-300 rounded-xl group-hover:text-gray-800 transition-colors">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-gray-800  transition-colors" />
                      </div>
                      <div className="mt-4">
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-gray-800 transition-colors">
                          {t.supervisorQueueCard}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {t.supervisorQueueDesc}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-gray-700">
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
                        <div className="p-3 bg-blue-50 text-gray-700 rounded-xl group-hover:text-gray-800 transition-colors">
                          <TrendingUp className="w-6 h-6" />
                        </div>
                        <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-gray-800 transition-colors" />
                      </div>
                      <div className="mt-4">
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-gray-800 transition-colors">
                          {isFinance ? 'Budget & Spend Oversight' : 'TNA Competency Matrix'}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {isFinance ? 'Track departmental training expenditure and evaluate budget availability.' : 'Analyze institutional skill gaps, department heatmaps, and prioritize training budgets.'}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-gray-800">
                        <span>{isFinance ? 'Review Budget Accounts' : 'Open Strategic TNA Engine'}</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Stats Grid - Calm Borders, High Eye Comfort */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 hover:border-[#264033] shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-4 group cursor-default">
                <div className="p-3 bg-[#264033]/10 text-[#264033] group-hover:bg-[#264033] group-hover:text-white rounded-xl shrink-0 transition-colors duration-200">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900">{myRequests.length}</p>
                  <p className="text-xs font-semibold text-slate-500">{t.requestsStat}</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 hover:border-[#264033] shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-4 group cursor-default">
                <div className="p-3 bg-gray-200 text-gray-600 group-hover:bg-[#264033] group-hover:text-white rounded-xl shrink-0 transition-colors duration-200">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900">{myEnrollments.length}</p>
                  <p className="text-xs font-semibold text-slate-500">{t.enrolledStat}</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 hover:border-[#264033] shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-4 group cursor-default">
                <div className="p-3 bg-gray-200 text-gray-600 group-hover:bg-[#264033] group-hover:text-white rounded-xl shrink-0 transition-colors duration-200">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900">{gapData.length || '4'}</p>
                  <p className="text-xs fontbg-amber-50 text-amber-800-semibold text-slate-500">{t.competencyStat}</p>
                </div>
              </div>
            </div>

            {/* Operational Modules & Workspaces Grid */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#264033]"></span>
                    {t.modulesTitle}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t.modulesSubtitle}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {[
                  {
                    id: 'requests',
                    label: t.tabRequests,
                    sublabel: t.tabRequestsDesc,
                    icon: FileText,
                    badge: `${myRequests.length} Requests`,
                    badgeColor: 'bg-gray-200 text-gray-600 border-blue-200',
                    actionLabel: lang === 'sw' ? 'Fungua Maombi' : 'Open Requests'
                  },
                  canApprove && {
                    id: 'requests-approval',
                    label: t.tabRequestsApproval,
                    sublabel: t.tabRequestsApprovalDesc,
                    icon: MessageSquare,
                    badge: 'Approvals Queue',
                    badgeColor: 'bg-gray-200 text-gray-600 border-gray-200',
                    actionLabel: lang === 'sw' ? 'Fungua Idhini' : 'Open Approvals'
                  },
                  {
                    id: 'competencies',
                    label: t.tabCompetencies,
                    sublabel: t.tabCompetenciesDesc,
                    icon: TrendingUp,
                    badge: `${gapData.length || 4} Assessed`,
                    badgeColor: 'bg-gray-200 text-gray-600 border-gray-200',
                    actionLabel: lang === 'sw' ? 'Kagua Ujuzi' : 'Review Competencies'
                  },
                  {
                    id: 'enrollments',
                    label: t.tabEnrollments,
                    sublabel: t.tabEnrollmentsDesc,
                    icon: BookOpen,
                    badge: `${myEnrollments.length} Active`,
                    badgeColor: 'bg-gray-200 text-gray-800 border-gray-200',
                    actionLabel: lang === 'sw' ? 'Tazama Masomo' : 'View Enrollments'
                  },
                  {
                    id: 'compliance',
                    label: t.tabCompliance,
                    sublabel: t.tabComplianceDesc,
                    icon: Award,
                    // here we nee to keep the list of certifications and compliance
                    badge: '@',
                    badgeColor: 'bg-gray-200 text-gray-600 border-gray-200',
                    actionLabel: lang === 'sw' ? 'Kagua Vyeti' : 'Check Compliance'
                  },
                ].filter(Boolean).map(tab => {
                  const Icon = tab.icon;
                  return (
                    <div
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className="relative text-left p-5 rounded-2xl bg-white/50 border-2 border-slate-200/90 hover:border-[#264033] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group overflow-hidden cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2 w-full">
                        <div className="p-3 rounded-xl bg-slate-100 text-slate-700 group-hover:bg-[#264033] group-hover:text-white transition-all duration-200">
                          <Icon className="w-5 h-5" />
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tab.badgeColor}`}>
                          {tab.badge}
                        </span>
                      </div>

                      <div className="mt-4 pt-1 w-full">
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#264033] tracking-tight transition-colors duration-200">
                          {tab.label}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {tab.sublabel}
                        </p>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#264033]">
                          <span>{tab.actionLabel}</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Overview Columns: Recommended Programs & Recent Requests & Profile */}
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
                              setRequestInitialData({
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
                      <span className="font-semibold text-slate-800">{user?.position_title || 'Staff Member'}</span>
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
                            className="h-full rounded-full bg-[#264033] transition-all"
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
          </div>
        ) : (
          /* VIEW 2: DEDICATED MODULE VIEW (Opens directly without scrolling, with Back to Home button) */
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Dedicated View Header */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4 relative overflow-hidden">
              {/* Subtle Watermark in Header Background ("kwa mbali") */}
              <div className="absolute -right-6 -bottom-10 pointer-events-none select-none opacity-[0.035]">
                <img
                  src="/logo/logo-light-full.png"
                  alt=""
                  className="w-56 h-56 object-contain grayscale"
                />
              </div>

              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <button
                  onClick={() => setActiveTab('overview')}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-300 hover:border-[#264033] bg-slate-50 hover:bg-white text-slate-700 hover:text-[#264033] text-xs sm:text-sm font-bold transition-all shadow-xs w-fit group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span>{t.backToHome}</span>
                </button>

                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <span
                    className="hover:text-slate-800 cursor-pointer"
                    onClick={() => setActiveTab('overview')}
                  >
                    {t.tabOverview}
                  </span>
                  <span>/</span>
                  <span className="text-[#264033] font-bold">
                    {getTabInfo(activeTab).title}
                  </span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="p-3 bg-[#264033]/10 text-[#264033] rounded-xl shrink-0">
                    {React.createElement(getTabInfo(activeTab).icon, { className: "w-6 h-6" })}
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                      {getTabInfo(activeTab).title}
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5 max-w-2xl">
                      {getTabInfo(activeTab).desc}
                    </p>
                  </div>
                </div>

                {activeTab === 'requests' && (
                  <button
                    onClick={() => setIsRequestModalOpen(true)}
                    className="bg-[#264033] hover:bg-[#1a2d24] text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-sm flex items-center gap-2 shrink-0 active:scale-95"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>{t.submitNewRequest}</span>
                  </button>
                )}
              </div>
            </div>

            {/* TAB CONTENT: MY TRAINING REQUESTS */}
            {activeTab === 'requests' && (
              <TrainingRequests />
            )}

            {/* TAB CONTENT: REQUESTS APPROVAL QUEUE */}
            {activeTab === 'requests-approval' && (
              canApprove ? (
                <RequestApprovalQueue />
              ) : (
                <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
                  <Shield className="w-10 h-10 text-slate-400 mx-auto" />
                  <h4 className="text-base font-bold text-slate-800">Supervisory Access Required</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    The Request Approval Queue is restricted to Department Heads, HRO, HR Managers, and Administrators.
                  </p>
                </div>
              )
            )}

            {/* TAB CONTENT: COMPETENCY & GAP ANALYSIS */}
            {activeTab === 'competencies' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Position Competency & Skill Gap Analysis</h3>
                  <p className="text-xs text-slate-500 mt-1">Comparison between required competency levels for your position vs current assessed proficiency.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(gapData && gapData.length > 0 ? gapData.map(g => ({
                    title: g.competency,
                    current: g.current,
                    required: g.required,
                    importance: g.priority || 'HIGH'
                  })) : [
                    { title: 'Core Insurance Principles', current: 4, required: 4, importance: 'HIGH' },
                    { title: 'Information Security & Data Protection', current: 3, required: 4, importance: 'HIGH' },
                    { title: 'Claims Management Workflow', current: 3, required: 5, importance: 'HIGH' },
                    { title: 'Customer Relationship Management', current: 5, required: 5, importance: 'MEDIUM' },
                    { title: 'Financial Risk Appraisal', current: 2, required: 4, importance: 'MEDIUM' },
                    { title: 'Compliance & Regulatory Reporting', current: 4, required: 4, importance: 'HIGH' },
                  ]).map((comp, idx) => {
                    const gap = Math.max(0, comp.required - comp.current);
                    return (
                      <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${comp.importance === 'HIGH' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                              {comp.importance} PRIORITY
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 mt-1.5">{comp.title}</h4>
                          </div>
                          {gap > 0 ? (
                            <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                              Gap: -{gap}
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                              Proficient
                            </span>
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-slate-500 font-medium">
                            <span>Current: Level {comp.current}</span>
                            <span>Required: Level {comp.required}</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                            <div
                              className="h-full bg-[#264033] rounded-full transition-all"
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

            {/* TAB CONTENT: ENROLLMENTS */}
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

            {/* TAB CONTENT: COMPLIANCE & CERTIFICATIONS */}
            {activeTab === 'compliance' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Mandatory Certifications & Expiry Tracking</h3>
                  <p className="text-xs text-slate-500 mt-1">Track regulatory certifications, validity dates, and trigger renewal training before expiration.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(certifications && certifications.length > 0 ? certifications : [
                    { requirement_name: 'TIRA Insurance Regulatory Compliance', expiry_date: '2027-05-15', is_simulated: true },
                    { requirement_name: 'AML / CFT Anti-Money Laundering Certified', expiry_date: '2026-11-30', is_simulated: true },
                    { requirement_name: 'Information Security & Data Privacy (PDPA)', expiry_date: '2027-01-10', is_simulated: true },
                  ]).map((cert, idx) => {
                    const certName = cert.requirement_name || `Mandatory Cert #${cert.id}`;
                    const expiry = cert.expiry_date || 'N/A';
                    const isExpiringSoon = expiry !== 'N/A' && (new Date(expiry) - new Date()) / (1000 * 60 * 60 * 24) < 90;

                    return (
                      <div key={cert.id || idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isExpiringSoon ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                              }`}>
                              {isExpiringSoon ? 'Expiring Soon (< 90d)' : 'Active Certificate'}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900">{certName}</h4>
                            {cert.issue_date && (
                              <p className="text-[11px] text-slate-400">Issued: {cert.issue_date}</p>
                            )}
                          </div>
                          <Award className="w-5 h-5 text-[#264033]" />
                        </div>

                        <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                          <div>
                            <p className="text-slate-400 text-[10px]">Expires On</p>
                            <p className="font-mono font-bold text-slate-800">{expiry}</p>
                          </div>
                          <button
                            onClick={() => {
                              setRequestInitialData({
                                title: `Renewal: ${certName}`,
                                justification: 'Mandatory certification renewal required for compliance standing.',
                                desired_outcome: 'Maintain continuous regulatory compliance accreditation and certifications.'
                              });
                              setIsRequestModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-[#264033] hover:bg-[#1a2d24] text-white text-xs font-semibold rounded-lg transition-colors"
                          >
                            Request Renewal
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal: Submit New Training Request (UC-01) */}
      <TrainingRequestForm
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        initialData={requestInitialData}
        translations={t}
        onSuccess={() => loadUserAndData()}
      />

      <ChangePasswordDialog
        showChangePassword={showChangePassword}
        setShowChangePassword={setshowChangePassword}
      />
    </div>
  );
};

export default HomePage;
