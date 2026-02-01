import Link from "next/link";
import { useRouter } from "next/router";
import { FiMenu } from "react-icons/fi";

import Logo from "components/ui/Logo";
import { useAuth } from "context/AuthContext";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    label: "Community",
    items: [
      {
        title: "Search",
        href: "/search/community",
        description: "Search for active communities",
      },
      {
        title: "Search",
        href: "/search/committee",
        description: "Search for active committees",
      },
      {
        title: "Apply",
        href: "/apply/community",
        description: "Apply to register your community",
      },
    ],
  },
  {
    label: "Location",
    items: [
      {
        title: "Mumbai Metropolitan Region",
        href: "/community/walkingproject/committee/region/MH-MMR",
        description: "Explore wards and civic activity across MMR",
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
    <header className="fixed top-0 z-50 w-full bg-gradient-to-br
          from-indigo-500/10
          to-purple-600/10">
      <div className="h-16 max-w-7xl mx-auto px-4 flex items-center justify-between">

        {/* BRAND */}
        <Logo />

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-6">

          {/* DESKTOP NAV */}
          <div className="hidden lg:flex">
            <NavigationMenu>
              <NavigationMenuList className="gap-2">
                {NAV_ITEMS.map((nav) => (
                  <NavigationMenuItem key={nav.label}>
                    <NavigationMenuTrigger
                      className="bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent"
                    >
                      {nav.label}
                    </NavigationMenuTrigger>

                    <NavigationMenuContent>
                      <ul className="grid gap-3 p-4 w-[320px]">
                        {nav.items.map((item) => (
                          <li key={item.title}>
                            <NavigationMenuLink asChild>
                              <Link
                                href={item.href}
                                className={cn(
                                  "block rounded-md p-3 no-underline transition-colors",
                                  "hover:bg-muted focus:bg-muted"
                                )}
                              >
                                <div className="text-sm font-medium">
                                  {item.title}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {item.description}
                                </p>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* AUTH AREA */}
          {!user ? (
            // Changed from Link to Button with onClick handler
            <Button size="sm" onClick={handleLogin}>
              Login
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {/* FIXED-SIZE WRAPPER prevents layout shift */}
                <div className="w-9 h-9 flex items-center justify-center">
                  <button
                    className="rounded-full focus:outline-none"
                    aria-label="User menu"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={
                          profile?.avatar_url ||
                          user.user_metadata?.avatar_url ||
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

              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-40"
              >
                <DropdownMenuItem onClick={() => router.push("/user/profile")}>
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* MOBILE MENU */}
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
                    <Button
                      className="w-full"
                      onClick={handleLogin}
                    >
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