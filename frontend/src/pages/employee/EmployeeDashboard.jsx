import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ticketService } from '../../services/ticketService';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyTickets();
  }, []);

  const fetchMyTickets = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await ticketService.getTickets();
      if (res.success) {
        setTickets(res.data);
      }
    } catch (err) {
      setError('Unable to load your support tickets');
    } finally {
      setLoading(false);
    }
  };

  const activeCount = tickets.filter(
    (t) => t.status === 'OPEN' || t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS' || t.status === 'ON_HOLD'
  ).length;

  const resolvedCount = tickets.filter(
    (t) => t.status === 'RESOLVED' || t.status === 'CLOSED'
  ).length;

  const urgentCount = tickets.filter(
    (t) => (t.priority === 'CRITICAL' || t.priority === 'HIGH') && t.status !== 'CLOSED'
  ).length;

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">Employee Service Portal</h4>
          <p className="text-muted small mb-0">
            Welcome back, <span className="fw-semibold text-dark">{user?.fullName}</span> ({user?.department})
          </p>
        </div>
        <div>
          <Link to="/tickets/new" className="btn btn-primary-enterprise d-inline-flex align-items-center gap-2">
            <i className="bi bi-plus-lg"></i> Create Support Ticket
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger py-2 small mb-4" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i> {error}
        </div>
      )}

      {/* KPI Metrics */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="metric-card">
            <div className="metric-card-title">Total Submitted</div>
            <div className="metric-card-value">{tickets.length}</div>
            <div className="metric-card-subtitle">Lifetime requests from your account</div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="metric-card">
            <div className="metric-card-title">Active / In Progress</div>
            <div className="metric-card-value text-primary">{activeCount}</div>
            <div className="metric-card-subtitle">Awaiting IT action or verification</div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="metric-card">
            <div className="metric-card-title">Resolved & Closed</div>
            <div className="metric-card-value text-success">{resolvedCount}</div>
            <div className="metric-card-subtitle">Successfully remediated issues</div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="metric-card">
            <div className="metric-card-title">High & Critical</div>
            <div className="metric-card-value text-danger">{urgentCount}</div>
            <div className="metric-card-subtitle">Urgent operational blockers</div>
          </div>
        </div>
      </div>

      {/* Recent Tickets Section */}
      <div className="card-enterprise">
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
          <div>
            <h6 className="fw-bold mb-0 text-dark">Recent IT Support Tickets</h6>
            <span className="text-muted small">Real-time status of your logged technical issues</span>
          </div>
          <Link to="/tickets" className="btn btn-sm btn-outline-secondary">
            View All ({tickets.length})
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Fetching your tickets..." />
        ) : tickets.length === 0 ? (
          <div className="text-center py-5">
            <div className="text-muted mb-2" style={{ fontSize: '2.5rem' }}>
              <i className="bi bi-inbox"></i>
            </div>
            <h6 className="fw-semibold text-secondary">No support tickets found</h6>
            <p className="text-muted small mb-3">You currently have no open or past technical requests.</p>
            <Link to="/tickets/new" className="btn btn-sm btn-primary-enterprise">
              Submit your first ticket
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table-enterprise">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Title & Description</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned Specialist</th>
                  <th>Logged On</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tickets.slice(0, 5).map((ticket) => (
                  <tr key={ticket.id}>
                    <td>
                      <Link to={`/tickets/${ticket.id}`} className="ticket-code text-decoration-none">
                        {ticket.ticketCode}
                      </Link>
                    </td>
                    <td style={{ maxWidth: '300px' }}>
                      <Link
                        to={`/tickets/${ticket.id}`}
                        className="fw-semibold text-dark text-decoration-none d-block text-truncate"
                      >
                        {ticket.title}
                      </Link>
                      <span className="text-muted small d-block text-truncate">
                        {ticket.description}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-light text-secondary border">
                        {ticket.categoryName}
                      </span>
                    </td>
                    <td>
                      <PriorityBadge priority={ticket.priority} />
                    </td>
                    <td>
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td>
                      {ticket.assignedToName ? (
                        <div className="small fw-medium text-dark">
                          <i className="bi bi-person me-1 text-muted"></i>
                          {ticket.assignedToName}
                        </div>
                      ) : (
                        <span className="text-muted small fst-italic">Unassigned queue</span>
                      )}
                    </td>
                    <td className="text-muted small">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <Link to={`/tickets/${ticket.id}`} className="btn btn-sm btn-light border py-1 px-2 text-primary">
                        View <i className="bi bi-chevron-right"></i>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
