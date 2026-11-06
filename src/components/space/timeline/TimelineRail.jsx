"use client";

import { motion } from "framer-motion";

import { Progress, ProgressIndicator, ProgressTrack } from "@/components/ui/progress";
import { getTimelineColor } from "@/config/timeline";

export default function TimelineRail({ progress = 0, color }) {
  const timelineColor = color || getTimelineColor(0, 0);

  return (
    <Progress value={progress} className="pointer-events-none absolute left-0 right-0 top-1/2 z-0 -translate-y-1/2">
      <ProgressTrack className="h-[3px] bg-muted/90">
        <ProgressIndicator
          className="h-full transition-none"
          style={{
            background: timelineColor.line,
            boxShadow: `0 0 10px ${timelineColor.glow}`,
          }}
        />
      </ProgressTrack>
    </Progress>
  );
}

export function TimelineConnector({ active = false, color, above = true }) {
  const timelineColor = color || getTimelineColor(0, 0);

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 z-[1] w-px -translate-x-1/2"
      style={{
        [above ? "bottom" : "top"]: "50%",
        height: "58px",
        background: active
          ? timelineColor.line
          : "hsl(var(--border))",
        boxShadow: active ? `0 0 10px ${timelineColor.glow}` : undefined,
      }}
      animate={{ opacity: active ? 1 : 0.65 }}
      transition={{ duration: 0.25 }}
    />
  );
}
