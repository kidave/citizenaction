"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { LogoSwitcher } from "@/components/layout/LogoSwitcher";
import { Navigation } from "@/components/layout/Navigation";
import { Profile } from "@/components/layout/Profile";

export default function MobileSidebar({ open, onOpenChange }) {
  return (
    <SidebarProvider
      open
      onOpenChange={() => {}}
      openMobile={open}
      onOpenMobileChange={onOpenChange}
    >
      <Sidebar
        side="left"
        collapsible="offcanvas"
        className="border-r md:hidden"
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
      </Sidebar>
    </SidebarProvider>
  );
}
