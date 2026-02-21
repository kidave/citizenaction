"use client";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";

import { LogoSwitcher } from "./LogoSwitcher";
import { Navigation } from "./Navigation";
import { Profile } from "./Profile";
import RightSidebar from "./RightSidebar";

export default function LeftSidebar() {
  return (
    <Sidebar collapsible="offcanvas" className="border-r">

      <SidebarHeader>
        <LogoSwitcher />
      </SidebarHeader>

      <SidebarContent>
        <Navigation />

        {/* Extra content on mobile */}
        <div className="md:hidden mt-6 px-4">
          <RightSidebar />
        </div>
      </SidebarContent>

      <SidebarFooter>
        <Profile />
      </SidebarFooter>

    </Sidebar>
  );
}