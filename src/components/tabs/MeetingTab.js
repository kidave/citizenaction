"use client";

import { useMeetings } from "@/hooks/useMeetings";
import MeetingCard from "@/components/feed/post-meeting/MeetingCard";
import MeetingSkeleton from "@/components/skeletons/MeetingSkeleton";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function MeetingTab({ clubId }) {

  const { data: meetings = [], isLoading } = useMeetings({
    clubId,
    enabled: !!clubId,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <MeetingSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!meetings.length) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>No meetings yet</CardTitle>
          <CardDescription>
            Meetings recorded by the club will appear here.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {meetings.map((meeting) => (
        <MeetingCard
          key={meeting.id}
          meeting={meeting}
        />
      ))}
    </div>
  );
}