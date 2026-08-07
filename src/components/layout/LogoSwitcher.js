"use client";

import { useRouter } from "next/router";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import Logo from "@/components/layout/Logo";
import { PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LogoSwitcher() {
  const router = useRouter();
  const { state, toggleSidebar } = useSidebar();

  const isCollapsed = state === "collapsed";

  // ---------------- COLLAPSED ----------------

  if (isCollapsed) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            onClick={toggleSidebar}
            tooltip="Expand sidebar"
            className="justify-center"
          >
            <PanelLeft className="h-5 w-5" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // ---------------- EXPANDED ----------------

  return (
    <SidebarMenu className="w-full">
      <SidebarMenuItem>
        <div className="flex w-full items-center justify-between px-2">
          <SidebarMenuButton
            size="lg"
            onClick={() => router.push("/")}
            className="flex flex-1 items-center gap-3"
            tooltip="Collapse sidebar"
          >
            <div className="flex size-8 items-center justify-center rounded-lg bg-accent text-sidebar-primary-foreground">
              <Logo className="h-4 w-4" />
            </div>

            {!isCollapsed && (
              <div className="grid text-left text-sm leading-tight">
                <span className="truncate font-semibold">Citizen Action</span>
                <span className="truncate text-xs text-muted-foreground">
                  Civic Platform
                </span>
              </div>
            )}
          </SidebarMenuButton>

          <Button onClick={toggleSidebar} className="p-2" variant="ghost">
            <PanelLeft className="size-4" />
          </Button>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
