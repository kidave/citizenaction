"use client";

import { useRouter } from "next/navigation";
import { useClubMeetings } from "@/hooks/useClubMeetings";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { UserIdentity } from "@/components/profile/UserIdentity";

export default function ClubMeetingTab({ clubId }) {
  const router = useRouter();

  const { data: meetings = [], isLoading } = useClubMeetings({
    clubId,
    enabled: !!clubId,
  });

  const handleNavigate = (id) => {
    router.push(`/meeting/${id}`);
  };

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground">
        Loading meetings...
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
        <Card
          key={meeting.id}
          className="transition"
        >

          {/* Header clickable like posts */}
          <CardHeader
            className="cursor-pointer"
            onClick={() => handleNavigate(meeting.id)}
          >
            <CardTitle className="flex items-center justify-between">
              {meeting.title}

              <Badge variant="secondary">
                {new Date(meeting.date || meeting.meeting_date).toLocaleDateString()}
              </Badge>
            </CardTitle>

            {meeting.summary && (
              <CardDescription>
                {meeting.summary}
              </CardDescription>
            )}

            {meeting.attendees?.length > 0 && (
              <div className="text-xs text-muted-foreground">
                {meeting.attendees.length} attendees
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-6">

            {meeting.action_items?.length > 0 && (
              <div>

                <h4 className="text-sm font-medium mb-2">
                  Action Items
                </h4>

                <div className="space-y-3">

                  {meeting.action_items.map((item, i) => (
                    <div
                      key={i}
                      className="border rounded-md p-3 text-sm space-y-2"
                    >

                      <UserIdentity
                        username={item.username}
                        name={item.name}
                        avatar={item.avatar}
                      />

                      {Array.isArray(item.actions) &&
                        item.actions.map((a, j) => (
                          <div
                            key={j}
                            className="text-muted-foreground pl-6"
                          >
                            • {a}
                          </div>
                        ))}

                    </div>
                  ))}

                </div>

              </div>
            )}

          </CardContent>

        </Card>
      ))}
    </div>
  );
}