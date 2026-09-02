import React, { useState, useEffect } from 'react';
import {
  Search, Shield, Lock, UserPlus, Loader2, MoreVertical, X, Save,
  RefreshCw, User, Briefcase, Key, Building2, CheckCircle2, AlertCircle,
  Trash2, Edit3, Mail, Hash, Layers, Check, Sparkles
} from 'lucide-react';
import { api } from '../auth/api';

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Unified Form State
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    employee_number: '',
    dept: '',
    position: '',
    supervisor: '',
    status: 'ACTIVE',
    language_pref: 'en',
    role_ids: ['EMPLOYEE'],
    password: '',
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [staffData, deptsData, posData, rolesData] = await Promise.all([
        api.auth.getUsers(),
        api.auth.getDepartments(),
        api.auth.getPositions(),
        api.auth.getRoles(),
      ]);
      setStaff(staffData || []);
      setDepartments(deptsData || []);
      setPositions(posData || []);
      setRoles(rolesData || []);
    } catch (err) {
      setError(err.message || 'Failed to load staff information.');
    } finally {
      setLoading(false);
    }
  };

  const refreshStaffList = async () => {
    try {
      const staffData = await api.auth.getUsers();
      setStaff(staffData || []);
    } catch (err) {
      console.error('Failed to refresh staff list:', err);
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password: result }));
  };

  const generateEmployeeNumber = () => {
    const num = `NIC-${Math.floor(1000 + Math.random() * 9000)}`;
    setFormData(prev => ({ ...prev, employee_number: num }));
  };

  const handleOpenModal = (member = null) => {
    setSelectedMember(member);
    setModalError(null);

    if (member) {
      setFormData({
        username: member.username || '',
        email: member.email || '',
        first_name: member.first_name || '',
        last_name: member.last_name || '',
        employee_number: member.employee_number || '',
        dept: member.dept || (departments[0]?.id || ''),
        position: member.position || (positions[0]?.id || ''),
        supervisor: member.supervisor || '',
        status: member.status || 'ACTIVE',
        language_pref: member.language_pref || 'en',
        role_ids: member.roles?.map(r => r.role_name) || ['EMPLOYEE'],
        password: '',
      });
    } else {
      const randomNum = `NIC-${Math.floor(1000 + Math.random() * 9000)}`;
      setFormData({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        employee_number: randomNum,
        dept: departments[0]?.id || '',
        position: positions[0]?.id || '',
        supervisor: '',
        status: 'ACTIVE',
        language_pref: 'en',
        role_ids: ['EMPLOYEE'],
        password: 'password123',
      });
    }
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };

      // Auto-suggest username and email when typing first and last names for a new user
      if (!selectedMember) {
        if (name === 'first_name' || name === 'last_name') {
          const fn = (name === 'first_name' ? value : prev.first_name).trim().toLowerCase().replace(/[^a-z0-9]/g, '');
          const ln = (name === 'last_name' ? value : prev.last_name).trim().toLowerCase().replace(/[^a-z0-9]/g, '');
          if (fn && ln) {
            updated.username = `${fn}.${ln}`;
            updated.email = `${fn}.${ln}@nicinsurance.co.tz`;
          } else if (fn) {
            updated.username = fn;
            updated.email = `${fn}@nicinsurance.co.tz`;
          }
        }
      }
      return updated;
    });
  };

  const handleRoleToggle = (roleName) => {
    setFormData(prev => {
      const currentRoles = prev.role_ids || [];
      const exists = currentRoles.includes(roleName);
      let updatedRoles;
      if (exists) {
        updatedRoles = currentRoles.filter(r => r !== roleName);
        if (updatedRoles.length === 0) updatedRoles = ['EMPLOYEE'];
      } else {
        updatedRoles = [...currentRoles, roleName];
      }
      return { ...prev, role_ids: updatedRoles };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError(null);

    try {
      if (!formData.first_name || !formData.last_name) {
        throw new Error('Please enter both First Name and Last Name.');
      }
      if (!formData.username) {
        throw new Error('Please enter a valid Username.');
      }
      if (!formData.email) {
        throw new Error('Please enter a valid Work Email address.');
      }

      const payload = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        employee_number: formData.employee_number ? formData.employee_number.trim() : null,
        dept: formData.dept ? parseInt(formData.dept, 10) : null,
        position: formData.position ? parseInt(formData.position, 10) : null,
        supervisor: formData.supervisor ? formData.supervisor : null,
        status: formData.status || 'ACTIVE',
        language_pref: formData.language_pref || 'en',
        role_ids: formData.role_ids && formData.role_ids.length > 0 ? formData.role_ids : ['EMPLOYEE'],
      };

      if (formData.password && formData.password.trim() !== '') {
        payload.password = formData.password.trim();
      }

      if (selectedMember) {
        await api.auth.updateUser(selectedMember.id, payload);
        setSuccessMessage(`Staff member "${payload.first_name} ${payload.last_name}" updated successfully!`);
      } else {
        if (!payload.password) {
          payload.password = 'password123';
        }
        await api.auth.createUser(payload);
        setSuccessMessage(`New staff member "${payload.first_name} ${payload.last_name}" created successfully!`);
      }

      setIsModalOpen(false);
      await refreshStaffList();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setModalError(err.message || 'Failed to save staff member.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStaff = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove staff account for "${name}"?`)) {
      return;
    }

    try {
      await api.auth.deleteUser(id);
      setSuccessMessage(`Staff member "${name}" removed.`);
      await refreshStaffList();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const filteredStaff = staff.filter(s => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      (s.full_name || `${s.first_name} ${s.last_name}`).toLowerCase().includes(search) ||
      (s.email || '').toLowerCase().includes(search) ||
      (s.username || '').toLowerCase().includes(search) ||
      (s.employee_number || '').toLowerCase().includes(search) ||
      (s.dept_name || '').toLowerCase().includes(search) ||
      (s.position_title || '').toLowerCase().includes(search);

    const matchesDept = selectedDeptFilter ? String(s.dept) === String(selectedDeptFilter) : true;
    const matchesRole = selectedRoleFilter ? s.roles?.some(r => r.role_name === selectedRoleFilter) : true;

    return matchesSearch && matchesDept && matchesRole;
  });

  const availablePositions = formData.dept
    ? positions.filter(p => String(p.dept) === String(formData.dept))
    : positions;

  if (loading) {
    return (
      <div className="h-full w-full min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#264033]" />
          <p className="text-slate-500 font-medium text-sm">Loading staff registry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#264033] text-white rounded-2xl shadow-lg shadow-[#264033]/20">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Staff Management</h1>
            <p className="text-slate-500 text-sm mt-1">
              Unified registry for employee personal details, organizational placement, and system credentials.
            </p>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal(null)}
          className="bg-[#264033] hover:bg-[#1c3026] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
        >
          <UserPlus className="w-4 h-4" /> Add New Staff
        </button>
      </div>

      {/* Global Success / Error Alerts */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search by name, email, employee #, role..."
            className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#264033] transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#264033]"
          >
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.dept_name}</option>
            ))}
          </select>

          <select
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            className="px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#264033]"
          >
            <option value="">All Roles</option>
            {roles.map(r => (
              <option key={r.id} value={r.role_name}>{r.role_name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 text-slate-500 text-[11px] uppercase tracking-widest font-bold">
              <tr>
                <th className="px-6 py-4">Staff Member</th>
                <th className="px-6 py-4">Email & Roles</th>
                <th className="px-6 py-4">Department & Position</th>
                <th className="px-6 py-4">Supervisor</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStaff.length > 0 ? (
                filteredStaff.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#264033]/10 text-[#264033] flex items-center justify-center text-sm font-bold ring-2 ring-white shadow-sm shrink-0">
                          {(s.first_name || s.username || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{s.full_name || `${s.first_name} ${s.last_name}`.trim() || s.username}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                            <Hash className="w-3 h-3 text-slate-400" />
                            {s.employee_number || s.username}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm text-slate-700 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {s.email || 'N/A'}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {s.roles && s.roles.length > 0 ? (
                            s.roles.map(r => (
                              <span
                                key={r.id || r.role_name}
                                className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
                              >
                                {r.role_name}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">
                              EMPLOYEE
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-slate-800">{s.dept_name || 'Unassigned Dept'}</p>
                        <p className="text-xs text-slate-500">{s.position_title || 'Unassigned Position'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-700">{s.supervisor_name || 'None'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full ${
                        s.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : s.status === 'ON_LEAVE'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {s.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenModal(s)}
                          title="Edit Staff Member"
                          className="p-2 text-slate-500 hover:text-[#264033] hover:bg-slate-100 rounded-lg transition-all"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(s.id, s.full_name || s.username)}
                          title="Delete Staff Account"
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500 text-sm">
                    No staff members match the specified search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unified All-in-One Staff Modal (No Tab Confusion) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-top-6 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/90 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#264033] text-white rounded-xl shadow-sm">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {selectedMember ? `Edit Staff: ${selectedMember.full_name || selectedMember.username}` : 'Add New Staff Member'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enter personal details, organizational placement, and account credentials all in one form.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="mx-6 mt-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2.5 shrink-0">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {/* Scrollable Unified Form Body */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
              {/* SECTION 1: Personal & Employee Details */}
              <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/40 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#264033] flex items-center gap-2">
                  <User className="w-4 h-4" /> 1. Personal & Contact Information
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">First Name *</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      placeholder="e.g. Amani"
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-[#264033] outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Last Name *</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      placeholder="e.g. Kimaro"
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-[#264033] outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-600">Employee Number</label>
                      <button
                        type="button"
                        onClick={generateEmployeeNumber}
                        className="text-[10px] text-[#264033] font-bold hover:underline"
                      >
                        Auto ID
                      </button>
                    </div>
                    <input
                      type="text"
                      name="employee_number"
                      value={formData.employee_number}
                      onChange={handleInputChange}
                      placeholder="e.g. NIC-1045"
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-[#264033] outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Work Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="e.g. amani.kimaro@nicinsurance.co.tz"
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-[#264033] outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Organization & Reporting */}
              <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/40 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#264033] flex items-center gap-2">
                  <Building2 className="w-4 h-4" /> 2. Organizational Placement & Role
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Department</label>
                    <select
                      name="dept"
                      value={formData.dept}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-[#264033] outline-none font-medium"
                    >
                      <option value="">-- Select Department --</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.dept_name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Position / Job Title</label>
                    <select
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-[#264033] outline-none font-medium"
                    >
                      <option value="">-- Select Position --</option>
                      {availablePositions.map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Direct Supervisor</label>
                    <select
                      name="supervisor"
                      value={formData.supervisor}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-[#264033] outline-none font-medium"
                    >
                      <option value="">None (Top Level / Direct Executive)</option>
                      {staff
                        .filter(s => !selectedMember || s.id !== selectedMember.id)
                        .map(s => (
                          <option key={s.id} value={s.id}>
                            {s.full_name || s.username} ({s.position_title || s.dept_name || 'Staff'})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Employment Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-[#264033] outline-none font-medium"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="ON_LEAVE">On Leave</option>
                      <option value="RETIRED">Retired</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Account Credentials & System Roles */}
              <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/40 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#264033] flex items-center gap-2">
                  <Key className="w-4 h-4" /> 3. Login Credentials & System Permissions
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Username *</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="e.g. amani.kimaro"
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-[#264033] outline-none font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-600">
                        {selectedMember ? 'Change Password (Optional)' : 'Initial Password'}
                      </label>
                      <button
                        type="button"
                        onClick={generatePassword}
                        className="text-[10px] font-bold text-[#264033] hover:underline flex items-center gap-1 uppercase"
                      >
                        <RefreshCw className="w-3 h-3" /> Generate
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        name="password"
                        className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-[#264033] outline-none font-mono"
                        placeholder={selectedMember ? 'Leave blank to keep current password' : 'e.g. password123'}
                        value={formData.password}
                        onChange={handleInputChange}
                      />
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <Lock className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>

                {/* System Access Roles Chips */}
                <div className="space-y-2 pt-2 border-t border-slate-200/60">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#264033]" /> Assigned Security Roles
                  </label>
                  <p className="text-[11px] text-slate-500">Select all roles that apply to this staff member's access level:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {roles.map((r) => {
                      const isChecked = (formData.role_ids || []).includes(r.role_name);
                      return (
                        <button
                          type="button"
                          key={r.id || r.role_name}
                          onClick={() => handleRoleToggle(r.role_name)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold text-left border transition-all flex items-center justify-between ${
                            isChecked
                              ? 'bg-[#264033] text-white border-[#264033] shadow-sm'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <span>{r.role_name}</span>
                          {isChecked && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-3 flex gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 text-sm font-bold text-white bg-[#264033] hover:bg-[#1a2d24] rounded-xl transition-all shadow-md shadow-[#264033]/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Staff Record...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{selectedMember ? 'Save Changes' : 'Create Staff Member'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
