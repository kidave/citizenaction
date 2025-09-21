// utils/format.js
export const formatStatus = (status) => {
  if (!status) return '';
  
  const statusMap = {
    pending: 'Pending',
    in_progress: 'In Progress', 
    completed: 'Completed',
    on_hold: 'On Hold',
    cancelled: 'Cancelled'
  };
  
  return statusMap[status] || status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const snakeToCamel = (str) => {
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};