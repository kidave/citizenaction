import Feed from "@/components/feed/Feed";
import RightSidebar from "@/components/layout/RightSidebar";
import CreatePostTrigger from "@/components/feed/CreatePostTrigger";

export default function Home() {
  return (
    <div className="mx-auto flex w-full min-w-0 max-w-[1200px] justify-center px-0 sm:px-4">
      {/* FEED */}
      <div className="w-full min-w-0 max-w-[680px] pt-0 sm:pt-4">
        <CreatePostTrigger />

        <Feed />
      </div>

      {/* RIGHT SIDEBAR */}
      <div className="ml-4 hidden w-[320px] xl:block">
        <RightSidebar />
      </div>
    </div>
  );
}
