import { fn } from "storybook/test";

import GovernancePageHeader from "./GovernancePageHeader";

const meta = {
  title: "Governance/Navigation/Page Header",
  component: GovernancePageHeader,
  args: {
    items: [
      { label: "Organizations", href: "/governance" },
      { label: "City Council" },
    ],
    title: "City Council",
    primaryActions: [
      {
        label: "Add organization",
        onClick: fn(),
      },
    ],
  },
  parameters: {
    nextjs: {
      router: {
        pathname: "/governance",
        asPath: "/governance",
        query: {},
      },
    },
  },
};

export default meta;

export const Organization = {};

export const People = {
  args: {
    items: [{ label: "People" }],
    title: "People",
    primaryActions: [],
  },
};
