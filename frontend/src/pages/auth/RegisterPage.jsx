import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    department: 'Finance & Accounting',
    phone: '',
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const departments = [
    'Finance & Accounting',
    'Product & Design',
    'Engineering',
    'Human Resources',
    'Marketing & Sales',
    'Legal & Compliance',
    'Customer Success',
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setError('');
      setSubmitting(true);
      await register({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        fullName: formData.fullName.trim(),
        department: formData.department,
        phone: formData.phone.trim(),
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light px-3 py-5">
      <div className="card-enterprise p-4 p-md-5" style={{ maxWidth: '520px', width: '100%' }}>
        <div className="text-center mb-4">
          <div className="brand-badge mx-auto mb-2" style={{ width: '42px', height: '42px', fontSize: '1.25rem' }}>
            <i className="bi bi-person-plus"></i>
          </div>
          <h4 className="fw-bold text-dark mb-1">Create Employee Account</h4>
          <p className="text-muted small">Join the corporate IT Helpdesk service platform</p>
        </div>

        {error && (
          <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3" role="alert">
            <i className="bi bi-exclamation-octagon-fill"></i>
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label small fw-semibold text-secondary">Full Legal Name</label>
              <input
                type="text"
                name="fullName"
                className="form-control"
                placeholder="e.g. David Miller"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Corporate Username</label>
              <input
                type="text"
                name="username"
                className="form-control"
                placeholder="e.g. emp.david"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Email Address</label>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="david.miller@company.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Department</label>
              <select
                name="department"
                className="form-select"
                value={formData.department}
                onChange={handleChange}
                required
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Direct Phone / Ext</label>
              <input
                type="text"
                name="phone"
                className="form-control"
                placeholder="+1-555-0104"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Password</label>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-control"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="mt-4">
            <button
              type="submit"
              className="btn btn-primary-enterprise w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Creating Account...
                </>
              ) : (
                <>
                  Register & Continue <i className="bi bi-check2-circle"></i>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-4 pt-2 border-top">
          <span className="text-muted small">Already have an account? </span>
          <Link to="/login" className="small fw-semibold text-decoration-none text-primary">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
