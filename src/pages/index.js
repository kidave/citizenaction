import Feed from "@/components/layout/Feed";
import RightSidebar from "@/components/layout/RightSidebar";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6">

        {/* MAIN FEED */}
        <Feed />

        {/* RIGHT SIDEBAR */}
        <div className="hidden xl:block">
          <RightSidebar />
        </div>

      </div>
    </div>
  );
}
