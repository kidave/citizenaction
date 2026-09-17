"use client";

import Link from "next/link";
import { useState } from "react";

import { motion } from "framer-motion";
import { CalendarDays, MapPin } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function MemberCard({ member }) {
  const [isHovered, setIsHovered] = useState(false);

  if (!member) return null;

  const hasMessage = Boolean(member.membership_message?.trim());
  const memberInitial = member.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <Card
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative h-[470px] overflow-hidden rounded-[28px] bg-muted transition-all duration-300"
    >
      <div className="flex h-full flex-col">
        {/* Member identity */}
        <Link href={`/user/${member.username}`} className="block shrink-0">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 shrink-0">
                <AvatarImage src={member.avatar_url || undefined} />
                <AvatarFallback>{memberInitial}</AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <div className="truncate font-medium">
                  {member.name || "Unnamed User"}
                </div>
              </div>
            </div>
          </CardContent>
        </Link>

        {/* Member story */}
        <div className="flex min-h-0 flex-1 flex-col justify-between border-t bg-background p-5">
          <div className="min-h-0">
            {(member.designation || member.locality) && (
              <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                {member.designation ? (
                  <span className="truncate font-medium text-foreground">
                    {member.designation}
                  </span>
                ) : null}

                {member.designation && member.locality ? (
                  <span aria-hidden="true">·</span>
                ) : null}

                {member.locality ? (
                  <span className="flex min-w-0 items-center gap-1 truncate">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{member.locality}</span>
                  </span>
                ) : null}
              </div>
            )}

            {hasMessage ? (
              <div className="mt-5">
                <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Their introduction
                </p>
                <p className="line-clamp-6 whitespace-pre-wrap text-sm leading-6">
                  “{member.membership_message}”
                </p>
              </div>
            ) : (
              <p className="mt-5 text-sm text-muted-foreground">
                No introduction provided.
              </p>
            )}
          </div>

          {member.created_at ? (
            <div className="mt-6 flex shrink-0 items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5 shrink-0" />
              <span>Member since {formatDate(member.created_at)}</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Full introduction on hover, following the activity preview pattern */}
      <motion.div
        initial={false}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.22 }}
        className="pointer-events-none absolute inset-0 flex flex-col bg-muted"
        aria-hidden={!isHovered}
      >
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {member.name || "Member"}
          </div>

          <div className="mt-3 whitespace-pre-wrap text-sm leading-6">
            {hasMessage ? member.membership_message : "No introduction provided."}
          </div>
        </div>

        <CardContent className="shrink-0 flex items-center justify-between p-5 pt-3">
          <div className="flex min-w-0 items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={member.avatar_url || undefined} />
              <AvatarFallback>{memberInitial}</AvatarFallback>
            </Avatar>

            <span className="truncate text-xs font-medium">
              {member.name || "Unnamed User"}
            </span>
          </div>

          {member.created_at ? (
            <div className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              <span>{formatDate(member.created_at)}</span>
            </div>
          ) : null}
        </CardContent>
      </motion.div>
    </Card>
  );
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
