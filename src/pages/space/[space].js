"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";

import { cn } from "@/lib/utils";

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

  const sentinelRef = useRef(null);

  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setCollapsed(!entry.isIntersecting);
      },
      {
        threshold: 0,
      },
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, []);

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
      {/* sentinel */}
      <div ref={sentinelRef} className="h-px" />

      {/* LARGE HEADER */}
      <header className="space-y-4 px-4 py-6">
        <div className="flex items-center gap-4">
          <BackButton />
          <Image
            src={space.logo_url}
            alt={space.name}
            width={64}
            height={64}
            className="rounded-lg border bg-muted"
          />

          <div>
            <h1 className="text-3xl font-bold">{space.name}</h1>

            {space.description && (
              <p className="mt-2 max-w-3xl text-muted-foreground">
                {space.description}
              </p>
            )}
          </div>
        </div>
      </header>

      <Tabs value={activeTab}>
        <TabsList className="mx-4">
          <TabsTrigger value="overview" onClick={() => router.push(base)}>
            Overview
          </TabsTrigger>

          <TabsTrigger
            value="members"
            onClick={() => router.push(`${base}?tab=members`)}
          >
            Members
          </TabsTrigger>

          <TabsTrigger
            value="activity"
            onClick={() => router.push(`${base}?tab=activity`)}
          >
            Activity
          </TabsTrigger>
        </TabsList>
      </Tabs>

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
