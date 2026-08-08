"use client";

import { useRouter } from "next/router";

import BackButton from "@/components/ui/back-button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import PageHeaderSkeleton from "@/components/skeletons/PageHeaderSkeleton";
import MetaCardsSkeleton from "@/components/skeletons/MetaCardsSkeleton";

import { useSpaces } from "@/hooks/space/useSpaces";

import MembersTab from "@/components/tabs/MembersTab";
import ActivityTab from "@/components/tabs/ActivityTab";
import OverviewTab from "@/components/tabs/OverviewTab";

export default function SpacePage() {
  const router = useRouter();

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

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-4 p-4">
        {" "}
        <PageHeaderSkeleton /> <MetaCardsSkeleton />{" "}
      </div>
    );
  }

  if (error || !space) {
    return (
      <div className="mx-auto max-w-6xl py-16 text-center">
        {" "}
        <h2 className="text-xl font-semibold">Space not found</h2>
        <p className="mt-2 text-muted-foreground">
          The requested space does not exist.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="sticky top-0 z-40 border-b bg-background backdrop-blur">
        <div className="flex h-14 items-center gap-3 px-4 sm:h-16">
          <BackButton />

          <h1 className="truncate font-semibold sm:text-lg">{space.name}</h1>
        </div>
      </div>

      <div className="sticky top-14 z-30 p-2 sm:top-16">
        <Tabs value={activeTab}>
          <TabsList className="mx-6 flex w-auto">
            <TabsTrigger
              value="overview"
              onClick={() => router.push(base)}
              className="flex-1"
            >
              Overview
            </TabsTrigger>

            <TabsTrigger
              value="members"
              onClick={() => router.push(`${base}?tab=members`)}
              className="flex-1"
            >
              Members
            </TabsTrigger>

            <TabsTrigger
              value="activity"
              onClick={() => router.push(`${base}?tab=activity`)}
              className="flex-1"
            >
              Activity
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="mx-4 space-y-4 p-4">
        <Tabs value={activeTab}>
          <TabsContent value="overview">
            <OverviewTab space={space} />
          </TabsContent>

          <TabsContent value="members">
            <MembersTab spaceId={space.id} />
          </TabsContent>

          <TabsContent value="activity">
            <ActivityTab spaceId={space.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
