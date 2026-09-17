import React, { useState } from 'react';
import {
    Settings, Database, Network, Globe, ShieldCheck,
    Users, ArrowRight, Activity, CheckCircle2, Shield
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
        <div className="space-y-6 w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#264033] text-white rounded-2xl shadow-sm">
                        <Settings className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                            Enterprise Configuration &amp; Settings
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">
                            Multi-tenant schema isolation, standard skill taxonomies, telemetry integration, and talent marketplace settings.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                        Platform v2.4 · Active
                    </span>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 overflow-x-auto custom-scrollbar gap-2 pb-px w-full">
                {[
                    { id: 'multi-tenancy', label: 'Multi-Tenant Schema Isolation', icon: Database },
                    { id: 'taxonomies', label: 'Global Skill Taxonomies', icon: Globe },
                    { id: 'xapi-lrs', label: 'xAPI & LRS Learning Telemetry', icon: Network },
                    { id: 'marketplace', label: 'Talent Marketplace & Staffing', icon: Users },
                ].map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 py-2.5 px-4 font-semibold text-xs uppercase tracking-wider transition-all border-b-2 whitespace-nowrap rounded-t-xl ${
                                isActive
                                    ? 'bg-[#264033] text-white border-[#264033] shadow-sm'
                                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Tab 1: Multi-Tenancy */}
            {activeTab === 'multi-tenancy' && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full">
                    <div className="xl:col-span-2 bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                        <div>
                            <h3 className="text-base font-bold text-slate-900">PostgreSQL Schema Isolation Engine</h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Strict tenant separation ensures institutional data integrity. Each corporate division operates within its dedicated schema boundary.
                            </p>
                        </div>

                        <div className="space-y-3">
                            {[
                                { tenant: 'NIC Head Office (Dar es Salaam)', schema: 'tenant_nic_hq', status: 'ACTIVE', users: 842, dbSize: '1.4 GB' },
                                { tenant: 'NIC Zanzibar Operations', schema: 'tenant_nic_znz', status: 'ACTIVE', users: 185, dbSize: '320 MB' },
                                { tenant: 'NIC Arusha Regional Branch', schema: 'tenant_nic_arusha', status: 'ACTIVE', users: 94, dbSize: '145 MB' },
                                { tenant: 'Tanzania Reinsurance (Sandbox)', schema: 'tenant_tanre_sandbox', status: 'STAGING', users: 24, dbSize: '45 MB' },
                            ].map((t, idx) => (
                                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-900">{t.tenant}</h4>
                                        <p className="text-[11px] font-mono text-slate-500 mt-0.5">schema: {t.schema}</p>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs">
                                        <span className="font-semibold text-slate-600">{t.users} Users • {t.dbSize}</span>
                                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                                            {t.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <h3 className="text-base font-bold text-slate-900">Security Architecture</h3>
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs text-slate-600">
                            <div className="flex items-start gap-2.5">
                                <ShieldCheck className="w-4 h-4 text-[#264033] shrink-0 mt-0.5" />
                                <span>1. TenantResolverMiddleware intercepts incoming domain and header tokens.</span>
                            </div>
                            <div className="flex items-start gap-2.5">
                                <ShieldCheck className="w-4 h-4 text-[#264033] shrink-0 mt-0.5" />
                                <span>2. Dynamic SET search_path TO tenant_schema executes at connection level.</span>
                            </div>
                            <div className="flex items-start gap-2.5">
                                <ShieldCheck className="w-4 h-4 text-[#264033] shrink-0 mt-0.5" />
                                <span>3. Cross-tenant data querying is blocked at the database engine level.</span>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                            <strong>Compliance:</strong> Meets statutory national security guidelines and internal IT governance benchmarks.
                        </div>
                    </div>
                </div>
            )}

            {/* Tab 2: Global Taxonomies */}
            {activeTab === 'taxonomies' && (
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 w-full">
                    <div>
                        <h3 className="text-base font-bold text-slate-900">Standardized Skill Taxonomies</h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Standardizes internal organizational competencies against recognized industry frameworks.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-800">Lightcast Framework</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">Synchronized</span>
                            </div>
                            <div className="text-2xl font-bold text-slate-900 font-mono">33,400+</div>
                            <p className="text-xs text-slate-500">Universal skill definitions mapped to operational job descriptions.</p>
                        </div>

                        <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-800">ESCO Taxonomy</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">Synchronized</span>
                            </div>
                            <div className="text-2xl font-bold text-slate-900 font-mono">13,900+</div>
                            <p className="text-xs text-slate-500">Structured competency and occupational hierarchy crosswalks.</p>
                        </div>

                        <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-800">O*NET Classifications</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">Synchronized</span>
                            </div>
                            <div className="text-2xl font-bold text-slate-900 font-mono">1,100+ Roles</div>
                            <p className="text-xs text-slate-500">Standardized job families and operational task matrices.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab 3: xAPI & LRS */}
            {activeTab === 'xapi-lrs' && (
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 w-full">
                    <div>
                        <h3 className="text-base font-bold text-slate-900">Learning Telemetry &amp; LRS Ingestion (xAPI / cmi5)</h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Captures continuous learning signals across internal documentation, test environments, and compliance workshops formatted as Actor-Verb-Object statements.
                        </p>
                    </div>

                    <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono text-xs space-y-2 overflow-x-auto">
                        <div className="flex items-center justify-between text-slate-500 border-b border-slate-200 pb-2 mb-2 font-sans text-xs">
                            <span>Ingested Telemetry Statement Payload</span>
                            <span className="text-emerald-700 font-mono font-bold">200 OK · Validated</span>
                        </div>
                        <pre className="text-slate-800">{JSON.stringify({
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
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 w-full">
                    <div>
                        <h3 className="text-base font-bold text-slate-900">Skill-Based Dynamic Staffing &amp; Talent Allocation</h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Matches verified skill competencies against organizational projects and departmental staffing openings.
                        </p>
                    </div>

                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-bold border-b border-slate-200">
                                    <th className="px-5 py-3.5">Employee</th>
                                    <th className="px-5 py-3.5">Primary Role</th>
                                    <th className="px-5 py-3.5">Current Assignment</th>
                                    <th className="px-5 py-3.5">Utilization</th>
                                    <th className="px-5 py-3.5">Match Fit Score</th>
                                    <th className="px-5 py-3.5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {talentStaffing.map((m, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="px-5 py-4 text-xs font-bold text-slate-900">{m.name}</td>
                                        <td className="px-5 py-4 text-xs text-slate-600">{m.role}</td>
                                        <td className="px-5 py-4 text-xs text-slate-600">{m.currentProject}</td>
                                        <td className="px-5 py-4 text-xs font-bold text-slate-700">{(m.util * 100).toFixed(0)}%</td>
                                        <td className="px-5 py-4">
                                            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                                                {m.fitScore}% Fit
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <button className="px-3.5 py-1.5 bg-[#264033] hover:bg-[#1a2d24] text-white text-xs font-semibold rounded-lg shadow-sm transition-all">
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