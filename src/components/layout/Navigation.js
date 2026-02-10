"use client";

import { useRouter } from "next/router";
import { Search, Users, Building2, MapPinned, ChevronRight } from "lucide-react";

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

export function Navigation() {
  const router = useRouter();

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

        {/* COMMUNITIES / CLUBS (collapsible, expanded only) */}
        <Collapsible
          defaultOpen
          className="group/collapsible group-data-[collapsible=icon]:hidden"
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton>
                <Users />
                <span>Communities</span>
                <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={() => router.push("/community")}>
                    <span>All Communities</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>

                <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={() => router.push("/club")}>
                    <span>All Clubs</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>

        {/* DIRECT REGION LINK */}
        <SidebarMenuItem>
          <SidebarMenuButton
            tooltip="Mumbai Region"
            onClick={() =>
              router.push("/community/walkingproject/club/region/MH-MMR")
            }
          >
            <MapPinned />
            <span>Mumbai Region</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
