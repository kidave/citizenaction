"use client";

import Link from "next/link";

import {
  Users,
  Activity,
  CalendarDays,
  Megaphone,
  Globe,
  Mail,
  Phone,
  Presentation,
  MapPinned,
  ExternalLink,
} from "lucide-react";

import { useFeed } from "@/hooks/feed/useFeed";

import { useSpaceMembers } from "@/hooks/space/useSpaceMembers";

import ActivityPreviewCard from "@/components/feed/post-activity/ActivityPreviewCard";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";


export default function OverviewTab({
  space,
}) {
  const {
    data: members = [],
  } = useSpaceMembers({
    spaceId: space.id,
  });

  const {
    data: feed = [],
  } = useFeed();

  const spaceFeed = feed.filter(
    (f) => f.space_id === space.id
  );

  const meetings =
    spaceFeed.filter(
      (f) => f.type === "meeting"
    );

  const events =
    spaceFeed.filter(
      (f) => f.type === "event"
    );

  const recentFeed =
    [...spaceFeed]
      .sort(
        (a, b) =>
          new Date(
            b.created_at
          ) -
          new Date(
            a.created_at
          )
      )
      .slice(0, 4);

  const admins =
    members.filter((m) =>
      ["owner", "admin"].includes(
        m.role
      )
    );

  return (
    <div className="space-y-6">

      {/* =====================================================
          METRICS
      ===================================================== */}

      <section
        className="
          grid
          grid-cols-2
          lg:grid-cols-4
          gap-4
        "
      >

        <MetricCard
          icon={Users}
          label="Members"
          value={members.length}
        />

        <MetricCard
          icon={Activity}
          label="Activity"
          value={spaceFeed.length}
        />

        <MetricCard
          icon={Presentation}
          label="Meetings"
          value={meetings.length}
        />

        <MetricCard
          icon={CalendarDays}
          label="Events"
          value={events.length}
        />

      </section>

      {/* =====================================================
          GRID
      ===================================================== */}

      <section
        className="
          grid
          grid-cols-1
          lg:grid-cols-3
          gap-6
        "
      >

        {/* =====================================================
            LEFT
        ===================================================== */}

        <div className="lg:col-span-2 space-y-6">

          {/* RECENT ACTIVITY */}

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

            {!recentFeed.length ? (
              <div className="text-sm text-muted-foreground">
                No recent activity.
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

                {recentFeed.map((post) => (
                  <ActivityPreviewCard
                    key={post.id}
                    post={post}
                  />
                ))}

              </div>
            )}

          </div>

        </div>

        {/* =====================================================
            RIGHT
        ===================================================== */}

        <div className="space-y-6">

          {/* GOVERNANCE */}

          <Card>

            <CardHeader>
              <Link
                href={`/space/${space.slug}?tab=members`}
                className="flex items-center justify-between"
              >
                <CardTitle>
                  Team
                </CardTitle>
              </Link>

            </CardHeader>

            <CardContent className="space-y-4">

              {admins.map((member) => (
                <Link
                  key={member.user_id}
                  href={`/user/${member.username}`}
                >

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      gap-3
                      rounded-lg
                      p-2
                      transition
                    "
                  >

                    <div className="flex items-center gap-3 min-w-0">

                      <Avatar className="h-10 w-10">

                        <AvatarImage
                          src={
                            member.avatar_url
                          }
                        />

                        <AvatarFallback>
                          {member.name?.[0] ||
                            "U"}
                        </AvatarFallback>

                      </Avatar>

                      <div className="min-w-0">

                        <div className="font-medium truncate">
                          {member.name}
                        </div>

                        <div className="text-xs text-muted-foreground truncate">
                          @{member.username}
                        </div>

                      </div>

                    </div>

                  </div>

                </Link>
              ))}

            </CardContent>

          </Card>

          {/* SPACE INFO */}

          <Card>

            <CardHeader>

              <CardTitle>
                {space.name}
              </CardTitle>

            </CardHeader>

            <CardContent className="space-y-4 text-sm">

              {space.scope_type && (
                <InfoRow
                  icon={MapPinned}
                  label="Scope"
                  value={
                    space.scope_type
                  }
                />
              )}

              {space.website && (
                <InfoRow
                    icon={Globe}
                    label="Website"
                    value={
                    <a
                        href={space.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
                        inline-flex
                        items-center
                        gap-1
                        hover:opacity-70
                        transition
                        "
                    >
                        <span className="truncate max-w-[160px]">
                        {space.website
                            .replace("https://", "")
                            .replace("http://", "")}
                        </span>

                        <ExternalLink className="h-3 w-3" />

                    </a>
                    }
                />
              )}

              {space.email && (
                <InfoRow
                    icon={Mail}
                    label="Email"
                    value={
                    <a
                        href={`mailto:${space.email}`}
                        className="
                        hover:underline
                        break-all
                        "
                    >
                        {space.email}
                    </a>
                    }
                />
              )}

              {space.contact_number && (
                <InfoRow
                  icon={Phone}
                  label="Phone"
                  value={
                    space.contact_number
                  }
                />
              )}

            </CardContent>

          </Card>

        </div>

      </section>

    </div>
  );
}

/* =====================================================
   METRIC CARD
===================================================== */

function MetricCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <Card>

      <CardContent className="p-5">

        <div className="flex items-center justify-between">

          <div>

            <div className="text-2xl font-semibold">
              {value}
            </div>

            <div className="text-sm text-muted-foreground">
              {label}
            </div>

          </div>

          <Icon className="h-5 w-5 text-muted-foreground" />

        </div>

      </CardContent>

    </Card>
  );
}

/* =====================================================
   INFO ROW
===================================================== */

function InfoRow({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-start gap-3">

      <Icon className="h-4 w-4 mt-0.5 text-muted-foreground" />

      <div>

        <div className="text-xs text-muted-foreground">
          {label}
        </div>

        <div>{value}</div>

      </div>

    </div>
  );
}