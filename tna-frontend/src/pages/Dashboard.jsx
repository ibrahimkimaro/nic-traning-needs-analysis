import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Download, TrendingUp, TrendingDown,
  DollarSign, FileText, Percent, Users, Search, ChevronDown, Filter,
  Building2, Award, Calendar, CheckCircle2, Clock, ShieldCheck, ArrowRight,
  Layers, AlertTriangle, XCircle, RefreshCw
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { api } from '../auth/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Raw Database Records
  const [employees, setEmployees] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [requests, setRequests] = useState([]);
  const [programs, setPrograms] = useState([]);

  // Filter & View States
  const [chartMetric, setChartMetric] = useState('count'); // 'count' | 'cost'
  const [doughnutMode, setDoughnutMode] = useState('department'); // 'department' | 'stage'
  const [tableTab, setTableTab] = useState('requests'); // 'requests' | 'staff'
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [empData, budgetData, reqData, progData] = await Promise.all([
        api.organizations.getEmployees().catch(() => []),
        api.budget.getBudgets().catch(() => []),
        api.tna.getRequests().catch(() => []),
        api.training.getPrograms().catch(() => [])
      ]);

      setEmployees(empData || []);
      setBudgets(budgetData || []);
      setRequests(reqData || []);
      setPrograms(progData || []);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // REAL STATS COMPUTATION FROM DATABASE
  // ==========================================
  const totalBudget = budgets.reduce((acc, b) => acc + (Number(b.total_amount) || Number(b.amount) || 0), 0);
  const spentBudget = budgets.reduce((acc, b) => acc + (Number(b.spent_amount) || 0), 0);
  const budgetUtilization = totalBudget > 0 ? (spentBudget / totalBudget) * 100 : 0;

  const totalEmployees = employees.length;
  const activeStaff = employees.filter(e => e.status === 'Active' || e.is_active !== false).length;

  const activeRequests = requests.filter(r => r.status !== 'COMPLETED' && r.status !== 'REJECTED');
  const completedRequests = requests.filter(r => r.status === 'COMPLETED');
  const completionRate = requests.length > 0 ? (completedRequests.length / requests.length) * 100 : 0;

  // ==========================================
  // REAL MONTHLY TRENDS (LAST 6 MONTHS)
  // ==========================================
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const last6Months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    last6Months.push({
      year: d.getFullYear(),
      month: d.getMonth(),
      label: `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`
    });
  }

  const monthlyCounts = last6Months.map(m => {
    return requests.filter(r => {
      if (!r.created_at) return false;
      const d = new Date(r.created_at);
      return d.getFullYear() === m.year && d.getMonth() === m.month;
    }).length;
  });

  const monthlyCosts = last6Months.map(m => {
    return requests.filter(r => {
      if (!r.created_at) return false;
      const d = new Date(r.created_at);
      return d.getFullYear() === m.year && d.getMonth() === m.month;
    }).reduce((sum, r) => {
      const itemsCost = r.items?.reduce((itemSum, item) => itemSum + (Number(item.estimated_cost) || 0), 0) || 0;
      return sum + (itemsCost || Number(r.estimated_cost) || 0);
    }, 0);
  });

  // ==========================================
  // REAL DEPARTMENT & STAGE DISTRIBUTIONS
  // ==========================================
  // 1. Department Distribution from Requests
  const deptMap = {};
  requests.forEach(r => {
    const dept = r.employee_dept || (employees.find(e => String(e.id) === String(r.employee))?.dept_name) || 'General';
    deptMap[dept] = (deptMap[dept] || 0) + 1;
  });
  if (Object.keys(deptMap).length === 0) {
    employees.forEach(e => {
      const dept = e.dept_name || 'General';
      deptMap[dept] = (deptMap[dept] || 0) + 1;
    });
  }

  const deptLabels = Object.keys(deptMap);
  const deptCounts = Object.values(deptMap);
  const palette = ['#264033', '#3d6350', '#56846c', '#75a68d', '#9ec3af', '#cbd5e1'];

  // 2. Workflow Stage Breakdown
  const stageMap = {
    'Gate 1: HOD Review': requests.filter(r => r.status === 'SUBMITTED' || r.status === 'PENDING_DEPT').length,
    'Gate 2: HRO Verification': requests.filter(r => r.status === 'HOD_APPROVED' || r.status === 'DEPARTMENT_APPROVED').length,
    'Gate 3: Strategic Sign-off': requests.filter(r => r.status === 'HRO_PROCESSED').length,
    'Gate 4: Logistics Setup': requests.filter(r => r.status === 'STRATEGIC_APPROVED').length,
    'Gate 5: Delivery Active': requests.filter(r => r.status === 'FULFILLMENT_ACTIVE').length,
    'Completed': completedRequests.length,
  };
  const stageLabels = Object.keys(stageMap).filter(k => stageMap[k] > 0);
  const stageCounts = stageLabels.map(k => stageMap[k]);

  // Active Doughnut Data Selection
  const currentDoughnutLabels = doughnutMode === 'department' ? (deptLabels.length ? deptLabels : ['No Data']) : (stageLabels.length ? stageLabels : ['No Data']);
  const currentDoughnutData = doughnutMode === 'department' ? (deptCounts.length ? deptCounts : [1]) : (stageCounts.length ? stageCounts : [1]);

  const kpiConfigs = [
    {
      title: 'Total Training Budget',
      value: totalBudget > 0 ? `${(totalBudget / 1000000).toFixed(1)}M TZS` : '0 TZS',
      subtext: totalBudget > 0 ? `${budgetUtilization.toFixed(1)}% Allocated & Utilized` : 'Configure annual budget',
      trend: budgetUtilization > 70 ? 'up' : 'neutral',
      icon: DollarSign,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Total Workforce',
      value: totalEmployees.toLocaleString(),
      subtext: `${activeStaff} Active Staff Accounts`,
      trend: 'up',
      icon: Users,
      color: 'text-[#264033]',
      bg: 'bg-slate-100',
    },
    {
      title: 'Active Workflow Requests',
      value: activeRequests.length.toLocaleString(),
      subtext: `${requests.length} Total Submissions`,
      trend: activeRequests.length > 0 ? 'up' : 'neutral',
      icon: FileText,
      color: 'text-amber-700',
      bg: 'bg-amber-50',
    },
    {
      title: 'Fulfillment Completion',
      value: `${completionRate.toFixed(1)}%`,
      subtext: `${completedRequests.length} Completed Courses`,
      trend: completionRate > 50 ? 'up' : 'neutral',
      icon: Percent,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200"><CheckCircle2 className="w-3 h-3" /> Completed</span>;
      case 'SUBMITTED':
      case 'PENDING_DEPT':
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200"><Clock className="w-3 h-3" /> Gate 1: HOD</span>;
      case 'HOD_APPROVED':
      case 'DEPARTMENT_APPROVED':
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200"><Clock className="w-3 h-3" /> Gate 2: HRO</span>;
      case 'HRO_PROCESSED':
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200"><Clock className="w-3 h-3" /> Gate 3: Strategic</span>;
      case 'STRATEGIC_APPROVED':
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200"><Calendar className="w-3 h-3" /> Gate 4: Logistics</span>;
      case 'FULFILLMENT_ACTIVE':
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200"><Clock className="w-3 h-3" /> Gate 5: Attending</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200"><XCircle className="w-3 h-3" /> Rejected</span>;
      default:
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">{status || 'Submitted'}</span>;
    }
  };

  const handleExportCSV = () => {
    if (requests.length === 0) {
      alert('No request data available to export.');
      return;
    }
    const headers = ['Request ID,Employee Name,Department,Recipient HOD,Status,Created Date,Items Count'];
    const rows = requests.map(r => [
      `"${r.id}"`,
      `"${r.employee_name || 'N/A'}"`,
      `"${r.employee_dept || 'N/A'}"`,
      `"${r.recipient_name || 'N/A'}"`,
      `"${r.status || 'SUBMITTED'}"`,
      `"${r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}"`,
      `"${r.items?.length || 1}"`
    ].join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NIC_TNA_Dashboard_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#264033] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium text-sm">Aggregating Live Organizational Metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-red-200 shadow-xl text-center">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Connection Error</h2>
          <p className="text-slate-500 text-xs mb-6">{error}</p>
          <button onClick={fetchDashboardData} className="w-full bg-[#264033] text-white py-2.5 rounded-xl font-bold text-xs hover:bg-[#1a2d24] transition-colors">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // Filtered lists for table
  const filteredRequests = requests.filter(r => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      (r.employee_name && r.employee_name.toLowerCase().includes(q)) ||
      (r.recipient_name && r.recipient_name.toLowerCase().includes(q)) ||
      (r.status && r.status.toLowerCase().includes(q)) ||
      (r.employee_dept && r.employee_dept.toLowerCase().includes(q))
    );
  });

  const filteredEmployees = employees.filter(e => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    const fullName = e.full_name || `${e.first_name || ''} ${e.last_name || ''}`.trim();
    return (
      fullName.toLowerCase().includes(q) ||
      (e.email && e.email.toLowerCase().includes(q)) ||
      (e.dept_name && e.dept_name.toLowerCase().includes(q)) ||
      (e.position_title && e.position_title.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4 text-[#264033]" />
            Enterprise Executive Governance
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Operational TNA Dashboard
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Real-time organizational training demand, budget allocations, and state machine audit metrics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            className="p-2.5 text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-xs"
            title="Refresh Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportCSV}
            className="bg-[#264033] hover:bg-[#1a2d24] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
          >
            <Download className="w-4 h-4" />
            Export Live Report
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiConfigs.map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 group">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 ${kpi.bg} ${kpi.color} rounded-xl transition-transform group-hover:scale-105 duration-200`}>
                <kpi.icon className="w-5 h-5 text-[#264033]" />
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-600" /> Live DB
              </span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{kpi.title}</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{kpi.value}</h3>
            <p className="text-xs text-slate-500 font-medium mt-2">{kpi.subtext}</p>
          </div>
        ))}
      </div>

      {/* Main Charts: Real Trends & Real Department / Stage Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Monthly Training Volume Trends */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Monthly Training Demand &amp; Ingestion</h3>
              <p className="text-xs text-slate-500 mt-0.5">Historical submission volume across the preceding 6-month period.</p>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => setChartMetric('count')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  chartMetric === 'count' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Requests Count
              </button>
              <button
                type="button"
                onClick={() => setChartMetric('cost')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  chartMetric === 'cost' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Est. Cost (TZS)
              </button>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <Line
              data={{
                labels: last6Months.map(m => m.label),
                datasets: [{
                  label: chartMetric === 'count' ? 'Submitted Requests' : 'Estimated Budget (TZS)',
                  data: chartMetric === 'count' ? monthlyCounts : monthlyCosts,
                  borderColor: '#264033',
                  backgroundColor: 'rgba(38, 64, 51, 0.08)',
                  fill: true,
                  tension: 0.35,
                  borderWidth: 3,
                  pointRadius: 5,
                  pointBackgroundColor: '#264033',
                  pointBorderColor: '#ffffff',
                  pointBorderWidth: 2
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        return chartMetric === 'count'
                          ? ` Requests: ${context.parsed.y}`
                          : ` Cost: ${context.parsed.y.toLocaleString()} TZS`;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: { color: '#f1f5f9' },
                    ticks: {
                      color: '#64748b',
                      font: { size: 11 },
                      callback: (val) => chartMetric === 'count' ? val : `${(val / 1000000).toFixed(0)}M`
                    }
                  },
                  x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 11 } } }
                }
              }}
            />
          </div>
        </div>

        {/* Right: Department / Workflow Stage Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Pipeline Distribution</h3>
              <p className="text-xs text-slate-500 mt-0.5">Categorization across active operational units.</p>
            </div>
            <select
              value={doughnutMode}
              onChange={(e) => setDoughnutMode(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg bg-slate-50 px-2.5 py-1.5 outline-none font-semibold text-slate-700 focus:ring-1 focus:ring-[#264033]"
            >
              <option value="department">By Department</option>
              <option value="stage">By Workflow Stage</option>
            </select>
          </div>

          <div className="h-64 w-full flex items-center justify-center pt-2">
            <Doughnut
              data={{
                labels: currentDoughnutLabels,
                datasets: [{
                  data: currentDoughnutData,
                  backgroundColor: palette.slice(0, currentDoughnutLabels.length),
                  borderWidth: 2,
                  borderColor: '#ffffff',
                  hoverOffset: 8
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '72%',
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { usePointStyle: true, padding: 12, font: { size: 11, weight: '600' }, color: '#475569' }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Operational Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTableTab('requests')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                tableTab === 'requests' ? 'bg-[#264033] text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Live Training Requests ({requests.length})
            </button>
            <button
              onClick={() => setTableTab('staff')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                tableTab === 'staff' ? 'bg-[#264033] text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Registered Staff ({employees.length})
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder={tableTab === 'requests' ? "Filter requests by employee, HOD, status..." : "Filter staff by name, department, role..."}
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="block w-64 sm:w-80 pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#264033] shadow-xs"
              />
            </div>
            {tableTab === 'requests' && (
              <button
                onClick={() => navigate('/admin/tna/approvals')}
                className="text-xs font-bold text-[#264033] hover:underline flex items-center gap-1 shrink-0 px-2"
              >
                Approval Queue <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Requests Table */}
        {tableTab === 'requests' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                  <th className="px-6 py-3.5">Employee / Requester</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Designated HOD</th>
                  <th className="px-6 py-3.5">Workflow Stage</th>
                  <th className="px-6 py-3.5">Training Needs</th>
                  <th className="px-6 py-3.5 text-right">Submission Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.length > 0 ? (
                  filteredRequests.slice(0, 8).map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#264033] text-white text-xs font-bold flex items-center justify-center shrink-0">
                            {req.employee_name?.charAt(0) || 'E'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {req.employee_name || 'Staff Member'}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              ID: {req.id?.slice(0, 8)?.toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-700">
                        {req.employee_dept || 'Department'}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-600">
                        {req.recipient_name || 'Assigned HOD'}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(req.status)}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                          {req.items?.length || 1} Need{req.items?.length > 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 text-right font-mono">
                        {req.created_at ? new Date(req.created_at).toLocaleDateString() : 'Recent'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400 text-xs">
                      No training requests found matching filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Staff Table */}
        {tableTab === 'staff' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                  <th className="px-6 py-3.5">Staff Member</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Position Title</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Member Since</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.slice(0, 8).map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src="/userAvatar.jpeg"
                            alt="Staff avatar"
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 shadow-xs shrink-0"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-900">
                              {emp.full_name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || emp.username}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">{emp.employee_number || emp.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 font-mono">
                        {emp.email || '—'}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-700">
                        {emp.dept_name || '—'}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-700">
                        {emp.position_title || 'Staff Member'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          emp.status === 'Active' || emp.is_active !== false
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {emp.status || (emp.is_active ? 'Active' : 'Inactive')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 text-right font-mono">
                        {emp.date_joined ? new Date(emp.date_joined).toLocaleDateString() : 'Recent'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400 text-xs">
                      No staff members found matching filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 text-xs text-slate-500">
          <p>
            Showing {tableTab === 'requests' ? Math.min(filteredRequests.length, 8) : Math.min(filteredEmployees.length, 8)} of{' '}
            {tableTab === 'requests' ? filteredRequests.length : filteredEmployees.length} live records
          </p>
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-slate-400">Synced directly with PostgreSQL database</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
