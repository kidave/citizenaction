import { fn, expect, userEvent, within } from "storybook/test";

import LinkManager from "./LinkManager";

const meta = {
  title: "UI Primitives/Forms/Link Manager",
  component: LinkManager,
  args: {
    value: [],
    onChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        component:
          "Link resolution and metadata lookups use the Storybook Supabase mock; no production API is called.",
      },
    },
  },
};

export default meta;

export const Empty = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Manage links" }));
    within(document.body).getByRole("dialog", {
      name: "Add links",
    });
    await expect(
      within(document.body).getByText("No links added yet."),
    ).toBeInTheDocument();
  },
};

export const AddLink = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Manage links" }));
    await userEvent.type(
      within(document.body).getByPlaceholderText("https://..."),
      "https://citizenaction.example/projects",
    );
    await userEvent.click(within(document.body).getByRole("button", { name: "Add" }));
    await expect(
      within(document.body).getByText("Storybook example link"),
    ).toBeInTheDocument();
    await expect(args.onChange).toHaveBeenCalledOnce();
  },
};
