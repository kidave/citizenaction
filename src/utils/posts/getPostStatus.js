export default function getPostStatus(status) {
  if (!status) return null;

  const statusMap = {
    reported: {
      label: "Reported",
      color: "text-red-600",
    },
    "in-progress": {
      label: "In Progress",
      color: "text-yellow-600",
    },
    resolved: {
      label: "Resolved",
      color: "text-green-600",
    },
    closed: {
      label: "Closed",
      color: "text-muted-foreground",
    },
  };

  return statusMap[status] || {
    label: status,
    color: "text-foreground",
  };
}