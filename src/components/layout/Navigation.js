"use client";

import { useRouter } from "next/router";
import { useState } from "react";
import {
  Search,
  CirclePlus,
  Orbit,
  Sparkles,
  Info,
  MapPinned,
  ChevronRight,
  Landmark,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { LoginModal } from "@/components/auth/LoginModal";
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
import { useSpaces } from "@/hooks/space/useSpaces";
import { useMyProfile } from "@/hooks/user/useMyProfile";

export function Navigation({ onCreatePost }) {
  const router = useRouter();

  const { data: spaces = [], isLoading } = useSpaces({
    enabled: true,
  });

  const { user } = useAuth();
  const { data: profile } = useMyProfile();
  const [showLogin, setShowLogin] = useState(false);

  const isAdmin = profile?.role === "admin";

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Explore</SidebarGroupLabel>

      <SidebarMenu>
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
            tooltip="Register Your Space"
            onClick={() => router.push("/apply/space")}
          >
            <Sparkles />
            <span>Register Space</span>
          </SidebarMenuButton>
        </SidebarMenuItem>

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

        <SidebarMenuItem>
          <SidebarMenuButton onClick={() => router.push("/governance")}>
            <Landmark />
            <span>Governance</span>
          </SidebarMenuButton>
        </SidebarMenuItem>

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

      <LoginModal open={showLogin} onOpenChange={setShowLogin} />
    </SidebarGroup>
  );
}
