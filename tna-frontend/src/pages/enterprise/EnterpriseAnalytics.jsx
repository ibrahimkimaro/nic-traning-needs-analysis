import React, { useState } from 'react';
import {
  TrendingUp, Award, DollarSign, Calculator, Target, Users, BookOpen,
  ArrowRight, ShieldCheck, Clock, CheckCircle2, AlertTriangle, Sparkles,
  Layers, BarChart2, RefreshCw, ChevronRight, Activity, Percent, Building2,
  Sliders, Zap, HelpCircle, Compass
} from 'lucide-react';

const EnterpriseAnalytics = () => {
  const [activeSubTab, setActiveSubTab] = useState('360-assessment');

  // --- State 1: 360 Assessment Engine ---
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

  // Calculate composite score: S_composite = ws*S_self + wm*S_manager + wp*S_peer + wd*S_subordinate
  const compositeScore = (
    raterScores.self * weights.w_self +
    raterScores.manager * weights.w_manager +
    raterScores.peer * weights.w_peer +
    raterScores.subordinate * weights.w_subordinate
  );
  // External average
  const externalWeightSum = weights.w_manager + weights.w_peer + weights.w_subordinate;
  const externalAverage = (
    raterScores.manager * weights.w_manager +
    raterScores.peer * weights.w_peer +
    raterScores.subordinate * weights.w_subordinate
  ) / (externalWeightSum || 1);
  const perceptionBlindSpot = raterScores.self - externalAverage;
  const skillGap = Math.max(0, raterScores.target - compositeScore);

  // --- State 2: Kirkpatrick ROI Engine ---
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

  // --- State 3: Algorithmic Skill Decay Model ---
  const [decayParams, setDecayParams] = useState({
    category: 'tech',
    initialProficiency: 95,
    elapsedDays: 365,
    usageFrequency: 0.6,
    dampingFactor: 0.7
  });

  const categoryHalfLives = {
    tech_emerging: { label: 'Emerging Tech & AI Tools', halfLifeDays: 547, lambda: 0.001267, gamma: 0.85 },
    tech: { label: 'Technical & Engineering', halfLifeDays: 1095, lambda: 0.000633, gamma: 0.70 },
    domain: { label: 'Domain & Regulatory Compliance', halfLifeDays: 1825, lambda: 0.000380, gamma: 0.50 },
    leadership: { label: 'Core Leadership & Soft Skills', halfLifeDays: 2920, lambda: 0.000237, gamma: 0.30 },
  };

  const selectedCatConfig = categoryHalfLives[decayParams.category] || categoryHalfLives.tech;
  // Exponential decay model: P(t) = P0 * exp(-lambda * t) * (1 + gamma * U_freq)
  const decayExponent = Math.exp(-selectedCatConfig.lambda * decayParams.elapsedDays);
  const usageMitigation = (1 + selectedCatConfig.gamma * decayParams.usageFrequency);
  const predictedProficiency = Math.min(100, Math.max(0, decayParams.initialProficiency * decayExponent * usageMitigation));

  // --- State 4: Financial Priority Ranking Matrix ---
  const [requestsList, setRequestsList] = useState([
    { id: 1, title: 'Actuarial Risk Modeling (IFRS 17)', dept: 'Risk & Actuarial', severity: 5, alignment: 5, urgency: 4, costPerCapita: 1800000, budgetFactor: 1.2 },
    { id: 2, title: 'Cloud Infrastructure & Kubernetes Security', dept: 'ICT & Systems', severity: 4, alignment: 4, urgency: 5, costPerCapita: 1200000, budgetFactor: 1.1 },
    { id: 3, title: 'Corporate Customer Relations Mastery', dept: 'Customer Service', severity: 3, alignment: 3, urgency: 3, costPerCapita: 650000, budgetFactor: 0.9 },
    { id: 4, title: 'AML / CFT Regulatory Compliance Refresher', dept: 'Legal & Compliance', severity: 5, alignment: 5, urgency: 5, costPerCapita: 950000, budgetFactor: 1.3 },
  ]);

  const calculatePriorityScore = (req) => {
    // P_score = ((G_severity * 0.4) + (S_alignment * 0.35) + (C_urgency * 0.25)) / (Cost / 100,000) * F_budget
    const weightedNumerator = (req.severity * 0.4) + (req.alignment * 0.35) + (req.urgency * 0.25);
    const normalizedCost = Math.max(1, req.costPerCapita / 100000);
    return ((weightedNumerator / normalizedCost) * req.budgetFactor * 10).toFixed(2);
  };

  // --- State 5: Career Pathing & Mobility ---
  const [selectedCareerTrack, setSelectedCareerTrack] = useState('underwriter-to-actuary');
  const careerTracks = {
    'underwriter-to-actuary': {
      currentRole: 'Senior Underwriting Officer',
      targetRole: 'Principal Risk & Actuarial Analyst',
      currentScore: 68,
      targetScore: 92,
      skillsDelta: [
        { skill: 'Stochastic Loss Modeling', current: 2, target: 5, gap: 3 },
        { skill: 'Python / R Statistical Analysis', current: 3, target: 5, gap: 2 },
        { skill: 'TIRA Solvency II Compliance', current: 4, target: 5, gap: 1 },
        { skill: 'Reinsurance Treaty Negotiation', current: 4, target: 4, gap: 0 },
      ],
      learningRoadmap: [
        { step: 1, title: 'Advanced Quantitative Risk Certification', duration: '6 Weeks', provider: 'Institute of Actuaries' },
        { step: 2, title: 'Algorithmic Financial Simulation in Python', duration: '4 Weeks', provider: 'NIC Academy' },
        { step: 3, title: 'Executive Actuarial Mentorship Program', duration: '8 Weeks', provider: 'Internal Leadership' }
      ]
    },
    'dev-to-architect': {
      currentRole: 'Senior Software Developer',
      targetRole: 'Enterprise Solutions Architect',
      currentScore: 72,
      targetScore: 95,
      skillsDelta: [
        { skill: 'Distributed System Topology', current: 3, target: 5, gap: 2 },
        { skill: 'Enterprise Architecture Framework (TOGAF)', current: 1, target: 4, gap: 3 },
        { skill: 'Cloud Security Posture Management', current: 3, target: 5, gap: 2 },
        { skill: 'Database Performance Optimization', current: 4, target: 5, gap: 1 },
      ],
      learningRoadmap: [
        { step: 1, title: 'TOGAF 10 Enterprise Architecture Practitioner', duration: '5 Weeks', provider: 'The Open Group' },
        { step: 2, title: 'High-Throughput Microservices & Event Sourcing', duration: '4 Weeks', provider: 'NIC Tech Hub' },
        { step: 3, title: 'Executive IT Strategy Capstone', duration: '3 Weeks', provider: 'Strathmore Business School' }
      ]
    }
  };

  const activeTrackData = careerTracks[selectedCareerTrack] || careerTracks['underwriter-to-actuary'];

  return (
    <div className="space-y-8 w-full">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#142d22] via-[#1b3d2f] to-[#25503e] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-emerald-800/30 flex flex-col md:flex-row md:items-center justify-between gap-6 w-full">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/25 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Generation Skills Intelligence Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Enterprise Skills Intelligence & Analytics Suite
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            Multi-rater 360° competency evaluations, Kirkpatrick Level 1–4 impact analytics, predictive skill decay modeling, and dynamic financial prioritization.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          <div className="bg-emerald-950/60 border border-emerald-700/40 px-4 py-2.5 rounded-2xl text-center">
            <span className="text-[10px] uppercase font-bold text-emerald-300 block">Assessment Reliability</span>
            <span className="text-lg font-extrabold text-white">99.4%</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200/80 dark:border-slate-800 overflow-x-auto custom-scrollbar gap-2 pb-px w-full">
        {[
          { id: '360-assessment', label: '360° Multi-Rater & Blind Spots', icon: Users },
          { id: 'kirkpatrick-roi', label: 'Kirkpatrick 1–4 Impact & ROI', icon: Calculator },
          { id: 'skill-decay', label: 'Algorithmic Skill Decay', icon: Activity },
          { id: 'career-pathing', label: 'Career Pathing & Mobility', icon: Compass },
          { id: 'priority-matrix', label: 'Financial Priority Ranking', icon: DollarSign },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`flex items-center gap-2 py-3 px-4.5 font-bold text-xs uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
              activeSubTab === tab.id
                ? 'border-[#1b3d2f] dark:border-emerald-400 text-[#1b3d2f] dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-t-xl'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 rounded-t-xl'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* --- TAB 1: 360° MULTI-RATER & PERCEPTION BLIND SPOT ENGINE --- */}
      {activeSubTab === '360-assessment' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full">
          {/* Controls & Scoring Inputs */}
          <div className="xl:col-span-2 bg-white dark:bg-[#13221b] p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">Multi-Rater Evaluation Input Matrix</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Collects weighted skill ratings across an employee's organizational network to eliminate the Dunning-Kruger cognitive bias.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Self */}
              <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0f1a14] space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Self Assessment (w = {weights.w_self * 100}%)</span>
                  <span className="text-emerald-700 dark:text-emerald-400">{raterScores.self} / 5.0</span>
                </div>
                <input
                  type="range" min="1" max="5" step="0.1"
                  value={raterScores.self}
                  onChange={(e) => setRaterScores({ ...raterScores, self: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-700"
                />
              </div>

              {/* Manager */}
              <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0f1a14] space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Direct Supervisor (w = {weights.w_manager * 100}%)</span>
                  <span className="text-emerald-700 dark:text-emerald-400">{raterScores.manager} / 5.0</span>
                </div>
                <input
                  type="range" min="1" max="5" step="0.1"
                  value={raterScores.manager}
                  onChange={(e) => setRaterScores({ ...raterScores, manager: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-700"
                />
              </div>

              {/* Peer */}
              <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0f1a14] space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Peer Reviewers (w = {weights.w_peer * 100}%)</span>
                  <span className="text-emerald-700 dark:text-emerald-400">{raterScores.peer} / 5.0</span>
                </div>
                <input
                  type="range" min="1" max="5" step="0.1"
                  value={raterScores.peer}
                  onChange={(e) => setRaterScores({ ...raterScores, peer: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-700"
                />
              </div>

              {/* Subordinate */}
              <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0f1a14] space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Direct Reports (w = {weights.w_subordinate * 100}%)</span>
                  <span className="text-emerald-700 dark:text-emerald-400">{raterScores.subordinate} / 5.0</span>
                </div>
                <input
                  type="range" min="1" max="5" step="0.1"
                  value={raterScores.subordinate}
                  onChange={(e) => setRaterScores({ ...raterScores, subordinate: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-700"
                />
              </div>
            </div>

            {/* Formula Reference */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 text-xs font-mono text-emerald-900 dark:text-emerald-300 space-y-1">
              <p className="font-bold">Composite Equation:</p>
              <p>S_composite = (0.15 × {raterScores.self}) + (0.45 × {raterScores.manager}) + (0.25 × {raterScores.peer}) + (0.15 × {raterScores.subordinate}) = {compositeScore.toFixed(2)}</p>
            </div>
          </div>

          {/* Results & Blind Spot Diagnostics */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#13221b] p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-800 dark:text-white">Perception Blind Spot Diagnostics</h3>

              {/* Composite Score Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0f1a14] border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Calculated Composite Score</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-800 dark:text-white">{compositeScore.toFixed(2)}</span>
                  <span className="text-xs text-slate-400">/ 5.00</span>
                </div>
              </div>

              {/* Perception Variance */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0f1a14] border border-slate-200/80 dark:border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Perception Variance (B)</span>
                  <span className={`text-xs font-extrabold ${perceptionBlindSpot > 0.5 ? 'text-rose-700 dark:text-rose-400' : perceptionBlindSpot < -0.5 ? 'text-blue-700 dark:text-blue-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                    {perceptionBlindSpot > 0 ? `+${perceptionBlindSpot.toFixed(2)}` : perceptionBlindSpot.toFixed(2)}
                  </span>
                </div>
                {perceptionBlindSpot > 0.5 ? (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300 space-y-1">
                    <p className="font-bold flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-rose-600" /> Over-Estimation Blind Spot</p>
                    <p className="text-[11px]">Self rating is significantly higher than external consensus. Automatically tagged for targeted executive coaching.</p>
                  </div>
                ) : perceptionBlindSpot < -0.5 ? (
                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 text-xs text-blue-800 dark:text-blue-300 space-y-1">
                    <p className="font-bold flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-blue-600" /> Under-Confidence Blind Spot</p>
                    <p className="text-[11px]">External evaluators rate employee higher than self assessment. Recommended for high-visibility stretch assignments.</p>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                    <p className="font-bold flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-600" /> Calibrated Self-Awareness</p>
                    <p className="text-[11px]">Evaluation consensus aligns closely with self assessment score.</p>
                  </div>
                )}
              </div>

              {/* Calculated Gap */}
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-[#0f1a14] text-xs font-semibold">
                <span className="text-slate-500">Target Level: {raterScores.target.toFixed(1)}</span>
                <span className="text-amber-800 dark:text-amber-300 font-bold">Skill Gap Delta: {skillGap.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: KIRKPATRICK 1-4 IMPACT & ROI --- */}
      {activeSubTab === 'kirkpatrick-roi' && (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 w-full">
          {/* Level 1: Reaction */}
          <div className="bg-white dark:bg-[#13221b] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">Level 1: Reaction</span>
              <Activity className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">Net Promoter Score (NPS)</h4>
              <p className="text-xs text-slate-500 mt-0.5">Post-course learner satisfaction</p>
            </div>
            <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-[#0f1a14] border border-blue-100 dark:border-blue-900/40 text-center">
              <span className="text-3xl font-extrabold text-blue-700 dark:text-blue-400">+{kirkpatrick.npsReaction}</span>
              <span className="text-xs text-slate-500 block mt-1">Excellent Satisfaction Benchmark</span>
            </div>
          </div>

          {/* Level 2: Learning */}
          <div className="bg-white dark:bg-[#13221b] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">Level 2: Learning</span>
              <Award className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">Knowledge Gain Delta (Δ)</h4>
              <p className="text-xs text-slate-500 mt-0.5">Pre vs Post-training quiz scores</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-[#0f1a14] border border-emerald-100 dark:border-emerald-900/40 text-center">
              <span className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">+{knowledgeGainDelta}%</span>
              <span className="text-xs text-slate-500 block mt-1">{kirkpatrick.preTestScore}% Pre → {kirkpatrick.postTestScore}% Post</span>
            </div>
          </div>

          {/* Level 3: Behavior */}
          <div className="bg-white dark:bg-[#13221b] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200">Level 3: Behavior</span>
              <Clock className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">30/60/90-Day Retention</h4>
              <p className="text-xs text-slate-500 mt-0.5">On-the-job skill transfer rate</p>
            </div>
            <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-[#0f1a14] border border-purple-100 dark:border-purple-900/40 text-xs space-y-1.5">
              <div className="flex justify-between"><span>30-Day Check:</span><span className="font-bold text-purple-700 dark:text-purple-400">{kirkpatrick.retention30D}%</span></div>
              <div className="flex justify-between"><span>60-Day Check:</span><span className="font-bold text-purple-700 dark:text-purple-400">{kirkpatrick.retention60D}%</span></div>
              <div className="flex justify-between"><span>90-Day Check:</span><span className="font-bold text-purple-700 dark:text-purple-400">{kirkpatrick.retention90D}%</span></div>
            </div>
          </div>

          {/* Level 4: Results & ROI */}
          <div className="bg-white dark:bg-[#13221b] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200">Level 4: Results</span>
              <DollarSign className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">Financial ROI Calculator</h4>
              <p className="text-xs text-slate-500 mt-0.5">Direct business value return</p>
            </div>
            <div className="p-4 rounded-2xl bg-teal-50/50 dark:bg-[#0f1a14] border border-teal-100 dark:border-teal-900/40 text-center">
              <span className="text-3xl font-extrabold text-teal-700 dark:text-teal-400">+{trainingROI.toFixed(1)}%</span>
              <span className="text-xs text-slate-500 block mt-1">Impact: TZS 85M vs Cost: 32M</span>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: ALGORITHMIC SKILL DECAY MODEL --- */}
      {activeSubTab === 'skill-decay' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full">
          <div className="xl:col-span-2 bg-white dark:bg-[#13221b] p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">Exponential Skill Decay & Half-Life Predictor</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Predicts competency decay over time based on disuse and technological obsolescence, modified by daily operational usage telemetry.
              </p>
            </div>

            {/* Category Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Select Competency Classification</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(categoryHalfLives).map(([key, item]) => (
                  <button
                    key={key}
                    onClick={() => setDecayParams({ ...decayParams, category: key })}
                    className={`p-3.5 rounded-2xl border text-left text-xs transition-all ${
                      decayParams.category === key
                        ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/60 font-bold text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0f1a14] text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <p className="font-bold text-slate-800 dark:text-white">{item.label}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Half-life (t½): {item.halfLifeDays} Days ({ (item.halfLifeDays/365).toFixed(1) } Years)</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Parameter Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0f1a14] border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Elapsed Days Since Training</span>
                  <span className="text-emerald-700 dark:text-emerald-400">{decayParams.elapsedDays} Days</span>
                </div>
                <input
                  type="range" min="30" max="1825" step="15"
                  value={decayParams.elapsedDays}
                  onChange={(e) => setDecayParams({ ...decayParams, elapsedDays: parseInt(e.target.value) })}
                  className="w-full accent-emerald-700"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0f1a14] border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Workplace Usage Frequency (U_freq)</span>
                  <span className="text-emerald-700 dark:text-emerald-400">{(decayParams.usageFrequency * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range" min="0" max="1" step="0.05"
                  value={decayParams.usageFrequency}
                  onChange={(e) => setDecayParams({ ...decayParams, usageFrequency: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-700"
                />
              </div>
            </div>
          </div>

          {/* Predicted Result & Refresher Alert */}
          <div className="bg-white dark:bg-[#13221b] p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Real-Time Decay Status</h3>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0f1a14] border border-slate-200/80 dark:border-slate-800 text-center space-y-2">
              <span className="text-xs text-slate-500 font-semibold">Predicted Current Proficiency</span>
              <div className="text-4xl font-extrabold text-slate-800 dark:text-white">{predictedProficiency.toFixed(1)}%</div>
              <p className="text-[11px] text-slate-400">Initial Baseline: {decayParams.initialProficiency}%</p>
            </div>

            {predictedProficiency < 70 ? (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 space-y-2">
                <p className="font-bold flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-amber-600" /> Critical Decay Threshold Reached</p>
                <p className="text-[11px] leading-relaxed">Proficiency has dropped below operational threshold P_critical (70%). System has triggered an automated micro-refresher recommendation.</p>
                <button className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm">
                  Enroll in Micro-Refresher Module
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                <p className="font-bold flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Active Proficiency Retained</p>
                <p className="text-[11px]">Sufficient daily workplace application (U_freq) is successfully mitigating natural skill degradation.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 4: DYNAMIC CAREER PATHING & MOBILITY --- */}
      {activeSubTab === 'career-pathing' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full">
          <div className="xl:col-span-2 bg-white dark:bg-[#13221b] p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white">Internal Mobility & Role Transition Simulator</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Executes vector-distance calculations between current profile and target position.</p>
              </div>
              <select
                value={selectedCareerTrack}
                onChange={(e) => setSelectedCareerTrack(e.target.value)}
                className="text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1a14] text-slate-700 dark:text-slate-200 outline-none"
              >
                <option value="underwriter-to-actuary">Underwriting → Actuarial Analyst</option>
                <option value="dev-to-architect">Software Dev → Solutions Architect</option>
              </select>
            </div>

            {/* Role Header Transition */}
            <div className="p-4.5 rounded-2xl bg-gradient-to-r from-emerald-50/80 to-blue-50/80 dark:from-emerald-950/40 dark:to-blue-950/40 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Current Designation</span>
                <p className="text-sm font-extrabold text-slate-800 dark:text-white">{activeTrackData.currentRole}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-emerald-600" />
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Target Objective</span>
                <p className="text-sm font-extrabold text-emerald-800 dark:text-emerald-300">{activeTrackData.targetRole}</p>
              </div>
            </div>

            {/* Skills Delta Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Competency Delta Matrix (Gap = C_target - C_current)</h4>
              <div className="space-y-2.5">
                {activeTrackData.skillsDelta.map((s, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0f1a14] flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white">{s.skill}</p>
                      <p className="text-[11px] text-slate-500">Current Level: {s.current} / 5.0 → Target Level: {s.target} / 5.0</p>
                    </div>
                    {s.gap > 0 ? (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/30">
                        Gap Delta: -{s.gap}
                      </span>
                    ) : (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/30">
                        Matched
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Step-by-Step Learning Roadmap */}
          <div className="bg-white dark:bg-[#13221b] p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Generated Progression Roadmap</h3>
            <div className="space-y-3">
              {activeTrackData.learningRoadmap.map((step) => (
                <div key={step.step} className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0f1a14] space-y-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">Stage {step.step}</span>
                  <p className="text-xs font-bold text-slate-800 dark:text-white">{step.title}</p>
                  <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                    <span>{step.duration}</span>
                    <span className="font-semibold">{step.provider}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 5: FINANCIAL PRIORITY RANKING MATRIX --- */}
      {activeSubTab === 'priority-matrix' && (
        <div className="bg-white dark:bg-[#13221b] p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 w-full">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Dynamic Financial Priority Ranking Matrix</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Ranks competing training requests by correlating skill severity, strategic leadership alignment, timeline urgency, cost per capita, and remaining departmental budget modifier (F_budget).
            </p>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-[#0f1a14] text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-widest font-bold border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-4">Training Proposal</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Gap Severity (G)</th>
                  <th className="px-6 py-4">Strategic Alignment (S)</th>
                  <th className="px-6 py-4">Cost / Capita</th>
                  <th className="px-6 py-4">Priority Score (P_score)</th>
                  <th className="px-6 py-4 text-right">Allocation Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {requestsList.map((req) => {
                  const score = calculatePriorityScore(req);
                  return (
                    <tr key={req.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 text-xs font-bold text-slate-800 dark:text-white">{req.title}</td>
                      <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-300">{req.dept}</td>
                      <td className="px-6 py-4 text-xs font-bold text-emerald-800 dark:text-emerald-400">{req.severity}/5</td>
                      <td className="px-6 py-4 text-xs font-bold text-blue-800 dark:text-blue-400">{req.alignment}/5</td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-700 dark:text-slate-300">TZS {req.costPerCapita.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40">
                          {score} pts
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="px-3.5 py-1.5 bg-[#1b3d2f] hover:bg-[#132e23] text-white text-xs font-bold rounded-xl shadow-sm transition-all">
                          Fund & Approve
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnterpriseAnalytics;
