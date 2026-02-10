"use client";

import { useRouter } from "next/router";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import Logo from "@/components/layout/Logo";

export function LogoSwitcher() {
  const router = useRouter();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          onClick={() => router.push("/")}
        >
          <div className="flex size-8 items-center justify-center rounded-lg bg-accent text-sidebar-primary-foreground">
            <Logo className="h-4 w-4" />
          </div>

          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Citizen Action</span>
            <span className="truncate text-xs text-muted-foreground">
              Civic Platform
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
