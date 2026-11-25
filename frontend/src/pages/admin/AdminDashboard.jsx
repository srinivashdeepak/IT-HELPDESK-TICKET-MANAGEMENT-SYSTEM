import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsService } from '../../services/analyticsService';
import { ticketService } from '../../services/ticketService';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import AnnouncementBanner from '../../components/AnnouncementBanner';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const [statsRes, ticketsRes] = await Promise.all([
        analyticsService.getDashboardStats(),
        ticketService.getTickets({}),
      ]);

      if (statsRes.success) {
        setStats(statsRes.data);
      }
      if (ticketsRes.success) {
        setRecentTickets(ticketsRes.data.slice(0, 6));
      }
    } catch (err) {
      setError('Failed to load executive dashboard analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      setExporting(true);
      await analyticsService.downloadCsvReport();
    } catch (err) {
      alert('Failed to export CSV report');
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Aggregating corporate IT metrics..." />;

  const categoryDistribution = stats?.categoryDistribution || {};
  const total = stats?.totalTickets || 1;
  const slaCompliance = stats?.slaComplianceRate ?? 100;

  return (
    <div>
      {/* Active System Announcements Alert Banner */}
      <AnnouncementBanner />

      {/* Title & Actions */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">Executive Administration Console</h4>
          <p className="text-muted small mb-0">
            Real-time operations, service level agreements, and support workload overview
          </p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button
            onClick={handleExportCsv}
            disabled={exporting}
            className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
          >
            <i className="bi bi-filetype-csv"></i> {exporting ? 'Generating CSV...' : 'Export CSV Report'}
          </button>
          <Link to="/admin/sla" className="btn btn-sm btn-outline-danger">
            <i className="bi bi-stopwatch me-1"></i> SLA Rules
          </Link>
          <Link to="/admin/users" className="btn btn-sm btn-outline-secondary">
            <i className="bi bi-people me-1"></i> User Directory
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger py-2 small mb-4">
          <i className="bi bi-exclamation-triangle me-2"></i> {error}
        </div>
      )}

      {/* Primary KPI Metrics */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-2">
          <div className="metric-card">
            <div className="metric-card-title">Total Incidents</div>
            <div className="metric-card-value">{stats?.totalTickets || 0}</div>
            <div className="metric-card-subtitle">Lifetime logged</div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-2">
          <div className="metric-card">
            <div className="metric-card-title">Open Tickets</div>
            <div className="metric-card-value text-primary">{stats?.openTickets || 0}</div>
            <div className="metric-card-subtitle">Awaiting triage</div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-2">
          <div className="metric-card">
            <div className="metric-card-title">In Progress</div>
            <div className="metric-card-value text-warning">{stats?.inProgressTickets || 0}</div>
            <div className="metric-card-subtitle">Active remediation</div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-2">
          <div className="metric-card">
            <div className="metric-card-title">Overdue Breaches</div>
            <div className={`metric-card-value ${(stats?.overdueTickets || 0) > 0 ? 'text-danger' : 'text-success'}`}>
              {stats?.overdueTickets || 0}
            </div>
            <div className="metric-card-subtitle">SLA turnaround breached</div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-2">
          <div className="metric-card">
            <div className="metric-card-title">SLA Compliance</div>
            <div className={`metric-card-value ${slaCompliance >= 90 ? 'text-success' : 'text-danger'}`}>
              {slaCompliance}%
            </div>
            <div className="metric-card-subtitle">Within service target</div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-2">
          <div className="metric-card">
            <div className="metric-card-title">Avg Resolution</div>
            <div className="metric-card-value" style={{ fontSize: '1.45rem' }}>
              {stats?.averageResolutionHours || 0} <span className="text-muted fs-6">hrs</span>
            </div>
            <div className="metric-card-subtitle">Mean turnaround time</div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* Category Breakdown */}
        <div className="col-12 col-lg-5">
          <div className="card-enterprise h-100">
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
              <h6 className="fw-bold mb-0 text-dark small">
                <i className="bi bi-pie-chart me-1"></i> Issue Volume by Category
              </h6>
              <Link to="/admin/categories" className="small text-decoration-none">Manage</Link>
            </div>
            <div className="p-4">
              {Object.keys(categoryDistribution).length === 0 ? (
                <div className="text-muted small text-center py-4">No categories recorded yet.</div>
              ) : (
                Object.entries(categoryDistribution).map(([category, count]) => {
                  const percent = Math.round((count / total) * 100);
                  return (
                    <div key={category} className="mb-3">
                      <div className="d-flex justify-content-between align-items-center small mb-1">
                        <span className="fw-medium text-dark">{category}</span>
                        <span className="text-muted fw-semibold">
                          {count} ({percent}%)
                        </span>
                      </div>
                      <div className="progress" style={{ height: '7px' }}>
                        <div
                          className="progress-bar bg-primary"
                          role="progressbar"
                          style={{ width: `${percent}%` }}
                          aria-valuenow={percent}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        ></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Quick Management Shortcuts */}
        <div className="col-12 col-lg-7">
          <div className="card-enterprise h-100">
            <div className="p-3 border-bottom">
              <h6 className="fw-bold mb-0 text-dark small">
                <i className="bi bi-sliders me-1"></i> Administrative Quick Controls
              </h6>
            </div>
            <div className="p-4">
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <div className="p-3 border rounded bg-light">
                    <h6 className="fw-bold text-dark mb-1">
                      <i className="bi bi-stopwatch text-danger me-2"></i> SLA Policies
                    </h6>
                    <p className="text-muted small mb-3">
                      Define response & resolution target hours and automatic escalation alerts.
                    </p>
                    <Link to="/admin/sla" className="btn btn-sm btn-outline-danger">
                      Configure SLA Targets <i className="bi bi-arrow-right"></i>
                    </Link>
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="p-3 border rounded bg-light">
                    <h6 className="fw-bold text-dark mb-1">
                      <i className="bi bi-megaphone text-info me-2"></i> Announcements
                    </h6>
                    <p className="text-muted small mb-3">
                      Broadcast maintenance downtime banners and security advisories to users.
                    </p>
                    <Link to="/admin/announcements" className="btn btn-sm btn-outline-info">
                      Broadcast Alerts <i className="bi bi-arrow-right"></i>
                    </Link>
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="p-3 border rounded bg-light">
                    <h6 className="fw-bold text-dark mb-1">
                      <i className="bi bi-shield-check text-success me-2"></i> Audit History
                    </h6>
                    <p className="text-muted small mb-3">
                      Review chronological audit events, security modifications, and escalations.
                    </p>
                    <Link to="/admin/audit-logs" className="btn btn-sm btn-outline-success">
                      View Audit Trail <i className="bi bi-arrow-right"></i>
                    </Link>
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="p-3 border rounded bg-light">
                    <h6 className="fw-bold text-dark mb-1">
                      <i className="bi bi-people text-primary me-2"></i> User Directory
                    </h6>
                    <p className="text-muted small mb-3">
                      Provision support agents, manage employee access privileges, and toggle active states.
                    </p>
                    <Link to="/admin/users" className="btn btn-sm btn-outline-primary">
                      Manage Accounts & Agents <i className="bi bi-arrow-right"></i>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Ticket Monitor */}
      <div className="card-enterprise">
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
          <h6 className="fw-bold mb-0 text-dark small">Recent Enterprise Support Activity</h6>
          <Link to="/tickets" className="btn btn-sm btn-outline-secondary">
            View All Incident Records
          </Link>
        </div>
        <div className="table-responsive">
          <table className="table-enterprise">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Incident Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Submitter</th>
                <th>Assignee</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentTickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>
                    <Link to={`/tickets/${ticket.id}`} className="ticket-code text-decoration-none">
                      {ticket.ticketCode}
                    </Link>
                  </td>
                  <td style={{ maxWidth: '280px' }}>
                    <Link to={`/tickets/${ticket.id}`} className="fw-semibold text-dark text-decoration-none d-block text-truncate">
                      {ticket.title}
                    </Link>
                  </td>
                  <td>
                    <span className="badge bg-light text-secondary border">{ticket.categoryName}</span>
                  </td>
                  <td>
                    <PriorityBadge priority={ticket.priority} />
                  </td>
                  <td>
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td>
                    <span className="small text-dark fw-medium">{ticket.createdByName}</span>
                  </td>
                  <td>
                    {ticket.assignedToName ? (
                      <span className="small text-dark">{ticket.assignedToName}</span>
                    ) : (
                      <span className="badge bg-warning-subtle text-warning-emphasis border">Unassigned</span>
                    )}
                  </td>
                  <td>
                    <Link to={`/tickets/${ticket.id}`} className="btn btn-sm btn-light border py-1 px-2 text-primary">
                      Manage <i className="bi bi-chevron-right"></i>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
