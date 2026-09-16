"use client";

import { useState } from "react";
import { useRouter } from "next/router";

import { Settings, UserPlus, Plus, History } from "lucide-react";

import EditorModal from "@/components/feed/editor/EditorModal";
import SpaceTopbar from "@/components/space/SpaceTopbar";

import { useAuth } from "@/context/AuthContext";
import { useSpaces } from "@/hooks/space/useSpaces";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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
    { label: "Timeline", icon: History, href: `${base}/timeline` },
    ...(user
      ? [{ label: "Create post", icon: Plus, onClick: () => setEditorOpen(true) }]
      : []),
  ];

  const overflowActions = canManage
    ? [{ label: "Administration", icon: Settings, href: `/space/${space.slug}/admin` }]
    : !isMember
      ? [
          {
            label: "Become a member",
            icon: UserPlus,
            href: `/space/${space.slug}/application/member`,
          },
        ]
      : [];

  const navigation = (
    <div className="bg-background">
      <div className="mx-auto flex min-h-12 max-w-6xl px-2 py-1.5 sm:px-4 sm:py-0">
        <Tabs value={activeTab} className="min-w-0">
          <TabsList className="w-max max-w-full">
            <TabsTrigger value="overview" onClick={() => router.push(base)} className="px-3 sm:px-4">
              Overview
            </TabsTrigger>
            <TabsTrigger value="members" onClick={() => router.push(`${base}?tab=members`)} className="px-3 sm:px-4">
              Members
            </TabsTrigger>
            <TabsTrigger value="activity" onClick={() => router.push(`${base}?tab=activity`)} className="px-3 sm:px-4">
              Activity
            </TabsTrigger>
          </TabsList>
        </Tabs>
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
