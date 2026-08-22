"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, History } from "lucide-react";
import { format } from "date-fns";

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

const NATURAL_TEXT = {
  space_created: [
    "This is where the story began",
    "This is where the work started",
    "The first page of the story",
    "The beginning of something local",
    "This is where it all came together",
  ],
  member_joined: [
    "Someone new joined the team",
    "Another person came on board",
    "The team grew a little stronger",
    "A new contributor joined in",
    "Another pair of hands joined the effort",
  ],
  report: [
    "A piece of work took shape",
    "The team moved an idea forward",
    "Something useful came together",
    "The team put its findings on record",
    "The work turned into something concrete",
  ],
  meeting: [
    "The team sat down to work through it",
    "People came together to figure it out",
    "A conversation moved the work forward",
    "The right people got around the table",
    "The team made time to work through the details",
  ],
  event: [
    "The team showed up",
    "The team stepped into the wider conversation",
    "The work met the real world",
    "The team took part in the moment",
    "The team was there for it",
  ],
  action: [
    "Something was done",
    "The team moved from words to action",
    "A small step became a real action",
    "The team followed through",
    "The work moved into the real world",
  ],
  announcement: [
    "Something important was shared",
    "The team had an update to share",
    "A new chapter was announced",
    "The team shared where things stood",
    "A useful update made its way out",
  ],
  post: [
    "A moment worth keeping",
    "Something the team wanted on record",
    "Another piece of the story",
    "A moment from along the way",
    "One more chapter in the journey",
  ],
};

const GOVERNANCE_TEXT = {
  authority: ["under", "with", "in conversation with"],
  department: ["within", "through", "with"],
  official: ["with", "in conversation with", "alongside"],
  organization: ["alongside", "with", "working with"],
  person: ["with", "alongside", "in conversation with"],
};

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
  const title = event.title || "this moment";
  return `${pickVariant(event, NATURAL_TEXT[event.event_type] || NATURAL_TEXT.post)}: ${title}.`;
}

function governanceSentence(event, teamName) {
  const governance = safeArray(event.governance_entities);
  if (!governance.length) return null;

  const item = governance[0];
  const name = item.short_name || item.label || "an authority";
  const type = item.entity_type || "authority";
  const phrase = pickVariant(
    event,
    GOVERNANCE_TEXT[type] || GOVERNANCE_TEXT.authority,
  );
  const relationship = String(item.relationship_type || "").toLowerCase();
  const actor = teamName || "The team";

  if (
    relationship.includes("respons") ||
    relationship.includes("owner") ||
    relationship.includes("jurisdiction")
  ) {
    return `${actor} worked under ${name}.`;
  }

  if (
    relationship.includes("collabor") ||
    relationship.includes("partner")
  ) {
    return `${actor} worked alongside ${name}.`;
  }

  if (relationship.includes("engag")) {
    return `${actor} was in conversation with ${name}.`;
  }

  return `${actor} worked ${phrase} ${name}.`;
}

function MemberIdentity({ event, light = false }) {
  if (event.event_type !== "member_joined") return null;

  return (
    <div
      className={`flex items-center gap-2 ${
        light ? "text-white/85" : "text-foreground"
      }`}
    >
      <Avatar
        className={`h-9 w-9 border ${
          light ? "border-white/20" : "border-border"
        }`}
      >
        <AvatarImage src={event.actor_avatar} alt={event.actor_name || ""} />
        <AvatarFallback>
          {event.actor_name?.charAt(0)?.toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <div className="truncate text-sm font-medium">
          {event.actor_name || "New member"}
        </div>
        <div
          className={`text-[11px] ${
            light ? "text-white/55" : "text-muted-foreground"
          }`}
        >
          {event.role || "Member"}
        </div>
      </div>
    </div>
  );
}

function GovernanceRow({ event, light = false }) {
  const governance = safeArray(event.governance_entities);
  if (!governance.length) return null;

  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${
        light ? "text-white/80" : "text-muted-foreground"
      }`}
    >
      {governance.slice(0, 4).map((item) => (
        <div
          key={item.id}
          className={`flex items-center gap-2 rounded-full border px-2.5 py-1.5 backdrop-blur ${
            light
              ? "border-white/15 bg-white/5"
              : "border-border bg-background/70"
          }`}
        >
          {item.image_url ? (
            <img
              src={item.image_url}
              alt=""
              className="h-5 w-5 rounded-full object-contain"
            />
          ) : (
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[9px] font-semibold">
              {(item.short_name || item.label || "G").charAt(0)}
            </div>
          )}
          <span className="max-w-32 truncate text-[11px] font-medium">
            {item.short_name || item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function EventDialog({ event, teamName, open, onOpenChange }) {
  const imageAttachments = safeArray(event.attachments).filter((item) =>
    item?.mime_type?.startsWith("image/"),
  );
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
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-white/70">
                  {format(new Date(event.occurred_at), "d MMMM yyyy")}
                </div>
                <DialogTitle className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  {event.title}
                </DialogTitle>
              </div>
            </div>
          ) : null}

          <div className="space-y-5 p-6 sm:p-8">
            {!imageAttachments.length ? (
              <div>
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  {format(new Date(event.occurred_at), "d MMMM yyyy")}
                </div>
                <DialogTitle className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {event.title}
                </DialogTitle>
              </div>
            ) : null}

            <DialogDescription className="text-base leading-7 text-muted-foreground">
              {event.description || naturalLabel(event)}
            </DialogDescription>

            {event.event_type === "member_joined" ? (
              <MemberIdentity event={event} />
            ) : event.actor_name ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Avatar className="h-8 w-8 border">
                  <AvatarImage src={event.actor_avatar} alt={event.actor_name} />
                  <AvatarFallback>
                    {event.actor_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>{event.actor_name}</span>
              </div>
            ) : null}

            {governanceCopy ? (
              <p className="text-sm leading-6 text-muted-foreground">
                {governanceCopy}
              </p>
            ) : null}

            <GovernanceRow event={event} />

            {event.address ? (
              <div className="rounded-2xl border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                {event.address}
              </div>
            ) : null}

            {links.length ? (
              <div className="flex flex-wrap gap-2">
                {links.slice(0, 4).map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-2 text-xs font-medium transition hover:bg-muted"
                  >
                    {link.hostname || link.title || "Source"}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function SpaceTimelinePage() {
  const router = useRouter();
  const railRef = useRef(null);
  const { space: slug } = router.query;

  const { data: space, isLoading, error } = useSpaces({
    slug,
    enabled: !!slug,
  });

  const { data: timeline = [], isLoading: timelineLoading } = useSpaceTimeline(
    space?.id,
  );

  const [activeId, setActiveId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const filteredEvents = useMemo(
    () =>
      timeline.filter(
        (event) => filter === "all" || event.event_type === filter,
      ),
    [timeline, filter],
  );

  const years = useMemo(
    () =>
      Array.from(
        new Set(
          filteredEvents.map((event) =>
            new Date(event.occurred_at).getFullYear(),
          ),
        ),
      ).sort((a, b) => a - b),
    [filteredEvents],
  );

  const groupedEvents = useMemo(() => {
    const groups = [];
    filteredEvents.forEach((event) => {
      const date = new Date(event.occurred_at);
      const monthKey = format(date, "yyyy-MM");
      let month = groups.find((group) => group.key === monthKey);
      if (!month) {
        month = {
          key: monthKey,
          label: format(date, "MMMM yyyy"),
          year: date.getFullYear(),
          events: [],
        };
        groups.push(month);
      }
      month.events.push(event);
    });
    return groups;
  }, [filteredEvents]);

  const activeEvent = filteredEvents.find(
    (event) => event.event_id === activeId,
  );
  const teamName = space?.name ? `${space.name} team` : "The team";

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return undefined;

    const handleWheel = (event) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      if (Math.abs(event.deltaY) < 2) return;

      const atStart = rail.scrollLeft <= 0 && event.deltaY < 0;
      const atEnd =
        rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 1 &&
        event.deltaY > 0;

      if (atStart || atEnd) return;

      event.preventDefault();
      rail.scrollLeft += event.deltaY;
    };

    rail.addEventListener("wheel", handleWheel, { passive: false });
    return () => rail.removeEventListener("wheel", handleWheel);
  }, []);

  const jump = (direction) => {
    railRef.current?.scrollBy({
      left: direction * Math.max(window.innerWidth * 0.72, 460),
      behavior: "smooth",
    });
  };

  const jumpToYear = (year) => {
    railRef.current
      ?.querySelector(`[data-year="${year}"]`)
      ?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  const jumpToMonth = (monthKey) => {
    railRef.current
      ?.querySelector(`[data-month="${monthKey}"]`)
      ?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  if (isLoading || timelineLoading) {
    return (
      <div className="min-h-dvh bg-background">
        <PageHeaderSkeleton />
      </div>
    );
  }

  if (error || !space) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-6 text-center">
        <div>
          <h1 className="text-2xl font-semibold">Space not found</h1>
          <p className="mt-2 text-muted-foreground">
            The requested Space does not exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ x: [-80, 80, -80], y: [20, -30, 20] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[-10%] top-[-5%] h-[520px] w-[520px] rounded-full bg-primary/10 blur-[130px]"
        />
        <motion.div
          animate={{ x: [70, -70, 70], y: [0, 50, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-10%] right-[-8%] h-[480px] w-[480px] rounded-full bg-primary/5 blur-[130px]"
        />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
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
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-4xl">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  <History className="h-3.5 w-3.5" />
                  The story so far
                </div>
                <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-7xl lg:text-8xl">
                  {space.name}
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                  A visual record of the people, places and moments that shaped the {space.name} team.
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  onClick={() => jump(-1)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  onClick={() => jump(1)}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {years.map((year) => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => jumpToYear(year)}
                    className="rounded-full border border-border bg-background/70 px-4 py-2 text-xs font-medium text-muted-foreground transition hover:border-foreground/20 hover:text-foreground"
                  >
                    {year}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:justify-end">
                {[
                  "all",
                  "member_joined",
                  "report",
                  "meeting",
                  "event",
                  "action",
                  "announcement",
                ].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setFilter(value);
                      setActiveId(null);
                    }}
                    className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition ${
                      filter === value
                        ? "bg-foreground text-background"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {value === "all"
                      ? "Everything"
                      : value === "member_joined"
                        ? "People"
                        : value === "announcement"
                          ? "Updates"
                          : value === "report"
                            ? "Reports"
                            : `${value.charAt(0).toUpperCase()}${value.slice(1)}s`}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="relative flex-1 pb-12">
            <div className="pointer-events-none absolute inset-x-0 top-1/2 hidden h-px bg-border/40 lg:block" />

            <div
              ref={railRef}
              className="scrollbar-hide relative flex h-[64vh] min-h-[520px] snap-x items-center gap-12 overflow-x-auto overflow-y-hidden px-[8vw] py-10"
            >
              {groupedEvents.map((month, monthIndex) => (
                <div
                  key={month.key}
                  data-month={month.key}
                  data-year={month.year}
                  className="relative flex h-full shrink-0 items-center"
                >
                  <div className="relative flex h-full w-[390px] flex-col justify-between sm:w-[440px] lg:w-[480px]">
                    <div className="flex items-center gap-3 pb-3">
                      <div className="h-2.5 w-2.5 rounded-full bg-foreground shadow-[0_0_0_7px_hsl(var(--background))]" />
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        {month.label}
                      </div>
                    </div>

                    <div className="absolute bottom-1/2 left-0 top-1/2 hidden w-px -translate-x-1/2 bg-border lg:block" />

                    <div className="grid h-[calc(100%-36px)] grid-rows-2 gap-7">
                      {month.events.map((event, eventIndex) => {
                        const isTop = (monthIndex + eventIndex) % 2 === 0;
                        const imageAttachments = safeArray(event.attachments).filter((item) =>
                          item?.mime_type?.startsWith("image/"),
                        );
                        const governance = safeArray(event.governance_entities);
                        const selected = activeId === event.event_id;

                        return (
                          <div
                            key={event.event_id}
                            className={`flex ${
                              isTop ? "items-end pb-3" : "items-start pt-3"
                            } ${eventIndex % 2 === 1 ? "justify-end" : "justify-start"}`}
                          >
                            <motion.button
                              type="button"
                              onClick={() => {
                                setActiveId(event.event_id);
                                setSelectedEvent(event);
                              }}
                              className={`group relative h-[220px] w-[300px] overflow-hidden rounded-[30px] border border-border/70 bg-muted text-left shadow-sm transition focus:outline-none focus:ring-2 focus:ring-primary sm:h-[230px] sm:w-[330px] ${
                                selected ? "ring-2 ring-primary/50" : ""
                              }`}
                              initial={{ opacity: 0, y: isTop ? 18 : -18 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true, amount: 0.2 }}
                              transition={{ duration: 0.45, delay: Math.min(eventIndex * 0.04, 0.16) }}
                            >
                              {imageAttachments.length ? (
                                <AutoImageCarousel attachments={imageAttachments} />
                              ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-muted via-background to-muted-foreground/10" />
                              )}

                              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

                              <div className="absolute left-4 top-4 rounded-full bg-black/35 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-white backdrop-blur">
                                {format(new Date(event.occurred_at), "d MMM")}
                              </div>

                              {event.event_type === "member_joined" && event.actor_avatar ? (
                                <Avatar className="absolute right-4 top-4 h-9 w-9 border-2 border-white/80 shadow-lg">
                                  <AvatarImage src={event.actor_avatar} alt={event.actor_name || ""} />
                                  <AvatarFallback>{event.actor_name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
                                </Avatar>
                              ) : null}

                              {governance.length ? (
                                <div className="absolute right-4 top-4 flex -space-x-1.5">
                                  {governance.slice(0, 3).map((item) =>
                                    item.image_url ? (
                                      <img
                                        key={item.id}
                                        src={item.image_url}
                                        alt=""
                                        className="h-7 w-7 rounded-full border-2 border-black/30 bg-white/90 object-contain"
                                      />
                                    ) : (
                                      <div
                                        key={item.id}
                                        className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-black/20 bg-white/90 text-[9px] font-semibold text-foreground"
                                      >
                                        {(item.short_name || item.label || "G").charAt(0)}
                                      </div>
                                    ),
                                  )}
                                </div>
                              ) : null}

                              <div className="absolute inset-x-5 bottom-5 text-white transition duration-300 group-hover:-translate-y-1">
                                <div className="text-xs font-medium uppercase tracking-[0.16em] text-white/70">
                                  {pickVariant(event, NATURAL_TEXT[event.event_type] || NATURAL_TEXT.post)}
                                </div>
                                <div className="mt-2 line-clamp-2 text-lg font-semibold leading-tight">
                                  {event.title}
                                </div>
                                <div className="mt-2 max-h-0 overflow-hidden text-sm leading-5 text-white/75 opacity-0 transition-all duration-300 group-hover:max-h-16 group-hover:opacity-100">
                                  {event.description || naturalLabel(event)}
                                </div>
                              </div>
                            </motion.button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {monthIndex < groupedEvents.length - 1 ? (
                    <div className="ml-10 h-full w-px bg-border/30" />
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

      <AnimatePresence>
        {selectedEvent ? (
          <EventDialog
            event={selectedEvent}
            teamName={teamName}
            open={!!selectedEvent}
            onOpenChange={(open) => {
              if (!open) {
                setSelectedEvent(null);
                setActiveId(null);
              }
            }}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
