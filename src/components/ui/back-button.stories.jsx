import BackButton from "./back-button";

const meta = {
  title: "UI Primitives/Navigation/Back Button",
  component: BackButton,
  args: {
    label: "Back to projects",
    fallbackHref: "/projects",
  },
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/projects/consultation",
      },
    },
  },
};

export default meta;

export const Default = {};
