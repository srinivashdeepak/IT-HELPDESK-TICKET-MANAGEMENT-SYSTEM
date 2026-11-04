import React from 'react';

const PriorityBadge = ({ priority }) => {
  const getBadgeClass = (p) => {
    switch (p) {
      case 'LOW':
        return 'badge-priority badge-priority-low';
      case 'MEDIUM':
        return 'badge-priority badge-priority-medium';
      case 'HIGH':
        return 'badge-priority badge-priority-high';
      case 'CRITICAL':
        return 'badge-priority badge-priority-critical';
      default:
        return 'badge-priority badge-priority-medium';
    }
  };

  const getIcon = (p) => {
    switch (p) {
      case 'LOW':
        return 'bi-arrow-down-short';
      case 'MEDIUM':
        return 'bi-dash';
      case 'HIGH':
        return 'bi-arrow-up-short';
      case 'CRITICAL':
        return 'bi-exclamation-triangle-fill';
      default:
        return 'bi-dash';
    }
  };

  return (
    <span className={getBadgeClass(priority)}>
      <i className={`bi ${getIcon(priority)}`}></i>
      {priority}
    </span>
  );
};

export default PriorityBadge;
