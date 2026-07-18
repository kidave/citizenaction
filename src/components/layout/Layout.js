"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useRouter } from "next/router";

import LeftSidebar from "./LeftSidebar";

function LayoutContent({ children }) {
  const { pathname } = useRouter();

  const showSidebar = pathname !== "/about";

  return (
    <div className="flex min-h-dvh w-full">
      {showSidebar && <LeftSidebar />}

      <SidebarInset className="flex min-h-dvh flex-1 flex-col">
        <div className="flex-1">{children}</div>
      </SidebarInset>
    </div>
  );
}

export default function Layout({ children }) {
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
}
