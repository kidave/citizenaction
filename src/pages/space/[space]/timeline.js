"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { History } from "lucide-react";

import { useSpaces } from "@/hooks/space/useSpaces";
import { useSpaceTimeline } from "@/hooks/space/useSpaceTimeline";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import BackButton from "@/components/ui/back-button";
import PageHeaderSkeleton from "@/components/skeletons/PageHeaderSkeleton";
import AutoImageCarousel from "@/components/attachment/AutoImageCarousel";
import PostLinks from "@/components/feed/post/PostLinks";
import AdaptiveTimelineRail from "@/components/space/timeline/AdaptiveTimelineRail";
import { TIMELINE_NATURAL_TEXT, GOVERNANCE_LANGUAGE } from "@/config/timeline";

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function pickVariant(event, items) {
  const key = String(event.event_id || event.post_id || event.title || "timeline");
  let hash = 0;
  for (let index = 0; index < key.length; index += 1) {
    hash = (hash * 31 + key.charCodeAt(index)) >>> 0;
  }
  return items[hash % items.length];
}

function naturalLabel(event) {
  const items = TIMELINE_NATURAL_TEXT[event.event_type] || TIMELINE_NATURAL_TEXT.post || [];
  return `${pickVariant(event, items)}: ${event.title || "this moment"}.`;
}

function governanceSentence(event, teamName) {
  const governance = safeArray(event.governance_entities);
  if (!governance.length) return null;

  const item = governance[0];
  const name = item.short_name || item.label || "an authority";
  const relationship = String(item.relationship_type || "").toLowerCase();
  const actor = teamName || "The team";

  if (relationship.includes("respons") || relationship.includes("owner") || relationship.includes("jurisdiction")) {
    return `${actor} worked under ${name}.`;
  }

  if (relationship.includes("collabor") || relationship.includes("partner")) {
    return `${actor} worked alongside ${name}.`;
  }

  if (relationship.includes("engag")) {
    return `${actor} was in conversation with ${name}.`;
  }

  const phrases = GOVERNANCE_LANGUAGE[item.entity_type] || GOVERNANCE_LANGUAGE.authority || ["with"];
  return `${actor} worked ${pickVariant(event, phrases)} ${name}.`;
}

function MemberIdentity({ event }) {
  if (event.event_type !== "member_joined") return null;

  return (
    <div className="flex items-center gap-2 text-foreground">
      <Avatar className="h-9 w-9 border border-border">
        <AvatarImage src={event.actor_avatar} alt={event.actor_name || ""} />
        <AvatarFallback>{event.actor_name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <div className="truncate text-sm font-medium">{event.actor_name || "New member"}</div>
        <div className="text-[11px] text-muted-foreground">{event.role || "Member"}</div>
      </div>
    </div>
  );
}

function GovernanceRow({ event }) {
  const governance = safeArray(event.governance_entities);
  if (!governance.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
      {governance.slice(0, 4).map((item) => (
        <div key={item.id} className="flex items-center gap-2 rounded-full border border-border bg-background/70 px-2.5 py-1.5 backdrop-blur">
          {item.image_url ? (
            <img src={item.image_url} alt="" className="h-5 w-5 rounded-full object-contain" />
          ) : (
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[9px] font-semibold">
              {(item.short_name || item.label || "G").charAt(0)}
            </div>
          )}
          <span className="max-w-32 truncate text-[11px] font-medium">{item.short_name || item.label}</span>
        </div>
      ))}
    </div>
  );
}

function EventDialog({ event, teamName, open, onOpenChange }) {
  const imageAttachments = safeArray(event.attachments).filter((item) => item?.mime_type?.startsWith("image/"));
  const links = safeArray(event.links);
  const governanceCopy = governanceSentence(event, teamName);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-4xl overflow-y-auto rounded-[30px] border bg-background p-0">
        <div className="overflow-hidden rounded-[30px]">
          {imageAttachments.length ? (
            <div className="relative h-[260px] overflow-hidden bg-muted sm:h-[380px]">
              <AutoImageCarousel attachments={imageAttachments} />
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute inset-x-6 bottom-5 text-white sm:inset-x-8">
                <DialogTitle className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{event.title}</DialogTitle>
              </div>
            </div>
          ) : null}

          <div className="space-y-5 p-6 sm:p-8">
            {!imageAttachments.length ? (
              <DialogTitle className="text-3xl font-semibold tracking-tight sm:text-4xl">{event.title}</DialogTitle>
            ) : null}

            <DialogDescription className="text-base leading-7 text-muted-foreground">
              {event.description || naturalLabel(event)}
            </DialogDescription>

            {event.event_type === "member_joined" ? <MemberIdentity event={event} /> : event.actor_name ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Avatar className="h-8 w-8 border">
                  <AvatarImage src={event.actor_avatar} alt={event.actor_name} />
                  <AvatarFallback>{event.actor_name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span>{event.actor_name}</span>
              </div>
            ) : null}

            {governanceCopy ? <p className="text-sm leading-6 text-muted-foreground">{governanceCopy}</p> : null}
            <GovernanceRow event={event} />
            {event.address ? <div className="rounded-2xl border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">{event.address}</div> : null}
            <PostLinks links={links} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function SpaceTimelinePage() {
  const router = useRouter();
  const { space: slug } = router.query;

  const { data: space, isLoading, error } = useSpaces({ slug, enabled: !!slug });
  const { data: timeline = [], isLoading: timelineLoading } = useSpaceTimeline(space?.id);

  const [filter, setFilter] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeMonth, setActiveMonth] = useState(null);

  const filteredEvents = useMemo(
    () => timeline.filter((event) => filter === "all" || event.event_type === filter),
    [timeline, filter],
  );

  const years = useMemo(
    () => Array.from(new Set(filteredEvents.map((event) => new Date(event.occurred_at).getFullYear()))).sort((a, b) => a - b),
    [filteredEvents],
  );

  const monthMarkers = useMemo(() => {
    const seen = new Set();
    return filteredEvents.reduce((markers, event, index) => {
      const date = new Date(event.occurred_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (seen.has(key)) return markers;
      seen.add(key);
      markers.push({
        key,
        label: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        year: date.getFullYear(),
        index,
      });
      return markers;
    }, []);
  }, [filteredEvents]);

  const teamName = space?.name ? `${space.name} team` : "The team";

  if (isLoading || timelineLoading) {
    return <div className="min-h-dvh bg-background"><PageHeaderSkeleton /></div>;
  }

  if (error || !space) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-6 text-center">
        <div>
          <h1 className="text-2xl font-semibold">Space not found</h1>
          <p className="mt-2 text-muted-foreground">The requested Space does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div animate={{ x: [-80, 80, -80], y: [20, -30, 20] }} transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }} className="absolute left-[-10%] top-[-5%] h-[520px] w-[520px] rounded-full bg-primary/10 blur-[130px]" />
        <motion.div animate={{ x: [70, -70, 70], y: [0, 50, 0] }} transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-[-10%] right-[-8%] h-[480px] w-[480px] rounded-full bg-primary/5 blur-[130px]" />
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
      </div>

      <div className="relative z-10 flex min-h-dvh flex-col">
        <header className="flex items-center gap-3 border-b border-border/70 px-4 py-3 sm:px-6 lg:px-8">
          <BackButton />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{space.name}</div>
            <div className="text-xs text-muted-foreground">The story so far</div>
          </div>
          <Button variant="ghost" asChild className="rounded-full">
            <Link href={`/space/${space.slug}`}>Back to {space.name}</Link>
          </Button>
        </header>

        <main className="flex min-h-0 flex-1 flex-col">
          <section className="mx-auto w-full max-w-7xl px-5 pb-8 pt-10 sm:px-8 sm:pt-16 lg:px-12">
            <div className="max-w-4xl">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                <History className="h-3.5 w-3.5" />
                The story so far
              </div>
              <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-7xl lg:text-8xl">{space.name}</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                A visual record of the people, places and moments that shaped the {space.name} team.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {years.map((year) => (
                  <span key={year} className="shrink-0 rounded-full border border-border bg-background/70 px-4 py-2 text-xs font-medium text-muted-foreground">
                    {year}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:justify-end">
                {["all", "member_joined", "report", "meeting", "event", "action", "announcement"].map((value) => (
                  <button key={value} type="button" onClick={() => setFilter(value)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition ${filter === value ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                    {value === "all" ? "Everything" : value === "member_joined" ? "People" : value === "announcement" ? "Updates" : value === "report" ? "Reports" : `${value.charAt(0).toUpperCase()}${value.slice(1)}s`}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <AdaptiveTimelineRail
            events={filteredEvents}
            monthMarkers={monthMarkers}
            activeMonth={activeMonth}
            onMonthChange={setActiveMonth}
            onSelectEvent={setSelectedEvent}
          />
        </main>
      </div>

      {selectedEvent ? (
        <EventDialog
          event={selectedEvent}
          teamName={teamName}
          open={!!selectedEvent}
          onOpenChange={(open) => {
            if (!open) setSelectedEvent(null);
          }}
        />
      ) : null}
    </div>
  );
}
