// pages/space/[space].js

"use client";

import { useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PageHeaderSkeleton from "@/components/skeletons/PageHeaderSkeleton";
import MetaCardsSkeleton from "@/components/skeletons/MetaCardsSkeleton";
import { useSpaces } from "@/hooks/useSpaces";
import MembersTab from "@/components/tabs/MembersTab";
import ActivityTab from "@/components/tabs/ActivityTab";
import OverviewTab from "@/components/tabs/OverviewTab";

export default function SpacePage() {
  const { user, loading: authLoading } = useAuth();

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

  /* ---------------- LOADING ---------------- */

  if (isLoading) {
    return (
      <div className="mx-auto my-auto max-w-6xl space-y-4 px-4 py-4">
        <PageHeaderSkeleton />
        <MetaCardsSkeleton />
      </div>
    );
  }

  /* ---------------- ERROR ---------------- */

  if (error || !space) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h2 className="text-xl font-semibold">Space not found</h2>

        <p className="mt-2 text-muted-foreground">
          The requested space does not exist or is unavailable.
        </p>
      </div>
    );
  }

  const isOwner = !!user && user.id === space.owner_user_id;

  return (
    <div
      className="mx-auto my-auto max-w-6xl space-y-6 px-4 py-4"
      style={
        space.primary_color
          ? {
              "--space-primary": space.primary_color,
            }
          : undefined
      }
    >
      {/* ================= HEADER ================= */}

      <header className="space-y-4">
        <div className="flex items-center gap-4">
          {/* BACK */}
          <Link href="/">
            <div className="inline-flex items-center justify-center rounded-md border p-2 hover:bg-muted">
              <ArrowLeft className="h-4 w-4" />
            </div>
          </Link>

          {/* LOGO */}
          {space.logo_url && (
            <Image
              src={space.logo_url}
              alt={`${space.name} logo`}
              width={56}
              height={56}
              className="rounded-md border object-contain"
            />
          )}

          {/* NAME */}
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold">{space.name}</h1>

            {space.scope_type && (
              <Badge>{space.scope_type.toUpperCase()}</Badge>
            )}
          </div>
        </div>

        {/* DESCRIPTION */}
        {space.description && (
          <p className="max-w-3xl text-muted-foreground">{space.description}</p>
        )}
      </header>

      {/* ================= TABS ================= */}

      <Tabs value={activeTab} className="space-y-6">
        <TabsList>
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

        {/* ================= OVERVIEW ================= */}

        <TabsContent value="overview">
          <OverviewTab space={space} />
        </TabsContent>

        {/* ================= MEMBERS ================= */}
        <TabsContent value="members">
          <MembersTab spaceId={space.id} />
        </TabsContent>

        {/* ================= ACTIVITY ================= */}

        <TabsContent value="activity">
          <ActivityTab spaceId={space.id} />
        </TabsContent>
      </Tabs>

      {/* ================= ACTIONS ================= */}

      {!authLoading && isOwner && (
        <div className="flex gap-3 pt-2">
          <Link href={`/manage/${space.slug}`}>
            <Button>Manage Space</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
