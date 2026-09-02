import React, { useState, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';
import { api } from '../../auth/api';
import OrganizationBase from './OrganizationBase';

const DepartmentTable = ({ data, onEdit }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left border-collapse">
      <thead className="bg-slate-50/80 text-slate-500 text-[11px] uppercase tracking-widest font-bold">
        <tr>
          <th className="px-6 py-4">Department Name</th>
          <th className="px-6 py-4">Code</th>
          <th className="px-6 py-4">Department Head</th>
          <th className="px-6 py-4">Parent Dept</th>
          <th className="px-6 py-4 text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {data.length > 0 ? (
          data.map((item, idx) => (
            <tr key={item.id || idx} className="hover:bg-slate-50/80 transition-colors group">
              <td className="px-6 py-4 text-sm font-semibold text-slate-900">{item.dept_name}</td>
              <td className="px-6 py-4 text-sm font-mono text-slate-600">{item.dept_code}</td>
              <td className="px-6 py-4 text-sm text-slate-600">{item.head_name || item.head_username || 'Not Assigned'}</td>
              <td className="px-6 py-4 text-sm text-slate-500">{item.parent_dept_name || 'Top Level'}</td>
              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => onEdit(item)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-all"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="5" className="px-6 py-12 text-center text-slate-500">No departments found.</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

const DepartmentForm = ({ formData, handleInputChange }) => {
  const [depts, setDepts] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const [deps, usersList] = await Promise.all([
          api.auth.getDepartments(),
          api.auth.getUsers(),
        ]);
        setDepts(deps);
        setUsers(usersList);
      } catch (err) {
        console.error('Error fetching form data for departments:', err);
      }
    };
    fetchFormData();
  }, []);

  return (
    <>
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Department Name</label>
        <input name="dept_name" value={formData.dept_name || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-[#264033] outline-none" required />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Department Code</label>
        <input name="dept_code" value={formData.dept_code || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-[#264033] outline-none" required />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Department Head</label>
        <select name="head" value={formData.head || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-[#264033] outline-none">
          <option value="">None (Unassigned)</option>
          {users.map(u => (
            <option key={u.id} value={u.id}>{u.full_name || u.username}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Parent Department</label>
        <select name="parent_dept" value={formData.parent_dept || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-[#264033] outline-none">
          <option value="">None (Top Level)</option>
          {depts.filter(d => d.id !== formData.id).map(d => (
            <option key={d.id} value={d.id}>{d.dept_name}</option>
          ))}
        </select>
      </div>
    </>
  );
};

const DepartmentManagement = () => {
  return (
    <OrganizationBase
      title="Department Management"
      subtitle="Define organizational structures and designate department heads."
      apiEndpoint={api.auth.getDepartments}
      saveFn={async (data, item) => {
        if (item) {
          return await api.auth.updateDepartment(item.id, data);
        }
        return await api.auth.createDepartment(data);
      }}
      Table={DepartmentTable}
      Form={DepartmentForm}
    />
  );
};

export default DepartmentManagement;
