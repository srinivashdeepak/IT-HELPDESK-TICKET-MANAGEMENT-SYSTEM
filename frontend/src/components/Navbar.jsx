import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import notificationService from '../services/notificationService';
import userService from '../services/userService';

const Navbar = () => {
  const { user, logout, isAdmin, isAgent } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [availability, setAvailability] = useState(user?.availabilityStatus || 'AVAILABLE');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (user?.availabilityStatus) {
      setAvailability(user.availabilityStatus);
    }
  }, [user?.availabilityStatus]);

  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 15000); // 15s poll
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const countRes = await notificationService.getUnreadCount();
      if (countRes && countRes.data !== undefined) {
        setUnreadCount(Number(countRes.data) || 0);
      }
      const notifRes = await notificationService.getMyNotifications();
      if (notifRes && notifRes.data && Array.isArray(notifRes.data)) {
        setNotifications(notifRes.data);
      }
    } catch (err) {
      // Ignore background notification load errors
    }
  };

  const handleMarkAsRead = async (id, ticketId) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        Array.isArray(prev) ? prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)) : []
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      if (ticketId) {
        navigate(`/tickets/${ticketId}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        Array.isArray(prev) ? prev.map((n) => ({ ...n, isRead: true })) : []
      );
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleAvailabilityChange = async (newStatus) => {
    if (!user?.id) return;
    try {
      await userService.updateAvailability(user.id, newStatus);
      setAvailability(newStatus);
    } catch (err) {
      console.error('Failed to update availability', err);
    }
  };

  const getRoleBadge = () => {
    if (isAdmin) return <span className="badge bg-danger-subtle text-danger border border-danger-subtle">ADMIN</span>;
    if (isAgent) return <span className="badge bg-primary-subtle text-primary border border-primary-subtle">SUPPORT AGENT</span>;
    return <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle">EMPLOYEE</span>;
  };

  const getAvailabilityBadge = () => {
    if (availability === 'AVAILABLE') return 'bg-success';
    if (availability === 'BUSY') return 'bg-warning text-dark';
    return 'bg-secondary';
  };

  return (
    <header className="app-navbar">
      <div className="d-flex align-items-center gap-3">
        <span className="text-secondary small fw-medium d-none d-md-inline">
          <i className="bi bi-shield-check text-success me-1"></i> Connected to Enterprise Gateway
        </span>

        {isAgent && (
          <div className="dropdown">
            <button
              className="btn btn-sm btn-outline-secondary dropdown-toggle d-flex align-items-center gap-2 py-1 px-2"
              type="button"
              data-bs-toggle="dropdown"
            >
              <span className={`badge rounded-circle p-1 ${getAvailabilityBadge()}`}> </span>
              <span className="small fw-semibold">{availability}</span>
            </button>
            <ul className="dropdown-menu shadow-sm">
              <li>
                <button className="dropdown-item small d-flex align-items-center gap-2" onClick={() => handleAvailabilityChange('AVAILABLE')}>
                  <span className="badge rounded-circle p-1 bg-success"> </span> Available for tickets
                </button>
              </li>
              <li>
                <button className="dropdown-item small d-flex align-items-center gap-2" onClick={() => handleAvailabilityChange('BUSY')}>
                  <span className="badge rounded-circle p-1 bg-warning"> </span> Busy / In meeting
                </button>
              </li>
              <li>
                <button className="dropdown-item small d-flex align-items-center gap-2" onClick={() => handleAvailabilityChange('UNAVAILABLE')}>
                  <span className="badge rounded-circle p-1 bg-secondary"> </span> Out of office
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>

      <div className="d-flex align-items-center gap-3">
        {/* Dark/Light Mode Switcher */}
        <button
          onClick={toggleTheme}
          className="btn btn-sm btn-light border rounded-circle d-flex align-items-center justify-content-center"
          style={{ width: '36px', height: '36px' }}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          <i className={`bi ${theme === 'dark' ? 'bi-sun text-warning' : 'bi-moon text-secondary'}`}></i>
        </button>

        {/* Notifications Dropdown */}
        <div className="dropdown">
          <button
            className="btn btn-sm btn-light border rounded-circle notification-bell-btn"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            title="Notifications"
          >
            <i className="bi bi-bell"></i>
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>
          <div className="dropdown-menu dropdown-menu-end shadow border-subtle notification-menu p-0">
            <div className="d-flex align-items-center justify-content-between p-3 border-bottom bg-light">
              <span className="fw-semibold small">Notifications ({unreadCount} unread)</span>
              {unreadCount > 0 && (
                <button
                  className="btn btn-link btn-sm p-0 text-decoration-none small text-primary"
                  onClick={handleMarkAllRead}
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="p-0" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {!notifications || notifications.length === 0 ? (
                <div className="text-center text-muted py-4 small">
                  <i className="bi bi-inbox fs-4 d-block mb-1 text-secondary opacity-50"></i>
                  No notifications
                </div>
              ) : (
                notifications.slice(0, 10).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleMarkAsRead(n.id, n.ticketId)}
                    className={`p-3 border-bottom cursor-pointer ${
                      n.isRead ? 'opacity-75' : 'bg-primary-subtle bg-opacity-25'
                    }`}
                    style={{ cursor: 'pointer', transition: 'background-color 0.15s ease' }}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <span className="fw-bold small text-dark">{n.title}</span>
                      <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                        {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <div className="text-secondary small text-truncate" style={{ fontSize: '0.8rem' }}>
                      {n.message}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="text-end d-none d-sm-block">
          <div className="fw-semibold text-dark small">{user?.fullName}</div>
          <div className="text-muted" style={{ fontSize: '0.75rem' }}>{user?.department}</div>
        </div>

        <div className="me-1">
          {getRoleBadge()}
        </div>

        {/* Profile menu */}
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
                <i className="bi bi-person me-2"></i> User Profile & Settings
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
