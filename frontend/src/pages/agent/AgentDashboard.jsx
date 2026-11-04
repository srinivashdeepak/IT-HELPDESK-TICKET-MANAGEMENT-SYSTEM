import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ticketService } from '../../services/ticketService';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

const AgentDashboard = () => {
  const { user } = useAuth();
  const [assignedTickets, setAssignedTickets] = useState([]);
  const [unassignedTickets, setUnassignedTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [activeTab, setActiveTab] = useState('assigned'); // 'assigned' | 'unassigned'

  useEffect(() => {
    loadAgentData();
  }, []);

  const loadAgentData = async () => {
    try {
      setLoading(true);
      setError('');
      // Load tickets assigned to this agent
      const assignedRes = await ticketService.getTickets({ assignedToMe: true });
      // Load all tickets to find unassigned ones
      const allRes = await ticketService.getTickets({});

      if (assignedRes.success) {
        setAssignedTickets(assignedRes.data);
      }
      if (allRes.success) {
        const unassigned = allRes.data.filter((t) => !t.assignedToId && t.status === 'OPEN');
        setUnassignedTickets(unassigned);
      }
    } catch (err) {
      setError('Failed to load agent workspace queue');
    } finally {
      setLoading(false);
    }
  };

  const handleTakeTicket = async (ticketId) => {
    try {
      setError('');
      const res = await ticketService.assignTicket(ticketId, user.id, 'Self-assigned by agent from queue');
      if (res.success) {
        setActionMsg(`Ticket assigned to you successfully!`);
        loadAgentData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to take ticket');
    }
  };

  const myActiveCount = assignedTickets.filter(
    (t) => t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS' || t.status === 'ON_HOLD'
  ).length;

  const myResolvedCount = assignedTickets.filter(
    (t) => t.status === 'RESOLVED' || t.status === 'CLOSED'
  ).length;

  const criticalCount = assignedTickets.filter(
    (t) => t.priority === 'CRITICAL' && t.status !== 'CLOSED'
  ).length;

  return (
    <div>
      {/* Page Title */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">IT Support Agent Workspace</h4>
          <p className="text-muted small mb-0">
            Specialist: <span className="fw-semibold text-dark">{user?.fullName}</span> | Queue: <span className="text-dark">{user?.department}</span>
          </p>
        </div>
        <div>
          <Link to="/tickets" className="btn btn-outline-secondary btn-sm me-2">
            <i className="bi bi-stack me-1"></i> Full Queue
          </Link>
          <Link to="/tickets/new" className="btn btn-primary-enterprise btn-sm">
            <i className="bi bi-plus-lg me-1"></i> Log Ticket
          </Link>
        </div>
      </div>

      {actionMsg && (
        <div className="alert alert-success py-2 small d-flex justify-content-between align-items-center mb-4">
          <div><i className="bi bi-check-circle me-2"></i> {actionMsg}</div>
          <button type="button" className="btn-close" onClick={() => setActionMsg('')}></button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger py-2 small mb-4">
          <i className="bi bi-exclamation-triangle me-2"></i> {error}
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="metric-card">
            <div className="metric-card-title">My Active Workload</div>
            <div className="metric-card-value text-primary">{myActiveCount}</div>
            <div className="metric-card-subtitle">Assigned & In Progress tickets</div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="metric-card">
            <div className="metric-card-title">Unassigned Triage Queue</div>
            <div className="metric-card-value text-warning">{unassignedTickets.length}</div>
            <div className="metric-card-subtitle">Open tickets awaiting pickup</div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="metric-card">
            <div className="metric-card-title">My Resolved Total</div>
            <div className="metric-card-value text-success">{myResolvedCount}</div>
            <div className="metric-card-subtitle">Lifetime successfully closed</div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="metric-card">
            <div className="metric-card-title">Critical Attention</div>
            <div className="metric-card-value text-danger">{criticalCount}</div>
            <div className="metric-card-subtitle">P1 SLA incidents in queue</div>
          </div>
        </div>
      </div>

      {/* Workspace Tabs */}
      <div className="card-enterprise">
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
          <ul className="nav nav-pills card-header-pills">
            <li className="nav-item">
              <button
                className={`nav-link btn-sm ${activeTab === 'assigned' ? 'active' : ''}`}
                onClick={() => setActiveTab('assigned')}
              >
                <i className="bi bi-inbox-fill me-1"></i> Assigned to Me ({assignedTickets.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link btn-sm ${activeTab === 'unassigned' ? 'active' : ''}`}
                onClick={() => setActiveTab('unassigned')}
              >
                <i className="bi bi-hourglass-split me-1"></i> Unassigned Pool ({unassignedTickets.length})
              </button>
            </li>
          </ul>

          <button onClick={loadAgentData} className="btn btn-sm btn-outline-secondary">
            <i className="bi bi-arrow-repeat me-1"></i> Refresh
          </button>
        </div>

        {loading ? (
          <LoadingSpinner message="Refreshing agent triage desk..." />
        ) : activeTab === 'assigned' ? (
          assignedTickets.length === 0 ? (
            <div className="text-center py-5">
              <div className="text-muted mb-2" style={{ fontSize: '2.5rem' }}>
                <i className="bi bi-check2-circle"></i>
              </div>
              <h6 className="fw-semibold text-secondary">No tickets currently assigned</h6>
              <p className="text-muted small mb-3">Your personal ticket queue is clear.</p>
              <button onClick={() => setActiveTab('unassigned')} className="btn btn-sm btn-outline-primary">
                View Unassigned Queue
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table-enterprise">
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Issue Summary</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Employee</th>
                    <th>Assigned Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedTickets.map((ticket) => (
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
                        <span className="text-muted small d-block text-truncate">{ticket.description}</span>
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
                        <div className="small fw-medium text-dark">{ticket.createdByName}</div>
                        <div className="text-muted" style={{ fontSize: '0.72rem' }}>{ticket.createdByDepartment}</div>
                      </td>
                      <td className="text-muted small">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <Link to={`/tickets/${ticket.id}`} className="btn btn-sm btn-primary-enterprise py-1 px-2">
                          Manage <i className="bi bi-chevron-right"></i>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          unassignedTickets.length === 0 ? (
            <div className="text-center py-5">
              <div className="text-muted mb-2" style={{ fontSize: '2.5rem' }}>
                <i className="bi bi-shield-check"></i>
              </div>
              <h6 className="fw-semibold text-secondary">Zero unassigned tickets</h6>
              <p className="text-muted small mb-0">All incoming support requests have been successfully triaged.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table-enterprise">
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Issue Summary</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Employee</th>
                    <th>Logged At</th>
                    <th>Triage Action</th>
                  </tr>
                </thead>
                <tbody>
                  {unassignedTickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td>
                        <Link to={`/tickets/${ticket.id}`} className="ticket-code text-decoration-none">
                          {ticket.ticketCode}
                        </Link>
                      </td>
                      <td style={{ maxWidth: '300px' }}>
                        <Link to={`/tickets/${ticket.id}`} className="fw-semibold text-dark text-decoration-none d-block text-truncate">
                          {ticket.title}
                        </Link>
                        <span className="text-muted small d-block text-truncate">{ticket.description}</span>
                      </td>
                      <td>
                        <span className="badge bg-light text-secondary border">{ticket.categoryName}</span>
                      </td>
                      <td>
                        <PriorityBadge priority={ticket.priority} />
                      </td>
                      <td>
                        <div className="small fw-medium text-dark">{ticket.createdByName}</div>
                        <div className="text-muted" style={{ fontSize: '0.72rem' }}>{ticket.createdByDepartment}</div>
                      </td>
                      <td className="text-muted small">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            onClick={() => handleTakeTicket(ticket.id)}
                            className="btn btn-sm btn-success py-1 px-2 d-flex align-items-center gap-1"
                          >
                            <i className="bi bi-hand-index-thumb"></i> Take Ticket
                          </button>
                          <Link to={`/tickets/${ticket.id}`} className="btn btn-sm btn-outline-secondary py-1 px-2">
                            Review
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default AgentDashboard;
