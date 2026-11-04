"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
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
  const isGovernanceRoute = router.pathname.startsWith("/governance")
    || ["/politics", "/legislature", "/executive", "/judiciary"].some((path) => router.pathname.startsWith(path));
  const [governanceOpen, setGovernanceOpen] = useState(isGovernanceRoute);

  useEffect(() => {
    if (isGovernanceRoute) setGovernanceOpen(true);
  }, [router.pathname]);

  const isAdmin = profile?.role === "admin";

  re¶»§q«^