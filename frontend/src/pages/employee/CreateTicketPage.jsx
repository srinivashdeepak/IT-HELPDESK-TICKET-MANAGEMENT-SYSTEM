import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ticketService } from '../../services/ticketService';
import { categoryService } from '../../services/categoryService';
import { kbService } from '../../services/kbService';
import { attachmentService } from '../../services/attachmentService';

const CreateTicketPage = () => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    priority: 'MEDIUM',
    description: '',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [kbSuggestions, setKbSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingCats, setFetchingCats] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    loadCategories();
  }, []);

  // Debounced search for Knowledge Base suggestions as user types the title
  useEffect(() => {
    if (formData.title.trim().length < 3) {
      setKbSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await kbService.getSuggestions(formData.title.trim());
        if (res.data) {
          setKbSuggestions(res.data);
        }
      } catch (e) {
        // Ignore background suggestions failure
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [formData.title]);

  const loadCategories = async () => {
    try {
      setFetchingCats(true);
      const res = await categoryService.getActiveCategories();
      if (res.success && res.data) {
        setCategories(res.data);
        if (res.data.length > 0) {
          setFormData((prev) => ({ ...prev, categoryId: res.data[0].id }));
        }
      }
    } catch (err) {
      setError('Failed to load support categories');
    } finally {
      setFetchingCats(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim() || !formData.categoryId) {
      setError('Please provide a title, category, and detailed problem description');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await ticketService.createTicket({
        title: formData.title.trim(),
        categoryId: Number(formData.categoryId),
        priority: formData.priority,
        description: formData.description.trim(),
      });

      if (res.success && res.data) {
        const createdTicketId = res.data.id;

        // If file is selected, upload it
        if (selectedFile) {
          try {
            await attachmentService.uploadAttachment(createdTicketId, selectedFile);
          } catch (fileErr) {
            console.error('File upload failed', fileErr);
          }
        }

        setSuccess(`Ticket ${res.data.ticketCode} logged successfully! Redirecting...`);
        setTimeout(() => {
          navigate(`/tickets/${createdTicketId}`);
        }, 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit ticket');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb small mb-1">
              <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
              <li className="breadcrumb-item active" aria-current="page">New Ticket</li>
            </ol>
          </nav>
          <h4 className="fw-bold text-dark mb-0">Create IT Support Request</h4>
        </div>
        <Link to="/tickets" className="btn btn-sm btn-outline-secondary">
          <i className="bi bi-arrow-left me-1"></i> Back to Tickets
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <div>{error}</div>
        </div>
      )}

      {success && (
        <div className="alert alert-success py-2 small d-flex align-items-center gap-2 mb-4" role="alert">
          <i className="bi bi-check-circle-fill"></i>
          <div>{success}</div>
        </div>
      )}

      {/* Live KB Suggestions Alert */}
      {kbSuggestions.length > 0 && (
        <div className="alert alert-info border-info-subtle shadow-sm mb-4">
          <div className="d-flex align-items-center gap-2 mb-2">
            <i className="bi bi-lightbulb-fill text-warning fs-5"></i>
            <strong className="small">Suggested Self-Service Guides Found:</strong>
          </div>
          <p className="small text-muted mb-2">
            These published solutions might resolve your issue immediately without waiting for an agent:
          </p>
          <ul className="mb-0 small ps-3">
            {kbSuggestions.map((art) => (
              <li key={art.id} className="mb-1">
                <Link to={`/kb/${art.id}`} target="_blank" className="fw-semibold text-primary">
                  {art.title}
                </Link>
                <span className="text-muted ms-2">({art.categoryName})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card-enterprise p-4">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">
              Ticket Summary / Title <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              name="title"
              className="form-control"
              placeholder="e.g. MacBook Pro M2 battery draining rapidly and overheating"
              value={formData.title}
              onChange={handleChange}
              required
              maxLength={200}
            />
            <div className="form-text small">Provide a concise one-line summary of the technical problem.</div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">
                Issue Category <span className="text-danger">*</span>
              </label>
              {fetchingCats ? (
                <div className="form-control text-muted small">Loading categories...</div>
              ) : (
                <select
                  name="categoryId"
                  className="form-select"
                  value={formData.categoryId}
                  onChange={handleChange}
                  required
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">
                Urgency / Priority <span className="text-danger">*</span>
              </label>
              <select
                name="priority"
                className="form-select"
                value={formData.priority}
                onChange={handleChange}
                required
              >
                <option value="LOW">Low (Turnaround target: 96h)</option>
                <option value="MEDIUM">Medium (Turnaround target: 48h)</option>
                <option value="HIGH">High (Turnaround target: 12h)</option>
                <option value="CRITICAL">Critical (Turnaround target: 4h)</option>
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">
              Detailed Description & Steps to Reproduce <span className="text-danger">*</span>
            </label>
            <textarea
              name="description"
              className="form-control"
              rows={5}
              placeholder="Please describe:
1. What was happening?
2. What error messages or diagnostic codes appeared?
3. Device hostname or IP address if applicable.
4. Any troubleshooting steps already attempted."
              value={formData.description}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          {/* Screenshot / File Attachment */}
          <div className="mb-4">
            <label className="form-label small fw-semibold text-secondary">
              Attach Screenshot or Log File (Optional)
            </label>
            <input
              type="file"
              className="form-control form-control-sm"
              onChange={(e) => setSelectedFile(e.target.files[0])}
            />
            <div className="form-text small">Accepted formats: PNG, JPG, PDF, TXT, LOG. Max size: 15MB.</div>
          </div>

          <div className="d-flex justify-content-end gap-2 pt-3 border-top">
            <Link to="/tickets" className="btn btn-outline-secondary btn-enterprise">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary-enterprise d-inline-flex align-items-center gap-2"
              disabled={loading || fetchingCats}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Submitting Ticket...
                </>
              ) : (
                <>
                  <i className="bi bi-send"></i> Submit Ticket
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicketPage;
