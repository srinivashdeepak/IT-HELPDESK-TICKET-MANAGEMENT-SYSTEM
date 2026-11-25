import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';

const UserProfilePage = () => {
  const { user, isAgent, logout } = useAuth();

  // Profile Edit State
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [emailNotif, setEmailNotif] = useState(user?.notificationEmailEnabled ?? true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  // Password Rotation State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rotatingPassword, setRotatingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Agent Availability
  const [availability, setAvailability] = useState(user?.availabilityStatus || 'AVAILABLE');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg('');
    try {
      const res = await userService.updateProfile({
        fullName,
        department,
        phone,
        notificationEmailEnabled: emailNotif,
      });
      if (res.data) {
        setProfileMsg('Profile updated successfully!');
        // Update user in localStorage
        const stored = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...stored, fullName, department }));
      }
    } catch (err) {
      setProfileMsg('Error: ' + (err.response?.data?.message || 'Failed to update profile'));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleRotatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match');
      return;
    }
    setRotatingPassword(true);
    setPasswordMsg('');
    setPasswordError('');
    try {
      await userService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setPasswordMsg('Password changed successfully! Next login will require your new credentials.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setRotatingPassword(false);
    }
  };

  const handleAvailabilityChange = async (status) => {
    try {
      await userService.updateAvailability(user.id, status);
      setAvailability(status);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="mb-4">
        <h4 className="fw-bold text-dark mb-1">User Profile & Account Security</h4>
        <p className="text-muted small mb-0">
          Manage your personal information, notification preferences, availability, and credential security
        </p>
      </div>

      <div className="row g-4">
        {/* Profile Card */}
        <div className="col-12 col-md-4">
          <div className="card-enterprise p-4 text-center mb-4">
            <div
              className="rounded-circle bg-primary bg-opacity-10 text-primary mx-auto mb-3 d-flex align-items-center justify-content-center fw-bold"
              style={{ width: '80px', height: '80px', fontSize: '2rem' }}
            >
              {fullName?.charAt(0) || 'U'}
            </div>
            <h5 className="fw-bold text-dark mb-1">{fullName}</h5>
            <p className="text-muted small mb-2">{department}</p>
            <div className="mb-3">
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                {user?.role?.replace('ROLE_', '')}
              </span>
            </div>

            {/* Agent Availability Selector */}
            {isAgent && (
              <div className="p-3 bg-light rounded border mb-3 text-start">
                <label className="form-label small fw-semibold text-muted d-block mb-1">Agent Queue Availability</label>
                <select
                  className="form-select form-select-sm"
                  value={availability}
                  onChange={(e) => handleAvailabilityChange(e.target.value)}
                >
                  <option value="AVAILABLE">AVAILABLE (Accepting tickets)</option>
                  <option value="BUSY">BUSY (In meeting / incident)</option>
                  <option value="UNAVAILABLE">UNAVAILABLE (Out of office)</option>
                </select>
              </div>
            )}

            <button onClick={logout} className="btn btn-outline-danger btn-sm w-100">
              <i className="bi bi-box-arrow-right me-1"></i> Sign Out
            </button>
          </div>
        </div>

        {/* Edit Forms */}
        <div className="col-12 col-md-8">
          {/* General Profile Settings */}
          <div className="card-enterprise p-4 mb-4">
            <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">Edit Personal Information</h6>
            {profileMsg && (
              <div className={`alert ${profileMsg.startsWith('Error') ? 'alert-danger' : 'alert-success'} py-2 small mb-3`}>
                {profileMsg}
              </div>
            )}
            <form onSubmit={handleUpdateProfile}>
              <div className="row g-3 mb-3">
                <div className="col-sm-6">
                  <label className="form-label small fw-semibold">Corporate Username</label>
                  <input type="text" className="form-control form-control-sm" value={user?.username || ''} disabled />
                </div>
                <div className="col-sm-6">
                  <label className="form-label small fw-semibold">Email Address</label>
                  <input type="email" className="form-control form-control-sm" value={user?.email || ''} disabled />
                </div>
                <div className="col-sm-6">
                  <label className="form-label small fw-semibold">Full Name</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="col-sm-6">
                  <label className="form-label small fw-semibold">Department</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    required
                  />
                </div>
                <div className="col-sm-12">
                  <label className="form-label small fw-semibold">Phone / Extension</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1-555-0100"
                  />
                </div>
              </div>

              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="emailNotifCheck"
                  checked={emailNotif}
                  onChange={(e) => setEmailNotif(e.target.checked)}
                />
                <label className="form-check-label small text-secondary" htmlFor="emailNotifCheck">
                  Receive real-time email notifications for ticket updates and assignments
                </label>
              </div>

              <button type="submit" className="btn btn-sm btn-primary-enterprise" disabled={savingProfile}>
                {savingProfile ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="card-enterprise p-4">
            <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">Change Account Password</h6>
            {passwordMsg && <div className="alert alert-success py-2 small mb-3">{passwordMsg}</div>}
            {passwordError && <div className="alert alert-danger py-2 small mb-3">{passwordError}</div>}

            <form onSubmit={handleRotatePassword}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Current Password</label>
                <input
                  type="password"
                  className="form-control form-control-sm"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div className="row g-2 mb-3">
                <div className="col-sm-6">
                  <label className="form-label small fw-semibold">New Password</label>
                  <input
                    type="password"
                    className="form-control form-control-sm"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <div className="col-sm-6">
                  <label className="form-label small fw-semibold">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control form-control-sm"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-sm btn-outline-danger" disabled={rotatingPassword}>
                {rotatingPassword ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
