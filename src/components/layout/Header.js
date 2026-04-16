import Link from "next/link";
import { useRouter } from "next/router";
import { FiMenu } from "react-icons/fi";

import Logo from "@/components/layout/Logo";
import { useAuth } from "@/context/AuthContext";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    label: "Space",
    items: [
      {
        title: "Search for active spaces",
        href: "/search/space",
      },
      {
        title: "Apply to register your space",
        href: "/apply/space",
      },
    ],
  },
  {
    label: "Club",
    items: [
      {
        title: "Search for active clubs",
        href: "/search/club",
      },
    ],
  },
  {
    label: "Location",
    items: [
      {
        title: "Mumbai Metropolitan Region",
        href: "/space/walkingproject/region/MH-MMR",
      },
    ],
  },
];

export default function Header() {
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

  return (
    <header className="fixed top-0 z-50 w-full lg:hidden bg-gradient-to-br from-indigo-500/10 to-purple-600/10">
      <div className="h-16 max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* BRAND */}
        <Logo />

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-6">
          {/* DESKTOP: SINGLE NAVIGATION BUTTON WITH DROPDOWN */}
          <div className="hidden lg:flex">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-transparent hover:bg-indigo-100 hover:text-indigo-700 border-indigo-300"
                >
                  <FiMenu className="mr-2" />
                  Navigation
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-64 p-3"
              >
                {NAV_ITEMS.map((nav) => (
                  <div key={nav.label} className="mb-3 last:mb-0">
                    <p className="text-xs font-semibold text-muted-foreground mb-2 px-2">
                      {nav.label}
                    </p>
                    <div className="space-y-1">
                      {nav.items.map((item) => (
                        <DropdownMenuItem
                          key={item.title}
                          onClick={() => router.push(item.href)}
                          className="px-2 py-2 cursor-pointer rounded-md hover:bg-muted"
                        >
                          <div>
                            <div className="font-medium">{item.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {item.description}
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* AUTH AREA */}
          {!user ? (
            <Button size="sm" onClick={handleLogin}>
              Login
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="w-9 h-9 flex items-center justify-center">
                  <button
                    className="rounded-full focus:outline-none"
                    aria-label="User menu"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={
                          profile?.avatar_url ||
                          "/user1.png"
                        }
                      />
                      <AvatarFallback>
                        {user.email?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" sideOffset={8} className="w-40">
                <DropdownMenuItem onClick={() => router.push("/user/profile")}>
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* MOBILE MENU - Keeps the same Sheet */}
          <div className="flex lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="ghost" aria-label="Open menu">
                  <FiMenu size={20} />
                </Button>
              </SheetTrigger>

              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>Navigation</SheetTitle>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                  {NAV_ITEMS.map((nav) => (
                    <div key={nav.label}>
                      <p className="text-sm font-semibold text-muted-foreground mb-2">
                        {nav.label}
                      </p>

                      <div className="space-y-1">
                        {nav.items.map((item) => (
                          <button
                            key={item.title}
                            className="w-full text-left rounded-md px-3 py-2 text-sm hover:bg-muted"
                            onClick={() => router.push(item.href)}
                          >
                            {item.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  {!user ? (
                    <Button className="w-full" onClick={handleLogin}>
                      Login
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => router.push("/user/profile")}
                      >
                        My Profile
                      </Button>
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={handleLogout}
                      >
                        Logout
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}