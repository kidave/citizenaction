import EditorWarning from "./EditorWarning";

const meta = {
  title: "Editor/Content Blocks/Warning",
  component: EditorWarning,
};

export default meta;

export const PublicNotice = {
  args: {
    data: {
      title: "Public notice",
      message:
        "The consultation period ends on 30 April. Submit your feedback before the closing date.",
    },
  },
};

export const MessageOnly = {
  args: {
    data: {
      message: "Please review the updated project guidelines.",
    },
  },
};
