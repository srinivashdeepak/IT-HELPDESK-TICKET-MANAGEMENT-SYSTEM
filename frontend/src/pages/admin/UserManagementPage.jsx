import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import LoadingSpinner from '../../components/LoadingSpinner';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Modal State for New User
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: 'password123',
    fullName: '',
    department: 'IT Support Tier 2',
    phone: '',
    role: 'ROLE_AGENT',
  });
  const [submittingUser, setSubmittingUser] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await userService.getUsers(roleFilter || null);
      if (res.success) {
        setUsers(res.data);
      }
    } catch (err) {
      setError('Failed to fetch user directory');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentActive, name) => {
    const action = currentActive ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} the account for ${name}?`)) {
      return;
    }

    try {
      setError('');
      const res = await userService.toggleUserStatus(id);
      if (res.success) {
        setActionSuccess(`User ${name} has been ${action}d.`);
        loadUsers();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.username.trim() || !newUser.email.trim() || !newUser.fullName.trim()) {
      setError('Please fill in all required user fields');
      return;
    }

    try {
      setSubmittingUser(true);
      setError('');
      const res = await userService.createUser(newUser);
      if (res.success) {
        setActionSuccess(`User ${res.data.fullName} provisioned successfully!`);
        setShowModal(false);
        setNewUser({
          username: '',
          email: '',
          password: 'password123',
          fullName: '',
          department: 'IT Support Tier 2',
          phone: '',
          role: 'ROLE_AGENT',
        });
        loadUsers();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to provision user');
    } finally {
      setSubmittingUser(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ROLE_ADMIN':
        return <span className="badge bg-danger-subtle text-danger border border-danger-subtle">ADMIN</span>;
      case 'ROLE_AGENT':
        return <span className="badge bg-primary-subtle text-primary border border-primary-subtle">SUPPORT AGENT</span>;
      case 'ROLE_EMPLOYEE':
        return <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle">EMPLOYEE</span>;
      default:
        return <span className="badge bg-light text-dark">{role}</span>;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">Corporate User & Agent Directory</h4>
          <p className="text-muted small mb-0">
            Provision IT support specialists, manage employee accounts, and control system authorization
          </p>
        </div>
        <div>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary-enterprise d-inline-flex align-items-center gap-2"
          >
            <i className="bi bi-person-plus-fill"></i> Provision New User
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="alert alert-success py-2 small d-flex justify-content-between align-items-center mb-4">
          <div><i className="bi bi-check-circle me-2"></i> {actionSuccess}</div>
          <button type="button" className="btn-close" onClick={() => setActionSuccess('')}></button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger py-2 small d-flex justify-content-between align-items-center mb-4">
          <div><i className="bi bi-exclamation-triangle me-2"></i> {error}</div>
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="card-enterprise p-3 mb-4">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <span className="small text-muted fw-semibold">Filter Role:</span>
            <div className="btn-group btn-group-sm" role="group">
              <button
                type="button"
                className={`btn ${roleFilter === '' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setRoleFilter('')}
              >
                All Roles
              </button>
              <button
                type="button"
                className={`btn ${roleFilter === 'ROLE_ADMIN' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setRoleFilter('ROLE_ADMIN')}
              >
                Admins
              </button>
              <button
                type="button"
                className={`btn ${roleFilter === 'ROLE_AGENT' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setRoleFilter('ROLE_AGENT')}
              >
                Support Agents
              </button>
              <button
                type="button"
                className={`btn ${roleFilter === 'ROLE_EMPLOYEE' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setRoleFilter('ROLE_EMPLOYEE')}
              >
                Employees
              </button>
            </div>
          </div>

          <span className="small text-muted">
            Total matching accounts: <strong>{users.length}</strong>
          </span>
        </div>
      </div>

      {/* Users Table */}
      <div className="card-enterprise">
        {loading ? (
          <LoadingSpinner message="Fetching user directory..." />
        ) : (
          <div className="table-responsive">
            <table className="table-enterprise">
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Username</th>
                  <th>Corporate Email</th>
                  <th>Department</th>
                  <th>Assigned Role</th>
                  <th>Account Status</th>
                  <th>Created Date</th>
                  <th>Access Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold"
                          style={{ width: '32px', height: '32px', fontSize: '0.85rem' }}
                        >
                          {u.fullName.charAt(0)}
                        </div>
                        <span className="fw-semibold text-dark">{u.fullName}</span>
                      </div>
                    </td>
                    <td>
                      <code className="text-secondary">{u.username}</code>
                    </td>
                    <td className="small text-dark">{u.email}</td>
                    <td>
                      <span className="badge bg-light text-secondary border">{u.department}</span>
                    </td>
                    <td>{getRoleBadge(u.role)}</td>
                    <td>
                      {u.active ? (
                        <span className="badge bg-success-subtle text-success border border-success-subtle">
                          Active
                        </span>
                      ) : (
                        <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle">
                          Deactivated
                        </span>
                      )}
                    </td>
                    <td className="text-muted small">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleStatus(u.id, u.active, u.fullName)}
                        className={`btn btn-sm ${u.active ? 'btn-outline-danger' : 'btn-outline-success'} py-0 px-2`}
                        style={{ fontSize: '0.75rem' }}
                        title={u.active ? 'Disable account' : 'Enable account'}
                      >
                        {u.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Provision User Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark fs-6">Provision New Enterprise Account</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleCreateUser}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-secondary">Full Name</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. Jordan Lee"
                        value={newUser.fullName}
                        onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Username</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. agent.jordan"
                        value={newUser.username}
                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Email Address</label>
                      <input
                        type="email"
                        className="form-control form-control-sm"
                        placeholder="jordan.lee@company.com"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">System Role</label>
                      <select
                        className="form-select form-select-sm"
                        value={newUser.role}
                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                        required
                      >
                        <option value="ROLE_AGENT">IT Support Agent</option>
                        <option value="ROLE_EMPLOYEE">Standard Employee</option>
                        <option value="ROLE_ADMIN">System Administrator</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Department</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={newUser.department}
                        onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Phone Number</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="+1-555-0199"
                        value={newUser.phone}
                        onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Initial Password</label>
                      <input
                        type="password"
                        className="form-control form-control-sm"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top bg-light">
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-sm btn-primary-enterprise" disabled={submittingUser}>
                    {submittingUser ? 'Provisioning...' : 'Provision Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
