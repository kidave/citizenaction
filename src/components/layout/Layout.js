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
            // Floating sidebar trigger for home page
            <div className="relative">
              <SidebarTrigger 
                className="absolute top-4 left-4 z-10 h-8 w-8 bg-background border rounded-md shadow-sm flex items-center justify-center hover:bg-accent"
                title="Toggle sidebar"
              />
              <main className="pt-4">
                {children}
              </main>
            </div>
          ) : (
            // Regular layout for other pages
            <>
              <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
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