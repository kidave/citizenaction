"use client";

import { useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import { LogoSwitcher } from "@/components/layout/LogoSwitcher";
import { Navigation } from "@/components/layout/Navigation";
import { Profile } from "@/components/layout/Profile";

function MobileSidebarController({ open, onOpenChange }) {
  const { setOpenMobile } = useSidebar();

  useEffect(() => {
    setOpenMobile(Boolean(open));
  }, [open, setOpenMobile]);

  return null;
}

export default function MobileSidebar({ open, onOpenChange }) {
  if (!open) return null;

  function handleOpenChange(nextOpen) {
    onOpenChange?.(nextOpen);
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <SidebarProvider
        open
        onOpenChange={() => {}}
      >
        <MobileSidebarController
          open={open}
          onOpenChange={onOpenChange}
        />

        <Sidebar
          side="left"
          collapsible="offcanvas"
          className="border-r"
          onOpenChange={handleOpenChange}
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
    </div>
  );
}
