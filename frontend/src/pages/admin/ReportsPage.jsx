import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analyticsService';
import { ticketService } from '../../services/ticketService';
import LoadingSpinner from '../../components/LoadingSpinner';

const ReportsPage = () => {
  const [stats, setStats] = useState(null);
  const [allTickets, setAllTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReportsData();
  }, []);

  const loadReportsData = async () => {
    try {
      setLoading(true);
      setError('');
      const [statsRes, ticketsRes] = await Promise.all([
        analyticsService.getDashboardStats(),
        ticketService.getTickets({}),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (ticketsRes.success) setAllTickets(ticketsRes.data);
    } catch (err) {
      setError('Failed to generate analytical reports');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Calculating SLA & turnaround metrics..." />;

  const total = stats?.totalTickets || 1;
  const resolvedTotal = (stats?.resolvedTickets || 0) + (stats?.closedTickets || 0);
  const resolutionRate = Math.round((resolvedTotal / total) * 100);

  const categories = stats?.categoryDistribution || {};

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">Reports & Service Level Analytics</h4>
          <p className="text-muted small mb-0">
            Resolution time benchmarks, SLA health metrics, and volume distribution
          </p>
        </div>
        <div>
          <button onClick={() => window.print()} className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2">
            <i className="bi bi-printer"></i> Print / Export Report
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger py-2 small mb-4">
          <i className="bi bi-exclamation-triangle me-2"></i> {error}
        </div>
      )}

      {/* SLA Metric Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="metric-card">
            <div className="metric-card-title">Overall SLA Clearance</div>
            <div className="metric-card-value text-success">{resolutionRate}%</div>
            <div className="metric-card-subtitle">
              {resolvedTotal} of {total} tickets resolved
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="metric-card">
            <div className="metric-card-title">Mean Time to Resolution</div>
            <div className="metric-card-value text-primary">
              {stats?.averageResolutionHours || 0} <span className="fs-6 text-muted">hrs</span>
            </div>
            <div className="metric-card-subtitle">Across closed and resolved incidents</div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="metric-card">
            <div className="metric-card-title">Critical & High Incidents</div>
            <div className="metric-card-value text-danger">
              {(stats?.criticalTickets || 0) + (stats?.highTickets || 0)}
            </div>
            <div className="metric-card-subtitle">High impact business tickets</div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="metric-card">
            <div className="metric-card-title">Active Queue Depth</div>
            <div className="metric-card-value text-warning">
              {(stats?.openTickets || 0) + (stats?.inProgressTickets || 0) + (stats?.assignedTickets || 0)}
            </div>
            <div className="metric-card-subtitle">Currently requiring engineer action</div>
          </div>
        </div>
      </div>

      {/* Status Breakdown & Category Matrix */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-6">
          <div className="card-enterprise h-100">
            <div className="p-3 border-bottom">
              <h6 className="fw-bold mb-0 text-dark small">
                <i className="bi bi-pie-chart-fill text-primary me-2"></i> Ticket Status Distribution
              </h6>
            </div>
            <div className="p-4">
              <div className="mb-3">
                <div className="d-flex justify-content-between small mb-1">
                  <span>Open (Awaiting Assignment)</span>
                  <strong>{stats?.openTickets || 0}</strong>
                </div>
                <div className="progress" style={{ height: '6px' }}>
                  <div className="progress-bar bg-info" style={{ width: `${Math.round(((stats?.openTickets || 0) / total) * 100)}%` }}></div>
                </div>
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between small mb-1">
                  <span>Assigned</span>
                  <strong>{stats?.assignedTickets || 0}</strong>
                </div>
                <div className="progress" style={{ height: '6px' }}>
                  <div className="progress-bar bg-secondary" style={{ width: `${Math.round(((stats?.assignedTickets || 0) / total) * 100)}%` }}></div>
                </div>
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between small mb-1">
                  <span>In Progress</span>
                  <strong>{stats?.inProgressTickets || 0}</strong>
                </div>
                <div className="progress" style={{ height: '6px' }}>
                  <div className="progress-bar bg-warning" style={{ width: `${Math.round(((stats?.inProgressTickets || 0) / total) * 100)}%` }}></div>
                </div>
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between small mb-1">
                  <span>Resolved</span>
                  <strong>{stats?.resolvedTickets || 0}</strong>
                </div>
                <div className="progress" style={{ height: '6px' }}>
                  <div className="progress-bar bg-success" style={{ width: `${Math.round(((stats?.resolvedTickets || 0) / total) * 100)}%` }}></div>
                </div>
              </div>

              <div>
                <div className="d-flex justify-content-between small mb-1">
                  <span>Closed</span>
                  <strong>{stats?.closedTickets || 0}</strong>
                </div>
                <div className="progress" style={{ height: '6px' }}>
                  <div className="progress-bar bg-dark" style={{ width: `${Math.round(((stats?.closedTickets || 0) / total) * 100)}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card-enterprise h-100">
            <div className="p-3 border-bottom">
              <h6 className="fw-bold mb-0 text-dark small">
                <i className="bi bi-bar-chart-fill text-success me-2"></i> Category Load Breakdown
              </h6>
            </div>
            <div className="p-4">
              {Object.entries(categories).map(([cat, count]) => {
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={cat} className="mb-3">
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="fw-medium">{cat}</span>
                      <span className="text-muted">{count} tickets ({pct}%)</span>
                    </div>
                    <div className="progress" style={{ height: '6px' }}>
                      <div className="progress-bar bg-primary" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
