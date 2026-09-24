"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/router";

import { Settings, UserPlus, Plus, History } from "lucide-react";

import EditorModal from "@/components/editor/EditorModal";
import SpaceTopbar from "@/components/space/SpaceTopbar";

import { useAuth } from "@/context/AuthContext";
import { useSpaces } from "@/hooks/space/useSpaces";
import { useSpaceFeed } from "@/hooks/space/useSpaceFeed";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { Button } from "@/components/ui/button";

import PageHeaderSkeleton from "@/components/skeletons/PageHeaderSkeleton";
import MetaCardsSkeleton from "@/components/skeletons/MetaCardsSkeleton";

import MembersTab from "@/components/space/tabs/MembersTab";
import ActivityTab from "@/components/space/tabs/ActivityTab";
import OverviewTab from "@/components/space/tabs/OverviewTab";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function SpacePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [editorOpen, setEditorOpen] = useState(false);

  const { space: slug, tab } = router.query;

  const {
    data: space,
    isLoading,
    error,
  } = useSpaces({
    slug,
    enabled: !!slug,
  });

  const activeTab = tab || "overview";
  const base = `/space/${slug}`;

  // Activity filters
  const [year, setYear] = useState("");
  const [month, setMonth] = useState(null);

  /*
   * Load activity feed here so the navigation can determine
   * which years are available for filtering.
   */
  const { data: activityFeed = [] } = useSpaceFeed(space?.id);

  const activityYears = useMemo(() => {
    const years = activityFeed.map((post) => {
      if (post.start_at) {
        return new Date(post.start_at).getFullYear();
      }

      if (post.date) {
        return new Date(post.date).getFullYear();
      }

      return new Date(post.created_at).getFullYear();
    });

    return [...new Set(years)].sort((a, b) => b - a);
  }, [activityFeed]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-4 p-2">
        <PageHeaderSkeleton />
        <MetaCardsSkeleton />
      </div>
    );
  }

  if (error || !space) {
    return (
      <div className="mx-auto max-w-6xl py-16 text-center">
        <h2 className="text-xl font-semibold">Space not found</h2>
        <p className="mt-2 text-muted-foreground">
          The requested space does not exist.
        </p>
      </div>
    );
  }

  const isOwner = user?.id === space.owner_user_id;
  const isAdmin = space.current_user_role === "admin";
  const isMember = !!space.current_user_role;
  const canManage = isOwner || isAdmin;

  const primaryActions = [
    {
      label: "Timeline",
      icon: History,
      href: `${base}/timeline`,
    },
    ...(user
      ? [
          {
            label: "Create post",
            icon: Plus,
            onClick: () => setEditorOpen(true),
          },
        ]
      : []),
  ];

  const overflowActions = canManage
    ? [
        {
          label: "Administration",
          icon: Settings,
          href: `/space/${space.slug}/admin`,
        },
      ]
    : !isMember
      ? [
          {
            label: "Become a member",
            icon: UserPlus,
            href: `/space/${space.slug}/application/member`,
          },
        ]
      : [];

  const activityFilters =
    activeTab === "activity" ? (
      <div className="flex items-center gap-1 overflow-x-auto">
        <select
          value={year}
          onChange={(e) => {
            setYear(e.target.value);
            setMonth(null);
          }}
          className="h-8 w-24 rounded-md border bg-background px-2 py-1.5 text-xs"
        >
          <option value="">Select year</option>

          {activityYears.map((y) => (
            <option key={y} value={String(y)}>
              {y}
            </option>
          ))}
        </select>

        <select
          value={month ?? ""}
          disabled={!year}
          onChange={(e) => {
            const value = e.target.value;
            setMonth(value === "" ? null : Number(value));
          }}
          className="h-8 w-28 rounded-md border bg-background px-2 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Select month</option>

          {months.map((monthName, index) => (
            <option key={index} value={index}>
              {monthName}
            </option>
          ))}
        </select>

        <Button
          size="sm"
          variant="ghost"
          className="h-8 px-2 text-xs"
          disabled={!year && month === null}
          onClick={() => {
            setYear("");
            setMonth(null);
          }}
        >
          Clear
        </Button>
      </div>
    ) : null;

  const navigation = (
    <div className="bg-background">
      <div className="mx-auto max-w-6xl px-2 sm:px-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {/* Tabs */}
          <Tabs value={activeTab} className="min-w-0">
            <TabsList className="w-max max-w-full">
              <TabsTrigger
                value="overview"
                onClick={() => router.push(base)}
                className="px-3 sm:px-4"
              >
                Overview
              </TabsTrigger>

              <TabsTrigger
                value="members"
                onClick={() => router.push(`${base}?tab=members`)}
                className="px-3 sm:px-4"
              >
                Members
              </TabsTrigger>

              <TabsTrigger
                value="activity"
                onClick={() => router.push(`${base}?tab=activity`)}
                className="px-3 sm:px-4"
              >
                Activity
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Contextual controls */}
          {activityFilters && (
            <div className="flex shrink-0 items-center">{activityFilters}</div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="mx-auto max-w-6xl">
        <SpaceTopbar
          items={[{ label: "Home", href: "/" }, { label: space.name }]}
          title={space.name}
          primaryActions={primaryActions}
          overflowActions={overflowActions}
          bottom={navigation}
        />

        <div className="space-y-4 p-2 sm:p-4">
          <Tabs value={activeTab}>
            <TabsContent value="overview">
              <OverviewTab space={space} />
            </TabsContent>

            <TabsContent value="members">
              <MembersTab spaceId={space.id} spaceSlug={space.slug} />
            </TabsContent>

            <TabsContent value="activity">
              <ActivityTab spaceId={space.id} year={year} month={month} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <EditorModal
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        mode="post"
        initialSpace={space}
      />
    </>
  );
}
