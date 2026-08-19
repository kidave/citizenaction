"use client";

import { useRouter } from "next/router";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import CenterColumn from "./CenterColumn";
import FloatingMenu from "./FloatingMenu";

export default function AppShell({ children }) {
  const { pathname } = useRouter();

  const showRightSidebar = pathname === "/";

  return (
    <div className="flex min-h-dvh w-full">
      {/* LEFT SIDEBAR SYSTEM */}

      <SidebarProvider className="min-w-0 flex-1">
        <LeftSidebar />

        <SidebarInset className="min-w-0 flex-1">
          <CenterColumn>{children}</CenterColumn>
        </SidebarInset>

        {/* IMPORTANT:
            FloatingMenu is INSIDE the left provider.
            Therefore useSidebar() means LEFT sidebar.
        */}
        <FloatingMenu />
      </SidebarProvider>

      {/* RIGHT SIDEBAR SYSTEM */}

      {showRightSidebar && (
        <div className="hidden xl:flex">
          <SidebarProvider className="w-[16rem]">
            <RightSidebar />
          </SidebarProvider>
        </div>
      )}
    </div>
  );
}
