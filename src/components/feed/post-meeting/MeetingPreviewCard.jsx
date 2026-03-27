"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import AttendeeAvatarGroup from "./AttendeeAvatarGroup";

export default function MeetingPreviewCard({ meeting }) {
  const router = useRouter();

  const handleNavigate = () => {
    router.push(`/meeting/${meeting.id}`);
  };

  const image =
    meeting.attachments?.[0]?.url ||
    meeting.attachments?.[0];

  return (
    <Card
      onClick={handleNavigate}
      className="group cursor-pointer overflow-hidden hover:shadow-lg transition"
    >
      {/* 🔥 IMAGE */}
      <div className="relative h-40 bg-muted overflow-hidden">
        {image ? (
            <>
            <Image
                src={image}
                alt="meeting"
                fill
                className="object-cover"
            />

            {/* gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

            {/* title on image */}
            <div className="absolute bottom-2 left-2 right-2 text-white text-sm font-medium line-clamp-2">
                {meeting.summary}
            </div>
            </>
        ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
            No image
            </div>
        )}
      </div>

      {/* 🔥 CONTENT */}
      <CardHeader className="space-y-2">
        {meeting.details && (
          <div className="text-sm text-muted-foreground line-clamp-2">
            {meeting.details}
          </div>
        )}
      </CardHeader>

      <CardContent className="flex items-center justify-between">
        <AttendeeAvatarGroup attendees={meeting.attendees} />
      </CardContent>
    </Card>
  );
}