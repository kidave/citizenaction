"use client";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";

import { LogoSwitcher } from "./LogoSwitcher";
import { Navigation } from "./Navigation";
import { Profile } from "./Profile";

export default function LeftSidebar() {
  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
    >
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
