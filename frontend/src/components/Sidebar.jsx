import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, isAdmin, isAgent, isEmployee, logout } = useAuth();

  return (
    <aside className="app-sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="brand-badge">
          <i className="bi bi-hdd-network"></i>
        </div>
        <div>
          <div className="text-white fw-bold" style={{ fontSize: '0.95rem', letterSpacing: '-0.02em' }}>
            TechDesk Pro
          </div>
          <div className="text-muted" style={{ fontSize: '0.7rem' }}>
            IT Service Management
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="d-flex flex-column flex-grow-1 overflow-auto py-2">
        {/* Main Menu */}
        <div className="sidebar-menu-category">Main Menu</div>

        {isEmployee && (
          <>
            <NavLink to="/dashboard" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
              <i className="bi bi-grid-1x2"></i> My Dashboard
            </NavLink>
            <NavLink to="/tickets/new" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
              <i className="bi bi-plus-circle"></i> Create Ticket
            </NavLink>
            <NavLink to="/tickets" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
              <i className="bi bi-ticket-perforated"></i> My Submitted Tickets
            </NavLink>
          </>
        )}

        {isAgent && (
          <>
            <NavLink to="/agent/dashboard" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
              <i className="bi bi-speedometer2"></i> Agent Workspace
            </NavLink>
            <NavLink to="/agent/assigned" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
              <i className="bi bi-inbox-fill"></i> Assigned to Me
            </NavLink>
            <NavLink to="/tickets" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
              <i className="bi bi-stack"></i> All Support Tickets
            </NavLink>
            <NavLink to="/tickets/new" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
              <i className="bi bi-plus-circle"></i> Log Issue on Behalf
            </NavLink>
          </>
        )}

        {isAdmin && (
          <>
            <NavLink to="/admin/dashboard" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
              <i className="bi bi-graph-up-arrow"></i> Executive Dashboard
            </NavLink>
            <NavLink to="/tickets" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
              <i className="bi bi-kanban"></i> Ticket Management
            </NavLink>
            <NavLink to="/admin/users" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
              <i className="bi bi-people"></i> User Directory
            </NavLink>
            <NavLink to="/admin/categories" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
              <i className="bi bi-tags"></i> Issue Categories
            </NavLink>
            <NavLink to="/admin/reports" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
              <i className="bi bi-bar-chart-line"></i> Analytics & Reports
            </NavLink>
          </>
        )}

        {/* ITSM Knowledge & Solutions */}
        <div className="sidebar-menu-category mt-3">Self Service</div>
        <NavLink to="/kb" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
          <i className="bi bi-book"></i> Knowledge Base
        </NavLink>

        {/* Admin Governance */}
        {isAdmin && (
          <>
            <div className="sidebar-menu-category mt-3">ITSM Governance</div>
            <NavLink to="/admin/sla" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
              <i className="bi bi-stopwatch"></i> SLA Configuration
            </NavLink>
            <NavLink to="/admin/announcements" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
              <i className="bi bi-megaphone"></i> Announcements
            </NavLink>
            <NavLink to="/admin/audit-logs" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
              <i className="bi bi-shield-check"></i> Audit Logs
            </NavLink>
          </>
        )}

        {/* System & Settings */}
        <div className="sidebar-menu-category mt-3">Account</div>
        <NavLink to="/profile" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
          <i className="bi bi-person-gear"></i> User Profile
        </NavLink>
      </div>

      {/* User footer */}
      <div className="p-3 border-top border-secondary border-opacity-25">
        <button
          onClick={logout}
          className="btn btn-outline-secondary btn-sm w-100 d-flex align-items-center justify-content-center gap-2 text-light"
          style={{ borderColor: 'rgba(255,255,255,0.15)' }}
        >
          <i className="bi bi-box-arrow-left"></i> Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
