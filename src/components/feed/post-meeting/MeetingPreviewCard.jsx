"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { Card, CardHeader, CardContent } from "@/components/ui/card";

import AttendeeAvatarGroup from "./AttendeeAvatarGroup";
import GovernanceAvatarGroups from "@/components/governance/GovernanceAvatarGroups";
import AutoImageCarousel from "@/components/ui/AutoImageCarousel";
import formatDate from "@/utils/date/formatDate";

const meetingStyle =
  "border-l-4 border-yellow-500 bg-yellow-50/30";

export default function MeetingPreviewCard({ meeting }) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handleNavigate = () => {
    router.push(`/post/${meeting.id}`);
  };

  const dateString =
    meeting.metadata_date || meeting.sort_date;

  const formattedDate = formatDate(
    dateString,
    "absolute"
  );

  return (
    <Card
      onClick={handleNavigate}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group cursor-pointer overflow-hidden hover:shadow-lg transition ${meetingStyle}`}
    >
      {/* ================= IMAGE AREA ================= */}
      <div className="relative h-40 bg-muted overflow-hidden">

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
              <div className="absolute bottom-2 left-2 right-2 text-white text-sm font-medium line-clamp-2">
                {meeting.summary || "Untitled"}
              </div>

              <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded">
                MEETING
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
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
          className="absolute inset-0 p-3 flex flex-col bg-background"
        >
          <div className="text-sm font-semibold line-clamp-2">
            {meeting.summary || "Untitled"}
          </div>

          <div className="text-xs text-muted-foreground mt-1 overflow-hidden">
            <div className="line-clamp-6">
              {meeting.details}
            </div>
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
            <div className="text-xs text-muted-foreground line-clamp-2">
              {meeting.details || meeting.summary}
            </div>
          )}
        </CardHeader>
      </motion.div>

      {/* ================= FOOTER ================= */}
      <CardContent className="flex items-center justify-between">
        <AttendeeAvatarGroup
          attendees={meeting.attendees || []}
        />

        {meeting.governance_entities?.length > 0 && (
          <GovernanceAvatarGroups
            entities={meeting.governance_entities}
          />
        )}
      </CardContent>

      {/* DATE */}
      <div className="px-4 pb-3 text-xs text-muted-foreground">
        {formattedDate}
      </div>
    </Card>
  );
}