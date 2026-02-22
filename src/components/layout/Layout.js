"use client";

import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";

import PageBreadcrumbs from "./PageBreadcrumbs";
import { usePathname } from "next/navigation";
import LeftSidebar from "./LeftSidebar";
import { motion } from "framer-motion";

function FloatingSidebarToggle() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  // Only show when collapsed
  if (!isCollapsed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="hidden md:block fixed top-4 left-4 z-50"
    >
      <SidebarTrigger className="bg-background border shadow-sm rounded-md p-2" />
    </motion.div>
  );
}

export default function Layout({ children }) {
  const pathname = usePathname();
  const hideHeader = pathname === "/" || pathname === "/about";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">

        <LeftSidebar />

        <SidebarInset className="flex flex-col flex-1 min-w-0">

          {/* Floating trigger for landing pages */}
          {hideHeader && <FloatingSidebarToggle />}

          {/* Header only for internal pages */}
          {!hideHeader && (
            <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4">
              <SidebarTrigger />
              <PageBreadcrumbs />
            </header>
          )}

          <main className="flex-1 overflow-y-auto">
            {children}
          </main>

        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}