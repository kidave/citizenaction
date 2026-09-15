"use client";

import { useState } from "react";
import { useRouter } from "next/router";

import { Settings, UserPlus, Plus, History } from "lucide-react";

import EditorModal from "@/components/feed/editor/EditorModal";
import PageHeader from "@/components/layout/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { useSpaces } from "@/hooks/space/useSpaces";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import PageHeaderSkeleton from "@/components/skeletons/PageHeaderSkeleton";
import MetaCardsSkeleton from "@/components/skeletons/MetaCardsSkeleton";
import MembersTab from "@/components/space/tabs/MembersTab";
import ActivityTab from "@/components/space/tabs/ActivityTab";
import OverviewTab from "@/components/space/tabs/OverviewTab";

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
        <p className="mt-2 text-muted-foreground">The requested space does not exist.</p>
      </div>
    );
  }

  const isOwner = user?.id === space.owner_user_id;
  const isAdmin = space.current_user_role === "admin";
  const isMember = !!space.current_user_role;
  const canManage = isOwner || isAdmin;

  return (
    <>
      <div className="mx-auto max-w-6xl">
        <PageHeader
          title={space.name}
          items={[{ label: "Home", href: "/" }, { label: "Spaces", href: "/#spaces" }, { label: space.name }]}
        />

        <div className="border-b bg-background/95 p-2 backdrop-blur">
          <div className="flex items-center justify-end gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="View Space timeline"
                  onClick={() => router.push(`${base}/timeline`)}
                >
                  <History className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>View timeline</p></TooltipContent>
            </Tooltip>

            {user && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Create post"
                    onClick={() => setEditorOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Create post</p></TooltipContent>
              </Tooltip>
            )}

            {canManage ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Space settings"
                    onClick={() => router.push(`/space/${space.slug}/admin`)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Settings</p></TooltipContent>
              </Tooltip>
            ) : !isMember ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Become a member"
                    onClick={() => router.push(`/space/${space.slug}/application/member`)}
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Become a member</p></TooltipContent>
              </Tooltip>
            ) : null}
          </div>
        </div>

        <div className="border-b bg-background/95 p-2 backdrop-blur">
          <Tabs value={activeTab}>
            <TabsList className="flex w-auto">
              <TabsTrigger value="overview" onClick={() => router.push(base)} className="flex-1">Overview</TabsTrigger>
              <TabsTrigger value="members" onClick={() => router.push(`${base}?tab=members`)} className="flex-1">Members</TabsTrigger>
              <TabsTrigger value="activity" onClick={() => router.push(`${base}?tab=activity`)} className="flex-1">Activity</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="space-y-4 p-2 sm:p-4">
          <Tabs value={activeTab}>
            <TabsContent value="overview"><OverviewTab space={space} /></TabsContent>
            <TabsContent value="members"><MembersTab spaceId={space.id} spaceSlug={space.slug} /></TabsContent>
            <TabsContent value="activity"><ActivityTab spaceId={space.id} /></TabsContent>
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
