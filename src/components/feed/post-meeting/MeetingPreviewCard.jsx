"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { Card, CardHeader, CardContent } from "@/components/ui/card";

import AttendeeAvatarGroup from "./AttendeeAvatarGroup";
import GovernanceAvatarGroups from "@/components/governance/GovernanceAvatarGroups";
import AutoImageCarousel from "@/components/ui/AutoImageCarousel";
import formatDate from "@/utils/date/formatDate";

const meetingStyle = "bg-yellow-50";

export default function MeetingPreviewCard({ meeting }) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handleNavigate = () => {
    router.push(`/post/${meeting.id}`);
  };

  const dateString = meeting.metadata_date || meeting.sort_date;

  const formattedDate = formatDate(dateString, "absolute");

  return (
    <Card
      onClick={handleNavigate}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group cursor-pointer overflow-hidden transition hover:shadow-lg ${meetingStyle}`}
    >
      {/* ================= IMAGE AREA ================= */}
      <div className="relative h-40 overflow-hidden bg-muted">
        {/* IMAGE OR FALLBACK */}
        <motion.div
          animate={{ opacity: isHovered ? 0 : 1 }}
          transition={{ duration: 0.25 }}
          className="absolute inset-0"
        >
          {meeting.attachments?.length > 0 ? (
            <>
              <AutoImageCarousel attachments={meeting.attachments} />

              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

              {/* TITLE ON IMAGE */}
              <div className="absolute bottom-2 left-2 right-2 line-clamp-2 text-sm font-medium text-white">
                {meeting.summary || "Untitled"}
              </div>

              <div className="absolute right-2 top-2 rounded bg-black/60 px-2 py-1 text-[10px] text-white">
                MEETING
              </div>
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              MEETING
            </div>
          )}
        </motion.div>

        {/* HOVER CONTENT (unchanged) */}
        <motion.div
          initial={false}
          animate={{
            opacity: isHovered ? 1 : 0,
          }}
          transition={{ duration: 0.25 }}
          className="absolute inset-0 flex flex-col bg-background p-3"
        >
          <div className="line-clamp-2 text-sm font-semibold">
            {meeting.summary || "Untitled"}
          </div>

          <div className="mt-1 overflow-hidden text-xs text-muted-foreground">
            <div className="line-clamp-6">{meeting.details}</div>
          </div>
        </motion.div>
      </div>

      {/* ================= CONTENT ================= */}
      <motion.div
        animate={{ opacity: isHovered ? 0 : 1 }}
        transition={{ duration: 0.2 }}
      >
        <CardHeader className="space-y-1">
          {(meeting.details || meeting.summary) && (
            <div className="line-clamp-2 text-xs text-muted-foreground">
              {meeting.details || meeting.summary}
            </div>
          )}
        </CardHeader>
      </motion.div>

      {/* ================= FOOTER ================= */}
      <CardContent className="flex items-center justify-between">
        <AttendeeAvatarGroup attendees={meeting.attendees || []} />

        {meeting.governance_entities?.length > 0 && (
          <GovernanceAvatarGroups entities={meeting.governance_entities} />
        )}
      </CardContent>

      {/* DATE */}
      <div className="px-4 pb-3 text-xs text-muted-foreground">
        {formattedDate}
      </div>
    </Card>
  );
}
