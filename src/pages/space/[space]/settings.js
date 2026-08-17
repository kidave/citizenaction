"use client";

import { useRouter } from "next/router";

import BackButton from "@/components/ui/back-button";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import SpaceGeneralSettings from "@/components/space/SpaceGeneralSettings";

import SpaceMembersSettings from "@/components/space/SpaceMembersSettings";

export default function SpaceSettingsPage() {
  const router = useRouter();

  const { space: spaceSlug } = router.query;

  const activeTab = router.query.tab || "general";

  function changeTab(value) {
    router.push(
      {
        pathname: `/space/${spaceSlug}/settings`,
        query: value === "general" ? {} : { tab: value },
      },
      undefined,
      {
        shallow: true,
      },
    );
  }

  return (
    <div className="mx-auto w-full">
      <div className="sticky top-0 z-40 border-b bg-background">
        <div className="flex h-14 items-center gap-3 px-4 sm:h-16">
          <BackButton />

          <h1 className="truncate font-semibold sm:text-lg">Space settings</h1>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={changeTab}>
        <div className="sticky top-14 z-30 overflow-x-auto border-b bg-background p-2 sm:top-16">
          <TabsList className="mx-2 flex w-max">
            <TabsTrigger value="general">General</TabsTrigger>

            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>
        </div>

        <div className="mx-auto max-w-4xl p-4 sm:p-6">
          <TabsContent value="general">
            <SpaceGeneralSettings spaceSlug={spaceSlug} />
          </TabsContent>

          <TabsContent value="members">
            <SpaceMembersSettings spaceSlug={spaceSlug} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
