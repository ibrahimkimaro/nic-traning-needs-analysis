import React, { useState, useEffect } from 'react';
import OrganizationBase from '../organization/OrganizationBase';
import { api } from '../../auth/api';

const ProgramManagement = () => {
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const data = await api.training.getProviders();
        setProviders(data);
      } catch (err) {
        console.error('Error fetching providers:', err);
      }
    };
    fetchProviders();
  }, []);

  return (
    <OrganizationBase
      title="Training Program Management"
      subtitle="Define and manage available training courses and programs."
      dataKey="Program"
      apiEndpoint={api.training.getPrograms}
      createFn={async (data) => {
        return await api.training.createProgram(data);
      }}
      itemRender={(type, item) => {
        if (type === 'header') {
          return (
            <>
              <th className="px-6 py-4">Program Title</th>
              <th className="px-6 py-4">Provider</th>
              <th className="px-6 py-4">Duration</th>
              <th className="px-6 py-4">Cost / Person</th>
            </>
          );
        }
        if (type === 'row') {
          return (
            <>
              <td className="px-6 py-4 text-sm font-semibold text-slate-900">{item.title}</td>
              <td className="px-6 py-4 text-sm text-slate-600">{item.provider?.provider_name || 'Internal'}</td>
              <td className="px-6 py-4 text-sm text-slate-600">{item.duration_hours} hrs</td>
              <td className="px-6 py-4 text-sm font-medium text-slate-700">{item.cost_per_person?.toLocaleString()} TZS</td>
            </>
          );
        }
        if (type === 'form') {
          return (
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Program Title</label>
                <input name="title" className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-[#264033] outline-none" required />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                <textarea name="description" rows="3" className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-[#264033] outline-none" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Duration (Hours)</label>
                  <input name="duration_hours" type="number" className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-[#264033] outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cost Per Person</label>
                  <input name="cost_per_person" type="number" className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-[#264033] outline-none" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Provider</label>
                <select name="provider" className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-[#264033] outline-none">
                  <option value="">Internal / None</option>
                  {providers.map(p => (
                    <option key={p.id} value={p.id}>{p.provider_name}</option>
                  ))}
                </select>
              </div>
            </>
          );
        }
      }}
    />
  );
};

export default ProgramManagement;
