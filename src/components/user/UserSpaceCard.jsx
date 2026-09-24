"use client";

import { useRouter } from "next/router";
import { Users } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function UserSpaceCard({ space }) {
  const router = useRouter();

  if (!space) {
    return null;
  }

  const handleNavigate = () => {
    if (!space.slug) {
      return;
    }

    router.push(`/space/${space.slug}`);
  };

  const spaceName = space.name || space.space_name || "Unnamed Space";

  const role = space.role || space.member_role || "Member";

  const logo = space.logo_url || space.space_logo || null;

  return (
    <Card
      onClick={handleNavigate}
      className="group relative flex aspect-[3/4] cursor-pointer flex-col overflow-hidden rounded-xl border bg-muted/30 p-3 shadow-none transition-colors hover:bg-muted/60"
    >
      {/* SPACE LOGO */}

      <div className="flex flex-1 items-center justify-center">
        <Avatar className="h-16 w-16 rounded-2xl sm:h-20 sm:w-20 sm:rounded-3xl">
          <AvatarImage src={logo || undefined} alt={spaceName} />

          <AvatarFallback className="rounded-2xl text-lg sm:text-xl">
            {spaceName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* SPACE INFO */}

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{spaceName}</p>

        <div className="mt-1 flex items-center gap-1.5">
          <p className="truncate text-xs uppercase text-muted-foreground">
            {role}
          </p>
        </div>
      </div>
    </Card>
  );
}
