import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

import { useRouter } from "next/navigation";
import { UserIdentity } from "@/components/profile/UserIdentity";

export default function ClubMeetingCard({ meeting }) {
  const router = useRouter();

  return (
    <Card>

      <CardHeader
        className="cursor-pointer"
        onClick={() => router.push(`/meeting/${meeting.id}`)}
      >
        <CardTitle className="hover:underline">
          {meeting.title}
        </CardTitle>

        {meeting.summary && (
          <CardDescription>
            {meeting.summary}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-6">

        {meeting.action_items?.map((item, i) => (
          <div
            key={i}
            className="border rounded-md p-3 text-sm space-y-2"
          >

            <UserIdentity
              username={item.username}
              name={item.name || item.assignee_name}
              avatar={item.avatar}
            />

            {item.actions?.map((a, j) => (
              <div
                key={j}
                className="text-muted-foreground pl-6"
              >
                • {a}
              </div>
            ))}

          </div>
        ))}

      </CardContent>

    </Card>
  );
}