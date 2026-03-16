import { useRouter } from "next/router";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

import ClubMeetingCard from "@/components/clubs/ClubMeetingCard";
import { useMeeting } from "@/hooks/useMeeting";

export default function SingleMeetingPage() {
  const router = useRouter();
  const { id } = router.query;

  const { data: meeting, isLoading } = useMeeting(id);

  if (isLoading) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Loading meeting...
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Meeting not found
      </div>
    );
  }

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
        <div className="w-full max-w-4xl px-4">

          <ClubMeetingCard
            meeting={meeting}
            forceExpanded={true}
          />

        </div>
      </div>

    </div>
  );
}