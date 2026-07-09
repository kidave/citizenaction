"use client";

import { useRouter } from "next/router";
import {
  Search,
  CirclePlus,
  Orbit,
  Sparkles,
  Info,
  MapPinned,
  ChevronRight,
} from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";

import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { useSpaces } from "@/hooks/useSpaces";

export function Navigation() {
  const router = useRouter();

  const { data: spaces = [], isLoading } = useSpaces({
    enabled: true,
  });

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Explore</SidebarGroupLabel>

      <SidebarMenu>
        {/* SEARCH (page only) */}
        <SidebarMenuItem>
          <SidebarMenuButton
            tooltip="Search"
            onClick={() => router.push("/search")}
          >
            <Search />
            <span>Search</span>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            tooltip="Create Post"
            onClick={() => router.push("/action")}
          >
            <CirclePlus />
            <span>Create Post</span>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            tooltip="Register Your Space"
            onClick={() => router.push("/apply/space")}
          >
            <Sparkles />
            <span>Register Space</span>
          </SidebarMenuButton>
        </SidebarMenuItem>

        {/* (collapsible, expanded only) */}
        <Collapsible
          defaultOpen
          className="group/collapsible group-data-[collapsible=icon]:hidden"
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton>
                <Orbit />
                <span>Space</span>
                <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <SidebarMenuSub>
                {isLoading && (
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton
                      disabled
                      className="flex items-center gap-2"
                    >
                      <Skeleton className="h-4 w-24" />
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                )}

                {spaces?.map((space) => (
                  <SidebarMenuSubItem key={space.id}>
                    <SidebarMenuSubButton
                      onClick={() => router.push(`/space/${space.slug}`)}
                    >
                      <span>{space.name}</span>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>

        {/* DIRECT REGION LINK */}
        <SidebarMenuItem>
          <SidebarMenuButton
            tooltip="Land-Based Classification Standards"
            onClick={() => router.push("/standards/lbcs")}
          >
            <MapPinned />
            <span>Land-Based Classification Standards</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>

      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            tooltip="About"
            onClick={() => router.push("/about")}
          >
            <Info />
            <span>About Us</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
