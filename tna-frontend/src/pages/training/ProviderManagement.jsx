import React from 'react';
import OrganizationBase from '../organization/OrganizationBase';
import { api } from '../../auth/api';

const ProviderManagement = () => {
  return (
    <OrganizationBase
      title="Training Provider Management"
      subtitle="Manage external vendors and training institutions."
      dataKey="Provider"
      apiEndpoint={api.training.getProviders}
      createFn={async (data) => {
        return await api.training.createProvider(data);
      }}
      itemRender={(type, item) => {
        if (type === 'header') {
          return (
            <>
              <th className="px-6 py-4">Provider Name</th>
              <th className="px-6 py-4">Contact Person</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Rating</th>
            </>
          );
        }
        if (type === 'row') {
          return (
            <>
              <td className="px-6 py-4 text-sm font-semibold text-slate-900">{item.provider_name}</td>
              <td className="px-6 py-4 text-sm text-slate-600">{item.contact_person || 'N/A'}</td>
              <td className="px-6 py-4 text-sm text-slate-600">{item.email || 'N/A'}</td>
              <td className="px-6 py-4 text-sm font-medium text-amber-600">
                { '★'.repeat(item.rating || 0) }{ '☆'.repeat(5 - (item.rating || 0)) }
              </td>
            </>
          );
        }
        if (type === 'form') {
          return (
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Provider Name</label>
                <input name="provider_name" className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-[#264033] outline-none" required />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Person</label>
                <input name="contact_person" className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-[#264033] outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                <input name="email" type="email" className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-[#264033] outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rating (1-5)</label>
                <input name="rating" type="number" min="0" max="5" className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-[#264033] outline-none" />
              </div>
            </>
          );
        }
      }}
    />
  );
};

export default ProviderManagement;
