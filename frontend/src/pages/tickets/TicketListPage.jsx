import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ticketService } from '../../services/ticketService';
import { categoryService } from '../../services/categoryService';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import SlaBadge from '../../components/SlaBadge';
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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [assignedOnly, setAssignedOnly] = useState(searchParams.get('assignedToMe') === 'true');

  // Pagination State
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadTickets();
  }, [page, statusFilter, priorityFilter, categoryFilter, assignedOnly]);

  const loadCategories = async () => {
    try {
      const res = await categoryService.getActiveCategories();
      if (res.success && Array.isArray(res.data)) {
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
      const params = {
        page,
        size: pageSize,
      };
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (categoryFilter) params.categoryId = categoryFilter;
      if (searchQuery.trim()) params.query = searchQuery.trim();
      if (assignedOnly) params.assignedToMe = true;
      if (startDate) params.startDate = new Date(startDate).toISOString();
      if (endDate) params.endDate = new Date(endDate + 'T23:59:59').toISOString();

      const res = await ticketService.getPagedTickets(params);
      if (res.success && res.data) {
        setTickets(Array.isArray(res.data.content) ? res.data.content : []);
        setTotalPages(res.data.totalPages || 1);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err) {
      setError('Failed to fetch tickets');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    loadTickets();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setPriorityFilter('');
    setCategoryFilter('');
    setStartDate('');
    setEndDate('');
    setAssignedOnly(false);
    setPage(0);
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
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-light text-secondary border p-2 small">
            Total Tickets: {totalElements}
          </span>
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
          <div className="col-12 col-md-3">
            <div className="input-group">
              <span className="input-group-text bg-white text-muted border-end-0">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Ticket ID, keyword, name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Status filter */}
          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
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
              className="form-select form-select-sm"
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(0);
              }}
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
              className="form-select form-select-sm"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(0);
              }}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date range inputs */}
          <div className="col-6 col-md-3 d-flex gap-1">
            <input
              type="date"
              className="form-control form-control-sm"
              title="Start Date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(0);
              }}
            />
            <input
              type="date"
              className="form-control form-control-sm"
              title="End Date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(0);
              }}
            />
          </div>

          {/* Action buttons */}
          <div className="col-12 d-flex justify-content-end gap-2 mt-2">
            {(isAgent || isAdmin) && (
              <button
                type="button"
                className={`btn btn-sm ${assignedOnly ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => {
                  setAssignedOnly(!assignedOnly);
                  setPage(0);
                }}
                title="Filter tickets assigned to me"
              >
                <i className="bi bi-person-check me-1"></i> Assigned to Me
              </button>
            )}
            <button
              type="submit"
              className="btn btn-sm btn-primary-enterprise"
            >
              <i className="bi bi-funnel me-1"></i> Filter
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={handleResetFilters}
              title="Reset all filters"
            >
              <i className="bi bi-arrow-counterclockwise me-1"></i> Reset
            </button>
          </div>
        </form>
      </div>

      {/* Tickets Table */}
      {loading ? (
        <LoadingSpinner message="Querying ITSM queue..." />
      ) : !tickets || tickets.length === 0 ? (
        <div className="card-enterprise text-center py-5">
          <i className="bi bi-ticket-perforated fs-1 text-muted opacity-50 mb-2"></i>
          <h5 className="fw-semibold text-dark">No tickets found</h5>
          <p className="text-muted small mb-3">No incident records matched your active filter criteria.</p>
          <button className="btn btn-sm btn-outline-secondary" onClick={handleResetFilters}>
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="card-enterprise">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="small text-muted text-uppercase" style={{ width: '120px' }}>Ticket Code</th>
                  <th className="small text-muted text-uppercase">Summary</th>
                  <th className="small text-muted text-uppercase">Category</th>
                  <th className="small text-muted text-uppercase">Priority</th>
                  <th className="small text-muted text-uppercase">Status</th>
                  <th className="small text-muted text-uppercase">SLA Status</th>
                  <th className="small text-muted text-uppercase">Requester</th>
                  <th className="small text-muted text-uppercase">Assignee</th>
                  <th className="small text-muted text-uppercase text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <Link to={`/tickets/${t.id}`} className="ticket-code text-decoration-none">
                        {t.ticketCode}
                      </Link>
                    </td>
                    <td>
                      <Link to={`/tickets/${t.id}`} className="text-decoration-none text-dark fw-medium small d-block text-truncate" style={{ maxWidth: '280px' }}>
                        {t.title}
                      </Link>
                      <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                        Created {new Date(t.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-light text-secondary border small">
                        {t.categoryName}
                      </span>
                    </td>
                    <td>
                      <PriorityBadge priority={t.priority} />
                    </td>
                    <td>
                      <StatusBadge status={t.status} />
                    </td>
                    <td>
                      <SlaBadge status={t.slaStatus} deadline={t.resolutionDeadline} isBreached={t.slaBreached} />
                    </td>
                    <td>
                      <div className="small fw-semibold text-dark">{t.createdByName}</div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>{t.createdByDepartment}</div>
                    </td>
                    <td>
                      {t.assignedToName ? (
                        <div className="small text-dark fw-medium">
                          <i className="bi bi-person me-1 text-primary"></i>
                          {t.assignedToName}
                        </div>
                      ) : (
                        <span className="badge bg-light text-muted border">Unassigned</span>
                      )}
                    </td>
                    <td className="text-end">
                      <Link to={`/tickets/${t.id}`} className="btn btn-sm btn-outline-primary py-1 px-2">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="card-footer bg-white d-flex justify-content-between align-items-center py-3">
              <span className="small text-muted">
                Page {page + 1} of {totalPages} ({totalElements} total tickets)
              </span>
              <div className="btn-group btn-group-sm">
                <button
                  className="btn btn-outline-secondary"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  <i className="bi bi-chevron-left me-1"></i> Prev
                </button>
                <button
                  className="btn btn-outline-secondary"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next <i className="bi bi-chevron-right ms-1"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TicketListPage;
