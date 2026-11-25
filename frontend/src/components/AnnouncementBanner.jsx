import React, { useEffect, useState } from 'react';
import announcementService from '../services/announcementService';

const AnnouncementBanner = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('dismissed_announcements') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const res = await announcementService.getActiveAnnouncements();
      if (res && res.data && Array.isArray(res.data)) {
        setAnnouncements(res.data);
      }
    } catch (err) {
      console.error('Failed to load announcements', err);
    }
  };

  const dismiss = (id) => {
    const updated = [...dismissed, id];
    setDismissed(updated);
    sessionStorage.setItem('dismissed_announcements', JSON.stringify(updated));
  };

  const visible = Array.isArray(announcements)
    ? announcements.filter((a) => !dismissed.includes(a.id))
    : [];

  if (visible.length === 0) return null;

  return (
    <div className="mb-4 d-flex flex-column gap-2">
      {visible.map((ann) => {
        let alertClass = 'alert-info border-info-subtle';
        let icon = 'bi-info-circle-fill text-info';

        if (ann.priority === 'CRITICAL') {
          alertClass = 'alert-danger border-danger-subtle';
          icon = 'bi-exclamation-octagon-fill text-danger';
        } else if (ann.priority === 'WARNING') {
          alertClass = 'alert-warning border-warning-subtle';
          icon = 'bi-exclamation-triangle-fill text-warning';
        }

        return (
          <div
            key={ann.id}
            className={`alert ${alertClass} alert-dismissible fade show d-flex align-items-center mb-0 shadow-sm py-2 px-3`}
            role="alert"
          >
            <i className={`bi ${icon} me-2 fs-5`}></i>
            <div className="flex-grow-1">
              <strong className="me-2">{ann.title}:</strong>
              <span>{ann.content}</span>
            </div>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={() => dismiss(ann.id)}
              style={{ padding: '0.75rem' }}
            ></button>
          </div>
        );
      })}
    </div>
  );
};

export default AnnouncementBanner;
