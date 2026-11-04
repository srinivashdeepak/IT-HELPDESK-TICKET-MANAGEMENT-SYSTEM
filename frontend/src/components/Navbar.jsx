import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const { user, logout, isAdmin, isAgent } = useAuth();

  const getRoleBadge = () => {
    if (isAdmin) return <span className="badge bg-danger-subtle text-danger border border-danger-subtle">ADMIN</span>;
    if (isAgent) return <span className="badge bg-primary-subtle text-primary border border-primary-subtle">SUPPORT AGENT</span>;
    return <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle">EMPLOYEE</span>;
  };

  return (
    <header className="app-navbar">
      <div className="d-flex align-items-center gap-3">
        <span className="text-secondary small fw-medium">
          <i className="bi bi-shield-check text-success me-1"></i> Connected to Enterprise Gateway
        </span>
      </div>

      <div className="d-flex align-items-center gap-3">
        <div className="text-end d-none d-sm-block">
          <div className="fw-semibold text-dark small">{user?.fullName}</div>
          <div className="text-muted" style={{ fontSize: '0.75rem' }}>{user?.department}</div>
        </div>

        <div className="me-1">
          {getRoleBadge()}
        </div>

        <div className="dropdown">
          <button
            className="btn btn-sm btn-light border rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: '36px', height: '36px', padding: 0 }}
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <span className="fw-bold text-primary" style={{ fontSize: '0.9rem' }}>
              {user?.fullName?.charAt(0) || 'U'}
            </span>
          </button>
          <ul className="dropdown-menu dropdown-menu-end shadow-sm border-subtle">
            <li>
              <div className="dropdown-header">
                <strong>{user?.fullName}</strong>
                <div className="text-muted small">{user?.email}</div>
              </div>
            </li>
            <li><hr className="dropdown-divider" /></li>
            <li>
              <Link className="dropdown-item small" to="/profile">
                <i className="bi bi-person me-2"></i> User Profile
              </Link>
            </li>
            <li><hr className="dropdown-divider" /></li>
            <li>
              <button className="dropdown-item small text-danger" onClick={logout}>
                <i className="bi bi-box-arrow-right me-2"></i> Sign Out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
