import CreatePostWaveAnimation from "./CreatePostWaveAnimation";

const meta = {
  title: "Feed/Composition/Create Post Wave Animation",
  component: CreatePostWaveAnimation,
  parameters: {
    layout: "centered",
  },
};

export default meta;

export const Preview = {
  render: () => (
    <div className="relative h-32 w-[32rem] overflow-hidden rounded-2xl border bg-card p-5">
      <CreatePostWaveAnimation />
      <div className="relative z-10 font-medium">Share a community update</div>
    </div>
  ),
};
