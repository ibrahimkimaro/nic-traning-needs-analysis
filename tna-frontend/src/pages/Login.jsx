import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Building2,
  Award,
  FileSpreadsheet,
  Layers
} from 'lucide-react';
import { api } from '../auth/api';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError('');
  };

  const handleRolePreset = (username, password = 'password123') => {
    setFormData({ username, password });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await api.auth.login(formData);

      if (data && data.access) {
        localStorage.setItem('accessToken', data.access);
        if (data.refresh) localStorage.setItem('refreshToken', data.refresh);
        if (data.user) localStorage.setItem('user', JSON.stringify(data.user));

        // Navigate to home workspace
        navigate('/home');
      } else {
        setError('Invalid response from authentication server.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="nic-login-viewport">
      {/* LEFT PANEL: Institutional Branding & Mission */}
      <div className="nic-login-brand-panel">
        <div className="nic-brand-pattern" />

        {/* Top Header Badge */}
        <div className="nic-brand-header">
          <div className="nic-brand-tag">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Official Portal &bull; United Republic of Tanzania</span>
          </div>
        </div>

        {/* Hero Content */}
        <div className="nic-brand-body">
          <div className="nic-logo-wrapper">
            <div className="nic-emblem-circle">
              <Building2 className="w-10 h-10 text-emerald-100" />
            </div>
            <div>
              <h2 className="nic-org-name">National Insurance Corporation</h2>
              <p className="nic-org-sub">NIC Tanzania Limited</p>
            </div>
          </div>

          <div className="nic-headline-box">
            <h1 className="nic-hero-title">
              Training Needs Analysis &amp; Competency Platform
            </h1>
            <p className="nic-hero-desc">
              Deterministic workforce capability analysis, regulatory compliance monitoring,
              and multi-gate workflow governance engineered for institutional excellence.
            </p>
          </div>

          {/* Institutional Highlights */}
          <div className="nic-features-list">
            <div className="nic-feature-item">
              <div className="nic-feature-icon">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h4 className="nic-feature-title">TIRA Regulatory Compliance</h4>
                <p className="nic-feature-sub">Automated certification tracking with 30-day proactive expiry alerts.</p>
              </div>
            </div>

            <div className="nic-feature-item">
              <div className="nic-feature-icon">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h4 className="nic-feature-title">Deterministic Gap Prioritization</h4>
                <p className="nic-feature-sub">Objective scoring based on organizational strategic weight and role competency benchmarks.</p>
              </div>
            </div>

            <div className="nic-feature-item">
              <div className="nic-feature-icon">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h4 className="nic-feature-title">End-to-End Workflow Governance</h4>
                <p className="nic-feature-sub">Structured validation gates across Employee, HOD, HRO, and HR Management.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Trust Badges */}
        <div className="nic-brand-footer">
          <div className="nic-compliance-badges">
            <span className="badge-item">
              <Award className="w-3.5 h-3.5" /> TIRA Regulated
            </span>
            <span className="badge-item">
              <ShieldCheck className="w-3.5 h-3.5" /> ISO 27001 Ready
            </span>
            <span className="badge-item">
              <FileSpreadsheet className="w-3.5 h-3.5" /> End-to-End Audit Trail
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Authentication Form */}
      <div className="nic-login-form-panel">
        <div className="nic-form-container">

          {/* Form Header */}
          <div className="nic-form-header">
            <div className="nic-mobile-logo">
              <Building2 className="w-7 h-7 text-[#1b3d2f]" />
              <span className="font-bold text-[#1b3d2f] text-lg">NIC Tanzania</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Staff Portal Sign In
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Enter your corporate credentials to access your TNA dashboard.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="nic-error-box">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <div className="text-xs font-semibold text-red-800 leading-snug">
                {error}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="nic-auth-form">
            <div className="nic-input-group">
              <label htmlFor="username" className="nic-input-label">
                Username or Staff ID
              </label>
              <div className="nic-input-wrapper">
                <User className="nic-field-icon" />
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="e.g. ibrahim or emp_001"
                  className="nic-text-input"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="nic-input-group">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="nic-input-label">
                  Corporate Password
                </label>
                <button
                  type="button"
                  onClick={() => alert('For password resets, please contact NIC ICT Helpdesk (ext 4040).')}
                  className="text-xs font-semibold text-[#264033] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="nic-input-wrapper">
                <Lock className="nic-field-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  className="nic-text-input pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="nic-eye-toggle"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-slate-300 text-[#264033] focus:ring-[#264033]"
                />
                <span>Remember this terminal session</span>
              </label>
              <span className="flex items-center gap-1 text-emerald-700 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> 256-bit Encrypted
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="nic-submit-btn"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </button>
          </form>



          {/* Footer Note */}
          <div className="nic-form-footer">
            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              &copy; {new Date().getFullYear()} National Insurance Corporation of Tanzania Limited.<br />
              Authorized institutional access only. All activities are monitored and logged.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
