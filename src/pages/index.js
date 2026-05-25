import Feed from "@/components/feed/Feed";
import RightSidebar from "@/components/layout/RightSidebar";
import CreatePostTrigger from "@/components/feed/CreatePostTrigger";

export default function Home() {
  return (
    <div
      className="
        mx-auto
        flex
        w-full
        max-w-[1200px]
        min-w-0
        justify-center
        px-2
        sm:px-4
      "
    >
      {/* FEED */}
      <div
        className="
          w-full
          max-w-[680px]
          min-w-0
          pt-0
          sm:pt-4
        "
      >
        <CreatePostTrigger />

        <Feed />
      </div>

      {/* RIGHT SIDEBAR */}
      <div
        className="
          ml-4
          hidden
          w-[320px]
          xl:block
        "
      >
        <RightSidebar />
      </div>
    </div>
  );
}