export const EDITOR_TYPE_CONFIG = {
  action: {
    label: "Action",
    rich: false,
    placeholder: "Document civic initiatives and actions taken.",
  },

  report: {
    label: "Report",
    rich: true,
    placeholder:
      "Document project taken, suggested improvements or policy proposals.",
  },

  update: {
    label: "Update",
    rich: true,
    placeholder: "Document major updates or announcements.",
  },

  event: {
    label: "Event",
    rich: false,
    placeholder: "Post event details and media.",
  },

  meeting: {
    label: "Meeting",
    rich: true,
    placeholder: "Document minutes of meetings with officials.",
  },
};

export const RICH_EDITOR_TYPES = Object.entries(EDITOR_TYPE_CONFIG)
  .filter(([, config]) => config.rich)
  .map(([type]) => type);

export function getEditorTypeConfig(type) {
  return (
    EDITOR_TYPE_CONFIG[type] ?? {
      label: "Post",
      rich: false,
      placeholder: "Write something...",
    }
  );
}
