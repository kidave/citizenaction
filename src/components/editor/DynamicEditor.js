import dynamic from "next/dynamic";

const DynamicEditor = dynamic(
  () => import("./EditorContent"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[240px] w-full animate-pulse rounded-md bg-muted" />
    ),
  },
);

export default DynamicEditor;
