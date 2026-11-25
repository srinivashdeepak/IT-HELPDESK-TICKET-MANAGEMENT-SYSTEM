import React, { useState, useEffect } from 'react';
import auditService from '../../services/auditService';
import LoadingSpinner from '../../components/LoadingSpinner';

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuditLogs(page);
  }, [page]);

  const loadAuditLogs = async (pageNumber) => {
    setLoading(true);
    try {
      const res = await auditService.getAuditLogs(pageNumber, pageSize);
      if (res.data) {
        setLogs(Array.isArray(res.data.content) ? res.data.content : []);
        setTotalPages(res.data.totalPages || 1);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err) {
      console.error(err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action) => {
    if (!action) return 'bg-secondary-subtle text-secondary';
    if (action.includes('BREACH') || action.includes('ESCALAT') || action.includes('REOPEN')) {
      return 'bg-danger-subtle text-danger border border-danger-subtle';
    }
    if (action.includes('ASSIGN') || action.includes('STATUS')) {
      return 'bg-primary-subtle text-primary border border-primary-subtle';
    }
    if (action.includes('PROVISION') || action.includes('PASSWORD')) {
      return 'bg-warning-subtle text-warning border border-warning-subtle';
    }
    return 'bg-secondary-subtle text-secondary border border-secondary-subtle';
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h4 className="fw-bold mb-1">Compliance & Activity Audit Logs</h4>
          <p className="text-muted small mb-0">
            Immutable chronological record of administrative actions, ticket escalations, assignments, and credential changes
          </p>
        </div>
        <div className="badge bg-light text-dark border p-2">
          Total Recorded Events: {totalElements}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : !logs || logs.length === 0 ? (
        <div className="card text-center py-5 shadow-sm border-0">
          <i className="bi bi-shield-slash fs-1 text-muted opacity-50 mb-2"></i>
          <h6 className="fw-bold">No audit entries recorded yet</h6>
          <p className="text-muted small mb-0">System events will automatically stream here.</p>
        </div>
      ) : (
        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="small text-muted text-uppercase">Action Type</th>
                  <th className="small text-muted text-uppercase">Event Details</th>
                  <th className="small text-muted text-uppercase">Actor</th>
                  <th className="small text-muted text-uppercase">IP Origin</th>
                  <th className="small text-muted text-uppercase text-end">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <span className={`badge ${getActionBadge(log.action)} font-monospace px-2 py-1`}>
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <div className="small text-dark fw-medium" style={{ maxWidth: '450px' }}>
                        {log.details}
                      </div>
                    </td>
                    <td className="small">
                      <div className="fw-semibold">{log.performedBy || 'SYSTEM / AUTOMATION'}</div>
                    </td>
                    <td className="small text-muted font-monospace">
                      {log.ipAddress || 'Internal Bus'}
                    </td>
                    <td className="small text-muted text-end">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="card-footer bg-white d-flex justify-content-between align-items-center py-3">
              <span className="small text-muted">
                Page {page + 1} of {totalPages}
              </span>
              <div className="btn-group btn-group-sm">
                <button
                  className="btn btn-outline-secondary"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  <i className="bi bi-chevron-left me-1"></i> Previous
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

export default AuditLogsPage;
