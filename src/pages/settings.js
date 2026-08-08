"use client";

import { useRouter } from "next/router";

import BackButton from "@/components/ui/back-button";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import EditProfile from "@/components/profile/EditProfile";

import Appearance from "@/components/system/Appearance";
import Notifications from "@/components/system/Notification";
import Support from "@/components/system/Support";
import About from "@/components/system/About";
import PrivacyPolicy from "@/components/system/PrivacyPolicy";

export default function SettingsPage() {
  const router = useRouter();

  const activeTab = router.query.tab || "account";

  function changeTab(value) {
    router.push(
      {
        pathname: "/settings",
        query: value === "account" ? {} : { tab: value },
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

          <h1 className="truncate font-semibold sm:text-lg">Settings</h1>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={changeTab}>
        <div className="sticky top-14 z-30 p-2 sm:top-16">
          <TabsList className="mx-6 flex w-max overflow-x-auto">
            <TabsTrigger value="account" className="flex-1">
              Account
            </TabsTrigger>

            <TabsTrigger value="appearance" className="flex-1">
              Appearance
            </TabsTrigger>

            <TabsTrigger value="notifications" className="flex-1">
              Notifications
            </TabsTrigger>

            <TabsTrigger value="privacy" className="flex-1">
              Privacy
            </TabsTrigger>

            <TabsTrigger value="support" className="flex-1">
              Support
            </TabsTrigger>

            <TabsTrigger value="about" className="flex-1">
              About
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="mx-4 space-y-4 p-4">
          <TabsContent value="account">
            <EditProfile />
          </TabsContent>

          <TabsContent value="appearance">
            <Appearance />
          </TabsContent>

          <TabsContent value="notifications">
            <Notifications />
          </TabsContent>

          <TabsContent value="privacy">
            <PrivacyPolicy />
          </TabsContent>

          <TabsContent value="support">
            <Support />
          </TabsContent>

          <TabsContent value="about">
            <About />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
