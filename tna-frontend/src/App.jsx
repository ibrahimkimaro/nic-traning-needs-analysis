import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layout/AdminLayout';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import StaffManagement from './pages/StaffManagement';
import DepartmentManagement from './pages/organization/DepartmentManagement';
import PositionManagement from './pages/organization/PositionManagement';
import TrainingRequestForm from './pages/tna/TrainingRequestForm';
import RequestApprovalQueue from './pages/tna/RequestApprovalQueue';
import GapAnalysisView from './pages/tna/GapAnalysisView';
import TrainingRecommendations from './pages/tna/TrainingRecommendations';
import ProviderManagement from './pages/training/ProviderManagement';
import ProgramManagement from './pages/training/ProgramManagement';
import EnrollmentManagement from './pages/training/EnrollmentManagement';
import BudgetOversight from './pages/BudgetOversight';
import SystemAdministration from './pages/SystemAdministration';
import Login from './pages/Login';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    return <Navigate to="/home" replace />;
  }
  return children;
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Login Route */}
        <Route
          path="/"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />

        {/* Unified Employee Home Workspace (UC-01 to UC-09 Hub) */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        {/* Administrative & Strategic Management Suite */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="staff" element={<StaffManagement />} />
          <Route path="org/departments" element={<DepartmentManagement />} />
          <Route path="org/positions" element={<PositionManagement />} />

          {/* TNA Engine Routes */}
          <Route path="tna/request" element={<TrainingRequestForm />} />
          <Route path="tna/approvals" element={<RequestApprovalQueue />} />
          <Route path="tna/gap-analysis" element={<GapAnalysisView />} />
          <Route path="tna/recommendations" element={<TrainingRecommendations />} />

          {/* Training Management Routes */}
          <Route path="training/providers" element={<ProviderManagement />} />
          <Route path="training/programs" element={<ProgramManagement />} />
          <Route path="training/enrollments" element={<EnrollmentManagement />} />

          {/* Budget Oversight */}
          <Route path="budget" element={<BudgetOversight />} />

          {/* System Administration */}
          <Route path="system-admin" element={<SystemAdministration />} />

          <Route path="analytics" element={<div className="p-8 font-medium text-slate-500">Analytics Suite (Under Construction)</div>} />
          <Route path="settings" element={<div className="p-8 font-medium text-slate-500">Settings Page (Under Construction)</div>} />
          <Route path="security" element={<div className="p-8 font-medium text-slate-500">Security & RBAC Configuration</div>} />
          <Route path="audit" element={<div className="p-8 font-medium text-slate-500">Audit Logs & Access History</div>} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
