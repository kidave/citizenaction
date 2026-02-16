"use client";

import { useRouter } from "next/router";
import { Search, CirclePlus, Users, Info, MapPinned, ChevronRight } from "lucide-react";

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

import { useCommunities } from "@/hooks/useCommunities";

export function Navigation() {
  const router = useRouter();

  const { data: communities = [], isLoading } = useCommunities({
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

                {isLoading && (
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton disabled>
                      <span>Loading...</span>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                )}

                {communities?.map((community) => (
                  <SidebarMenuSubItem key={community.id}>
                    <SidebarMenuSubButton
                      onClick={() =>
                        router.push(`/community/${community.slug}`)
                      }
                    >
                      <span>{community.name}</span>
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
            tooltip="Mumbai Metropolitan Region"
            onClick={() =>
              router.push("/community/walkingproject/region/MH-MMR")
            }
          >
            <MapPinned />
            <span>Mumbai Metropolitan Region</span>
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
