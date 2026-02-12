"use client";

import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";

import PageBreadcrumbs from "./PageBreadcrumbs";
import { usePathname } from "next/navigation";
import LeftSidebar from "./LeftSidebar";

export default function Layout({ children }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">

        {/* LEFT SIDEBAR */}
        <LeftSidebar />

        {/* MAIN AREA */}
        <SidebarInset className="flex flex-col flex-1 min-w-0">
          {isHomePage ? (
            // Home page - no header, just content
            <main className="flex-1">
              {children}
            </main>
          ) : (
            // Other pages - with header and breadcrumbs
            <>
              <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
                <SidebarTrigger className="-ml-1" />
                <PageBreadcrumbs />
              </header>
              <main className="flex-1 overflow-y-auto">
                {children}
              </main>
            </>
          )}
        </SidebarInset>
        
      </div>
    </SidebarProvider>
  );
}