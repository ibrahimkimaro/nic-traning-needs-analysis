import React, { useState, useEffect } from 'react';
import {
  Download, TrendingUp, TrendingDown,
  DollarSign, FileText, Percent, Users, Search, ChevronDown, Filter
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState({
    totalBudget: 0,
    totalEmployees: 0,
    pendingRequests: 0,
    completionRate: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [revenueData, setRevenueData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [employees, budgets, requests, programs] = await Promise.all([
        api.organizations.getEmployees(),
        api.budget.getBudgets(),
        api.tna.getRequests(),
        api.training.getPrograms()
      ]);

      const totalBudget = budgets.reduce((acc, b) => acc + (b.amount || 0), 0);
      const totalEmployees = employees.length;
      const pendingRequests = requests.filter(r => r.status === 'PENDING').length;
      const completionRate = programs.length > 0
        ? (requests.filter(r => r.status === 'COMPLETED').length / requests.length * 100) || 0
        : 0;

      setStats({ totalBudget, totalEmployees, pendingRequests, completionRate });
      setRecentUsers(employees.slice(0, 5).map(emp => ({
        name: emp.full_name || `${emp.first_name} ${emp.last_name}`,
        email: emp.email,
        role: emp.position_title || 'Employee',
        status: emp.status || 'Active',
        lastLogin: 'Recent',
        avatar: (emp.first_name || emp.username || 'U').charAt(0).toUpperCase()
      })));
      setRevenueData([45000, 52000, 48000, 61000, 55000, 67000]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const kpiConfigs = [
    {
      title: 'Total Budget Allocated',
      value: `TZS ${Number(stats.totalBudget || 0).toLocaleString()}`,
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-emerald-800 dark:text-emerald-300',
      bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-100 dark:border-emerald-800/40',
      chartColor: '#10b981'
    },
    {
      title: 'Active Employees',
      value: stats.totalEmployees.toLocaleString(),
      change: '+3.2%',
      trend: 'up',
      icon: Users,
      color: 'text-blue-800 dark:text-blue-300',
      bg: 'bg-blue-50 dark:bg-blue-950/60 border-blue-100 dark:border-blue-800/40',
      chartColor: '#3b82f6'
    },
    {
      title: 'Pending Requests',
      value: stats.pendingRequests.toLocaleString(),
      change: '-1.4%',
      trend: 'down',
      icon: FileText,
      color: 'text-amber-800 dark:text-amber-300',
      bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-100 dark:border-amber-800/40',
      chartColor: '#f59e0b'
    },
    {
      title: 'Completion Rate',
      value: `${stats.completionRate.toFixed(1)}%`,
      change: '+0.8%',
      trend: 'up',
      icon: Percent,
      color: 'text-purple-800 dark:text-purple-300',
      bg: 'bg-purple-50 dark:bg-purple-950/60 border-purple-100 dark:border-purple-800/40',
      chartColor: '#8b5cf6'
    },
  ];

  if (loading) {
    return (
      <div className="h-full w-full min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-emerald-700 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Loading Executive Dashboard Data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-[#13221b] p-8 rounded-3xl border border-rose-200 dark:border-rose-900/60 shadow-xl text-center">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Connection Error</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{error}</p>
          <button onClick={fetchDashboardData} className="w-full bg-[#1b3d2f] hover:bg-[#132e23] text-white py-2.5 rounded-xl font-bold transition-all shadow-sm">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full">
      {/* Page Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 w-full">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            Institutional Operational Overview
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Real-time analytics, skill development metrics, and organizational KPIs.
          </p>
        </div>
        <button className="bg-[#1b3d2f] hover:bg-[#132e23] text-white px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 shrink-0">
          <Download className="w-4 h-4" />
          <span>Export Summary Report</span>
        </button>
      </div>

      {/* KPI Stats Grid - Full Width */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 w-full">
        {kpiConfigs.map((kpi, idx) => (
          <div key={idx} className="bg-white dark:bg-[#13221b] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 group">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 ${kpi.bg} ${kpi.color} rounded-2xl border transition-all shadow-xs`}>
                <kpi.icon className="w-5 h-5" />
              </div>
              <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${
                kpi.trend === 'up'
                  ? 'text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/60'
                  : 'text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200/60'
              }`}>
                {kpi.trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {kpi.change}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{kpi.title}</p>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-white mt-1">{kpi.value}</h3>
            <div className="mt-4 h-10 w-full opacity-60">
              <svg className="w-full h-full" preserveAspectRatio="none">
                <path
                  d={`M0 25 Q 25 ${idx % 2 === 0 ? 8 : 18}, 50 20 T 100 12 T 150 28 T 200 16 T 250 22 T 300 10`}
                  fill="none"
                  stroke={kpi.chartColor}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid - Expanded Full Width */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full">
        <div className="xl:col-span-2 bg-white dark:bg-[#13221b] p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-base">Training Spend & Budget Trajectory</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Quarterly development allocation vs expenditure</p>
            </div>
            <select className="text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/80 dark:bg-[#0f1a14] text-slate-700 dark:text-slate-200 px-3.5 py-2 outline-none focus:ring-2 focus:ring-emerald-600/40 transition-all font-semibold">
              <option>Last 6 Months</option>
              <option>Full Fiscal Year</option>
            </select>
          </div>
          <div className="h-72 w-full">
            <Line
              data={{
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                  label: 'Training Investment (TZS)',
                  data: revenueData,
                  borderColor: '#10b981',
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  fill: true,
                  tension: 0.4,
                  borderWidth: 3,
                  pointRadius: 4,
                  pointBackgroundColor: '#fff',
                  pointBorderColor: '#10b981',
                  pointBorderWidth: 2
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true, grid: { color: 'rgba(148, 163, 184, 0.1)' }, ticks: { color: '#64748b', font: { size: 11 } } },
                  x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 11 } } }
                }
              }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-[#13221b] p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-base">Departmental Distribution</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Training participants by sector</p>
            </div>
            <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
              <Filter className="w-4 h-4" />
            </button>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <Doughnut
              data={{
                labels: ['Underwriting', 'Claims', 'ICT & Systems', 'Finance', 'Legal'],
                datasets: [{
                  data: [35, 25, 20, 12, 8],
                  backgroundColor: ['#1b3d2f', '#2d6a4f', '#40916c', '#74c69d', '#b7e4c7'],
                  borderWidth: 0,
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
                    labels: { usePointStyle: true, padding: 15, font: { size: 11, weight: '600' }, color: '#64748b' }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Recent Users Table - Full Screen Width */}
      <div className="bg-white dark:bg-[#13221b] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden w-full">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-base">Recent Staff Registrations & Activity</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Real-time authentication records and employee profile states</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Filter staff members..."
                className="block w-64 pl-10 pr-3.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/80 dark:bg-[#0f1a14] text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/40 transition-all text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-[#0f1a14] text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-widest font-bold border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Corporate Email</th>
                <th className="px-6 py-4">Designation</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentUsers.map((u, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-[#1b3d2f] dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                        {u.avatar}
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-300">{u.email}</td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-600 dark:text-slate-300">{u.role}</td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40">
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 text-right font-medium">{u.lastLogin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
