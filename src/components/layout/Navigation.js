"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  Search,
  Orbit,
  Sparkles,
  Info,
  MapPinned,
  ChevronRight,
  Network,
  Vote,
  Landmark,
  Scale,
  Building2,
  Users,
  Map,
  Building,
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
import { GOVERNANCE_DOMAINS } from "@/utils/governance";

export function Navigation({ onCreatePost }) {
  const router = useRouter();
  const { data: spaces = [], isLoading } = useSpaces({ enabled: true });
  const { user } = useAuth();
  const { data: profile } = useMyProfile();
  const [showLogin, setShowLogin] = useState(false);
  const isGovernanceRoute = router.pathname.startsWith("/governance")
    || router.pathname.startsWith("/person")
    || GOVERNANCE_DOMAINS.some(({ value }) => router.pathname.startsWith(`/${value}`));
  const [governanceOpen, setGovernanceOpen] = useState(isGovernanceRoute);
  const isGeographyRoute = router.pathname.startsWith("/geography");
  const [geographyOpen, setGeographyOpen] = useState(isGeographyRoute);

  useEffect(() => {
    if (isGovernanceRoute) setGovernanceOpen(true);
  }, [isGovernanceRoute]);

  useEffect(() => {
    if (isGeographyRoute) setGeographyOpen(true);
  }, [isGeographyRoute]);

  const isAdmin = profile?.role === "admin";

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Explore</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Search" onClick={() => router.push("/search")}>
            <Search />
            <span>Search</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Register Your Space" onClick={() => router.push("/apply/space")}>
            <Sparkles />
            <span>Register Space</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <Collapsible defaultOpen className="group/collapsible group-data-[collapsible=icon]:hidden">
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
                {isLoading && <SidebarMenuSubItem><SidebarMenuSubButton disabled className="flex items-center gap-2"><Skeleton className="h-4 w-24" /></SidebarMenuSubButton></SidebarMenuSubItem>}
                {spaces?.map((space) => (
                  <SidebarMenuSubItem key={space.id}>
                    <SidebarMenuSubButton onClick={() => router.push(`/space/${space.slug}`)}>
                      <span>{space.name}</span>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
        <SidebarMenuItem>
          <Collapsible open={governanceOpen} onOpenChange={setGovernanceOpen} className="group/collapsible group-data-[collapsible=icon]:hidden">
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip="Governance">
                <Network />
                <span>Governance</span>
                <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton isActive={router.pathname.startsWith("/governance")} onClick={() => router.push("/governance")}>
                    <span>Other</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                {GOVERNANCE_DOMAINS.map((domain) => {
                  const DomainIcon = {
                    politics: Vote,
                    legislature: Landmark,
                    executive: Building2,
                    judiciary: Scale,
                  }[domain.value];
                  return (
                    <SidebarMenuSubItem key={domain.value}>
                      <SidebarMenuSubButton isActive={router.pathname.startsWith(`/${domain.value}`)} onClick={() => router.push(`/${domain.value}`)}>
                        <DomainIcon className="h-4 w-4" />
                        <span>{domain.label}</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  );
                })}
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton isActive={router.pathname === "/person" || router.pathname.startsWith("/person/")} onClick={() => router.push("/person")}>
                    <Users className="h-4 w-4" />
                    <span>People</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </CollapsibleContent>
          </Collapsible>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <Collapsible open={geographyOpen} onOpenChange={setGeographyOpen} className="group/collapsible group-data-[collapsible=icon]:hidden">
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip="Geography">
                <Map />
                <span>Geography</span>
                <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton isActive={router.pathname === "/geography" && !router.query.category} onClick={() => router.push("/geography")}>
                    <span>All boundaries</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton isActive={router.pathname === "/geography" && router.query.category === "administrative"} onClick={() => router.push("/geography?category=administrative")}>
                    <Landmark className="h-4 w-4" />
                    <span>Administrative</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton isActive={router.pathname === "/geography" && router.query.category === "local_government"} onClick={() => router.push("/geography?category=local_government")}>
                    <Building className="h-4 w-4" />
                    <span>Local government</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton isActive={router.pathname === "/geography" && router.query.category === "political"} onClick={() => router.push("/geography?category=political")}>
                    <Vote className="h-4 w-4" />
                    <span>Political</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </CollapsibleContent>
          </Collapsible>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Land-Based Classification Standards" onClick={() => router.push("/standards/lbcs")}>
            <MapPinned />
            <span>Land-Based Classification Standards</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="About" onClick={() => router.push("/about")}>
            <Info />
            <span>About Us</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      <LoginModal open={showLogin} onOpenChange={setShowLogin} />
    </SidebarGroup>
  );
}
