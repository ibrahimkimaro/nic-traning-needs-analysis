import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8081/api/v1/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.access);
        localStorage.setItem('refreshToken', data.refresh);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/home');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || errorData.detail || 'Invalid username or password. Please verify your credentials.');
      }
    } catch {
      setError('Connection error. Unable to reach the authentication server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-root">
      {/* Background ambient lighting effects */}
      <div className="login-bg-glow glow-1"></div>
      <div className="login-bg-glow glow-2"></div>
      <div className="login-bg-grid"></div>

      {/* Top Security Banner */}
      <header className="login-top-bar">
        <div className="login-top-inner">
          <div className="login-security-tag">
            <span className="security-pulse"></span>
            <span>OFFICIAL CORPORATE PORTAL</span>
          </div>
          <div className="login-top-info">
            <span>National Insurance Corporation (Tanzania) Ltd.</span>
            <span className="dot-sep">&bull;</span>
            <span className="security-note">Authorized Staff Only</span>
          </div>
        </div>
      </header>

      {/* Main Centered Content */}
      <main className="login-main-container">
        <div className="login-card">
          {/* Institution & Portal Branding */}
          <div className="login-card-header">
            <div className="login-logo-container">
              <img
                src="/logo/logo-light-streamline.png"
                alt="National Insurance Corporation"
                className="login-emblem-img"
              />
            </div>
            <div className="login-brand-titles">
              <span className="login-inst-name">National Insurance Corporation</span>
              <h1 className="login-portal-title">Training Needs Analysis</h1>
              <p className="login-portal-subtitle">
                Integrated HR Development & Competency Portal
              </p>
            </div>
          </div>

          <div className="login-card-divider"></div>

          {/* Error Alert Box */}
          {error && (
            <div className="login-error-banner" role="alert">
              <AlertCircle className="error-icon" />
              <div className="error-text">
                <strong>Authentication Failed</strong>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} className="login-auth-form" noValidate>
            {/* Username / Email Field */}
            <div className="login-field-group">
              <label htmlFor="username" className="login-field-label">
                Username or Corporate Email
              </label>
              <div className="login-input-box">
                <span className="input-leading-icon">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="e.g cyber.leak or cyberleak@gmail.com"
                  required
                  autoComplete="username"
                  className="login-text-input"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="login-field-group">
              <div className="login-password-header">
                <label htmlFor="password" className="login-field-label">
                  Security Password
                </label>
              </div>
              <div className="login-input-box">
                <span className="input-leading-icon">
                  <Lock size={18} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your confidential password"
                  required
                  autoComplete="current-password"
                  className="login-text-input"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="input-trailing-toggle"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              className="login-cta-button"
              disabled={isLoading || !formData.username || !formData.password}
            >
              {isLoading ? (
                <span className="login-btn-content">
                  <Loader2 className="btn-spinner animate-spin" size={18} />
                  <span>Authenticating...</span>
                </span>
              ) : (
                <span className="login-btn-content">
                  <span>Sign In to Portal</span>
                  <ArrowRight size={18} className="btn-arrow" />
                </span>
              )}
            </button>
          </form>

          {/* Security & Audit Verification Note */}
          <div className="login-card-footer">
            <div className="security-encryption-pill">
              <ShieldCheck size={15} className="shield-icon" />
              <span>256-bit TLS Encrypted & Audited System Session</span>
            </div>
            <p className="login-disclaimer">
              Unauthorized access or misuse is strictly prohibited under Tanzania Cybercrimes Act.
            </p>
          </div>
        </div>

        {/* Outer Footer */}
        <footer className="login-page-footer">
          <p>&copy; {new Date().getFullYear()} National Insurance Corporation (T) Ltd. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
};

export default Login;