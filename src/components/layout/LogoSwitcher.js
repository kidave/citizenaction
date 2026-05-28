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

export function LogoSwitcher() {
  const router = useRouter();
  const { state, toggleSidebar } = useSidebar();

  const isCollapsed = state === "collapsed";

  return (
    <SidebarMenu className="w-full">
      <SidebarMenuItem>
        <div className="flex w-full items-center justify-between px-2">
          {/* LEFT SIDE: Logo + Text */}
          <SidebarMenuButton
            size="lg"
            onClick={() => router.push("/")}
            className="flex flex-1 items-center gap-3"
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

          {/* RIGHT SIDE: Toggle (Inline, Not Floating) */}
          <button
            onClick={toggleSidebar}
            className="ml-2 rounded-md p-2 transition hover:bg-muted"
          >
            <PanelLeft className="size-4" />
          </button>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
