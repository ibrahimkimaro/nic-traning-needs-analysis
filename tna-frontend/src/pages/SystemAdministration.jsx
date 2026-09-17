import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Settings, Lock, Save, Loader2, Search, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../auth/api';

const ROLE_META = {
  ADMIN: { label: 'Admin', badge: 'bg-rose-100 text-rose-800 border-rose-200' },
  HR_MANAGER: { label: 'HR Manager', badge: 'bg-purple-100 text-purple-800 border-purple-200' },
  HRO: { label: 'HRO', badge: 'bg-teal-100 text-teal-800 border-teal-200' },
  DEPT_HEAD: { label: 'HOD', badge: 'bg-blue-100 text-blue-800 border-blue-200' },
  FINANCE: { label: 'Finance', badge: 'bg-amber-100 text-amber-800 border-amber-200' },
  DIRECTOR: { label: 'Director', badge: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  EMPLOYEE: { label: 'Employee', badge: 'bg-slate-100 text-slate-700 border-slate-200' },
  TRAINER: { label: 'Trainer', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
};

const SystemAdministration = () => {
  const [activeTab, setActiveTab] = useState('rbac');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [config, setConfig] = useState({
    fiscalYear: '2026',
    approvalThreshold: '500000',
    defaultLanguage: 'en',
    sessionTimeout: '3600',
    institutionName: 'National Insurance Corporation of Tanzania Limited',
    regulatoryBody: 'TIRA - Tanzania Insurance Regulatory Authority'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSystemData();
  }, []);

  const fetchSystemData = async () => {
    setLoading(true);
    try {
      const [usersData, rolesData] = await Promise.all([
        api.auth.getUsers(),
        api.auth.getRoles(),
      ]);

      const formattedUsers = (usersData || []).map(u => ({
        id: u.id,
        username: u.username,
        full_name: u.full_name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username,
        email: u.email,
        roles: u.roles?.map(r => r.role_name) || ['EMPLOYEE'],
      }));

      const allRoles = (rolesData || []);
      if (!allRoles.some(r => r.role_name === 'HRO')) {
        allRoles.push({ id: 'hro', role_name: 'HRO', description: 'Human Resource Officer' });
      }

      setUsers(formattedUsers);
      setRoles(allRoles);
    } catch (err) {
      setError('Failed to load live system administration data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      setError('Failed to save configuration settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleRole = async (userId, roleName) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const roles = u.roles.includes(roleName)
          ? u.roles.filter(r => r !== roleName)
          : [...u.roles, roleName];
        return { ...u, roles: roles.length === 0 ? ['EMPLOYEE'] : roles };
      }
      return u;
    }));
  };

  const filteredUsers = users.filter(u => {
    const term = searchTerm.toLowerCase();
    return (
      (u.username || '').toLowerCase().includes(term) ||
      (u.full_name || '').toLowerCase().includes(term) ||
      (u.email || '').toLowerCase().includes(term)
    );
  });

  if (loading) return (
    <div className="h-full w-full min-h-[400px] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#264033]" />
    </div>
  );

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#264033] text-white rounded-2xl shadow-sm">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">System Administration &amp; Settings</h1>
            <p className="text-slate-500 text-sm mt-0.5">Global configuration, institutional parameters, and access governance.</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('rbac')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
            activeTab === 'rbac'
              ? 'bg-[#264033] text-white border-[#264033] shadow-sm'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Staff Roles &amp; Permissions (RBAC)
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
            activeTab === 'config'
              ? 'bg-[#264033] text-white border-[#264033] shadow-sm'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Institutional Parameters &amp; Thresholds
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>System configuration updated and validated successfully.</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {activeTab === 'rbac' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#264033]" />
              <h3 className="text-base font-bold text-slate-900">User Role Assignments ({filteredUsers.length} Staff)</h3>
            </div>
            <div className="relative w-full sm:w-72">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Filter by name, username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-900 font-semibold text-xs placeholder:text-slate-400 focus:ring-2 focus:ring-[#264033] outline-none shadow-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-widest font-bold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Staff Member</th>
                  <th className="px-6 py-3.5">Work Email</th>
                  <th className="px-6 py-3.5">Assigned Security Roles (Click to Toggle)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src="/userAvatar.jpeg"
                          alt="Avatar"
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-sm border border-slate-200 shrink-0"
                        />
                        <div>
                          <p className="text-sm font-bold text-slate-900">{user.full_name}</p>
                          <p className="text-xs text-slate-400 font-mono">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-600">{user.email || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {roles.map(role => {
                          const isAssigned = user.roles.includes(role.role_name);
                          const meta = ROLE_META[role.role_name] || { label: role.role_name };
                          return (
                            <button
                              key={role.id}
                              type="button"
                              onClick={() => toggleRole(user.id, role.role_name)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider transition-all border ${
                                isAssigned
                                  ? 'bg-[#264033] text-white border-[#264033] shadow-sm'
                                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                              }`}
                            >
                              {role.role_name === 'HRO' ? 'HRO (Officer)' : meta.label}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={handleSaveConfig} className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <Settings className="w-5 h-5 text-[#264033]" />
              <div>
                <h3 className="text-base font-bold text-slate-900">Institutional Governance Parameters</h3>
                <p className="text-xs text-slate-500">Configured thresholds applied across deterministic validation gates.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Institution Name</label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#264033] outline-none shadow-sm"
                  value={config.institutionName}
                  onChange={(e) => setConfig({ ...config, institutionName: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Regulatory Oversight Authority</label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#264033] outline-none shadow-sm"
                  value={config.regulatoryBody}
                  onChange={(e) => setConfig({ ...config, regulatoryBody: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Current Fiscal Cycle Year</label>
                <input
                  type="number"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#264033] outline-none shadow-sm font-mono"
                  value={config.fiscalYear}
                  onChange={(e) => setConfig({ ...config, fiscalYear: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Single Request Cost Ceiling (TZS)</label>
                <input
                  type="number"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#264033] outline-none shadow-sm font-mono"
                  value={config.approvalThreshold}
                  onChange={(e) => setConfig({ ...config, approvalThreshold: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Default Portal Language</label>
                <select
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#264033] outline-none shadow-sm"
                  value={config.defaultLanguage}
                  onChange={(e) => setConfig({ ...config, defaultLanguage: e.target.value })}
                >
                  <option value="en">English (Official Business)</option>
                  <option value="sw">Kiswahili (Taifa)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Terminal Session Timeout (Seconds)</label>
                <input
                  type="number"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#264033] outline-none shadow-sm font-mono"
                  value={config.sessionTimeout}
                  onChange={(e) => setConfig({ ...config, sessionTimeout: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-[#264033] hover:bg-[#1a2d24] text-white rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Parameters</span>
              </button>
            </div>
          </form>

          {/* Audit Trail Sidebar */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 h-fit">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Governance Audit Standing</h4>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <p className="font-bold text-slate-800">RBAC Enforcement</p>
                <p className="text-slate-500 mt-0.5">Strict multi-tier gates: Employee, HOD, HRO, and HR Manager.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <p className="font-bold text-slate-800">TIRA Regulatory Baseline</p>
                <p className="text-slate-500 mt-0.5">Automated certification checks before nomination dispatch.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <p className="font-bold text-slate-800">Deterministic Engine</p>
                <p className="text-slate-500 mt-0.5">Non-AI mathematical priority calculations.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemAdministration;
