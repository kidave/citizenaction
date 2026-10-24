import PostMetadata from "./PostMetadata";

const meta = {
  title: "Feed/Post Metadata",
  component: PostMetadata,
};

export default meta;

export const DateAndAddress = {
  args: {
    forceExpanded: true,
    post: {
      start_at: "2025-04-15T09:00:00.000Z",
      address: "Dadar West, Mumbai",
      metadata: {
        date_precision: "date",
      },
    },
  },
};

export const MonthPrecision = {
  args: {
    forceExpanded: true,
    post: {
      start_at: "2025-04-01T00:00:00.000Z",
      metadata: {
        date_precision: "month",
      },
    },
  },
};
