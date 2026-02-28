import { useRouter } from "next/router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import PostCard from "@/components/feed/PostCard";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SinglePostPage() {
  const router = useRouter();
  const { id } = router.query;

  const { data, isLoading } = useQuery({
    queryKey: ["post", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feed_view")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Restore scroll when going back
  useEffect(() => {
    return () => {
      const scroll = sessionStorage.getItem("feed-scroll");
      if (scroll) {
        setTimeout(() => {
          window.scrollTo(0, parseInt(scroll));
        }, 50);
      }
    };
  }, []);

  if (isLoading || !data) return null;

  return (
    <div className="flex flex-col w-full min-h-screen">

      {/* 🔙 Back Button Header */}
      <div className="sticky top-0 z-40 bg-background border-b">
        <div className="flex items-center h-16 px-4 max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <span className="ml-3 font-medium">
            Post
          </span>
        </div>
      </div>

      {/* FULL WIDTH CONTENT */}
      <div className="flex justify-center w-full py-8">
        <div className="w-full max-w-4xl px-4">
          <PostCard
            post={data}
            forceExpanded={true}
          />
        </div>
      </div>
    </div>
  );
}