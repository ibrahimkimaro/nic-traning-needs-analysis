import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Settings, Lock, Save, Loader2, Search, RefreshCw } from 'lucide-react';
import { api } from '../auth/api';

const SystemAdministration = () => {
  const [activeTab, setActiveTab] = useState('rbac');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [config, setConfig] = useState({
    fiscalYear: '2026',
    approvalThreshold: '500000',
    defaultLanguage: 'en',
    sessionTimeout: '3600'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSystemData();
  }, []);

  const fetchSystemData = async () => {
    setLoading(true);
    try {
      // Mocking the user/role data since endpoints are limited
      // In a real app, these would be api.accounts.getUsers() and api.accounts.getRoles()
      setRoles([
        { id: 1, role_name: 'ADMIN', description: 'Full system access' },
        { id: 2, role_name: 'HR_MANAGER', description: 'Manage training and employees' },
        { id: 3, role_name: 'DEPT_HEAD', description: 'Approve department requests' },
        { id: 4, role_name: 'FINANCE', description: 'Budget and expenditure oversight' },
        { id: 5, role_name: 'EMPLOYEE', description: 'Standard user access' },
      ]);

      // Mocking users for the UI
      setUsers([
        { id: 'u1', username: 'admin', email: 'admin@nic.gov.tz', roles: ['ADMIN'] },
        { id: 'u2', username: 'hr_manager', email: 'hr@nic.gov.tz', roles: ['HR_MANAGER'] },
        { id: 'u3', username: 'dept_head_1', email: 'head1@nic.gov.tz', roles: ['DEPT_HEAD', 'EMPLOYEE'] },
        { id: 'u4', username: 'finance_off', email: 'finance@nic.gov.tz', roles: ['FINANCE', 'EMPLOYEE'] },
      ]);
    } catch (err) {
      setError('Failed to load system data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('System configuration updated successfully!');
    } catch (err) {
      setError('Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleRole = (userId, roleName) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const roles = u.roles.includes(roleName)
          ? u.roles.filter(r => r !== roleName)
          : [...u.roles, roleName];
        return { ...u, roles };
      }
      return u;
    }));
  };

  if (loading) return (
    <div className="h-full w-full flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#264033]" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#264033] text-white rounded-2xl shadow-lg shadow-emerald-900/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Administration</h1>
            <p className="text-slate-500 text-sm mt-1">Global configuration and access control center.</p>
          </div>
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-slate-200/50 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('rbac')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'rbac' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          User RBAC
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'config' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Org Config
        </button>
      </div>

      {activeTab === 'rbac' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-slate-400" />
              <h3 className="text-lg font-bold text-slate-900">User Role Assignments</h3>
            </div>
            <div className="relative w-64">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input type="text" placeholder="Search users..." className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-[#264033] outline-none" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/80 text-slate-500 text-[11px] uppercase tracking-widest font-bold">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Assigned Roles</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 ring-2 ring-white shadow-sm">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-sm font-semibold text-slate-900">{user.username}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {roles.map(role => (
                          <button
                            key={role.id}
                            onClick={() => toggleRole(user.id, role.role_name)}
                            className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                              user.roles.includes(role.role_name)
                                ? 'bg-[#264033] text-white shadow-sm'
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            }`}
                          >
                            {role.role_name}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-all">
                        <Settings className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-5 h-5 text-slate-400" />
              <h3 className="text-lg font-bold text-slate-900">Global Configuration</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Fiscal Year</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-[#264033] outline-none"
                  value={config.fiscalYear}
                  onChange={(e) => setConfig({ ...config, fiscalYear: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Budget Approval Threshold (TZS)</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-[#264033] outline-none"
                  value={config.approvalThreshold}
                  onChange={(e) => setConfig({ ...config, approvalThreshold: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Default System Language</label>
                <select
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-[#264033] outline-none"
                  value={config.defaultLanguage}
                  onChange={(e) => setConfig({ ...config, defaultLanguage: e.target.value })}
                >
                  <option value="en">English</option>
                  <option value="sw">Swahili</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Session Timeout (Seconds)</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-[#264033] outline-none"
                  value={config.sessionTimeout}
                  onChange={(e) => setConfig({ ...config, sessionTimeout: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button
                onClick={handleSaveConfig}
                disabled={isSaving}
                className="bg-[#264033] hover:bg-[#1a2d24] text-white px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <Lock className="w-5 h-5 text-slate-400" />
              <h3 className="text-lg font-bold text-slate-900">Quick Security</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-sm text-slate-600">Audit Logs Active</span>
                <div className="w-10 h-5 bg-emerald-500 rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-sm text-slate-600">Strict Password Policy</span>
                <div className="w-10 h-5 bg-slate-300 rounded-full relative cursor-pointer">
                  <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-sm text-slate-600">Auto-Lock Sessions</span>
                <div className="w-10 h-5 bg-emerald-500 rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
            <div className="pt-4">
              <button className="w-full py-2 text-xs font-bold text-[#264033] border border-[#264033] rounded-lg hover:bg-emerald-50 transition-colors">
                Open Detailed Security Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemAdministration;
