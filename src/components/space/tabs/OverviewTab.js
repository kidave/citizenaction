"use client";

import Image from "next/image";
import Link from "next/link";

import {
  Activity,
  CalendarDays,
  ExternalLink,
  Globe,
  Mail,
  Phone,
  Presentation,
  Users,
} from "lucide-react";

import { useSpaceFeed } from "@/hooks/space/useSpaceFeed";
import { useSpaceMembers } from "@/hooks/space/useSpaceMembers";

import ActivityPreviewCard from "@/components/feed/activity/ActivityPreviewCard";
import MetricCard from "@/components/ui/metric-card";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function OverviewTab({ space }) {
  const { data: members = [] } = useSpaceMembers({
    spaceId: space.id,
  });

  const { data: spaceFeed = [] } = useSpaceFeed(space.id);

  const meetings = spaceFeed.filter((f) => f.type === "meeting");

  const events = spaceFeed.filter((f) => f.type === "event");

  const recentFeed = [...spaceFeed]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 4);

  const admins = members.filter((m) => ["owner", "admin"].includes(m.role));

  return (
    <div className="space-y-6">
      {/* =====================================================
          SPACE INFORMATION
      ===================================================== */}

      <header>
        <div className="flex items-start gap-3 sm:gap-4">
          {space.logo_url && (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted sm:h-20 sm:w-20">
              <img
                src={space.logo_url}
                alt={`${space.name} logo`}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          )}

          <div className="min-w-0 flex-1">
            {space.description && (
              <p className="text-sm leading-relaxed text-muted-foreground lg:text-base">
                {space.description}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* =====================================================
          METRICS
      ===================================================== */}

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard icon={Users} label="Members" value={members.length} />

        <MetricCard icon={Activity} label="Activity" value={spaceFeed.length} />

        <MetricCard
          icon={Presentation}
          label="Meetings"
          value={meetings.length}
        />

        <MetricCard icon={CalendarDays} label="Events" value={events.length} />
      </section>

      {/* =====================================================
          LATEST ACTIVITY
      ===================================================== */}

      <div className="space-y-4">
        <Link
          href={`/space/${space.slug}?tab=activity`}
          className="flex items-center justify-between"
        >
          <div>
            <p className="text-sm font-semibold text-muted-foreground">
              Latest updates from {space.name}
            </p>
          </div>
        </Link>
      </div>

      {/* =====================================================
          OVERVIEW CARDS
      ===================================================== */}

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {recentFeed.slice(0, 1).map((post) => (
          <ActivityPreviewCard key={post.id} post={post} />
        ))}

        {!recentFeed.length && (
          <div className="text-sm text-muted-foreground">
            No recent activity.
          </div>
        )}

        {/* TEAM */}

        <Card className="flex h-full flex-col overflow-hidden rounded-3xl bg-muted">
          <CardHeader>
            <Link
              href={`/space/${space.slug}?tab=members`}
              className="flex items-center justify-between"
            >
              <CardTitle>Team</CardTitle>
            </Link>
          </CardHeader>

          <CardContent className="flex-1 bg-background py-2">
            {admins.map((member) => (
              <Link key={member.user_id} href={`/user/${member.username}`}>
                <div className="flex items-center justify-between gap-3 rounded-lg p-2 transition">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.avatar_url} />

                      <AvatarFallback>{member.name?.[0] || "U"}</AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <div className="truncate font-medium">{member.name}</div>

                      <div className="truncate text-xs text-muted-foreground">
                        @{member.username}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* CONTACT */}

        <Card className="flex h-full flex-col overflow-hidden rounded-3xl bg-muted">
          <CardHeader>
            <CardTitle>{space.name}</CardTitle>
          </CardHeader>

          <CardContent className="flex-1 bg-background py-2">
            {space.website && (
              <div className="flex items-start gap-3 p-2">
                <Globe className="mt-0.5 h-4 w-4 text-muted-foreground" />

                <div>
                  <div className="text-xs text-muted-foreground">Website</div>

                  <a
                    href={space.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 transition hover:opacity-70"
                  >
                    <span className="max-w-[160px] truncate">
                      {space.website
                        .replace("https://", "")
                        .replace("http://", "")}
                    </span>

                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            )}

            {space.email && (
              <div className="flex items-start gap-3 p-2">
                <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />

                <div>
                  <div className="text-xs text-muted-foreground">Email</div>

                  <a
                    href={`mailto:${space.email}`}
                    className="break-all hover:underline"
                  >
                    {space.email}
                  </a>
                </div>
              </div>
            )}

            {space.contact_number && (
              <div className="flex items-start gap-3 p-2">
                <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />

                <div>
                  <div className="text-xs text-muted-foreground">Phone</div>

                  <div>{space.contact_number}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
