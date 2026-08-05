"use client";

import { useRouter } from "next/router";
import Image from "next/image";

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

  return (
    <div className="mx-auto max-w-6xl">
      <header className="space-y-4 px-4 py-4">
        {/* Mobile Back Button */}
        <div className="lg:hidden">
          <BackButton />
        </div>

        <div className="flex items-start gap-2">
          {/* Desktop Back Button */}
          <div className="hidden lg:block">
            <BackButton />
          </div>

          <Image
            src={space.logo_url}
            alt={space.name}
            width={64}
            height={64}
            className="h-16 w-16 rounded-lg border bg-muted object-cover"
          />

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-bold lg:text-3xl">
              {space.name}
            </h1>

            {space.description && (
              <p className="mt-2 text-sm text-muted-foreground lg:text-base">
                {space.description}
              </p>
            )}
          </div>
        </div>
      </header>

      <div className="sticky top-0 z-20 pt-2">
        <Tabs value={activeTab}>
          <TabsList className="mx-4 flex w-auto">
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

      {/* CONTENT */}
      <div className="space-y-6 px-4 py-6">
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
