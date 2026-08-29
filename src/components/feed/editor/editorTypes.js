export const EDITOR_TYPE_CONFIG = {
  action: {
    label: "Action",
    rich: false,
    placeholder: "Document your action",
  },

  event: {
    label: "Event",
    rich: true,
    placeholder: "Share event details",
    requiresDateTime: true,
    requiresLocation: true,
  },

  meeting: {
    label: "Meeting",
    rich: true,
    placeholder: "Share minutes of meeting",
  },

  report: {
    label: "Report",
    rich: true,
    placeholder: "Add a policy suggestion, project or guidelines",
  },

  update: {
    label: "Update",
    rich: true,
    placeholder: "Share major update or announcement",
  },
};

export const RICH_EDITOR_TYPES = Object.entries(EDITOR_TYPE_CONFIG)
  .filter(([, config]) => config.rich)
  .map(([type]) => type);

export function getEditorTypeConfig(type) {
  return (
    EDITOR_TYPE_CONFIG[type] ?? {
      label: "Action",
      rich: false,
      placeholder: "Document your action",
    }
  );
}
