"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AutoImageCarousel from "@/components/attachment/AutoImageCarousel";
import { TIMELINE_FALLBACK_IMAGES, getTimelineColor, TIMELINE_NATURAL_TEXT } from "@/config/timeline";

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function pickVariant(event, items) {
  const key = String(event.event_id || event.post_id || event.title || "timeline");
  let hash = 0;
  for (let index = 0; index < key.length; index += 1) hash = (hash * 31 + key.charCodeAt(index)) >>> 0;
  return items[hash % items.length];
}

function getFallbackImage(event) {
  return TIMELINE_FALLBACK_IMAGES[event?.event_type] || TIMELINE_FALLBACK_IMAGES.post;
}

export default function TimelineCard({ event, active, onSelect, monthIndex = 0, orientation = "horizontal", color }) {
  const date = new Date(event.occurred_at);
  const attachments = safeArray(event.attachments).filter((item) => item?.mime_type?.startsWith("image/"));
  const governance = safeArray(event.governance_entities);
  const resolvedColor = color || getTimelineColor(date.getFullYear(), monthIndex);
  const fallback = getFallbackImage(event);
  const naturalItems = TIMELINE_NATURAL_TEXT[event.event_type] || TIMELINE_NATURAL_TEXT.post || ["A moment worth keeping"];
  const natural = pickVariant(event, naturalItems);
  const vertical = orientation === "vertical";

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(event)}
      className={`group relative block h-[230px] w-full max-w-[420px] overflow-hidden rounded-[30px] border bg-background text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary ${vertical ? "sm:max-w-[440px]" : "w-[350px]"}`}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.38 }}
      style={{
        borderColor: active ? resolvedColor.line : "hsl(var(--border))",
        boxShadow: active ? `0 0 0 1px ${resolvedColor.line}, 0 0 28px ${resolvedColor.glow}` : undefined,
      }}
    >
      {attachments.length ? (
        <AutoImageCarousel attachments={attachments} />
      ) : (
        <img src={fallback} alt="" className="absolute inset-0 h-full w-full object-cover" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />

      <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/25 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur">
        {format(date, "d MMM")}
      </div>

      {governance.length ? (
        <div className="absolute right-4 top-4 flex -space-x-1.5">
          {governance.slice(0, 3).map((item) => (
            item.image_url ? (
              <img key={item.id} src={item.image_url} alt="" className="h-7 w-7 rounded-full border-2 border-black/30 bg-white/90 object-contain" />
            ) : (
              <div key={item.id} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-black/20 bg-white/90 text-[9px] font-semibold text-foreground">
                {(item.short_name || item.label || "G").charAt(0)}
              </div>
            )
          ))}
        </div>
      ) : null}

      {event.event_type === "member_joined" ? (
        <div className="absolute bottom-20 left-4 flex items-center gap-2 rounded-full bg-black/35 px-2 py-1.5 text-white backdrop-blur">
          <Avatar className="h-7 w-7 border border-white/20">
            <AvatarImage src={event.actor_avatar} alt={event.actor_name || ""} />
            <AvatarFallback>{event.actor_name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <span className="max-w-[170px] truncate text-xs font-medium">{event.actor_name || "New member"}</span>
        </div>
      ) : null}

      <div className="absolute inset-x-4 bottom-4 text-white">
        <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/70">{natural}</div>
        <div className="mt-1 line-clamp-2 text-lg font-semibold leading-tight">{event.title}</div>
      </div>
    </motion.button>
  );
}
