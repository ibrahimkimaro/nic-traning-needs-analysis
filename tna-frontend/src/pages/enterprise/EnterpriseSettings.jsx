import React, { useState } from 'react';
import {
  Settings, Database, Network, Share2, Globe, ShieldCheck,
  CheckCircle2, AlertCircle, RefreshCw, Cpu, Server, Sparkles,
  Layers, Users, ArrowRight, Activity, Terminal
} from 'lucide-react';

const EnterpriseSettings = () => {
  const [activeTab, setActiveTab] = useState('multi-tenancy');

  const [talentStaffing] = useState([
    { name: 'David Kimaro', role: 'Senior Actuary', currentProject: 'Risk Review', util: 0.7, fitScore: 94, readiness: 'Immediate' },
    { name: 'Sarah Mrema', role: 'Full Stack Engineer', currentProject: 'Portal V2', util: 0.4, fitScore: 88, readiness: 'Available (60%)' },
    { name: 'Hamisi Juma', role: 'Claims Lead', currentProject: 'Underwriting Audit', util: 0.9, fitScore: 79, readiness: 'Fully Allocated' },
    { name: 'Grace Massawe', role: 'Cybersecurity Analyst', currentProject: 'Security Posture', util: 0.3, fitScore: 96, readiness: 'Immediate' },
  ]);

  return (
    <div className="space-y-8 w-full">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#142d22] via-[#1b3d2f] to-[#25503e] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-emerald-800/30 flex flex-col md:flex-row md:items-center justify-between gap-6 w-full">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/25 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Enterprise Infrastructure & Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Enterprise Architecture & Platform Configuration
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            Multi-tenant PostgreSQL schema isolation, global taxonomy ontologies (Lightcast / ESCO), xAPI / LRS telemetry, and skill-based talent marketplace integration.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200/80 dark:border-slate-800 overflow-x-auto custom-scrollbar gap-2 pb-px w-full">
        {[
          { id: 'multi-tenancy', label: 'Multi-Tenant Schema Isolation', icon: Database },
          { id: 'taxonomies', label: 'Global Skill Taxonomies', icon: Globe },
          { id: 'xapi-lrs', label: 'xAPI & LRS Learning Telemetry', icon: Network },
          { id: 'marketplace', label: 'Talent Marketplace & Staffing', icon: Users },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 py-3 px-4.5 font-bold text-xs uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-[#1b3d2f] dark:border-emerald-400 text-[#1b3d2f] dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-t-xl'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 rounded-t-xl'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Multi-Tenancy */}
      {activeTab === 'multi-tenancy' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full">
          <div className="xl:col-span-2 bg-white dark:bg-[#13221b] p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">PostgreSQL Schema Isolation Engine</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Zero cross-tenant data leakage through django-tenants. Each corporate division or subsidiary operates in its own physical schema boundary.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { tenant: 'NIC Head Office (Dar es Salaam)', schema: 'tenant_nic_hq', status: 'ACTIVE', users: 842, dbSize: '1.4 GB' },
                { tenant: 'NIC Zanzibar Operations', schema: 'tenant_nic_znz', status: 'ACTIVE', users: 185, dbSize: '320 MB' },
                { tenant: 'NIC Arusha Regional Branch', schema: 'tenant_nic_arusha', status: 'ACTIVE', users: 94, dbSize: '145 MB' },
                { tenant: 'Tanzania Reinsurance (Sandbox)', schema: 'tenant_tanre_sandbox', status: 'STAGING', users: 24, dbSize: '45 MB' },
              ].map((t, idx) => (
                <div key={idx} className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0f1a14] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white">{t.tenant}</h4>
                    <p className="text-[11px] font-mono text-emerald-800 dark:text-emerald-400 mt-0.5">schema: {t.schema}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">{t.users} Users • {t.dbSize}</span>
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40">
                      {t.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#13221b] p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Security Lifecycle</h3>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0f1a14] border border-slate-200 dark:border-slate-800 space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>1. TenantResolverMiddleware intercepts incoming domain and header tokens.</span>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>2. Dynamic SET search_path TO tenant_schema executes at connection level.</span>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>3. Cross-tenant data querying is impossible at the database engine level.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Global Taxonomies */}
      {activeTab === 'taxonomies' && (
        <div className="bg-white dark:bg-[#13221b] p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 w-full">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Global Skill Taxonomies & Ontological Crosswalks</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Standardizes raw internal skill labels using 384-dimensional dense vector embeddings and cosine similarity indexing against Lightcast (33,000+ skills), ESCO (13,900+ skills), and O*NET.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 space-y-2">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Lightcast Open Skills</span>
              <div className="text-2xl font-extrabold text-slate-800 dark:text-white">33,400+</div>
              <p className="text-[11px] text-slate-500">Vector indexed with HNSW cosine search threshold (cos θ ≥ 0.82)</p>
            </div>

            <div className="p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40 space-y-2">
              <span className="text-xs font-bold text-blue-800 dark:text-blue-300">European ESCO Ontologies</span>
              <div className="text-2xl font-extrabold text-slate-800 dark:text-white">13,900+</div>
              <p className="text-[11px] text-slate-500">Multilingual competency and occupational hierarchy</p>
            </div>

            <div className="p-5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-800/40 space-y-2">
              <span className="text-xs font-bold text-purple-800 dark:text-purple-300">O*NET Occupational Crosswalk</span>
              <div className="text-2xl font-extrabold text-slate-800 dark:text-white">1,100+ Roles</div>
              <p className="text-[11px] text-slate-500">Standardized job family classifications and task rubrics</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: xAPI & LRS */}
      {activeTab === 'xapi-lrs' && (
        <div className="bg-white dark:bg-[#13221b] p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 w-full">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Real-Time Informal Learning Telemetry (xAPI / cmi5)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Captures experiential learning across internal technical wikis, coding sandboxes, code reviews, and VR simulations formatted as Actor-Verb-Object statement triples.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0f172a] text-emerald-400 font-mono text-xs space-y-2 overflow-x-auto">
            <p className="text-slate-400">// Ingested Live xAPI Statement Payload</p>
            <pre>{JSON.stringify({
              actor: { mbox: "mailto:d.kimaro@nic.co.tz", name: "David Kimaro" },
              verb: { id: "http://adlnet.gov/expapi/verbs/completed", display: { "en-US": "completed" } },
              object: { id: "http://nic.co.tz/courses/tira-compliance-2026", definition: { name: { "en-US": "TIRA Statutory Risk Assessment" } } },
              result: { score: { raw: 95, min: 0, max: 100 }, success: true }
            }, null, 2)}</pre>
          </div>
        </div>
      )}

      {/* Tab 4: Talent Marketplace */}
      {activeTab === 'marketplace' && (
        <div className="bg-white dark:bg-[#13221b] p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 w-full">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Skill-Based Dynamic Staffing & Talent Marketplace</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Computes real-time project match fit score: Fit Score = Σ (w_i × P_i(t) × (1 - U_allocation)).
            </p>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-[#0f1a14] text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-widest font-bold border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Primary Role</th>
                  <th className="px-6 py-4">Current Assignment</th>
                  <th className="px-6 py-4">Utilization</th>
                  <th className="px-6 py-4">Computed Fit Score</th>
                  <th className="px-6 py-4 text-right">Deployment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {talentStaffing.map((m, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-xs font-bold text-slate-800 dark:text-white">{m.name}</td>
                    <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-300">{m.role}</td>
                    <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-300">{m.currentProject}</td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-700 dark:text-slate-300">{(m.util * 100).toFixed(0)}%</td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40">
                        {m.fitScore}% Fit
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="px-3.5 py-1.5 bg-[#1b3d2f] hover:bg-[#132e23] text-white text-xs font-bold rounded-xl shadow-sm transition-all">
                        Assign to Project
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnterpriseSettings;
