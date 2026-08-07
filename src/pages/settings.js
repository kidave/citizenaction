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
    <div className="mx-auto max-w-xl">
      {/* Header */}
      <header className="space-y-4 px-4 py-4">
        <div className="flex items-start gap-2">
          <BackButton />

          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold lg:text-3xl">Settings</h1>
          </div>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={changeTab}>
        {/* Navigation */}
        <div className="sticky top-0 z-20 bg-background pt-2">
          <div className="overflow-x-auto">
            <TabsList className="mx-4 flex w-max min-w-[calc(100%-2rem)]">
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
        </div>

        {/* Content */}
        <div className="px-4 py-6">
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
