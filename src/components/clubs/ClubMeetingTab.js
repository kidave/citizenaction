import { useClubMeetings } from "@/hooks/useClubMeetings";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export default function ClubMeetingTab({ clubId }) {
  const { data: meetings = [], isLoading } = useClubMeetings({
    clubId,
    enabled: !!clubId,
  });

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading meetings...</div>;
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
        <Card key={meeting.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {meeting.title}

              <Badge variant="secondary">
                {new Date(meeting.meeting_date).toLocaleDateString()}
              </Badge>
            </CardTitle>

            {meeting.summary && (
              <CardDescription>{meeting.summary}</CardDescription>
            )}
          </CardHeader>

          <CardContent className="space-y-6">

            {/* Action Items */}
            {meeting.action_items?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">
                  Action Items
                </h4>

                <div className="space-y-3">
                  {meeting.action_items.map((item, i) => (
                    <div
                      key={i}
                      className="border rounded-md p-3 text-sm space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        <Image
                          src={item.avatar_url || "/user1.png"}
                          width={24}
                          height={24}
                          className="rounded-full"
                          alt=""
                        />

                        <span className="font-medium">
                          {item.assignee_name}
                        </span>

                      </div>

                      {Array.isArray(item.actions) &&
                        item.actions.map((a, j) => (
                          <div
                            key={j}
                            className="text-muted-foreground"
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