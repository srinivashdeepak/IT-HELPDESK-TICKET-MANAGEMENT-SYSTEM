import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ticketService } from '../../services/ticketService';
import { categoryService } from '../../services/categoryService';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

const TicketListPage = () => {
  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAgent, isAdmin, isEmployee } = useAuth();

  // Filter States
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [priorityFilter, setPriorityFilter] = useState(searchParams.get('priority') || '');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || '');
  const [assignedOnly, setAssignedOnly] = useState(searchParams.get('assignedToMe') === 'true');

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadTickets();
  }, [statusFilter, priorityFilter, categoryFilter, assignedOnly]);

  const loadCategories = async () => {
    try {
      const res = await categoryService.getActiveCategories();
      if (res.success) {
        setCategories(res.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (categoryFilter) params.categoryId = categoryFilter;
      if (searchQuery.trim()) params.query = searchQuery.trim();
      if (assignedOnly) params.assignedToMe = true;

      const res = await ticketService.getTickets(params);
      if (res.success) {
        setTickets(res.data);
      }
    } catch (err) {
      setError('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadTickets();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setPriorityFilter('');
    setCategoryFilter('');
    setAssignedOnly(false);
  };

  return (
    <div>
      {/* Top Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">
            {isEmployee ? 'My Submitted Tickets' : 'IT Service Tickets'}
          </h4>
          <p className="text-muted small mb-0">
            {isEmployee
              ? 'View, track, and update all technical requests logged from your account'
              : 'Enterprise queue of all technical support, access, and infrastructure requests'}
          </p>
        </div>
        <div>
          <Link to="/tickets/new" className="btn btn-primary-enterprise d-inline-flex align-items-center gap-2">
            <i className="bi bi-plus-lg"></i> {isEmployee ? 'Create Ticket' : 'Log New Ticket'}
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger py-2 small mb-4">
          <i className="bi bi-exclamation-triangle me-2"></i> {error}
        </div>
      )}

      {/* Search and Filter Toolbar */}
      <div className="card-enterprise p-3 mb-4">
        <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
          {/* Search input */}
          <div className="col-12 col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-white text-muted border-end-0">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search ticket code, title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="btn btn-outline-secondary">
                Search
              </button>
            </div>
          </div>

          {/* Status filter */}
          <div className="col-6 col-md-2">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          {/* Priority filter */}
          <div className="col-6 col-md-2">
            <select
              className="form-select"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          {/* Category filter */}
          <div className="col-6 col-md-2">
            <select
              className="form-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Reset button */}
          <div className="col-6 col-md-2 d-flex gap-2">
            {(isAgent || isAdmin) && (
              <button
                type="button"
                className={`btn btn-sm ${assignedOnly ? 'btn-primary' : 'btn-outline-secondary'} flex-grow-1`}
                onClick={() => setAssignedOnly(!assignedOnly)}
                title="Filter tickets assigned to me"
              >
                <i className="bi bi-person-check me-1"></i> Mine
              </button>
            )}
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary flex-grow-1"
              onClick={handleResetFilters}
              title="Reset all filters"
            >
              <i className="bi bi-arrow-counterclockwise"></i> Reset
            </button>
          </div>
        </form>
      </div>

      {/* Ticket List Table */}
      <div className="card-enterprise">
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
          <span className="fw-semibold text-secondary small">
            Showing <strong className="text-dark">{tickets.length}</strong> tickets
          </span>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading ticket queue..." />
        ) : tickets.length === 0 ? (
          <div className="text-center py-5">
            <div className="text-muted mb-2" style={{ fontSize: '2.5rem' }}>
              <i className="bi bi-search"></i>
            </div>
            <h6 className="fw-semibold text-secondary">No matching tickets found</h6>
            <p className="text-muted small mb-3">
              Try adjusting your search terms or clearing the filters above.
            </p>
            <button onClick={handleResetFilters} className="btn btn-sm btn-outline-primary">
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table-enterprise">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Title & Summary</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Reported By</th>
                  <th>Assignee</th>
                  <th>Logged Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>
                      <Link to={`/tickets/${ticket.id}`} className="ticket-code text-decoration-none">
                        {ticket.ticketCode}
                      </Link>
                    </td>
                    <td style={{ maxWidth: '280px' }}>
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
                      <div className="small fw-medium text-dark">{ticket.createdByName}</div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                        {ticket.createdByDepartment}
                      </div>
                    </td>
                    <td>
                      {ticket.assignedToName ? (
                        <div className="small fw-medium text-dark">
                          <i className="bi bi-headset me-1 text-primary"></i>
                          {ticket.assignedToName}
                        </div>
                      ) : (
                        <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="text-muted small">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <Link to={`/tickets/${ticket.id}`} className="btn btn-sm btn-light border py-1 px-2 text-primary">
                        Details <i className="bi bi-arrow-right-short"></i>
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

export default TicketListPage;
