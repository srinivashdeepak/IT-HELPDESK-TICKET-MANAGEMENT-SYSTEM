import React from 'react';
import { useAuth } from '../../context/AuthContext';

const UserProfilePage = () => {
  const { user, logout } = useAuth();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="mb-4">
        <h4 className="fw-bold text-dark mb-1">User Profile & Account Security</h4>
        <p className="text-muted small mb-0">
          Verify your employee credentials, departmental assignments, and authentication status
        </p>
      </div>

      <div className="row g-4">
        <div className="col-12 col-md-4">
          <div className="card-enterprise p-4 text-center">
            <div
              className="rounded-circle bg-primary bg-opacity-10 text-primary mx-auto mb-3 d-flex align-items-center justify-content-center fw-bold"
              style={{ width: '80px', height: '80px', fontSize: '2rem' }}
            >
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <h5 className="fw-bold text-dark mb-1">{user?.fullName}</h5>
            <p className="text-muted small mb-2">{user?.department}</p>
            <div className="mb-3">
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                {user?.role?.replace('ROLE_', '')}
              </span>
            </div>
            <button onClick={logout} className="btn btn-outline-danger btn-sm w-100">
              <i className="bi bi-box-arrow-right me-1"></i> Sign Out
            </button>
          </div>
        </div>

        <div className="col-12 col-md-8">
          <div className="card-enterprise p-4">
            <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">Enterprise Identity Information</h6>

            <div className="row g-3 mb-4">
              <div className="col-sm-6">
                <label className="text-muted small d-block">Corporate Username</label>
                <code className="fw-semibold fs-6 text-dark">{user?.username}</code>
              </div>

              <div className="col-sm-6">
                <label className="text-muted small d-block">Email Address</label>
                <span className="fw-medium text-dark">{user?.email}</span>
              </div>

              <div className="col-sm-6">
                <label className="text-muted small d-block">Assigned Department</label>
                <span className="fw-medium text-dark">{user?.department}</span>
              </div>

              <div className="col-sm-6">
                <label className="text-muted small d-block">Authorization Level</label>
                <span className="fw-medium text-dark">{user?.role}</span>
              </div>
            </div>

            <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">Platform Security Attributes</h6>

            <div className="p-3 bg-light rounded border">
              <div className="d-flex align-items-center justify-content-between mb-2 small">
                <span className="text-muted">Password Encryption:</span>
                <span className="badge bg-success-subtle text-success">BCrypt 10-Rounds (Salted)</span>
              </div>
              <div className="d-flex align-items-center justify-content-between mb-2 small">
                <span className="text-muted">Session Authentication:</span>
                <span className="badge bg-primary-subtle text-primary">Stateless JWT (HMAC-SHA256)</span>
              </div>
              <div className="d-flex align-items-center justify-content-between small">
                <span className="text-muted">Account Status:</span>
                <span className="badge bg-success-subtle text-success">Active & Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
