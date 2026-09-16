"use client";

import { useState } from "react";
import { useRouter } from "next/router";

import { Settings, UserPlus, Plus, History } from "lucide-react";

import EditorModal from "@/components/feed/editor/EditorModal";
import PageHeader from "@/components/navigation/PageHeader";

import { useAuth } from "@/context/AuthContext";
import { useSpaces } from "@/hooks/space/useSpaces";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import PageHeaderSkeleton from "@/components/skeletons/PageHeaderSkeleton";
import MetaCardsSkeleton from "@/components/skeletons/MetaCardsSkeleton";

import MembersTab from "@/components/space/tabs/MembersTab";
import ActivityTab from "@/components/space/tabs/ActivityTab";
import OverviewTab from "@/components/space/tabs/OverviewTab";

function SpaceAction({ label, icon: Icon, onClick, ariaLabel }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-2 px-2 sm:px-3"
          aria-label={ariaLabel || label}
          onClick={onClick}
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export default function SpacePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [editorOpen, setEditorOpen] = useState(false);

  const { space: slug, tab } = router.query;

  const { data: space, isLoading, error } = useSpaces({
    slug,
    enabled: !!slug,
  });

  const activeTab = tab || "overview";
  const base = `/space/${slug}`;

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

  const actionItems = (
    <>
      <SpaceAction
        label="Timeline"
        icon={History}
        ariaLabel="View space timeline"
        onClick={() => router.push(`${base}/timeline`)}
      />

      {user && (
        <SpaceAction
          label="Create post"
          icon={Plus}
          ariaLabel="Create post"
          onClick={() => setEditorOpen(true)}
        />
      )}

      {canManage ? (
        <SpaceAction
          label="Admin"
          icon={Settings}
          ariaLabel="Open space administration"
          onClick={() => router.push(`/space/${space.slug}/admin`)}
        />
      ) : !isMember ? (
        <SpaceAction
          label="Become a member"
          icon={UserPlus}
          ariaLabel="Become a member"
          onClick={() =>
            router.push(`/space/${space.slug}/application/member`)
          }
        />
      ) : null}
    </>
  );

  const navigation = (
    <div className="border-t border-border/70">
      <div className="mx-auto flex min-h-12 max-w-6xl flex-col gap-1 px-2 py-1.5 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-0">
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

        <div className="flex shrink-0 items-center justify-end gap-0.5 sm:gap-1">
          {actionItems}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="mx-auto max-w-6xl">
        <PageHeader
          items={[
            { label: "Home", href: "/" },
            { label: "Spaces", href: "/space" },
            { label: space.name },
          ]}
          title={space.name}
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
              <ActivityTab spaceId={space.id} />
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
