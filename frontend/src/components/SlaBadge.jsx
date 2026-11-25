import React from 'react';

const SlaBadge = ({ status, deadline, isBreached }) => {
  if (!status && !deadline) return null;

  const currentStatus = isBreached ? 'BREACHED' : (status || 'WITHIN_SLA');

  let badgeClass = 'within';
  let label = 'Within SLA';
  let icon = 'bi-check-circle-fill';

  if (currentStatus === 'BREACHED') {
    badgeClass = 'breached';
    label = 'Breached';
    icon = 'bi-exclamation-octagon-fill';
  } else if (currentStatus === 'NEAR_DEADLINE') {
    badgeClass = 'near';
    label = 'Near Deadline';
    icon = 'bi-clock-history';
  }

  // Calculate relative time string if deadline provided
  let timeStr = '';
  if (deadline) {
    const time = new Date(deadline).getTime();
    if (!isNaN(time)) {
      const diffMs = time - Date.now();
      const diffHours = Math.round(diffMs / (1000 * 60 * 60));
      if (diffMs < 0) {
        timeStr = ` (${Math.abs(diffHours)}h overdue)`;
      } else {
        timeStr = ` (Due in ${diffHours}h)`;
      }
    }
  }

  return (
    <span className={`sla-tag ${badgeClass}`} title={deadline ? `Deadline: ${new Date(deadline).toLocaleString()}` : ''}>
      <i className={`bi ${icon}`}></i>
      <span>{label}{timeStr}</span>
    </span>
  );
};

export default SlaBadge;
