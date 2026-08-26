export const EDITOR_TYPE_CONFIG = {
  action: {
    label: "Action",
    rich: false,
    placeholder:
      "What happened? What needs to change? Tell people what action is needed.",
  },

  event: {
    label: "Event",
    rich: true,
    placeholder: "Describe the event, why it matters and what people should know.",
    requiresDateTime: true,
    requiresLocation: true,
  },

  meeting: {
    label: "Meeting",
    rich: true,
    placeholder: "Record what was discussed, decided and assigned.",
  },

  report: {
    label: "Report",
    rich: true,
    placeholder: "Document the issue, evidence, findings, project or proposal.",
  },

  update: {
    label: "Update",
    rich: true,
    placeholder: "Share an announcement, development or important update.",
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
