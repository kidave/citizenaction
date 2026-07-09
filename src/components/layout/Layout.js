"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useRouter } from "next/router";

import LeftSidebar from "./LeftSidebar";

function LayoutContent({ children }) {
  const { pathname } = useRouter();

  const showSidebar = pathname !== "/about";

  return (
    <div className="flex min-h-screen w-full min-w-0">
      {showSidebar && <LeftSidebar />}

      <SidebarInset className="flex min-w-0 flex-1 flex-col">
        <main className="w-full min-w-0">{children}</main>
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
