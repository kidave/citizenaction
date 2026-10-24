import { fn } from "storybook/test";

import Topbar from "./Topbar";

const meta = {
  title: "Layout/Navigation/Topbar",
  component: Topbar,
  args: {
    items: [
      { label: "Home", href: "/" },
      { label: "Community projects", href: "/projects" },
    ],
    title: "Community projects",
    primaryActions: [
      {
        label: "Create project",
        onClick: fn(),
      },
    ],
    overflowActions: [
      {
        label: "Export list",
        onClick: fn(),
      },
    ],
  },
  parameters: {
    nextjs: {
      router: {
        pathname: "/projects",
        asPath: "/projects",
        query: {},
      },
    },
  },
};

export default meta;

export const Default = {};

export const WithBottomContent = {
  args: {
    bottom: <p className="border-t px-4 py-2 text-sm">Open consultations</p>,
  },
};
