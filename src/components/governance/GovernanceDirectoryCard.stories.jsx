import { fn } from "storybook/test";

import GovernanceDirectoryCard from "./GovernanceDirectoryCard";

const meta = {
  title: "Governance/Directory/Entity Card",
  component: GovernanceDirectoryCard,
  args: {
    entity: {
      id: "city-council",
      name: "City Council",
      type: "council",
    },
    tab: "organizations",
    selectionMode: "checkbox",
    selected: false,
    onSelect: fn(),
  },
};

export default meta;

export const Unselected = {};

export const Selected = {
  args: {
    selected: true,
  },
};

export const Person = {
  args: {
    entity: {
      id: "maya-shah",
      name: "Maya Shah",
      type: "person",
    },
    tab: "people",
    selectionMode: "radio",
    selected: true,
  },
};
