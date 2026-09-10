import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, BarChart3, Settings,
  LogOut, Search, Bell, ChevronDown, ChevronRight,
  ShieldCheck, FileText, Building2, Briefcase, Target, Zap,
  LineChart, CheckCircle, BookOpen, DollarSign, Home, ArrowLeft, Sun, Moon
} from 'lucide-react';
import { api } from '../auth/api';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isOrgOpen, setIsOrgOpen] = useState(true);
  const [isTnaOpen, setIsTnaOpen] = useState(false);
  const [isTrainingOpen, setIsTrainingOpen] = useState(false);
  const [currentUser] = useState(() => {
    const stored = localStorage.getItem('user');
    if (!stored || stored === 'undefined' || stored === 'null') return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  });
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    api.notifications.getMine().then(setNotifications).catch(() => setNotifications([]));
  }, []);

  const toggleNotifications = async () => {
    const nextOpen = !showNotifications;
    setShowNotifications(nextOpen);
    if (nextOpen && notifications.some((notification) => !notification.is_read)) {
      await api.notifications.markRead().catch(() => { });
      setNotifications((current) => current.map((notification) => ({ ...notification, is_read: true })));
    }
  };

  const clearNotifications = async () => {
    await api.notifications.clear().catch(() => { });
    setNotifications([]);
    setShowNotifications(false);
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const mainMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  ];

  const orgMenuItems = [
    { id: 'staff', label: 'Staff Management', icon: Users, path: '/admin/staff' },
    { id: 'departments', label: 'Departments', icon: Building2, path: '/admin/org/departments' },
    { id: 'positions', label: 'Positions', icon: Briefcase, path: '/admin/org/positions' },
  ];

  const tnaMenuItems = [
    { id: 'request', label: 'Request Training', icon: FileText, path: '/admin/tna/request' },
    { id: 'approvals', label: 'Approval Queue', icon: CheckCircle, path: '/admin/tna/approvals' },
    { id: 'gap', label: 'Gap Analysis', icon: LineChart, path: '/admin/tna/gap-analysis' },
    { id: 'recs', label: 'Recommendations', icon: Zap, path: '/admin/tna/recommendations' },
  ];

  const trainingMenuItems = [
    { id: 'providers', label: 'Providers', icon: Building2, path: '/admin/training/providers' },
    { id: 'programs', label: 'Programs', icon: BookOpen, path: '/admin/training/programs' },
    { id: 'enrollments', label: 'Enrollments', icon: Users, path: '/admin/training/enrollments' },
  ];

  const otherMenuItems = [
    { id: 'budget', label: 'Budget Oversight', icon: DollarSign, path: '/admin/budget' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  const systemItems = [
    { id: 'sysadmin', label: 'System Administration', icon: ShieldCheck, path: '/admin/system-admin' },
    { id: 'security', label: 'Security', icon: ShieldCheck, path: '/admin/security' },
    { id: 'audit', label: 'Audit Logs', icon: FileText, path: '/admin/audit' },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f6f8fa] dark:bg-[#0b1410] text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Executive Sidebar */}
      <aside className="w-64 bg-[#14261d] dark:bg-[#0f1a14] text-slate-200 flex flex-col h-full z-20 shrink-0 border-r border-[#1e382b] dark:border-slate-800 shadow-xl">
        <div className="p-5 flex items-center gap-3 border-b border-emerald-900/40">
          <div className="flex h-9 w-24 items-center justify-center rounded-lg bg-white px-2 shadow-sm">
            <img src="/logo/logo-light-full.png" alt="National Insurance Corporation" className="max-h-8 w-full object-contain" />
          </div>
          <div>
            <span className="text-white font-bold text-sm tracking-tight block">TNA System</span>
            <span className="text-[10px] text-emerald-300 font-semibold uppercase tracking-wider">Management Suite</span>
          </div>
        </div>

        {/* Back to Employee Portal Button */}
        <div className="p-3">
          <button
            onClick={() => navigate('/home')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-900/30 hover:bg-emerald-900/60 text-emerald-200 text-xs font-bold border border-emerald-700/30 transition-all group active:scale-95"
          >
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4 text-emerald-400" />
              <span>Employee Portal</span>
            </div>
            <ArrowLeft className="w-3.5 h-3.5 text-emerald-400 group-hover:-translate-x-0.5 transition-transform" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="text-[10px] font-bold text-emerald-300/60 uppercase tracking-widest px-3 mb-2">Main Menu</div>

          {mainMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${location.pathname === item.path
                  ? 'bg-emerald-600/30 text-white border border-emerald-500/40 shadow-sm'
                  : 'hover:text-white hover:bg-emerald-900/30 text-slate-300'
                }`}
            >
              <item.icon className="w-4 h-4 text-emerald-400" />
              {item.label}
            </button>
          ))}

          {/* Organization Collapsible Menu */}
          <div className="pt-2">
            <button
              onClick={() => setIsOrgOpen(!isOrgOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold transition-all text-slate-300 hover:text-white hover:bg-emerald-900/30"
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>Organization</span>
              </div>
              {isOrgOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {isOrgOpen && (
              <div className="mt-1 ml-4 pl-3 border-l border-emerald-800/40 space-y-1">
                {orgMenuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${location.pathname === item.path
                        ? 'bg-emerald-600/30 text-emerald-200 border border-emerald-500/30 font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-emerald-900/20'
                      }`}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* TNA Operations Collapsible Menu */}
          <div className="pt-2">
            <button
              onClick={() => setIsTnaOpen(!isTnaOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold transition-all text-slate-300 hover:text-white hover:bg-emerald-900/30"
            >
              <div className="flex items-center gap-3">
                <Target className="w-4 h-4 text-emerald-400" />
                <span>TNA Operations</span>
              </div>
              {isTnaOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {isTnaOpen && (
              <div className="mt-1 ml-4 pl-3 border-l border-emerald-800/40 space-y-1">
                {tnaMenuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${location.pathname === item.path
                        ? 'bg-emerald-600/30 text-emerald-200 border border-emerald-500/30 font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-emerald-900/20'
                      }`}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Training Management Collapsible Menu */}
          <div className="pt-2">
            <button
              onClick={() => setIsTrainingOpen(!isTrainingOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold transition-all text-slate-300 hover:text-white hover:bg-emerald-900/30"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>Training</span>
              </div>
              {isTrainingOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {isTrainingOpen && (
              <div className="mt-1 ml-4 pl-3 border-l border-emerald-800/40 space-y-1">
                {trainingMenuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${location.pathname === item.path
                        ? 'bg-emerald-600/30 text-emerald-200 border border-emerald-500/30 font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-emerald-900/20'
                      }`}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Other Menus */}
          <div className="pt-2 space-y-1">
            {otherMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${location.pathname === item.path
                    ? 'bg-emerald-600/30 text-white border border-emerald-500/40 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-emerald-900/30'
                  }`}
              >
                <item.icon className="w-4 h-4 text-emerald-400" />
                {item.label}
              </button>
            ))}
          </div>

          {/* System Administration Items */}
          <div className="pt-3 border-t border-emerald-900/40 mt-3 space-y-1">
            <div className="text-[10px] font-bold text-emerald-300/60 uppercase tracking-widest px-3 mb-1">Administration</div>
            {systemItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${location.pathname === item.path
                    ? 'bg-emerald-600/30 text-white border border-emerald-500/40 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-emerald-900/30'
                  }`}
              >
                <item.icon className="w-4 h-4 text-emerald-400" />
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        <div className="p-3 border-t border-emerald-900/40">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:text-white hover:bg-rose-900/30 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area - Expands to Fill Full Viewport */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Admin Header */}
        <header className="h-16 bg-white dark:bg-[#13221b] border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-10 shadow-sm">
          <div className="relative w-full max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search staff, programs, or records..."
              className="block w-full pl-10 pr-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/80 dark:bg-[#0f1a14] text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/40 transition-all"
            />
          </div>

          <div className="flex items-center gap-3.5">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-xl p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              aria-label="Theme toggle"
            >
              {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            {/* Back to Portal */}
            <button
              onClick={() => navigate('/home')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <Home className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>Employee Portal</span>
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={toggleNotifications}
                className="relative rounded-xl p-2 text-slate-500 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-800 dark:hover:text-emerald-300 transition-all"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-4.5 h-4.5" />
                {notifications.some((n) => !n.is_read) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white dark:border-[#13221b]" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 z-30 w-80 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-slate-800 dark:text-slate-100 shadow-xl animate-in fade-in slide-in-from-top-8">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-2 pb-2.5">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Notifications</p>
                    {notifications.length > 0 && (
                      <button
                        type="button"
                        onClick={clearNotifications}
                        className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  {notifications.length > 0 ? (
                    notifications.slice(0, 5).map((n) => (
                      <p key={n.id} className="border-b border-slate-100 dark:border-slate-800 px-2 py-3 text-xs last:border-0 text-slate-600 dark:text-slate-300">
                        {n.message}
                      </p>
                    ))
                  ) : (
                    <p className="px-2 py-6 text-xs text-center text-slate-400">No new notifications.</p>
                  )}
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1b3d2f] to-[#14261d] text-emerald-300 flex items-center justify-center text-xs font-extrabold ring-2 ring-emerald-500/20 shadow-sm">
                  {(currentUser?.first_name || currentUser?.username || 'A').charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-xs font-bold text-slate-800 dark:text-white leading-none">
                    {currentUser?.full_name || currentUser?.username || 'NIC Admin'}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-none mt-1">
                    {currentUser?.roles?.[0]?.role_name || 'Administrator'}
                  </p>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-30 ring-1 ring-black ring-opacity-5 animate-in fade-in slide-in-from-top-8">
                  <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-800 dark:text-white">{currentUser?.full_name || currentUser?.username}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{currentUser?.email}</p>
                  </div>
                  <button
                    onClick={() => { setIsProfileOpen(false); navigate('/home'); }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Home className="w-4 h-4 text-emerald-700 dark:text-emerald-400" /> Employee Workspace
                  </button>
                  <button
                    onClick={() => { setIsProfileOpen(false); navigate('/admin/staff'); }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Users className="w-4 h-4 text-emerald-700 dark:text-emerald-400" /> Staff Directory
                  </button>
                  <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area: Expanded Full Screen View */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10 xl:p-12 custom-scrollbar w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
