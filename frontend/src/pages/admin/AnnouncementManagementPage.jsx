import React, { useState, useEffect } from 'react';
import announcementService from '../../services/announcementService';
import LoadingSpinner from '../../components/LoadingSpinner';

const AnnouncementManagementPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('INFO');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await announcementService.getAllAnnouncements();
      if (res.data) setAnnouncements(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setPriority('INFO');
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);
    setStartDate(now.toISOString().slice(0, 16));
    setEndDate(nextWeek.toISOString().slice(0, 16));
    setErrorMsg('');
    setShowModal(true);
  };

  const handleOpenEdit = (ann) => {
    setEditingId(ann.id);
    setTitle(ann.title);
    setContent(ann.content);
    setPriority(ann.priority);
    setStartDate(ann.startDate ? ann.startDate.slice(0, 16) : '');
    setEndDate(ann.endDate ? ann.endDate.slice(0, 16) : '');
    setErrorMsg('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    try {
      const payload = {
        title,
        content,
        priority,
        startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : new Date(Date.now() + 7 * 86400000).toISOString(),
        active: true,
      };

      if (editingId) {
        await announcementService.updateAnnouncement(editingId, payload);
      } else {
        await announcementService.createAnnouncement(payload);
      }
      setShowModal(false);
      loadAnnouncements();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save announcement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this announcement?')) return;
    try {
      await announcementService.deleteAnnouncement(id);
      loadAnnouncements();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete announcement');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h4 className="fw-bold mb-1">System Announcements & Maintenance Broadcasts</h4>
          <p className="text-muted small mb-0">Publish critical alerts, maintenance schedules, and security advisories to all employees</p>
        </div>
        <button className="btn btn-primary btn-sm d-flex align-items-center gap-2" onClick={handleOpenCreate}>
          <i className="bi bi-broadcast"></i> Broadcast Announcement
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : announcements.length === 0 ? (
        <div className="card text-center py-5 shadow-sm border-0">
          <i className="bi bi-megaphone fs-1 text-muted opacity-50 mb-2"></i>
          <h6 className="fw-bold">No announcements found</h6>
          <p className="text-muted small mb-0">Click "Broadcast Announcement" to create the first banner.</p>
        </div>
      ) : (
        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="small text-muted text-uppercase">Priority</th>
                  <th className="small text-muted text-uppercase">Title & Content</th>
                  <th className="small text-muted text-uppercase">Active Window</th>
                  <th className="small text-muted text-uppercase">Posted By</th>
                  <th className="small text-muted text-uppercase text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {announcements.map((ann) => {
                  let badge = 'bg-info-subtle text-info border-info-subtle';
                  if (ann.priority === 'CRITICAL') badge = 'bg-danger-subtle text-danger border-danger-subtle';
                  if (ann.priority === 'WARNING') badge = 'bg-warning-subtle text-warning border-warning-subtle';

                  return (
                    <tr key={ann.id}>
                      <td>
                        <span className={`badge ${badge} border px-2 py-1`}>{ann.priority}</span>
                      </td>
                      <td>
                        <div className="fw-bold">{ann.title}</div>
                        <div className="text-muted small text-truncate" style={{ maxWidth: '400px' }}>
                          {ann.content}
                        </div>
                      </td>
                      <td className="small text-muted">
                        <div><i className="bi bi-play-circle me-1"></i> {new Date(ann.startDate).toLocaleDateString()}</div>
                        <div><i className="bi bi-stop-circle me-1"></i> {new Date(ann.endDate).toLocaleDateString()}</div>
                      </td>
                      <td className="small text-secondary">
                        {ann.createdByName}
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-outline-secondary btn-sm me-2 py-0 px-2"
                          onClick={() => handleOpenEdit(ann)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm py-0 px-2"
                          onClick={() => handleDelete(ann.id)}
                        >
                          <i className="bi bi-trash"></i>
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

      {/* Broadcast Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleSave}>
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">
                    {editingId ? 'Edit Announcement' : 'Broadcast System Announcement'}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  {errorMsg && <div className="alert alert-danger py-2 small">{errorMsg}</div>}

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Announcement Title</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Scheduled Network Upgrade"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Severity / Priority</label>
                    <select
                      className="form-select"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                    >
                      <option value="INFO">INFO (General Information)</option>
                      <option value="WARNING">WARNING (Maintenance Window / Degraded Performance)</option>
                      <option value="CRITICAL">CRITICAL (System Outage / Security Warning)</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Detailed Message</label>
                    <textarea
                      className="form-control small"
                      rows="3"
                      placeholder="Enter the alert message to display to employees..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <div className="row g-2">
                    <div className="col-md-6 mb-3">
                      <label className="form-label small fw-semibold">Start Date & Time</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label small fw-semibold">End Date & Time</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                    {saving ? 'Publishing...' : 'Publish Announcement'}
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

export default AnnouncementManagementPage;
