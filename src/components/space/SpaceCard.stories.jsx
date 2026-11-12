import { fn } from "storybook/test";

import SpaceCard from "./SpaceCard";

const meta = {
  title: "Spaces/Discovery/Space Card",
  component: SpaceCard,
  args: {
    space: {
      id: "community-garden",
      slug: "community-garden",
      name: "Community Garden",
      description:
        "Neighbors working together to create a welcoming shared green space.",
      category_name: "Community project",
    },
    selectable: false,
    selected: false,
    onSelect: fn(),
  },
};

export default meta;

export const LinkedCard = {};

export const SelectedForParticipation = {
  args: {
    selectable: true,
    selected: true,
  },
};

export const Selectable = {
  args: {
    selectable: true,
    selected: false,
  },
};
