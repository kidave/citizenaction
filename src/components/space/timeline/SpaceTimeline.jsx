"use client";

import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ArrowLeft, ArrowRight, CalendarDays, ExternalLink, MapPin, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AutoImageCarousel from "@/components/attachment/AutoImageCarousel";
import GovernanceAvatarGroup from "@/components/governance/GovernanceAvatarGroup";

const FILTERS = [
  ["all", "All"],
  ["space_created", "Founded"],
  ["member_joined", "People"],
  ["report", "Reports"],
  ["meeting", "Meetings"],
  ["event", "Events"],
  ["action", "Actions"],
  ["announcement", "Updates"],
];

const EVENT_STYLES = {
  space_created: { accent: "border-primary/40 bg-primary/5", dot: "bg-primary" },
  member_joined: { accent: "border-violet-300/70 bg-violet-50/70 dark:border-violet-800 dark:bg-violet-950/20", dot: "bg-violet-500" },
  report: { accent: "border-blue-300/70 bg-blue-50/70 dark:border-blue-800 dark:bg-blue-950/20", dot: "bg-blue-500" },
  meeting: { accent: "border-amber-300/70 bg-amber-50/70 dark:border-amber-800 dark:bg-amber-950/20", dot: "bg-amber-500" },
  event: { accent: "border-emerald-300/70 bg-emerald-50/70 dark:border-emerald-800 dark:bg-emerald-950/20", dot: "bg-emerald-500" },
  action: { accent: "border-rose-300/70 bg-rose-50/70 dark:border-rose-800 dark:bg-rose-950/20", dot: "bg-rose-500" },
  announcement: { accent: "border-pink-300/70 bg-pink-50/70 dark:border-pink-800 dark:bg-pink-950/20", dot: "bg-pink-500" },
  post: { accent: "border-border bg-card", dot: "bg-muted-foreground" },
};

const safeArray = (value) => (Array.isArray(value) ? value : []);
const getYear = (date) => new Date(date).getFullYear();

function TimelineLinkPreview({ link }) {
  if (!link?.url) return null;

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="group/link mt-3 flex overflow-hidden rounded-2xl border bg-background/80 transition hover:border-foreground/20 hover:shadow-sm"
    >
      {link.image_url ? (
        <div className="h-20 w-24 shrink-0 overflow-hidden bg-muted">
          <img src={link.image_url} alt="" className="h-full w-full object-cover transition duration-300 group-hover/link:scale-105" />
        </div>
      ) : (
        <div className="flex h-20 w-20 shrink-0 items-center justify-center bg-muted">
          {link.icon_url ? <img src={link.icon_url} alt="" className="h-7 w-7 object-contain" /> : <ExternalLink className="h-5 w-5 text-muted-foreground" />}
        </div>
      )}
      <div className="min-w-0 flex-1 p-3">
        <div className="line-clamp-1 text-sm font-medium">{link.title || link.hostname || "External link"}</div>
        {link.description ? <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{link.description}</div> : null}
        {link.hostname ? <div className="mt-1 text-[11px] text-muted-foreground">{link.hostname}</div> : null}
      </div>
      <div className="flex items-center px-3 text-muted-foreground"><ExternalLink className="h-4 w-4" /></div>
    </a>
  );
}

function TimelineEventCard({ event, index }) {
  const style = EVENT_STYLES[event.event_type] || EVENT_STYLES.post;
  const attachments = safeArray(event.attachments);
  const links = safeArray(event.links);
  const governance = safeArray(event.governance_entities);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.025, 0.15) }}
      className="relative shrink-0 snap-center lg:w-[28rem]"
    >
      <div className="mb-3 flex items-center gap-3 px-1">
        <div className={`h-2.5 w-2.5 rounded-full ${style.dot} shadow-[0_0_0_5px_hsl(var(--background))]`} />
        <div className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{event.label}</div>
      </div>

      <Card className={`group overflow-hidden rounded-[28px] border p-0 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg ${style.accent}`}>
        {attachments.length ? (
          <div className="relative h-52 overflow-hidden bg-muted">
            <AutoImageCarousel attachments={attachments} />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3 text-white">
              <div className="min-w-0">
                <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/75">{format(new Date(event.occurred_at), "d MMMM yyyy")}</div>
                <div className="mt-1 line-clamp-2 text-lg font-semibold leading-tight">{event.title}</div>
              </div>
              <Badge className="shrink-0 border-0 bg-black/45 text-[10px] text-white backdrop-blur">{event.event_type === "member_joined" ? "PEOPLE" : event.event_type.toUpperCase()}</Badge>
            </div>
          </div>
        ) : (
          <div className="px-5 pt-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">{format(new Date(event.occurred_at), "d MMMM yyyy")}</div>
                <h3 className="mt-2 line-clamp-2 text-xl font-semibold tracking-tight">{event.title}</h3>
              </div>
              <Badge variant="secondary" className="shrink-0">{event.event_type === "member_joined" ? "People" : event.label}</Badge>
            </div>
          </div>
        )}

        <div className="space-y-4 p-5">
          {event.description ? <p className="line-clamp-4 text-sm leading-6 text-muted-foreground">{event.description}</p> : null}

          {event.event_type === "member_joined" && event.actor_name ? (
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10"><AvatarImage src={event.actor_avatar} alt="" /><AvatarFallback>{event.actor_name.charAt(0)}</AvatarFallback></Avatar>
              <div className="min-w-0"><div className="font-medium">{event.actor_name}</div><div className="text-xs text-muted-foreground">{event.role || "Member"}</div></div>
            </div>
          ) : null}

          {event.address ? <div className="flex items-start gap-2 text-xs text-muted-foreground"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" /><span className="line-clamp-2">{event.address}</span></div> : null}

          {governance.length ? <div className="flex items-center justify-between gap-3 rounded-2xl border bg-background/60 px-3 py-2"><span className="text-xs font-medium text-muted-foreground">Engaged with</span><GovernanceAvatarGroup authorities={governance} /></div> : null}

          {links.slice(0, 2).map((link) => <TimelineLinkPreview key={link.id} link={link} />)}

          <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="flex min-w-0 items-center gap-2">
              {event.actor_name ? <><Avatar className="h-6 w-6"><AvatarImage src={event.actor_avatar} alt="" /><AvatarFallback>{event.actor_name.charAt(0)}</AvatarFallback></Avatar><span className="max-w-32 truncate">{event.actor_name}</span></> : null}
            </div>
            {event.event_type === "space_created" ? <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> Founded</span> : event.event_type === "member_joined" ? <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Joined</span> : null}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export default function SpaceTimeline({ space, events = [] }) {
  const railRef = useRef(null);
  const [filter, setFilter] = useState("all");
  const [activeYear, setActiveYear] = useState(() => events.at(-1) ? getYear(events.at(-1).occurred_at) : new Date().getFullYear());
  const filteredEvents = useMemo(() => events.filter((event) => filter === "all" || event.event_type === filter), [events, filter]);
  const years = useMemo(() => Array.from(new Set(events.map((event) => getYear(event.occurred_at)))).sort((a, b) => a - b), [events]);
  const scrollBy = (amount) => railRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  const jumpToYear = (year) => { setActiveYear(year); railRef.current?.querySelector(`[data-year="${year}"]`)?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" }); };

  if (!events.length) return <Card className="rounded-[28px] p-8 text-center"><div className="mx-auto max-w-md"><div className="text-lg font-semibold">No timeline yet</div><p className="mt-2 text-sm text-muted-foreground">Space history will appear here as people join and the team records reports, meetings, events, actions and updates.</p></div></Card>;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded-[28px] border bg-card/80 p-4 shadow-sm backdrop-blur md:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div><div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">History of {space?.name || "this Space"}</div><h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Timeline</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">A visual history of the people, work, meetings, events and actions that shaped this Space.</p></div>
          <div className="flex items-center gap-2"><Button variant="outline" size="icon" onClick={() => scrollBy(-520)} aria-label="Previous timeline events"><ArrowLeft className="h-4 w-4" /></Button><Button variant="outline" size="icon" onClick={() => scrollBy(520)} aria-label="Next timeline events"><ArrowRight className="h-4 w-4" /></Button></div>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">{years.map((year) => <Button key={year} size="sm" variant={activeYear === year ? "default" : "ghost"} className="shrink-0 rounded-full" onClick={() => jumpToYear(year)}>{year}</Button>)}</div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">{FILTERS.map(([value, label]) => <Button key={value} size="sm" variant={filter === value ? "secondary" : "ghost"} className="shrink-0 rounded-full" onClick={() => setFilter(value)}>{label}</Button>)}</div>
      </div>

      <div className="relative overflow-hidden rounded-[32px] border bg-gradient-to-b from-muted/20 to-background">
        <div className="pointer-events-none absolute left-0 right-0 top-[118px] hidden h-px bg-border lg:block" />
        <div ref={railRef} className="scrollbar-hide flex snap-x gap-6 overflow-x-auto px-4 pb-7 pt-10 sm:px-6 lg:px-10">{filteredEvents.map((event, index) => <div key={event.event_id} data-year={getYear(event.occurred_at)} className="relative pt-5"><TimelineEventCard event={event} index={index} /></div>)}</div>
      </div>

      <div className="px-1 text-xs text-muted-foreground">Showing {filteredEvents.length} timeline {filteredEvents.length === 1 ? "event" : "events"}</div>
    </div>
  );
}
