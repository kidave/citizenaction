"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import CenterColumn from "./CenterColumn";
import FloatingMenu from "./FloatingMenu";

export default function AppShell({ children, showRightSidebar = false }) {
  return (
    <div className="flex min-h-dvh w-full">
      <SidebarProvider className="min-w-0 flex-1">
        <LeftSidebar />

        <SidebarInset className="min-w-0 flex-1">
          <CenterColumn>{children}</CenterColumn>
        </SidebarInset>

        <FloatingMenu />
      </SidebarProvider>

      {showRightSidebar && (
        <div className="hidden xl:flex">
          <SidebarProvider>
            <RightSidebar />
          </SidebarProvider>
        </div>
      )}
    </div>
  );
}
