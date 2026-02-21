"use client";

import React from "react";
import { FloatingDock } from "@/components/ui/floating-dock";
import { IconHome, IconSearch, IconPlus } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useSidebar } from "@/components/ui/sidebar";
import { useMyProfile } from "@/hooks/useMyProfile";
import Image from "next/image";

export default function MobileFloatingDock() {
  const router = useRouter();
  const { toggleSidebar } = useSidebar();
  const { data: profile } = useMyProfile();

  const items = [
    {
      title: "Home",
      icon: (
        <IconHome className="h-full w-full text-neutral-600 dark:text-neutral-300" />
      ),
      onClick: () => router.push("/"),
    },
    {
      title: "Search",
      icon: (
        <IconSearch className="h-full w-full text-neutral-600 dark:text-neutral-300" />
      ),
      onClick: () => router.push("/search"),
    },
    {
      title: "Create",
      icon: (
        <div className="flex items-center justify-center h-full w-full rounded-full bg-primary text-white">
          <IconPlus className="h-5 w-5" />
        </div>
      ),
      onClick: () => router.push("/action"),
    },
    {
      title: "Profile",
      icon: (
        <Image
          src={profile?.avatar_url || "/user1.png"}
          alt="avatar"
          className="h-7 w-7 rounded-full object-cover"
          width={32}
          height={32}
        />
      ),
      onClick: toggleSidebar,
    },
  ];

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center md:hidden">
      <FloatingDock items={items} />
    </div>
  );
}