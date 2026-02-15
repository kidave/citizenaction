"use client";

import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";

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

import { LogIn } from "lucide-react";

export function Profile() {
  const router = useRouter();
  const { user, profile, logout } = useAuth();

  const handleLogin = () => {
    // Save current path before redirecting to login
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

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback>
                  {user.email?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {user.user_metadata?.full_name || user.email}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email || Account}
                </span>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent side="right" align="end" className="w-56">
            <DropdownMenuItem onClick={() => router.push("/user/profile")}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/user")}>
              Settings
            </DropdownMenuItem>

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
