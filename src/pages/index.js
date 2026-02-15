import Feed from "@/components/layout/Feed";
import RightSidebar from "@/components/layout/RightSidebar";
import CreatePostTrigger from "@/components/feed/CreatePostTrigger";

export default function Home() {
  return (
    <div className="flex justify-center w-full min-h-screen">
      {/* CENTERED CONTENT AREA WITH FIXED WIDTH */}
      <div className="flex w-full max-w-[1200px] px-4">
        
        {/* CENTERED CONTENT WRAPPER */}
        <div className="flex w-full justify-center">
          
          {/* FEED - FIXED WIDTH */}
          <div className="w-full max-w-[680px] pt-4">  
            <CreatePostTrigger />          
            {/* FEED CONTENT */}
            <Feed />
          </div>
          
          {/* RIGHT SIDEBAR - FIXED WIDTH, ONLY ON LARGE SCREENS */}
          <div className="hidden xl:block w-[320px] ml-4">
            <RightSidebar />
          </div>
          
        </div>
        
      </div>
    </div>
  );
}