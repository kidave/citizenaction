import { useRouter } from "next/router";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

import MeetingCard from "@/components/feed/post-meeting/MeetingCard";
import { useMeetings } from "@/hooks/useMeetings";
import MeetingSkeleton from "@/components/skeletons/MeetingSkeleton";

export default function SingleMeetingPage() {
  const router = useRouter();
  const { id } = router.query;

  const { data: meeting, isLoading } = useMeetings({
    meetingId: id,
    enabled: !!id,
  });

  return (
    <div className="flex flex-col w-full min-h-screen mb-12">

      {/* HEADER */}
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
            Meeting
          </span>

        </div>
      </div>

      {/* CONTENT */}
      <div className="flex justify-center w-full py-8">
        <div className="w-full max-w-4xl px-4 space-y-6">

          {isLoading && <MeetingSkeleton />}

          {!isLoading && !meeting && (
            <div className="text-sm text-muted-foreground">
              Meeting not found
            </div>
          )}

          {!isLoading && meeting && (
            <MeetingCard
              meeting={meeting}
              clickable={false}
            />
          )}

        </div>
      </div>

    </div>
  );
}