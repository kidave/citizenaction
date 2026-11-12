import ActivityPreviewCard from "./ActivityPreviewCard";
import { expect, userEvent, within } from "storybook/test";

const meta = {
  title: "Activity/Activity Preview Card",
  component: ActivityPreviewCard,
  parameters: {
    layout: "centered",
  },
  args: {
    post: {
      id: "storybook-community-update",
      title: "A safer crossing for the neighborhood",
      content:
        "Residents shared their feedback on improving pedestrian access near the local school.",
      author_name: "Aarav Kulkarni",
      author_avatar: "",
      start_at: "2025-04-15T10:00:00.000Z",
      attachments: [],
      governance: [],
    },
  },
};

export default meta;

export const Default = {};

export const OpensPostPreview = {
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector(".group.relative.cursor-pointer");
    await expect(card).not.toBeNull();
    await userEvent.click(card);
    await expect(
      within(document.body).getByRole("dialog", {
        name: "A safer crossing for the neighborhood preview",
      }),
    ).toBeInTheDocument();
  },
};

export const MapPreview = {
  args: {
    variant: "map",
  },
};
