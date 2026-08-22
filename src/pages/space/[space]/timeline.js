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
import BackButton from "@/components/ui/back-button";
import PageHeaderSkeleton from "@/components/skeletons/PageHeaderSkeleton";

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

function getImage(event) {
  return safeArray(event.attachments).find((item) => item?.mime_type?.startsWith("image/"))?.public_url;
}

function pickVariant(event, items) {
  const key = String(event.event_id || event.post_id || event.title || "timeline");
  let hash = 0;
  for (let index = 0; index < key.length; index += 1) hash = (hash * 31 + key.charCodeAt(index)) >>> 0;
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
  const phrase = pickVariant(event, GOVERNANCE_TEXT[type] || GOVERNANCE_TEXT.authority);
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

  return `${actor} worked ${phrase} ${name}.`;
}

function GovernanceRow({ event, light = false }) {
  const governance = safeArray(event.governance_entities);
  if (!governance.length) return null;

  return (
    <div className={`mt-5 flex flex-wrap items-center gap-2 ${light ? "text-white/80" : "text-muted-foreground"}`}>
      {governance.slice(0, 4).map((item) => (
        <div
          key={item.id}
          className={`flex items-center gap-2 rounded-full border px-2.5 py-1.5 backdrop-blur ${
            light ? "border-white/15 bg-white/5" : "border-border bg-background/70"
          }`}
        >
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

function MemberIdentity({ event, light = false }) {
  if (event.event_type !== "member_joined" || !event.member_user_id) return null;

  return (
    <div className={`mt-4 flex items-center gap-2 ${light ? "text-white/85" : "text-foreground"}`}>
      <Avatar className={`h-8 w-8 border ${light ? "border-white/20" : "border-border"}`}>
        <AvatarImage src={event.actor_avatar} alt={event.actor_name || ""} />
        <AvatarFallback>{event.actor_name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <div className="truncate text-sm font-medium">{event.actor_name || "New member"}</div>
        <div className={`text-[11px] ${light ? "text-white/55" : "text-muted-foreground"}`}>{event.role || "Member"}</div>
      </div>
    </div>
  );
}

function EventDetail({ event, teamName }) {
  const image = getImage(event);
  const links = safeArray(event.links);
  const governanceCopy = governanceSentence(event, teamName);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="absolute inset-x-4 bottom-4 z-20 sm:inset-x-8 sm:bottom-8"
    >
      <div className="mx-auto max-w-4xl rounded-[28px] border border-white/15 bg-black/55 p-5 text-white shadow-2xl backdrop-blur-xl sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-white/60">
              {format(new Date(event.occurred_at), "d MMMM yyyy")}
            </div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-4xl">{event.title}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75 sm:text-base">
              {event.description || naturalLabel(event)}
            </p>
            <MemberIdentity event={event} light />
            {governanceCopy ? <p className="mt-3 max-w-2xl text-sm text-white/60">{governanceCopy}</p> : null}
          </div>

          {event.actor_name && event.event_type !== "member_joined" ? (
            <div className="flex shrink-0 items-center gap-2 text-sm text-white/80">
              <Avatar className="h-8 w-8 border border-white/20">
                <AvatarImage src={event.actor_avatar} alt="" />
                <AvatarFallback>{event.actor_name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span>{event.actor_name}</span>
            </div>
          ) : null}
        </div>

        <GovernanceRow event={event} light />

        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-white/70">
          {links.slice(0, 2).map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 transition hover:bg-white/10"
            >
              {link.hostname || "Source"}
              <ArrowUpRight className="h-3 w-3" />
            </a>
          ))}
        </div>

        {image ? (
          <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
            <img src={image} alt="" className="max-h-56 w-full object-cover" />
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}

export default function SpaceTimelinePage() {
  const router = useRouter();
  const railRef = useRef(null);
  const { space: slug } = router.query;
  const { data: space, isLoading, error } = useSpaces({ slug, enabled: !!slug });
  const { data: timeline = [], isLoading: timelineLoading } = useSpaceTimeline(space?.id);

  const [activeId, setActiveId] = useState(null);
  const [filter, setFilter] = useState("all");

  const filteredEvents = useMemo(
    () => timeline.filter((event) => filter === "all" || event.event_type === filter),
    [timeline, filter],
  );

  const years = useMemo(
    () => Array.from(new Set(filteredEvents.map((event) => new Date(event.occurred_at).getFullYear()))).sort((a, b) => a - b),
    [filteredEvents],
  );

  const activeEvent = filteredEvents.find((event) => event.event_id === activeId) || null;
  const teamName = space?.name ? `${space.name} team` : "The team";

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return undefined;

    const handleWheel = (event) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX) || Math.abs(event.deltaY) < 2) return;
      const atStart = rail.scrollLeft <= 0 && event.deltaY < 0;
      const atEnd = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 1 && event.deltaY > 0;
      if (atStart || atEnd) return;
      event.preventDefault();
      rail.scrollLeft += event.deltaY;
    };

    rail.addEventListener("wheel", handleWheel, { passive: false });
    return () => rail.removeEventListener("wheel", handleWheel);
  }, []);

  const jump = (direction) => {
    railRef.current?.scrollBy({ left: direction * Math.max(window.innerWidth * 0.72, 460), behavior: "smooth" });
  };

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
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: `linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)`, backgroundSize: "64px 64px" }} />
      </div>

      <div className="relative z-10 flex min-h-dvh flex-col">
        <header className="flex items-center gap-3 border-b border-border/70 px-4 py-3 sm:px-6 lg:px-8">
          <BackButton />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{space.name}</div>
            <div className="text-xs text-muted-foreground">The story so far</div>
          </div>
          <Button variant="ghost" asChild className="rounded-full"><Link href={`/space/${space.slug}`}>Back to {space.name}</Link></Button>
        </header>

        <main className="flex min-h-0 flex-1 flex-col">
          <section className="mx-auto w-full max-w-7xl px-5 pb-8 pt-10 sm:px-8 sm:pt-16 lg:px-12">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-4xl">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground"><History className="h-3.5 w-3.5" />The story so far</div>
                <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-7xl lg:text-8xl">{space.name}</h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">A visual record of the people, places and moments that shaped the {space.name} team.</p>
              </div>
              <div className="flex shrink-0 items-center gap-2"><Button variant="outline" size="icon" className="rounded-full" onClick={() => jump(-1)}><ArrowLeft className="h-4 w-4" /></Button><Button variant="outline" size="icon" className="rounded-full" onClick={() => jump(1)}><ArrowRight className="h-4 w-4" /></Button></div>
            </div>

            <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {years.map((year) => (
                  <button key={year} type="button" onClick={() => railRef.current?.querySelector(`[data-year="${year}"]`)?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" })} className="rounded-full border border-border bg-background/70 px-4 py-2 text-xs font-medium text-muted-foreground transition hover:border-foreground/20 hover:text-foreground">{year}</button>
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

          <section className="relative flex-1 pb-12">
            <div ref={railRef} className="scrollbar-hide flex h-[58vh] min-h-[430px] snap-x items-center gap-8 overflow-x-auto overflow-y-hidden px-[8vw] py-10">
              {filteredEvents.map((event, index) => {
                const image = getImage(event);
                const year = new Date(event.occurred_at).getFullYear();
                const selected = activeId === event.event_id;
                const governanceCopy = governanceSentence(event, teamName);
                return (
                  <motion.button key={event.event_id} type="button" data-year={year} onClick={() => setActiveId((current) => (current === event.event_id ? null : event.event_id))} className="group relative h-[360px] w-[280px] shrink-0 snap-center overflow-hidden rounded-[30px] border border-border/70 bg-muted text-left shadow-sm transition focus:outline-none focus:ring-2 focus:ring-primary sm:h-[390px] sm:w-[310px] lg:w-[330px]" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5, delay: Math.min(index * 0.025, 0.18) }}>
                    {image ? <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.035]" /> : <div className="absolute inset-0 bg-gradient-to-br from-muted via-background to-muted-foreground/10" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent opacity-80 transition duration-500 group-hover:from-black/70" />
                    <div className="absolute left-5 top-5 rounded-full bg-black/35 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-white backdrop-blur">{format(new Date(event.occurred_at), "yyyy")}</div>

                    {event.event_type === "member_joined" && event.actor_name ? (
                      <div className="absolute right-5 top-5 flex items-center gap-2 rounded-full bg-black/35 px-2 py-1.5 text-white backdrop-blur">
                        <Avatar className="h-7 w-7 border border-white/25"><AvatarImage src={event.actor_avatar} alt={event.actor_name} /><AvatarFallback>{event.actor_name.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
                        <span className="max-w-24 truncate text-[10px] font-medium">{event.actor_name}</span>
                      </div>
                    ) : safeArray(event.governance_entities).length ? (
                      <div className="absolute right-5 top-5 flex -space-x-1.5">{safeArray(event.governance_entities).slice(0, 3).map((item) => item.image_url ? <img key={item.id} src={item.image_url} alt="" className="h-7 w-7 rounded-full border-2 border-black/30 bg-white/90 object-contain" /> : <div key={item.id} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-black/20 bg-white/90 text-[9px] font-semibold text-foreground">{(item.short_name || item.label || "G").charAt(0)}</div>)}</div>
                    ) : null}

                    <div className="absolute inset-x-5 bottom-5 text-white transition duration-300 group-hover:translate-y-[-4px]">
                      <div className="text-xs font-medium uppercase tracking-[0.16em] text-white/70">{pickVariant(event, NATURAL_TEXT[event.event_type] || NATURAL_TEXT.post)}</div>
                      <div className="mt-2 line-clamp-2 text-xl font-semibold leading-tight">{event.title}</div>
                      <div className="mt-2 max-h-0 overflow-hidden text-sm leading-6 text-white/75 opacity-0 transition-all duration-300 group-hover:max-h-20 group-hover:opacity-100">{event.description || naturalLabel(event)}</div>
                      {governanceCopy ? <div className="mt-2 max-h-0 overflow-hidden text-xs leading-5 text-white/65 opacity-0 transition-all duration-300 group-hover:max-h-16 group-hover:opacity-100">{governanceCopy}</div> : null}
                      {event.event_type === "member_joined" ? <MemberIdentity event={event} light /> : null}
                    </div>

                    {selected ? <div className="absolute right-5 bottom-5 rounded-full bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-black shadow-lg">Selected</div> : null}
                  </motion.button>
                );
              })}
            </div>
            <div className="pointer-events-none absolute left-[8vw] right-[8vw] top-1/2 hidden h-px -translate-y-1/2 bg-border/70 lg:block" />
            <AnimatePresence>{activeEvent ? <EventDetail key={activeEvent.event_id} event={activeEvent} teamName={teamName} /> : null}</AnimatePresence>
          </section>
        </main>
      </div>
    </div>
  );
}
