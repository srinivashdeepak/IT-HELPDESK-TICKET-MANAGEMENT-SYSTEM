import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ticketService } from '../../services/ticketService';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

const TicketDetailPage = () => {
  const { id } = useParams();
  const { user, isAgent, isAdmin, isEmployee } = useAuth();

  const [ticketData, setTicketData] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Comment Form State
  const [commentText, setCommentText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Status Modal / Resolution State
  const [selectedStatus, setSelectedStatus] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Assign State
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    loadTicket();
    if (isAgent || isAdmin) {
      loadAgents();
    }
  }, [id]);

  const loadTicket = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await ticketService.getTicketById(id);
      if (res.success && res.data) {
        setTicketData(res.data);
        setSelectedStatus(res.data.ticket.status);
        if (res.data.ticket.resolutionNotes) {
          setResolutionNotes(res.data.ticket.resolutionNotes);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  };

  const loadAgents = async () => {
    try {
      const res = await userService.getAgents();
      if (res.success) {
        setAgents(res.data);
        if (res.data.length > 0) {
          setSelectedAgentId(res.data[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);
      const res = await ticketService.addComment(id, commentText.trim(), isInternal);
      if (res.success) {
        setCommentText('');
        setIsInternal(false);
        setActionSuccess('Comment added successfully');
        loadTicket();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleStatusChange = async (e) => {
    e.preventDefault();
    if (!selectedStatus) return;

    if (selectedStatus === 'RESOLVED' && !resolutionNotes.trim()) {
      setError('Resolution notes are required when marking a ticket as Resolved');
      return;
    }

    try {
      setUpdatingStatus(true);
      setError('');
      const res = await ticketService.updateStatus(id, selectedStatus, resolutionNotes.trim());
      if (res.success) {
        setActionSuccess(`Ticket status updated to ${selectedStatus}`);
        loadTicket();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePriorityChange = async (newPriority) => {
    try {
      setError('');
      const res = await ticketService.updatePriority(id, newPriority);
      if (res.success) {
        setActionSuccess(`Priority changed to ${newPriority}`);
        loadTicket();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update priority');
    }
  };

  const handleAssignTicket = async (e) => {
    e.preventDefault();
    if (!selectedAgentId) return;

    try {
      setAssigning(true);
      setError('');
      const res = await ticketService.assignTicket(id, Number(selectedAgentId), assignmentNotes.trim());
      if (res.success) {
        setActionSuccess('Ticket assigned successfully');
        setAssignmentNotes('');
        loadTicket();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign ticket');
    } finally {
      setAssigning(false);
    }
  };

  const handleSelfAssign = async () => {
    try {
      setError('');
      const res = await ticketService.assignTicket(id, user.id, 'Self-assigned by support agent');
      if (res.success) {
        setActionSuccess('Ticket assigned to you');
        loadTicket();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to self-assign ticket');
    }
  };

  if (loading) return <LoadingSpinner message="Loading ticket details & history..." />;

  if (error && !ticketData) {
    return (
      <div className="alert alert-danger p-4">
        <h5>Error Loading Ticket</h5>
        <p>{error}</p>
        <Link to="/tickets" className="btn btn-outline-danger btn-sm">
          Return to Tickets
        </Link>
      </div>
    );
  }

  const { ticket, comments = [], history = [] } = ticketData;

  return (
    <div>
      {/* Top Breadcrumb & Actions */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb small mb-1">
              <li className="breadcrumb-item"><Link to="/tickets">Tickets</Link></li>
              <li className="breadcrumb-item active" aria-current="page">{ticket.ticketCode}</li>
            </ol>
          </nav>
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <span className="ticket-code fs-5">{ticket.ticketCode}</span>
            <h4 className="fw-bold text-dark mb-0">{ticket.title}</h4>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
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

      <div className="row g-4">
        {/* Left Column: Details, Comments, Timeline */}
        <div className="col-12 col-lg-8">
          {/* Issue Description Card */}
          <div className="card-enterprise mb-4">
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
              <span className="fw-semibold text-dark small">
                <i className="bi bi-file-text me-1"></i> Problem Description
              </span>
              <span className="text-muted small">
                Reported by <strong>{ticket.createdByName}</strong> on {new Date(ticket.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="p-4">
              <p className="mb-0 text-secondary" style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                {ticket.description}
              </p>
            </div>
          </div>

          {/* Resolution Notes Card (if resolved/closed) */}
          {ticket.resolutionNotes && (
            <div className="card-enterprise mb-4 border-success-subtle bg-success-subtle bg-opacity-10">
              <div className="p-3 border-bottom border-success-subtle d-flex justify-content-between align-items-center">
                <span className="fw-bold text-success small">
                  <i className="bi bi-check-circle-fill me-1"></i> Resolution Details
                </span>
                <span className="text-muted small">
                  Resolved on: {ticket.resolvedAt ? new Date(ticket.resolvedAt).toLocaleString() : 'N/A'}
                </span>
              </div>
              <div className="p-3">
                <p className="mb-0 text-dark small" style={{ whiteSpace: 'pre-line' }}>
                  {ticket.resolutionNotes}
                </p>
              </div>
            </div>
          )}

          {/* Comment Thread */}
          <div className="card-enterprise mb-4">
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
              <span className="fw-semibold text-dark small">
                <i className="bi bi-chat-left-dots me-1"></i> Discussion & Troubleshooting Thread ({comments.length})
              </span>
            </div>

            <div className="p-4">
              {comments.length === 0 ? (
                <div className="text-center py-4 text-muted small">
                  No comments or notes have been logged for this ticket yet.
                </div>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className={`comment-card ${c.internal ? 'internal-note' : ''}`}>
                    <div className="comment-header">
                      <div className="d-flex align-items-center gap-2">
                        <strong className="text-dark small">{c.userName}</strong>
                        <span className="badge bg-light text-secondary border" style={{ fontSize: '0.65rem' }}>
                          {c.userRole.replace('ROLE_', '')}
                        </span>
                        {c.internal && (
                          <span className="badge bg-warning text-dark" style={{ fontSize: '0.65rem' }}>
                            <i className="bi bi-shield-lock me-1"></i> Internal Staff Note
                          </span>
                        )}
                      </div>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {new Date(c.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="p-3">
                      <p className="mb-0 text-secondary small" style={{ whiteSpace: 'pre-line' }}>
                        {c.commentText}
                      </p>
                    </div>
                  </div>
                ))
              )}

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="mt-4 pt-3 border-top">
                <label className="form-label small fw-semibold text-dark mb-1">
                  Add Response or Update
                </label>
                <textarea
                  className="form-control mb-2"
                  rows={3}
                  placeholder="Type your message, diagnostic findings, or response..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  required
                ></textarea>

                <div className="d-flex justify-content-between align-items-center">
                  {(isAgent || isAdmin) ? (
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="internalCheck"
                        checked={isInternal}
                        onChange={(e) => setIsInternal(e.target.checked)}
                      />
                      <label className="form-check-label small text-muted" htmlFor="internalCheck">
                        <i className="bi bi-eye-slash me-1"></i> Make this an internal staff note (invisible to employee)
                      </label>
                    </div>
                  ) : <div></div>}

                  <button
                    type="submit"
                    className="btn btn-sm btn-primary-enterprise d-flex align-items-center gap-1"
                    disabled={submittingComment}
                  >
                    {submittingComment ? 'Sending...' : (
                      <>
                        <i className="bi bi-send"></i> Post Comment
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Activity Audit Timeline */}
          <div className="card-enterprise">
            <div className="p-3 border-bottom bg-light">
              <span className="fw-semibold text-dark small">
                <i className="bi bi-clock-history me-1"></i> Activity Audit Timeline
              </span>
            </div>
            <div className="p-4">
              <ul className="timeline-list mb-0">
                {history.map((h) => (
                  <li key={h.id} className="timeline-item">
                    <span className="timeline-point"></span>
                    <div className="timeline-content">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <strong className="small text-dark">{h.action.replace('_', ' ')}</strong>
                        <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                          {new Date(h.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-secondary small">
                        {h.previousState ? (
                          <span>
                            Changed from <code>{h.previousState}</code> to <code>{h.newState}</code> by <strong>{h.changedByName}</strong>
                          </span>
                        ) : (
                          <span>
                            {h.newState} by <strong>{h.changedByName}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Ticket Management Sidebar */}
        <div className="col-12 col-lg-4">
          {/* Metadata Card */}
          <div className="card-enterprise mb-4">
            <div className="p-3 border-bottom bg-light">
              <h6 className="fw-bold mb-0 text-dark small">Ticket Metadata</h6>
            </div>
            <div className="p-3">
              <div className="mb-3">
                <div className="text-muted small">Category</div>
                <div className="fw-semibold text-dark">{ticket.categoryName}</div>
              </div>

              <div className="mb-3">
                <div className="text-muted small">Reported By</div>
                <div className="fw-semibold text-dark">{ticket.createdByName}</div>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>{ticket.createdByEmail}</div>
                <div className="badge bg-light text-secondary border mt-1">{ticket.createdByDepartment}</div>
              </div>

              <div className="mb-3">
                <div className="text-muted small">Assigned Specialist</div>
                {ticket.assignedToName ? (
                  <div>
                    <div className="fw-semibold text-dark">
                      <i className="bi bi-person-check text-primary me-1"></i>
                      {ticket.assignedToName}
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>{ticket.assignedToEmail}</div>
                  </div>
                ) : (
                  <div className="d-flex align-items-center justify-content-between">
                    <span className="badge bg-warning-subtle text-warning-emphasis border">Unassigned</span>
                    {(isAgent || isAdmin) && (
                      <button
                        onClick={handleSelfAssign}
                        className="btn btn-sm btn-outline-primary py-0 px-2"
                        style={{ fontSize: '0.75rem' }}
                      >
                        Assign to Me
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="row g-2 border-top pt-3">
                <div className="col-6">
                  <div className="text-muted small">Created</div>
                  <div className="small text-dark fw-medium">{new Date(ticket.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="col-6">
                  <div className="text-muted small">Last Activity</div>
                  <div className="small text-dark fw-medium">{new Date(ticket.updatedAt).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Transition Control Card */}
          <div className="card-enterprise mb-4">
            <div className="p-3 border-bottom bg-light">
              <h6 className="fw-bold mb-0 text-dark small">Update Ticket Status</h6>
            </div>
            <div className="p-3">
              <form onSubmit={handleStatusChange}>
                <div className="mb-3">
                  <label className="form-label small text-muted">New Status</label>
                  <select
                    className="form-select form-select-sm"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="OPEN">Open</option>
                    {(isAgent || isAdmin) && (
                      <>
                        <option value="ASSIGNED">Assigned</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="ON_HOLD">On Hold</option>
                        <option value="RESOLVED">Resolved</option>
                      </>
                    )}
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>

                {selectedStatus === 'RESOLVED' && (
                  <div className="mb-3">
                    <label className="form-label small text-danger fw-semibold">
                      Resolution Notes *
                    </label>
                    <textarea
                      className="form-control form-control-sm"
                      rows={3}
                      placeholder="Explain how the technical issue was resolved..."
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      required
                    ></textarea>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-sm btn-primary-enterprise w-100"
                  disabled={updatingStatus || selectedStatus === ticket.status}
                >
                  {updatingStatus ? 'Updating...' : 'Apply Status Change'}
                </button>
              </form>
            </div>
          </div>

          {/* Priority Control (Agent/Admin) */}
          {(isAgent || isAdmin) && (
            <div className="card-enterprise mb-4">
              <div className="p-3 border-bottom bg-light">
                <h6 className="fw-bold mb-0 text-dark small">Update Priority</h6>
              </div>
              <div className="p-3">
                <div className="d-grid gap-2">
                  <div className="btn-group btn-group-sm w-100" role="group">
                    <button
                      type="button"
                      className={`btn ${ticket.priority === 'LOW' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                      onClick={() => handlePriorityChange('LOW')}
                    >
                      Low
                    </button>
                    <button
                      type="button"
                      className={`btn ${ticket.priority === 'MEDIUM' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => handlePriorityChange('MEDIUM')}
                    >
                      Medium
                    </button>
                    <button
                      type="button"
                      className={`btn ${ticket.priority === 'HIGH' ? 'btn-warning' : 'btn-outline-warning'}`}
                      onClick={() => handlePriorityChange('HIGH')}
                    >
                      High
                    </button>
                    <button
                      type="button"
                      className={`btn ${ticket.priority === 'CRITICAL' ? 'btn-danger' : 'btn-outline-danger'}`}
                      onClick={() => handlePriorityChange('CRITICAL')}
                    >
                      Critical
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Assign / Delegate Specialist (Agent/Admin) */}
          {(isAgent || isAdmin) && (
            <div className="card-enterprise">
              <div className="p-3 border-bottom bg-light">
                <h6 className="fw-bold mb-0 text-dark small">Delegate / Assign Specialist</h6>
              </div>
              <div className="p-3">
                <form onSubmit={handleAssignTicket}>
                  <div className="mb-2">
                    <label className="form-label small text-muted">Support Specialist</label>
                    <select
                      className="form-select form-select-sm"
                      value={selectedAgentId}
                      onChange={(e) => setSelectedAgentId(e.target.value)}
                      required
                    >
                      {agents.map((ag) => (
                        <option key={ag.id} value={ag.id}>
                          {ag.fullName} ({ag.department})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-muted">Handover Notes (Optional)</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. Please run network traceroute"
                      value={assignmentNotes}
                      onChange={(e) => setAssignmentNotes(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-sm btn-outline-primary w-100"
                    disabled={assigning || !selectedAgentId}
                  >
                    {assigning ? 'Assigning...' : 'Assign to Specialist'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetailPage;
