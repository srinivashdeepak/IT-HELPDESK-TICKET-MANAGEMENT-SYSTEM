import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    try {
      setError('');
      setSubmitting(true);
      const user = await login(username, password);
      if (user.role === 'ROLE_ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'ROLE_AGENT') {
        navigate('/agent/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid credentials');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemo = (user, pass) => {
    setUsername(user);
    setPassword(pass);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light px-3 py-5">
      <div className="card-enterprise p-4 p-md-5" style={{ maxWidth: '460px', width: '100%' }}>
        <div className="text-center mb-4">
          <div className="brand-badge mx-auto mb-2" style={{ width: '42px', height: '42px', fontSize: '1.25rem' }}>
            <i className="bi bi-hdd-network"></i>
          </div>
          <h4 className="fw-bold text-dark mb-1">TechDesk Enterprise</h4>
          <p className="text-muted small">Sign in to your IT support service portal</p>
        </div>

        {error && (
          <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3" role="alert">
            <i className="bi bi-exclamation-octagon-fill"></i>
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Username or Corporate Email</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <i className="bi bi-person"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="e.g. admin or emp.david"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label small fw-semibold text-secondary">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <i className="bi bi-key"></i>
              </span>
              <input
                type="password"
                className="form-control border-start-0"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary-enterprise w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Authenticating...
              </>
            ) : (
              <>
                Sign In <i className="bi bi-arrow-right"></i>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials for Interviews and Portfolio */}
        <div className="mt-4 pt-3 border-top">
          <div className="text-muted text-center small fw-semibold mb-2">
            One-Click Demo Credentials:
          </div>
          <div className="d-flex flex-column gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-danger d-flex justify-content-between align-items-center px-3"
              onClick={() => handleQuickDemo('admin', 'password123')}
            >
              <span><i className="bi bi-shield-lock me-1"></i> Administrator</span>
              <span className="badge bg-danger-subtle text-danger font-monospace">admin</span>
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary d-flex justify-content-between align-items-center px-3"
              onClick={() => handleQuickDemo('agent.sarah', 'password123')}
            >
              <span><i className="bi bi-headset me-1"></i> IT Support Agent</span>
              <span className="badge bg-primary-subtle text-primary font-monospace">agent.sarah</span>
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary d-flex justify-content-between align-items-center px-3"
              onClick={() => handleQuickDemo('emp.david', 'password123')}
            >
              <span><i className="bi bi-person me-1"></i> Employee (David Miller)</span>
              <span className="badge bg-secondary-subtle text-secondary font-monospace">emp.david</span>
            </button>
          </div>
        </div>

        <div className="text-center mt-4">
          <span className="text-muted small">New employee? </span>
          <Link to="/register" className="small fw-semibold text-decoration-none text-primary">
            Register Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
