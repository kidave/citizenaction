import { fn } from "storybook/test";

import EditorDateTime from "./EditorDateTime";

const meta = {
  title: "Editor/Metadata/Action Date",
  component: EditorDateTime,
  args: {
    editor: {
      title: "Community meeting on 14 October 2026",
      content: "Residents will gather at the community hall.",
      start_at: null,
      datePrecision: "date",
      setStartAt: fn(),
      setEndAt: fn(),
      setDatePrecision: fn(),
    },
  },
};

export default meta;

export const SuggestedDate = {};

export const ExistingDate = {
  args: {
    editor: {
      title: "Community meeting",
      content: "",
      start_at: "2026-10-14T12:00:00.000Z",
      datePrecision: "date",
      setStartAt: fn(),
      setEndAt: fn(),
      setDatePrecision: fn(),
    },
  },
};
