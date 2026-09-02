import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, BarChart3, Settings,
  LogOut, Search, Bell, ChevronDown, ChevronRight, User,
  ShieldCheck, FileText, Building2, Briefcase, Target, Zap,
  LineChart, CheckCircle, BookOpen, DollarSign, Home, ArrowLeft
} from 'lucide-react';
import { api } from '../auth/api';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isOrgOpen, setIsOrgOpen] = useState(true);
  const [isTnaOpen, setIsTnaOpen] = useState(false);
  const [isTrainingOpen, setIsTrainingOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

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
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0f172a] text-slate-300 flex flex-col h-full z-20 shrink-0 border-r border-slate-800">
        <div className="p-5 flex items-center gap-3 border-b border-slate-800/80">
          <div className="w-8 h-8 bg-[#264033] rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-emerald-950/40">
            N
          </div>
          <div>
            <span className="text-white font-bold text-sm tracking-tight block">TNA System</span>
            <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Management Suite</span>
          </div>
        </div>

        {/* Back to Employee Portal Button */}
        <div className="p-3">
          <button
            onClick={() => navigate('/home')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 text-xs font-bold border border-emerald-800/40 transition-all group active:scale-95"
          >
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4 text-emerald-400" />
              <span>Employee Portal</span>
            </div>
            <ArrowLeft className="w-3.5 h-3.5 text-emerald-400 group-hover:-translate-x-0.5 transition-transform" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">Main Menu</div>

          {mainMenuItems.map(item => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                location.pathname === item.path
                  ? 'bg-[#264033] text-white shadow-sm ring-1 ring-[#264033]'
                  : 'hover:text-white hover:bg-slate-800 text-slate-400'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}

          {/* Organization Collapsible Menu */}
          <div className="pt-2">
            <button
              onClick={() => setIsOrgOpen(!isOrgOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4" />
                <span>Organization</span>
              </div>
              {isOrgOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {isOrgOpen && (
              <div className="mt-1 ml-4 pl-3 border-l border-slate-700/80 space-y-1">
                {orgMenuItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
                      location.pathname === item.path
                        ? 'text-white font-bold bg-[#264033]'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* TNA Engine Menu */}
          <div className="pt-2">
            <button
              onClick={() => setIsTnaOpen(!isTnaOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <div className="flex items-center gap-3">
                <Target className="w-4 h-4" />
                <span>TNA Engine</span>
              </div>
              {isTnaOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {isTnaOpen && (
              <div className="mt-1 ml-4 pl-3 border-l border-slate-700/80 space-y-1">
                {tnaMenuItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
                      location.pathname === item.path
                        ? 'text-white font-bold bg-[#264033]'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Training Delivery Menu */}
          <div className="pt-2">
            <button
              onClick={() => setIsTrainingOpen(!isTrainingOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4" />
                <span>Training Mgmt</span>
              </div>
              {isTrainingOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {isTrainingOpen && (
              <div className="mt-1 ml-4 pl-3 border-l border-slate-700/80 space-y-1">
                {trainingMenuItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
                      location.pathname === item.path
                        ? 'text-white font-bold bg-[#264033]'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Other Modules */}
          <div className="pt-3 border-t border-slate-800/80 mt-3 space-y-1">
            {otherMenuItems.map(item => (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  location.pathname === item.path
                    ? 'bg-[#264033] text-white shadow-sm ring-1 ring-[#264033]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>

          {/* System Items */}
          <div className="pt-3 border-t border-slate-800/80 mt-3 space-y-1">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-1">Administration</div>
            {systemItems.map(item => (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  location.pathname === item.path
                    ? 'bg-[#264033] text-white shadow-sm ring-1 ring-[#264033]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        <div className="p-3 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content View */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="relative w-full max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search staff, programs, or records..."
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#264033] transition-all"
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/home')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              <Home className="w-3.5 h-3.5 text-[#264033]" />
              <span>Employee Portal</span>
            </button>

            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="h-8 w-px bg-slate-200"></div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 p-1 hover:bg-slate-100 rounded-full transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#264033] text-white flex items-center justify-center text-xs font-bold ring-2 ring-emerald-500/20">
                  {(currentUser?.first_name || currentUser?.username || 'A').charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-xs font-bold text-slate-900 leading-none">
                    {currentUser?.full_name || currentUser?.username || 'NIC Admin'}
                  </p>
                  <p className="text-[10px] text-slate-500 leading-none mt-1">
                    {currentUser?.roles?.[0]?.role_name || 'Administrator'}
                  </p>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-30 ring-1 ring-black ring-opacity-5">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{currentUser?.full_name || currentUser?.username}</p>
                    <p className="text-[10px] text-slate-500 truncate">{currentUser?.email}</p>
                  </div>
                  <button
                    onClick={() => { setIsProfileOpen(false); navigate('/home'); }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Home className="w-4 h-4 text-[#264033]" /> Employee Workspace
                  </button>
                  <button
                    onClick={() => { setIsProfileOpen(false); navigate('/admin/staff'); }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Users className="w-4 h-4 text-[#264033]" /> Staff Directory
                  </button>
                  <div className="border-t border-slate-100 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
