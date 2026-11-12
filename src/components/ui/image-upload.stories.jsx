import { expect, fn, userEvent, within } from "storybook/test";

import ImageUpload from "./ImageUpload";

const meta = {
  title: "UI Primitives/Media/Image Upload",
  component: ImageUpload,
  args: {
    bucket: "storybook-assets",
    path: "community-avatar",
    label: "Community avatar",
    helperText: "PNG, JPG or WebP (up to 5 MB)",
    onChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        component:
          "Uploads are isolated to the Storybook Supabase mock; no production storage is contacted.",
      },
    },
  },
};

export default meta;

export const Empty = {};

export const UploadPreview = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const file = new File(["storybook image"], "community.png", {
      type: "image/png",
    });

    await userEvent.upload(canvas.getByLabelText("Community avatar"), file);
    await expect(args.onChange).toHaveBeenCalledOnce();
    await expect(canvas.getByAltText("Preview")).toBeInTheDocument();
  },
};

export const Disabled = {
  args: {
    disabled: true,
  },
};
