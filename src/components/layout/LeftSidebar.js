"use client";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";

import { LogoSwitcher } from "@/components/layout/LogoSwitcher";
import { Navigation } from "@/components/layout/Navigation";
import { Profile } from "@/components/layout/Profile";

export default function LeftSidebar() {
  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader>
        <LogoSwitcher />
      </SidebarHeader>

      <SidebarContent>
        <Navigation />
      </SidebarContent>

      <SidebarFooter>
        <Profile />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
