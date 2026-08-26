export const EDITOR_TYPE_CONFIG = {
  action: {
    label: "Action",
    rich: false,
    placeholder: "What happened? What needs to change? Tell people what action is needed.",
  },

  event: {
    label: "Event",
    rich: false,
    placeholder: "What is happening? Add the key details people should know.",
    requiresDateTime: true,
    requiresLocation: true,
  },

  meeting: {
    label: "Minutes of Meeting",
    rich: true,
    placeholder: "Record what was discussed, decided and assigned.",
  },

  update: {
    label: "Announcement",
    rich: true,
    placeholder: "Write the announcement you want people to read.",
  },

  // Kept for existing posts created with the previous report type.
  report: {
    label: "Report",
    rich: true,
    placeholder: "Document the issue, evidence, findings or proposal.",
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
      placeholder: "What happened? What needs to change?",
    }
  );
}
