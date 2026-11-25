import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import kbService from '../../services/kbService';
import categoryService from '../../services/categoryService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const KbListPage = () => {
  const { isAdmin, isAgent } = useAuth();
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // New Article Modal State
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategoryId, setNewCategoryId] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadArticles();
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      const res = await categoryService.getCategories();
      if (res.data) setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadArticles = async () => {
    setLoading(true);
    try {
      const res = await kbService.getArticles({
        categoryId: selectedCategory || undefined,
        search: searchQuery || undefined,
      });
      if (res.data) setArticles(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadArticles();
  };

  const handleCreateArticle = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    try {
      await kbService.createArticle({
        title: newTitle,
        content: newContent,
        categoryId: Number(newCategoryId),
      });
      setShowModal(false);
      setNewTitle('');
      setNewContent('');
      setNewCategoryId('');
      loadArticles();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create article');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h4 className="fw-bold mb-1">Knowledge Base</h4>
          <p className="text-muted small mb-0">Browse self-service solutions, troubleshooting articles, and IT runbooks</p>
        </div>
        {(isAdmin || isAgent) && (
          <button className="btn btn-primary btn-sm d-flex align-items-center gap-2" onClick={() => setShowModal(true)}>
            <i className="bi bi-journal-plus"></i> Publish Article
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-3">
          <form onSubmit={handleSearchSubmit} className="row g-2">
            <div className="col-md-7">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Search articles by title, keywords, or issue..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-secondary w-100">
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Article Grid */}
      {loading ? (
        <LoadingSpinner />
      ) : articles.length === 0 ? (
        <div className="card text-center py-5 shadow-sm border-0">
          <i className="bi bi-journal-x fs-1 text-muted opacity-50 mb-2"></i>
          <h6 className="fw-bold">No articles found</h6>
          <p className="text-muted small mb-0">Try adjusting your search criteria or category filter.</p>
        </div>
      ) : (
        <div className="row g-3">
          {articles.map((art) => (
            <div key={art.id} className="col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm border-subtle">
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle small">
                      {art.categoryName}
                    </span>
                    <span className="text-muted small" title="Helpful votes">
                      <i className="bi bi-hand-thumbs-up text-success me-1"></i>
                      {art.helpfulCount}
                    </span>
                  </div>
                  <h6 className="fw-bold mb-2">
                    <Link to={`/kb/${art.id}`} className="text-decoration-none text-dark">
                      {art.title}
                    </Link>
                  </h6>
                  <p className="text-muted small flex-grow-1 text-truncate-2 mb-3">
                    {art.content.replace(/[#*`]/g, '').slice(0, 140)}...
                  </p>
                  <div className="d-flex justify-content-between align-items-center pt-2 border-top border-light-subtle small text-muted">
                    <span>By {art.authorName}</span>
                    <Link to={`/kb/${art.id}`} className="btn btn-sm btn-outline-primary py-0 px-2">
                      Read Guide <i className="bi bi-arrow-right"></i>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Article Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <form onSubmit={handleCreateArticle}>
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">Publish Knowledge Base Article</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  {errorMsg && <div className="alert alert-danger py-2 small">{errorMsg}</div>}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Article Title</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. How to connect to Corporate VPN on macOS"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Category</label>
                    <select
                      className="form-select"
                      value={newCategoryId}
                      onChange={(e) => setNewCategoryId(e.target.value)}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Markdown Content / Resolution Steps</label>
                    <textarea
                      className="form-control font-monospace small"
                      rows="8"
                      placeholder="Write structured remediation steps in Markdown format (headers, lists, code)..."
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                    {saving ? 'Publishing...' : 'Publish Article'}
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

export default KbListPage;
