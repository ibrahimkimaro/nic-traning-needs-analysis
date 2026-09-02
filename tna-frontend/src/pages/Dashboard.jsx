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
  const [demoData, setDemoData] = useState([]);

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
      setDemoData([40, 30, 20, 10]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const kpiConfigs = [
    {
      title: 'Total Budget',
      value: `$${stats.totalBudget.toLocaleString()}`,
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      chartColor: '#264033'
    },
    {
      title: 'Total Employees',
      value: stats.totalEmployees.toLocaleString(),
      change: '+3.2%',
      trend: 'up',
      icon: Users,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      chartColor: '#264033'
    },
    {
      title: 'Pending Requests',
      value: stats.pendingRequests.toLocaleString(),
      change: '-1.4%',
      trend: 'down',
      icon: FileText,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      chartColor: '#d97706'
    },
    {
      title: 'Completion Rate',
      value: `${stats.completionRate.toFixed(1)}%`,
      change: '+0.8%',
      trend: 'up',
      icon: Percent,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      chartColor: '#264033'
    },
  ];

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#264033] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Loading Dashboard Data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-red-200 shadow-xl text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Connection Error</h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <button onClick={fetchDashboardData} className="w-full bg-[#264033] text-white py-2 rounded-lg font-medium hover:bg-[#1a2d24] transition-colors">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Operational Overview</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time performance metrics for the current fiscal quarter.</p>
        </div>
        <button className="bg-[#264033] hover:bg-[#1a2d24] text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiConfigs.map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 group">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2.5 ${kpi.bg} ${kpi.color} rounded-xl transition-transform group-hover:scale-110 duration-200`}>
                <kpi.icon className="w-5 h-5" />
              </div>
              <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${kpi.trend === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'
                }`}>
                {kpi.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {kpi.change}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-500">{kpi.title}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{kpi.value}</h3>
            <div className="mt-4 h-12 w-full opacity-60">
              <svg className="w-full h-full" preserveAspectRatio="none">
                <path d={`M0 30 Q 20 ${idx % 2 === 0 ? 10 : 20}, 40 25 T 80 15 T 120 35 T 160 20 T 200 30 T 240 10 T 280 25`}
                  fill="none" stroke={kpi.chartColor} strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900">Revenue Growth</h3>
            <select className="text-xs border border-slate-200 rounded-lg bg-slate-50 px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#264033] transition-all">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-72 w-full">
            <Line data={{
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
              datasets: [{
                label: 'Revenue',
                data: revenueData,
                borderColor: '#264033',
                backgroundColor: 'rgba(38, 64, 51, 0.05)',
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 4,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#264033',
                pointBorderWidth: 2
              }]
            }} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { color: '#64748b', font: { size: 11 } } },
                x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 11 } } }
              }
            }} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900">User Demographics</h3>
            <button className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-all"><Filter className="w-4 h-4" /></button>
          </div>
          <div className="h-72 w-full flex items-center justify-center">
            <Doughnut data={{
              labels: ['Enterprise', 'SMB', 'Freelance', 'Other'],
              value: [20, 30, 20, 10],
              datasets: [{
                data: [20, 30, 20, 10],
                backgroundColor: ['#264033', '#4a6b5d', '#8aa396', '#cbd5e1'],
                borderWidth: 0,
                hoverOffset: 10
              }]
            }} options={{
              responsive: true,
              maintainAspectRatio: false,
              cutout: '75%',
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: { usePointStyle: true, padding: 20, font: { size: 12, weight: '500' }, color: '#64748b' }
                }
              }
            }} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-bold text-slate-900">Recent Users</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input type="text" placeholder="Filter users..."
                className="block w-64 pl-10 pr-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#264033] transition-all" />
            </div>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 text-[11px] uppercase tracking-widest font-bold">
                <th className="px-6 py-4 w-10">
                  <input type="checkbox" className="rounded border-slate-300 text-[#264033] focus:ring-[#264033]" />
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-slate-700 group">
                  <div className="flex items-center gap-1">User <ChevronDown className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-slate-700 group">
                  <div className="flex items-center gap-1">Email <ChevronDown className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-slate-700 group">
                  <div className="flex items-center gap-1">Role <ChevronDown className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-slate-700 group">
                  <div className="flex items-center gap-1">Status <ChevronDown className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-slate-700 group text-right">
                  <div className="flex items-center justify-end gap-1">Last Login <ChevronDown className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentUsers.map((user, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4"><input type="checkbox" className="rounded border-slate-300 text-[#264033] focus:ring-[#264033]" /></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.avatar}`} className="w-8 h-8 rounded-full bg-slate-100 ring-2 ring-white shadow-sm" alt="" />
                      <span className="text-sm font-semibold text-slate-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.role}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md ${user.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                      user.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 text-right font-medium">{user.lastLogin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <p className="text-xs text-slate-500">Showing 1 to {recentUsers.length} of {recentUsers.length} entries</p>
          <div className="flex gap-1">
            <button className="p-1 px-3 text-xs border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors disabled:opacity-50" disabled>Previous</button>
            <button className="p-1 px-3 text-xs border border-slate-200 rounded-lg bg-[#264033] text-white font-semibold shadow-sm">1</button>
            <button className="p-1 px-3 text-xs border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
