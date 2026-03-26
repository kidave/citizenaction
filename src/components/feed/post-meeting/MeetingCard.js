"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

import { useRouter } from "next/navigation";
import { Row } from "@/components/layout/Row";
import { Inline } from "@/components/layout/Inline";
import { UserIdentity } from "@/components/profile/UserIdentity";
import AttendeeAvatarGroup from "./AttendeeAvatarGroup";

export default function MeetingCard({
  meeting,
  clickable = true,
}) {
  const router = useRouter();

  const handleNavigate = () => {
    if (clickable) {
      router.push(`/meeting/${meeting.id}`);
    }
  };

  return (
    <Card>

      {/* HEADER */}
      <CardHeader
        className={clickable ? "cursor-pointer" : ""}
        onClick={handleNavigate}
      >
        <CardTitle className="hover:underline">
          {meeting.title}
        </CardTitle>

        {meeting.summary && (
          <CardDescription>
            {meeting.summary}
          </CardDescription>
        )}

        {meeting.attendees?.length > 0 && (
          <AttendeeAvatarGroup attendees={meeting.attendees} />
        )}
      </CardHeader>

      {/* CONTENT */}
      <CardContent className="space-y-6">

        {meeting.action_items?.map((item, i) => (
          <div
            key={i}
            className="border rounded-md p-3 text-sm space-y-2"
          >
            <Row className="items-center gap-2 w-fit">
              <UserIdentity
                username={item.username}
                name={item.name || item.assignee_name}
                avatar={item.avatar}
              />
            </Row>

            <Inline className="flex-wrap gap-2">
              {item.actions?.map((a, j) => (
                <div
                  key={j}
                  className="text-muted-foreground"
                >
                  {a}
                </div>
              ))}
            </Inline>

          </div>
        ))}

      </CardContent>

    </Card>
  );
}