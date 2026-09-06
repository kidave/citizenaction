"use client";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { useMyProfile } from "@/hooks/user/useMyProfile";

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ShieldCheck, LogIn } from "lucide-react";

export function Profile() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { data: profile, isLoading } = useMyProfile();

  const handleLogin = () => {
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname + window.location.search;

      if (currentPath !== "/auth/login") {
        localStorage.setItem("returnTo", currentPath);
      }
    }

    router.push("/auth/login");
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (!user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            tooltip="Login"
            onClick={handleLogin}
            className="w-full justify-start gap-2"
          >
            <LogIn className="h-4 w-4" />
            <span>Login</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (isLoading || !profile) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarFallback>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent" />
              </AvatarFallback>
            </Avatar>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  const isAdmin = profile.role === "admin";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback>
                  {profile.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {profile.name || user.email}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  @{profile.username}
                </span>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent side="top" align="end" className="w-56">
            <DropdownMenuItem onClick={() => router.push(`/user/${profile.username}`)}>
              Profile
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => router.push("/settings")}>
              Settings
            </DropdownMenuItem>

            {isAdmin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/admin")}>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Administration
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/admin/governance")}>
                  Governance Review
                </DropdownMenuItem>
              </>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 focus:text-red-600"
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
