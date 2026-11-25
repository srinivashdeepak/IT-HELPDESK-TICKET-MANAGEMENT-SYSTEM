import React, { useState, useEffect } from 'react';
import slaService from '../../services/slaService';
import LoadingSpinner from '../../components/LoadingSpinner';

const SlaManagementPage = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState('');

  // Edit Modal
  const [editingRule, setEditingRule] = useState(null);
  const [responseHours, setResponseHours] = useState(1);
  const [resolutionHours, setResolutionHours] = useState(4);
  const [escalationEmail, setEscalationEmail] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    setLoading(true);
    try {
      const res = await slaService.getSlaRules();
      if (res.data) setRules(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (rule) => {
    setEditingRule(rule);
    setResponseHours(rule.responseTimeHours);
    setResolutionHours(rule.resolutionTimeHours);
    setEscalationEmail(rule.escalationEmail || '');
  };

  const handleSaveRule = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await slaService.updateSlaRule(editingRule.id, {
        priority: editingRule.priority,
        responseTimeHours: Number(responseHours),
        resolutionTimeHours: Number(resolutionHours),
        escalationEmail: escalationEmail || null,
        active: true,
      });
      setEditingRule(null);
      loadRules();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update rule');
    } finally {
      setSaving(false);
    }
  };

  const handleTriggerBreachScan = async () => {
    setScanning(true);
    setScanResult('');
    try {
      await slaService.triggerSlaCheck();
      setScanResult('SLA breach scan completed successfully. Overdue tickets have been escalated and notifications dispatched.');
    } catch (err) {
      setScanResult('Error during scan: ' + (err.response?.data?.message || err.message));
    } finally {
      setScanning(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h4 className="fw-bold mb-1">Service Level Agreement (SLA) Governance</h4>
          <p className="text-muted small mb-0">Define response & resolution turnaround targets and automatic escalation policies</p>
        </div>
        <button
          className="btn btn-outline-danger btn-sm d-flex align-items-center gap-2"
          onClick={handleTriggerBreachScan}
          disabled={scanning}
        >
          <i className="bi bi-broadcast"></i> {scanning ? 'Scanning Tickets...' : 'Run Breach Scan Now'}
        </button>
      </div>

      {scanResult && (
        <div className="alert alert-info alert-dismissible fade show py-2 small mb-4" role="alert">
          <i className="bi bi-info-circle me-2"></i> {scanResult}
          <button type="button" className="btn-close" onClick={() => setScanResult('')} style={{ padding: '0.75rem' }}></button>
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="small text-muted text-uppercase">Priority Level</th>
                  <th className="small text-muted text-uppercase">Target Response</th>
                  <th className="small text-muted text-uppercase">Target Resolution</th>
                  <th className="small text-muted text-uppercase">Escalation Recipient</th>
                  <th className="small text-muted text-uppercase">Status</th>
                  <th className="small text-muted text-uppercase text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((r) => {
                  let badge = 'bg-secondary';
                  if (r.priority === 'CRITICAL') badge = 'bg-danger';
                  if (r.priority === 'HIGH') badge = 'bg-warning text-dark';
                  if (r.priority === 'MEDIUM') badge = 'bg-info text-dark';

                  return (
                    <tr key={r.id}>
                      <td>
                        <span className={`badge ${badge} px-2 py-1`}>{r.priority}</span>
                      </td>
                      <td>
                        <div className="fw-semibold">{r.responseTimeHours} hour{r.responseTimeHours > 1 ? 's' : ''}</div>
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>First agent response</span>
                      </td>
                      <td>
                        <div className="fw-semibold">{r.resolutionTimeHours} hour{r.resolutionTimeHours > 1 ? 's' : ''}</div>
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>Complete incident resolution</span>
                      </td>
                      <td>
                        {r.escalationEmail ? (
                          <span className="text-primary small">{r.escalationEmail}</span>
                        ) : (
                          <span className="text-muted small">System Administrators</span>
                        )}
                      </td>
                      <td>
                        <span className="badge bg-success-subtle text-success border border-success-subtle">
                          ACTIVE
                        </span>
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-outline-primary btn-sm py-1 px-3"
                          onClick={() => handleOpenEdit(r)}
                        >
                          <i className="bi bi-pencil me-1"></i> Configure
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit SLA Modal */}
      {editingRule && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleSaveRule}>
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">Configure SLA for {editingRule.priority}</h5>
                  <button type="button" className="btn-close" onClick={() => setEditingRule(null)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Target Response Time (Hours)</label>
                    <input
                      type="number"
                      min="1"
                      max="168"
                      className="form-control"
                      value={responseHours}
                      onChange={(e) => setResponseHours(e.target.value)}
                      required
                    />
                    <div className="form-text small">Maximum time before first agent interaction is required.</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Target Resolution Time (Hours)</label>
                    <input
                      type="number"
                      min="1"
                      max="720"
                      className="form-control"
                      value={resolutionHours}
                      onChange={(e) => setResolutionHours(e.target.value)}
                      required
                    />
                    <div className="form-text small">Turnaround deadline before ticket status is marked BREACHED.</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Escalation Notification Email</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="admin@company.com"
                      value={escalationEmail}
                      onChange={(e) => setEscalationEmail(e.target.value)}
                    />
                    <div className="form-text small">Alert is sent immediately when breach occurs.</div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditingRule(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlaManagementPage;
