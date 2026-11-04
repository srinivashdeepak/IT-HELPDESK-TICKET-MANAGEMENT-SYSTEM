import React, { useState, useEffect } from 'react';
import { categoryService } from '../../services/categoryService';
import LoadingSpinner from '../../components/LoadingSpinner';

const CategoryManagementPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '', active: true });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await categoryService.getAllCategories();
      if (res.success) {
        setCategories(res.data);
      }
    } catch (err) {
      setError('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name.trim()) return;

    try {
      setSubmitting(true);
      setError('');
      const res = await categoryService.createCategory({
        name: newCategory.name.trim(),
        description: newCategory.description.trim(),
        active: true,
      });

      if (res.success) {
        setSuccess(`Category "${res.data.name}" created successfully`);
        setShowModal(false);
        setNewCategory({ name: '', description: '', active: true });
        loadCategories();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Are you sure you want to deactivate the "${name}" category?`)) {
      return;
    }

    try {
      setError('');
      const res = await categoryService.deleteCategory(id);
      if (res.success) {
        setSuccess(`Category "${name}" deactivated.`);
        loadCategories();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to deactivate category');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">Support Category Taxonomy</h4>
          <p className="text-muted small mb-0">
            Define and manage ticket classifications across hardware, applications, network, and cloud
          </p>
        </div>
        <div>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary-enterprise d-inline-flex align-items-center gap-2"
          >
            <i className="bi bi-tag-fill"></i> Add Category
          </button>
        </div>
      </div>

      {success && (
        <div className="alert alert-success py-2 small d-flex justify-content-between align-items-center mb-4">
          <div><i className="bi bi-check-circle me-2"></i> {success}</div>
          <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger py-2 small d-flex justify-content-between align-items-center mb-4">
          <div><i className="bi bi-exclamation-triangle me-2"></i> {error}</div>
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      <div className="card-enterprise">
        {loading ? (
          <LoadingSpinner message="Loading taxonomy..." />
        ) : (
          <div className="table-responsive">
            <table className="table-enterprise">
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Scope & Description</th>
                  <th>Classification Status</th>
                  <th>Created Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-folder-fill text-primary"></i>
                        <span className="fw-semibold text-dark">{c.name}</span>
                      </div>
                    </td>
                    <td className="text-secondary small" style={{ maxWidth: '400px' }}>
                      {c.description || <span className="text-muted fst-italic">No description</span>}
                    </td>
                    <td>
                      {c.active ? (
                        <span className="badge bg-success-subtle text-success border border-success-subtle">
                          Active
                        </span>
                      ) : (
                        <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="text-muted small">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      {c.active && (
                        <button
                          onClick={() => handleDeleteCategory(c.id, c.name)}
                          className="btn btn-sm btn-outline-danger py-0 px-2"
                          style={{ fontSize: '0.75rem' }}
                        >
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Category Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark fs-6">Add New Support Category</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleCreateCategory}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Category Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Database & Storage"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Description</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Explain what types of issues belong in this category..."
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-top bg-light">
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-sm btn-primary-enterprise" disabled={submitting}>
                    {submitting ? 'Creating...' : 'Save Category'}
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

export default CategoryManagementPage;
