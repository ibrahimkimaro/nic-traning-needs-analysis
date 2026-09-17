import React, { useState, useEffect } from 'react';
import {
    TrendingUp, Award, DollarSign, Calculator, Target, Users, BookOpen,
    ArrowRight, ShieldCheck, Clock, CheckCircle2, AlertTriangle,
    Layers, BarChart2, RefreshCw, ChevronRight, Activity, Percent, Building2,
    Sliders, Zap, HelpCircle, Compass, Radio, AlertOctagon, TrendingDown,
    ArrowUpRight, Cpu, Server, Check, X, Filter
} from 'lucide-react';
import { api } from '../../auth/api';

const EnterpriseAnalytics = () => {
    const [activeSubTab, setActiveSubTab] = useState('bottleneck-filter');

    // ==========================================
    // 1. HARD-CODED BOTTLENECK FILTER (RULE-BASED)
    // ==========================================
    const [bottleneckInput, setBottleneckInput] = useState({
        gap_name: 'Core Policy Issuance Latency',
        department: 'Underwriting & Operations',
        system_downtime_pct: 6.8,
        missing_licenses: false,
        outdated_hardware: true,
        tooling_process_blocker: false,
    });

    const isOperationalConstraint = (
        bottleneckInput.system_downtime_pct > 5.0 ||
        bottleneckInput.missing_licenses ||
        bottleneckInput.outdated_hardware ||
        bottleneckInput.tooling_process_blocker
    );

    const bottleneckReasons = [];
    if (bottleneckInput.system_downtime_pct > 5.0) {
        bottleneckReasons.push(`System Downtime (${bottleneckInput.system_downtime_pct}%) breaches the 5.0% enterprise operational threshold.`);
    }
    if (bottleneckInput.missing_licenses) {
        bottleneckReasons.push('Required specialized enterprise software licenses are missing or unassigned.');
    }
    if (bottleneckInput.outdated_hardware) {
        bottleneckReasons.push('Local workstation hardware is below minimum processing throughput specification.');
    }
    if (bottleneckInput.tooling_process_blocker) {
        bottleneckReasons.push('Documented workflow blockage caused by third-party ERP integration failure.');
    }

    const setBottleneckField = (field, val) => {
        setBottleneckInput((prev) => ({ ...prev, [field]: val }));
    };

    // ==========================================
    // 2. STATISTICAL WEIGHTED SKILL MATRIX
    // Equation: Priority Score = (Skill Gap) * (Business Goal Weight) * (Headcount Affected)
    // ==========================================
    const [weightedSkills, setWeightedSkills] = useState([
        { id: 1, skill_name: 'Actuarial IFRS 17 Valuation', department: 'Risk & Actuarial', skill_gap: 2.4, business_goal_weight: 5.0, headcount_affected: 8 },
        { id: 2, skill_name: 'Zero-Trust Cloud Network Security', department: 'ICT & Systems', skill_gap: 3.0, business_goal_weight: 4.5, headcount_affected: 12 },
        { id: 3, skill_name: 'Underwriting Fraud Risk Detection', department: 'Underwriting', skill_gap: 1.8, business_goal_weight: 4.0, headcount_affected: 24 },
        { id: 4, skill_name: 'Corporate Reinsurance Treaty Negotiation', department: 'Reinsurance', skill_gap: 1.2, business_goal_weight: 4.8, headcount_affected: 5 },
        { id: 5, skill_name: 'TIRA Statutory Solvency & Filing', department: 'Legal & Compliance', skill_gap: 2.0, business_goal_weight: 5.0, headcount_affected: 6 },
        { id: 6, skill_name: 'Omnichannel Claims Intake Protocol', department: 'Claims Operations', skill_gap: 1.5, business_goal_weight: 3.5, headcount_affected: 30 },
    ]);

    const handleUpdateSkillParam = (id, field, value) => {
        setWeightedSkills((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, [field]: parseFloat(value) || 0 } : item
            )
        );
    };

    const sortedWeightedSkills = [...weightedSkills].sort((a, b) => {
        const scoreA = a.skill_gap * a.business_goal_weight * a.headcount_affected;
        const scoreB = b.skill_gap * b.business_goal_weight * b.headcount_affected;
        return scoreB - scoreA;
    });

    // ==========================================
    // 3. MULTI-SOURCE TELEMETRY AGGREGATOR
    // ==========================================
    const [telemetryStreams, setTelemetryStreams] = useState([
        {
            system: 'Jira / ServiceDesk',
            metric_name: 'Avg Incident Resolution Time',
            department: 'ICT & Technical Support',
            current_value: '4.2 hrs',
            target_sla: '2.5 hrs',
            deviation_pct: 68.0,
            mapped_competency: 'Systems Troubleshooting & Incident Triage',
            status: 'DEGRADED',
            pipeline: 'Active Webhook · Poll 5m'
        },
        {
            system: 'Git / DevOps Pipeline',
            metric_name: 'Code Churn & Deployment Failure Rate',
            department: 'Software Engineering',
            current_value: '18.4%',
            target_sla: '5.0%',
            deviation_pct: 268.0,
            mapped_competency: 'Automated Testing & CI/CD Pipeline Discipline',
            status: 'AT_RISK',
            pipeline: 'Active Webhook · Real-time'
        },
        {
            system: 'Core Insurance ERP',
            metric_name: 'Policy Issuance & Underwriting TAT',
            department: 'Underwriting',
            current_value: '48 hrs',
            target_sla: '24 hrs',
            deviation_pct: 100.0,
            mapped_competency: 'Actuarial Risk Rating & Document Processing',
            status: 'DEGRADED',
            pipeline: 'Scheduled ETL · Daily 00:00'
        },
        {
            system: 'Sales CRM',
            metric_name: 'Corporate Policy Close Rate',
            department: 'Business Development',
            current_value: '34%',
            target_sla: '40%',
            deviation_pct: -15.0,
            mapped_competency: 'Consultative B2B Insurance Negotiation',
            status: 'STABLE',
            pipeline: 'REST Poll · Hourly'
        },
        {
            system: 'Compliance Portal',
            metric_name: 'TIRA Regulatory Filing Adherence',
            department: 'Legal & Compliance',
            current_value: '100%',
            target_sla: '100%',
            deviation_pct: 0.0,
            mapped_competency: 'Statutory Insurance Compliance',
            status: 'EXCELLENT',
            pipeline: 'Audit Stream · Continuous'
        }
    ]);

    // ==========================================
    // 4. TREND-BASED EARLY WARNING TRIGGERS
    // ==========================================
    const [departmentTrends, setDepartmentTrends] = useState([
        { department: 'ICT & Infrastructure', competency: 'Disaster Recovery Testing', avg_90d: 4.2, avg_60d: 3.7, avg_30d: 2.9 },
        { department: 'Underwriting', competency: 'Specialized Marine Cargo Risk', avg_90d: 4.5, avg_60d: 4.1, avg_30d: 3.4 },
        { department: 'Customer Service', competency: 'First Contact Resolution', avg_90d: 3.8, avg_60d: 3.8, avg_30d: 3.9 },
        { department: 'Claims Handling', competency: 'Third-Party Recovery Verification', avg_90d: 4.1, avg_60d: 3.5, avg_30d: 2.8 },
        { department: 'Finance & Audit', competency: 'Automated Reconciliations', avg_90d: 4.6, avg_60d: 4.6, avg_30d: 4.7 },
    ]);

    // Live Sync with Backend Macro Engine Endpoints
    useEffect(() => {
        let isMounted = true;
        const fetchBackendMacroData = async () => {
            try {
                const [matrixRes, telemetryRes, warningsRes] = await Promise.allSettled([
                    api.tna.macro.getWeightedSkillMatrix(),
                    api.tna.macro.getTelemetryStreams(),
                    api.tna.macro.getEarlyWarnings(),
                ]);
                if (!isMounted) return;
                if (matrixRes.status === 'fulfilled' && matrixRes.value?.matrix?.length > 0) {
                    setWeightedSkills(matrixRes.value.matrix.map((m, i) => ({
                        id: i + 1,
                        skill_name: m.skill_name,
                        department: m.department,
                        skill_gap: m.skill_gap,
                        business_goal_weight: m.business_goal_weight,
                        headcount_affected: m.headcount_affected,
                    })));
                }
                if (telemetryRes.status === 'fulfilled' && telemetryRes.value?.telemetry_streams?.length > 0) {
                    setTelemetryStreams(telemetryRes.value.telemetry_streams);
                }
                if (warningsRes.status === 'fulfilled' && warningsRes.value?.early_warnings?.length > 0) {
                    setDepartmentTrends(warningsRes.value.early_warnings.map(w => ({
                        department: w.department,
                        competency: w.competency,
                        avg_90d: w.avg_90d,
                        avg_60d: w.avg_60d,
                        avg_30d: w.avg_30d,
                    })));
                }
            } catch (err) {
                // Fall back gracefully to rich deterministic local state
            }
        };
        fetchBackendMacroData();
        return () => { isMounted = false; };
    }, []);

    // --- State: 360 Assessment Engine ---
    const [raterScores, setRaterScores] = useState({
        self: 4.5,
        manager: 3.2,
        peer: 3.6,
        subordinate: 3.8,
        target: 4.5
    });
    const [weights, setWeights] = useState({
        w_self: 0.15,
        w_manager: 0.45,
        w_peer: 0.25,
        w_subordinate: 0.15
    });
    const compositeScore = (
        raterScores.self * weights.w_self +
        raterScores.manager * weights.w_manager +
        raterScores.peer * weights.w_peer +
        raterScores.subordinate * weights.w_subordinate
    );
    const externalWeightSum = weights.w_manager + weights.w_peer + weights.w_subordinate;
    const externalAverage = (
        raterScores.manager * weights.w_manager +
        raterScores.peer * weights.w_peer +
        raterScores.subordinate * weights.w_subordinate
    ) / (externalWeightSum || 1);
    const perceptionBlindSpot = raterScores.self - externalAverage;
    const skillGap = Math.max(0, raterScores.target - compositeScore);

    // --- State: Kirkpatrick ROI Engine ---
    const [kirkpatrick, setKirkpatrick] = useState({
        npsReaction: 78,
        preTestScore: 54,
        postTestScore: 89,
        retention30D: 86,
        retention60D: 81,
        retention90D: 77,
        financialImpact: 85000000,
        totalTrainingCost: 32000000
    });
    const knowledgeGainDelta = kirkpatrick.postTestScore - kirkpatrick.preTestScore;
    const trainingROI = ((kirkpatrick.financialImpact - kirkpatrick.totalTrainingCost) / kirkpatrick.totalTrainingCost) * 100;

    // --- State: Algorithmic Skill Decay Model ---
    const [decayParams, setDecayParams] = useState({
        category: 'tech',
        initialProficiency: 95,
        elapsedDays: 365,
        usageFrequency: 0.6,
        dampingFactor: 0.7
    });
    const categoryHalfLives = {
        tech_emerging: { label: 'Emerging Tech Tools', halfLifeDays: 547, lambda: 0.001267, gamma: 0.85 },
        tech: { label: 'Technical & Engineering', halfLifeDays: 1095, lambda: 0.000633, gamma: 0.70 },
        domain: { label: 'Domain & Regulatory Compliance', halfLifeDays: 1825, lambda: 0.000380, gamma: 0.50 },
        leadership: { label: 'Core Leadership & Soft Skills', halfLifeDays: 2920, lambda: 0.000237, gamma: 0.30 },
    };
    const selectedCatConfig = categoryHalfLives[decayParams.category] || categoryHalfLives.tech;
    const decayExponent = Math.exp(-selectedCatConfig.lambda * decayParams.elapsedDays);
    const usageMitigation = (1 + selectedCatConfig.gamma * decayParams.usageFrequency);
    const predictedProficiency = Math.min(100, Math.max(0, decayParams.initialProficiency * decayExponent * usageMitigation));

    return (
        <div className="space-y-8 w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#264033] text-white rounded-2xl shadow-sm">
                        <BarChart2 className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                            Enterprise Analytics &amp; Intelligence
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">
                            Deterministic rule-based bottleneck filtering, mathematical weighted skill matrices, and operational telemetry.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                        100% Deterministic Engine
                    </span>
                </div>
            </div>

            {/* Navigation Sub-Tabs */}
            <div className="flex border-b border-slate-200 overflow-x-auto custom-scrollbar gap-2 pb-px w-full">
                {[
                    { id: 'bottleneck-filter', label: '1. Bottleneck Filter', icon: Filter, tag: 'Rule-Based' },
                    { id: 'weighted-matrix', label: '2. Weighted Skill Matrix', icon: BarChart2, tag: 'Mathematical' },
                    { id: 'telemetry-aggregator', label: '3. Telemetry Aggregator', icon: Radio, tag: 'ETL Pipeline' },
                    { id: 'early-warning', label: '4. Trend Early Warnings', icon: AlertOctagon, tag: 'Event-Driven' },
                    { id: '360-assessment', label: '360° Multi-Rater', icon: Users, tag: 'Evaluations' },
                    { id: 'kirkpatrick-roi', label: 'Kirkpatrick ROI', icon: Calculator, tag: 'Impact' },
                    { id: 'skill-decay', label: 'Skill Decay Half-Life', icon: Activity, tag: 'Algorithms' },
                ].map((tab) => {
                    const isActive = activeSubTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSubTab(tab.id)}
                            className={`flex items-center gap-2 py-2.5 px-4 font-semibold text-xs uppercase tracking-wider transition-all border-b-2 whitespace-nowrap rounded-t-xl ${
                                isActive
                                    ? 'bg-[#264033] text-white border-[#264033] shadow-sm'
                                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                            {tab.tag && (
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${isActive ? 'bg-black/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                    {tab.tag}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* ========================================================= */}
            {/* 1. HARD-CODED BOTTLENECK FILTER (RULE-BASED MATRIX) */}
            {/* ========================================================= */}
            {activeSubTab === 'bottleneck-filter' && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full animate-in fade-in duration-200">
                    {/* Interactive Conditional Input Matrix */}
                    <div className="xl:col-span-2 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
                        <div className="border-b border-slate-100 pb-4">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 text-[11px] font-bold">
                                <Filter className="w-3.5 h-3.5" /> Rule-Based Conditional Matrix
                            </div>
                            <h3 className="text-lg font-bold mt-2">
                                Operational Constraint vs. Genuine Training Need Filter
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Strict conditional checklist. If performance deficits are triggered by system downtime, missing licenses, or broken equipment, the system automatically locks the issue as an Operational Constraint and routes it to IT/Operations instead of wasting HR training budget.
                            </p>
                        </div>

                        {/* Form Inputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700 uppercase">Performance Gap / Request Name</label>
                                <input
                                    type="text"
                                    value={bottleneckInput.gap_name}
                                    onChange={(e) => setBottleneckField('gap_name', e.target.value)}
                                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-[#264033]"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700 uppercase">Department</label>
                                <input
                                    type="text"
                                    value={bottleneckInput.department}
                                    onChange={(e) => setBottleneckField('department', e.target.value)}
                                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-[#264033]"
                                />
                            </div>
                        </div>

                        {/* Conditional Checklist */}
                        <div className="space-y-3 pt-2">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Operational Trigger Conditions (Evaluated in Real-Time)
                            </p>

                            {/* Downtime Slider */}
                            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                                <div className="flex justify-between text-xs font-bold text-slate-800">
                                    <span>System / Platform Downtime (% past 30 days)</span>
                                    <span className={`font-mono ${bottleneckInput.system_downtime_pct > 5.0 ? 'text-red-600 font-extrabold' : 'text-emerald-700'}`}>
                                        {bottleneckInput.system_downtime_pct}% {bottleneckInput.system_downtime_pct > 5.0 ? '(> 5% Threshold Breached)' : '(Normal)'}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="25"
                                    step="0.5"
                                    value={bottleneckInput.system_downtime_pct}
                                    onChange={(e) => setBottleneckField('system_downtime_pct', parseFloat(e.target.value))}
                                    className="w-full accent-[#264033] h-2 bg-slate-200 rounded-lg cursor-pointer"
                                />
                            </div>

                            {/* Boolean Toggles */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {[
                                    { key: 'missing_licenses', label: 'Missing Software Licenses' },
                                    { key: 'outdated_hardware', label: 'Outdated / Deficient Hardware' },
                                    { key: 'tooling_process_blocker', label: 'Documented Tooling Blocker' },
                                ].map((item) => (
                                    <label
                                        key={item.key}
                                        className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${bottleneckInput[item.key]
                                            ? 'border-amber-400 bg-amber-50/60'
                                            : 'border-slate-200 bg-white'
                                            }`}
                                    >
                                        <span className="text-xs font-bold text-slate-800">{item.label}</span>
                                        <input
                                            type="checkbox"
                                            checked={bottleneckInput[item.key]}
                                            onChange={(e) => setBottleneckField(item.key, e.target.checked)}
                                            className="w-4 h-4 accent-[#264033] rounded cursor-pointer"
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Presets */}
                        <div className="pt-2 flex flex-wrap gap-2 items-center">
                            <span className="text-xs text-slate-400 font-bold uppercase">Quick Scenarios:</span>
                            <button
                                type="button"
                                onClick={() => setBottleneckInput({
                                    gap_name: 'Policy Issuance Delay',
                                    department: 'Underwriting',
                                    system_downtime_pct: 7.5,
                                    missing_licenses: false,
                                    outdated_hardware: true,
                                    tooling_process_blocker: false
                                })}
                                className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium"
                            >
                                Infrastructure Blocker
                            </button>
                            <button
                                type="button"
                                onClick={() => setBottleneckInput({
                                    gap_name: 'Actuarial Modeling Precision',
                                    department: 'Risk Management',
                                    system_downtime_pct: 1.2,
                                    missing_licenses: false,
                                    outdated_hardware: false,
                                    tooling_process_blocker: false
                                })}
                                className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium"
                            >
                                Genuine Human Skill Need
                            </button>
                        </div>
                    </div>

                    {/* Live Deterministic Routing Decision */}
                    <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-6 flex flex-col justify-between">
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                                Deterministic Routing Verdict
                            </h3>

                            {isOperationalConstraint ? (
                                <div className="p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 space-y-3">
                                    <div className="flex items-center gap-2 text-amber-800 font-extrabold text-sm">
                                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                                        <span>LOCKED: OPERATIONAL CONSTRAINT</span>
                                    </div>
                                    <p className="text-xs text-amber-900 leading-relaxed font-semibold">
                                        This performance gap is caused by operational and infrastructure barriers. Training will NOT resolve this issue.
                                    </p>
                                    <div className="pt-2 border-t border-amber-300/40 text-xs text-amber-900 font-medium">
                                        <strong>Automatic Route:</strong> IT / Operations Infrastructure Desk
                                    </div>
                                </div>
                            ) : (
                                <div className="p-5 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/40 space-y-3">
                                    <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                        <span>VALIDATED HUMAN TRAINING NEED</span>
                                    </div>
                                    <p className="text-xs text-emerald-900 leading-relaxed font-semibold">
                                        No operational or tooling constraints detected. Deficit qualifies for TNA curriculum planning and training allocation.
                                    </p>
                                    <div className="pt-2 border-t border-emerald-300/40 text-xs text-emerald-900 font-medium">
                                        <strong>Automatic Route:</strong> HR Training Request &amp; HRO Planning
                                    </div>
                                </div>
                            )}

                            {/* Active Triggers */}
                            <div className="space-y-2">
                                <span className="text-[11px] font-bold uppercase text-slate-400">Trigger Audit Trail:</span>
                                {bottleneckReasons.length > 0 ? (
                                    <ul className="space-y-1.5">
                                        {bottleneckReasons.map((r, i) => (
                                            <li key={i} className="text-xs text-red-700 font-medium flex items-start gap-1.5">
                                                <X className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-600" />
                                                <span>{r}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>All operational checks passed cleanly.</span>
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500">
                            <strong>Business Value:</strong> Eliminates wasted training expenditure on broken operational software or hardware.
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* 2. STATISTICAL WEIGHTED SKILL MATRIX */}
            {/* ========================================================= */}
            {activeSubTab === 'weighted-matrix' && (
                <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-6 animate-in fade-in duration-200">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-900 text-[11px] font-bold">
                                <Calculator className="w-3.5 h-3.5" /> Mathematical Scoring Formula
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mt-2">
                                Statistical Weighted Skill Matrix &amp; Business Risk Prioritization
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Calculates the true organizational impact of each competency gap using an objective mathematical equation.
                            </p>
                        </div>

                        {/* Equation Display Box */}
                        <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-slate-800 font-mono text-xs">
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Executive Formula</span>
                            <span className="font-bold text-sm text-[#264033]">
                                Priority Score = (Skill Gap) × (Goal Weight) × (Headcount)
                            </span>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 text-slate-500 text-[11px] uppercase tracking-widest font-bold border-b border-slate-200">
                                    <th className="px-5 py-3.5">Rank</th>
                                    <th className="px-5 py-3.5">Competency / Skill</th>
                                    <th className="px-5 py-3.5">Department</th>
                                    <th className="px-5 py-3.5 text-center">Skill Gap (0-5)</th>
                                    <th className="px-5 py-3.5 text-center">Goal Weight (1-5)</th>
                                    <th className="px-5 py-3.5 text-center">Headcount</th>
                                    <th className="px-5 py-3.5 text-center">Priority Score</th>
                                    <th className="px-5 py-3.5 text-right">Estimated Exposure</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {sortedWeightedSkills.map((item, index) => {
                                    const score = item.skill_gap * item.business_goal_weight * item.headcount_affected;
                                    const exposure = score * 450000;
                                    const tierColor = score >= 120
                                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                                        : score >= 60
                                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                                            : 'bg-emerald-50 text-emerald-800 border-emerald-200';

                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-5 py-4 text-xs font-bold text-slate-400 font-mono">
                                                #{index + 1}
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="text-xs font-bold text-slate-900">{item.skill_name}</p>
                                            </td>
                                            <td className="px-5 py-4 text-xs font-medium text-slate-600">
                                                {item.department}
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    min="0"
                                                    max="5"
                                                    value={item.skill_gap}
                                                    onChange={(e) => handleUpdateSkillParam(item.id, 'skill_gap', e.target.value)}
                                                    className="w-16 text-center text-xs font-bold font-mono px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-800"
                                                />
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    min="1"
                                                    max="5"
                                                    value={item.business_goal_weight}
                                                    onChange={(e) => handleUpdateSkillParam(item.id, 'business_goal_weight', e.target.value)}
                                                    className="w-16 text-center text-xs font-bold font-mono px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-800"
                                                />
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.headcount_affected}
                                                    onChange={(e) => handleUpdateSkillParam(item.id, 'headcount_affected', e.target.value)}
                                                    className="w-16 text-center text-xs font-bold font-mono px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-800"
                                                />
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <span className={`text-xs font-extrabold px-3 py-1 rounded-full border font-mono ${tierColor}`}>
                                                    {score.toFixed(1)} pts
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right text-xs font-mono font-bold text-slate-900">
                                                {exposure.toLocaleString()} TZS
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                        <span><strong>Executive Value:</strong> Provides leadership with an un-biased, mathematical ranking of which skill gaps are costing the organization the most right now.</span>
                        <span className="font-mono text-xs font-bold text-[#264033]">Total Quantified Exposure: TZS {sortedWeightedSkills.reduce((acc, it) => acc + (it.skill_gap * it.business_goal_weight * it.headcount_affected * 450000), 0).toLocaleString()}</span>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* 3. MULTI-SOURCE TELEMETRY AGGREGATOR */}
            {/* ========================================================= */}
            {activeSubTab === 'telemetry-aggregator' && (
                <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-6 animate-in fade-in duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-[11px] font-bold">
                                <Radio className="w-3.5 h-3.5 text-[#264033]" /> Live Data Ingestion Pipeline
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mt-2">
                                Multi-Source Telemetry Aggregator
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Aggregates operational telemetry from Jira, GitHub, Core ERP, and CRM to map live execution metrics directly against TNA competency models.
                            </p>
                        </div>
                        <span className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold font-mono">
                            5 Active Connectors
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {telemetryStreams.map((stream, idx) => (
                            <div
                                key={idx}
                                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4 hover:border-slate-300 transition-all"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                        {stream.system}
                                    </span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                        stream.status === 'EXCELLENT' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                                        stream.status === 'STABLE' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                                        stream.status === 'DEGRADED' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                                        'bg-rose-50 text-rose-800 border-rose-200'
                                    }`}>
                                        {stream.status}
                                    </span>
                                </div>

                                <div>
                                    <h4 className="text-sm font-bold text-slate-900">{stream.metric_name}</h4>
                                    <p className="text-xs text-slate-500 mt-0.5">{stream.department}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-2 bg-white p-3 rounded-xl border border-slate-200/80 font-mono text-xs">
                                    <div>
                                        <span className="text-[10px] text-slate-400 block">Current Avg</span>
                                        <span className="font-bold text-slate-900">{stream.current_value}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-400 block">Target SLA</span>
                                        <span className="font-bold text-emerald-700">{stream.target_sla}</span>
                                    </div>
                                </div>

                                <div className="text-xs space-y-1">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Mapped TNA Competency:</span>
                                    <p className="text-slate-700 font-semibold">{stream.mapped_competency}</p>
                                </div>

                                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
                                    <span>Pipeline:</span>
                                    <span className="font-mono text-emerald-700 font-semibold">{stream.pipeline}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                        <strong>Value:</strong> Replaces slow, subjective annual surveys with continuous, real-time performance telemetry.
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* 4. TREND-BASED EARLY WARNING TRIGGERS */}
            {/* ========================================================= */}
            {activeSubTab === 'early-warning' && (
                <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-6 animate-in fade-in duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-[11px] font-bold">
                                <AlertOctagon className="w-3.5 h-3.5 text-[#264033]" /> Event-Driven Alert Engine
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mt-2">
                                Trend-Based Early Warning Triggers (30 / 60 / 90 Days)
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Tracks rolling competency averages over 30, 60, and 90 days. Detects steady downward slopes across consecutive intervals to alert leadership before capabilities hurt revenue.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {departmentTrends.map((trend, idx) => {
                            const slope = ((trend.avg_30d - trend.avg_90d) / 2.0).toFixed(2);
                            const isAtRisk = (trend.avg_30d < trend.avg_60d) && (trend.avg_60d < trend.avg_90d);

                            return (
                                <div
                                    key={idx}
                                    className={`p-5 rounded-2xl border transition-all ${isAtRisk
                                        ? 'border-rose-200 bg-rose-50/30'
                                        : 'border-slate-200 bg-slate-50/40'
                                        }`}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-slate-900">{trend.department}</span>
                                                <span className="text-xs text-slate-500">· {trend.competency}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${isAtRisk
                                                ? 'bg-rose-50 text-rose-800 border-rose-200'
                                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                }`}>
                                                {isAtRisk ? '⚠️ At-Risk Deficit' : '✓ Healthy Trajectory'}
                                            </span>
                                            <span className="text-xs font-mono font-bold text-slate-700">
                                                Slope m = {slope}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Rolling Intervals Progression */}
                                    <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                                        <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                                            <span className="text-[10px] uppercase font-bold text-slate-400 block">90-Day Baseline</span>
                                            <span className="text-base font-extrabold text-slate-800 font-mono">{trend.avg_90d} / 5.0</span>
                                        </div>
                                        <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                                            <span className="text-[10px] uppercase font-bold text-slate-400 block">60-Day Rolling</span>
                                            <span className="text-base font-extrabold text-slate-800 font-mono">{trend.avg_60d} / 5.0</span>
                                        </div>
                                        <div className={`p-3 rounded-xl border font-mono ${isAtRisk
                                            ? 'bg-rose-50 border-rose-200 text-rose-900'
                                            : 'bg-white border-slate-200/80 text-slate-800'
                                            }`}>
                                            <span className="text-[10px] uppercase font-bold text-slate-400 block">30-Day Recent</span>
                                            <span className="text-base font-extrabold">{trend.avg_30d} / 5.0</span>
                                        </div>
                                    </div>

                                    {isAtRisk && (
                                        <div className="mt-3 text-xs text-rose-800 font-medium flex items-center gap-1.5">
                                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                                            <span>
                                                Downslope detected across 3 consecutive observation windows ({trend.avg_90d} → {trend.avg_60d} → {trend.avg_30d}). Triggering early intervention alert to department head.
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                        <strong>Value:</strong> Prevents productivity drop by alerting leaders before a skills gap causes a major operational incident.
                    </div>
                </div>
            )}

            {/* --- TAB: 360° MULTI-RATER & PERCEPTION BLIND SPOT ENGINE --- */}
            {activeSubTab === '360-assessment' && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full animate-in fade-in duration-200">
                    <div className="xl:col-span-2 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
                        <div>
                            <h3 className="text-base font-bold text-slate-800">Multi-Rater Evaluation Input Matrix</h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Collects weighted skill ratings across an employee's organizational network to eliminate cognitive bias.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-2">
                                <div className="flex justify-between text-xs font-bold text-slate-700">
                                    <span>Self Assessment (w = {weights.w_self * 100}%)</span>
                                    <span className="text-[#1b3d2f] font-extrabold">{raterScores.self} / 5.0</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="5"
                                    step="0.1"
                                    value={raterScores.self}
                                    onChange={(e) => setRaterScores({ ...raterScores, self: parseFloat(e.target.value) })}
                                    className="w-full accent-[#1b3d2f] h-2 bg-slate-200 rounded-lg cursor-pointer"
                                />
                            </div>

                            <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-2">
                                <div className="flex justify-between text-xs font-bold text-slate-700">
                                    <span>Manager Rating (w = {weights.w_manager * 100}%)</span>
                                    <span className="text-[#1b3d2f] font-extrabold">{raterScores.manager} / 5.0</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="5"
                                    step="0.1"
                                    value={raterScores.manager}
                                    onChange={(e) => setRaterScores({ ...raterScores, manager: parseFloat(e.target.value) })}
                                    className="w-full accent-[#264033] h-2 bg-slate-200 rounded-lg cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Perception Gap &amp; Blind Spot</h3>
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
                            <span className="text-[10px] uppercase font-bold text-slate-500 block">Weighted Composite Score</span>
                            <span className="text-3xl font-extrabold text-[#264033] font-mono">{compositeScore.toFixed(2)}</span>
                            <span className="text-xs text-slate-500 block">Target: {raterScores.target} / 5.0</span>
                        </div>
                    </div>
                </div>
            )}

            {/* --- TAB: KIRKPATRICK ROI ENGINE --- */}
            {activeSubTab === 'kirkpatrick-roi' && (
                <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-200">
                    <h3 className="text-base font-bold text-slate-900">Kirkpatrick 4-Level ROI Evaluation Model</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Reaction Score</span>
                            <span className="text-2xl font-bold text-slate-800 font-mono">{kirkpatrick.npsReaction}%</span>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Knowledge Gain Delta</span>
                            <span className="text-2xl font-bold text-slate-800 font-mono">+{knowledgeGainDelta}%</span>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">90-Day Retention</span>
                            <span className="text-2xl font-bold text-slate-800 font-mono">{kirkpatrick.retention90D}%</span>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                            <span className="text-[10px] uppercase font-bold text-slate-500 block">Financial Training ROI</span>
                            <span className="text-2xl font-bold text-[#264033] font-mono">+{trainingROI.toFixed(1)}%</span>
                        </div>
                    </div>
                </div>
            )}

            {/* --- TAB: SKILL DECAY HALF-LIFE --- */}
            {activeSubTab === 'skill-decay' && (
                <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-200">
                    <h3 className="text-base font-bold text-slate-900">Exponential Competency Decay Half-Life Model</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Category</span>
                            <span className="text-sm font-bold text-slate-800">{selectedCatConfig.label}</span>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Half-Life</span>
                            <span className="text-sm font-bold text-slate-800 font-mono">{selectedCatConfig.halfLifeDays} Days</span>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                            <span className="text-[10px] uppercase font-bold text-slate-500 block">Predicted Current Proficiency</span>
                            <span className="text-lg font-bold text-[#264033] font-mono">{predictedProficiency.toFixed(1)}%</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnterpriseAnalytics;