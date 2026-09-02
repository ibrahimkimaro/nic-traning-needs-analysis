import React, { useState, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';
import { api } from '../../auth/api';
import OrganizationBase from './OrganizationBase';

const PositionTable = ({ data, onEdit }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left border-collapse">
      <thead className="bg-slate-50/80 text-slate-500 text-[11px] uppercase tracking-widest font-bold">
        <tr>
          <th className="px-6 py-4">Position Title</th>
          <th className="px-6 py-4">Department</th>
          <th className="px-6 py-4">Grade Level</th>
          <th className="px-6 py-4 text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {data.length > 0 ? (
          data.map((item, idx) => (
            <tr key={item.id || idx} className="hover:bg-slate-50/80 transition-colors group">
              <td className="px-6 py-4 text-sm font-semibold text-slate-900">{item.title}</td>
              <td className="px-6 py-4 text-sm text-slate-600">{item.dept_name || 'N/A'}</td>
              <td className="px-6 py-4 text-sm text-slate-600 font-mono">{item.grade_level || 'N/A'}</td>
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
            <td colSpan="4" className="px-6 py-12 text-center text-slate-500">No positions found.</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

const PositionForm = ({ formData, handleInputChange }) => {
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const deps = await api.auth.getDepartments();
        setDepartments(deps);
      } catch (err) {
        console.error('Error fetching departments for positions:', err);
      }
    };
    fetchDepts();
  }, []);

  return (
    <>
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Position Title</label>
        <input name="title" value={formData.title || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-[#264033] outline-none" required />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Department</label>
        <select name="dept" value={formData.dept || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-[#264033] outline-none" required>
          <option value="">Select Department</option>
          {departments.map(dept => (
            <option key={dept.id} value={dept.id}>{dept.dept_name}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Grade Level</label>
        <input name="grade_level" value={formData.grade_level || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-[#264033] outline-none" placeholder="e.g. L3" />
      </div>
    </>
  );
};

const PositionManagement = () => {
  return (
    <OrganizationBase
      title="Position Management"
      subtitle="Define job roles and associated grade levels for the organization."
      apiEndpoint={api.auth.getPositions}
      saveFn={async (data, item) => {
        if (item) {
          return await api.auth.updatePosition(item.id, data);
        }
        return await api.auth.createPosition(data);
      }}
      Table={PositionTable}
      Form={PositionForm}
    />
  );
};

export default PositionManagement;
