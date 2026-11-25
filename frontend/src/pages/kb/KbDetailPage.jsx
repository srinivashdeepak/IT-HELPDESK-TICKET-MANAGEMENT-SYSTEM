import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import kbService from '../../services/kbService';
import LoadingSpinner from '../../components/LoadingSpinner';

const KbDetailPage = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState(false);
  const [voteMsg, setVoteMsg] = useState('');

  useEffect(() => {
    loadArticle();
  }, [id]);

  const loadArticle = async () => {
    setLoading(true);
    try {
      const res = await kbService.getArticleById(id);
      if (res.data) setArticle(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (helpful) => {
    if (voted) return;
    try {
      await kbService.voteHelpful(id, helpful);
      setVoted(true);
      setVoteMsg(helpful ? 'Thank you! Glad this article helped.' : 'Thank you for your feedback. We will improve this article.');
      setArticle((prev) => ({
        ...prev,
        helpfulCount: helpful ? prev.helpfulCount + 1 : prev.helpfulCount,
        notHelpfulCount: !helpful ? prev.notHelpfulCount + 1 : prev.notHelpfulCount,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!article) {
    return (
      <div className="alert alert-danger">
        Article not found. <Link to="/kb">Back to Knowledge Base</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link to="/kb">Knowledge Base</Link></li>
          <li className="breadcrumb-item active" aria-current="page">{article.categoryName}</li>
        </ol>
      </nav>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-4">
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
              {article.categoryName}
            </span>
            <span className="text-muted small">
              <i className="bi bi-clock me-1"></i>
              Updated {new Date(article.updatedAt || article.createdAt).toLocaleDateString()}
            </span>
          </div>

          <h3 className="fw-bold mb-3">{article.title}</h3>

          <div className="d-flex align-items-center gap-3 text-muted small pb-3 mb-4 border-bottom">
            <span>
              <i className="bi bi-person-circle me-1"></i> Author: {article.authorName}
            </span>
            <span>
              <i className="bi bi-eye me-1"></i> {article.viewCount} views
            </span>
            <span>
              <i className="bi bi-hand-thumbs-up me-1"></i> {article.helpfulCount} people found this helpful
            </span>
          </div>

          {/* Article Body Content */}
          <div
            className="article-content lh-lg text-secondary"
            style={{ whiteSpace: 'pre-line', fontSize: '1rem' }}
          >
            {article.content}
          </div>

          {/* Helpful Feedback Widget */}
          <div className="mt-5 p-4 rounded bg-light border border-light-subtle text-center">
            <h6 className="fw-bold mb-2">Was this article helpful?</h6>
            {voteMsg ? (
              <div className="text-success small fw-semibold">
                <i className="bi bi-check2-circle me-1"></i> {voteMsg}
              </div>
            ) : (
              <div className="d-flex justify-content-center gap-3 mt-3">
                <button
                  className="btn btn-outline-success btn-sm d-flex align-items-center gap-2 px-3"
                  onClick={() => handleVote(true)}
                  disabled={voted}
                >
                  <i className="bi bi-hand-thumbs-up"></i> Yes, it helped
                </button>
                <button
                  className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2 px-3"
                  onClick={() => handleVote(false)}
                  disabled={voted}
                >
                  <i className="bi bi-hand-thumbs-down"></i> No, I still need help
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KbDetailPage;
