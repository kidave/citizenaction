"use client";

import { useRouter } from "next/router";

import { SidebarInset } from "@/components/ui/sidebar";

import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import CenterColumn from "./CenterColumn";

export default function AppShell({ children }) {
  const { pathname } = useRouter();

  const showRightSidebar = pathname === "/";

  return (
    <div className="flex min-h-dvh w-full">
      <LeftSidebar />

      <SidebarInset className="flex-1">
        <CenterColumn>{children}</CenterColumn>
      </SidebarInset>

      {showRightSidebar && (
        <div className="hidden xl:block">
          <RightSidebar />
        </div>
      )}
    </div>
  );
}
