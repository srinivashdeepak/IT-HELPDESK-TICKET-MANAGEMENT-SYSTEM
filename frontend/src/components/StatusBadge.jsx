import React from 'react';

const StatusBadge = ({ status }) => {
  const getBadgeClass = (s) => {
    switch (s) {
      case 'OPEN':
        return 'badge-status badge-status-open';
      case 'ASSIGNED':
        return 'badge-status badge-status-assigned';
      case 'IN_PROGRESS':
        return 'badge-status badge-status-in-progress';
      case 'ON_HOLD':
        return 'badge-status badge-status-on-hold';
      case 'RESOLVED':
        return 'badge-status badge-status-resolved';
      case 'CLOSED':
        return 'badge-status badge-status-closed';
      default:
        return 'badge-status badge-status-open';
    }
  };

  const getIcon = (s) => {
    switch (s) {
      case 'OPEN':
        return 'bi-record-circle';
      case 'ASSIGNED':
        return 'bi-person-check';
      case 'IN_PROGRESS':
        return 'bi-arrow-repeat';
      case 'ON_HOLD':
        return 'bi-pause-circle';
      case 'RESOLVED':
        return 'bi-check-circle-fill';
      case 'CLOSED':
        return 'bi-lock-fill';
      default:
        return 'bi-circle';
    }
  };

  const formatText = (s) => {
    if (!s) return 'Unknown';
    return s.replace('_', ' ');
  };

  return (
    <span className={getBadgeClass(status)}>
      <i className={`bi ${getIcon(status)}`}></i>
      {formatText(status)}
    </span>
  );
};

export default StatusBadge;
