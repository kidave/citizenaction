import dynamic from "next/dynamic";

const DynamicLeafletMap = dynamic(
  () => import("@/components/shared/LeafletMap"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full min-h-[280px] w-full animate-pulse rounded-md bg-muted" />
    ),
  },
);

export default DynamicLeafletMap;
