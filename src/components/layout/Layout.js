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

function LayoutContent({ children }) {
  const pathname = usePathname();
  const { state } = useSidebar();

  const safePathname = pathname ?? "";

  const isAboutPage = safePathname === "/about";
  const isHomePage = safePathname === "/";
  const isPostPage = safePathname.startsWith("/post/");
  const isMeetingPage = safePathname.startsWith("/meeting/");
  const hideHeader = isHomePage || isAboutPage || isPostPage || isMeetingPage;

  return (
    <div className="flex min-h-screen w-full">

      {/* 🚀 Do NOT render sidebar for About */}
      {!isAboutPage && <LeftSidebar />}

      <SidebarInset className="flex flex-col flex-1 min-w-0">

        {/* Floating trigger ONLY for home when collapsed */}
        {isHomePage && state === "collapsed" && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="hidden md:block fixed top-4 left-4 z-50"
          >
            <SidebarTrigger className="bg-background border shadow-sm rounded-md p-2" />
          </motion.div>
        )}


        <main>
          {children}
        </main>
        
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