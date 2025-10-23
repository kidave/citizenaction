// components/shared/ui/StatusBadge.js
import styles from 'styles/components/feedback/status.module.css';

/**
 * Reusable Status Badge Component
 * 
 * @param {Object} props
 * @param {string} props.status - The status value (pending, approved, rejected, in_progress, etc.)
 * @param {string} [props.variant="badge"] - The variant: "badge" | "status" | "publish" | "inline"
 * @param {string} [props.size="medium"] - The size: "small" | "medium" | "large"
 * @param {boolean} [props.showIcon=false] - Whether to show an icon
 * @param {string} [props.className] - Additional CSS class
 * @param {function} [props.onClick] - Click handler
 * @param {string} [props.customLabel] - Custom label to override default
 */
const StatusBadge = ({ 
  status, 
  variant = "badge", 
  size = "medium",
  showIcon = false,
  className = "",
  onClick,
  customLabel
}) => {
  // Status configuration mapping
  const statusConfig = {
    // Project statuses
    pending: {
      label: "Pending",
      variant: "warning",
      icon: "⏳"
    },
    approved: {
      label: "Approved", 
      variant: "success",
      icon: "✅"
    },
    rejected: {
      label: "Rejected",
      variant: "danger", 
      icon: "❌"
    },
    in_progress: {
      label: "In Progress",
      variant: "info",
      icon: "🔄"
    },
    blocked: {
      label: "Blocked",
      variant: "danger",
      icon: "🚫"
    },
    resolved: {
      label: "Resolved", 
      variant: "success",
      icon: "✅"
    },
    completed: {
      label: "Completed",
      variant: "success", 
      icon: "🎯"
    },
    
    // Availability statuses  
    available: {
      label: "Available",
      variant: "success",
      icon: "✅"
    },
    unavailable: {
      label: "Unavailable",
      variant: "danger",
      icon: "❌"
    },
    
    // Activity statuses
    active: {
      label: "Active",
      variant: "success", 
      icon: "🟢"
    },
    inactive: {
      label: "Inactive",
      variant: "danger",
      icon: "⚫"
    },
    
    // Planning statuses
    planned: {
      label: "Planned",
      variant: "info",
      icon: "📋"
    },
    on_hold: {
      label: "On Hold",
      variant: "warning",
      icon: "⏸️"
    },
    
    // Publish statuses
    published: {
      label: "Published",
      variant: "success",
      icon: "📢"
    },
    draft: {
      label: "Draft", 
      variant: "warning",
      icon: "📝"
    }
  };

  // Get status configuration or default to unknown
  const config = statusConfig[status] || {
    label: customLabel || status || "Unknown",
    variant: "default",
    icon: "❓"
  };

  const displayLabel = customLabel || config.label;

  const baseClass = styles.statusBase;
  const variantClass = styles[`${variant}_${config.variant}`];
  const sizeClass = styles[`size_${size}`];
  const clickableClass = onClick ? styles.clickable : '';

  return (
    <span
      className={`${baseClass} ${variantClass} ${sizeClass} ${clickableClass} ${className}`}
      onClick={onClick}
      title={displayLabel}
    >
      {showIcon && <span className={styles.statusIcon}>{config.icon}</span>}
      <span className={styles.statusLabel}>{displayLabel}</span>
    </span>
  );
};

export default StatusBadge;