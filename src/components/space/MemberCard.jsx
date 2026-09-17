"use client";

import Link from "next/link";

import { Mail, MapPin, Phone } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function MemberCard({ member }) {
  if (!member) return null;

  return (
    <Card className="h-full overflow-hidden transition-colors hover:bg-muted/40">
      <CardContent className="p-5">
        <Link href={`/user/${member.username}`} className="block">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 shrink-0">
              <AvatarImage src={member.avatar_url || undefined} />
              <AvatarFallback>
                {member.name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <div className="truncate font-medium">
                {member.name || "Unnamed User"}
              </div>
              <div className="truncate text-sm text-muted-foreground">
                @{member.username}
              </div>
            </div>
          </div>
        </Link>

        {(member.designation || member.locality) && (
          <div className="mt-4 space-y-1">
            {member.designation && (
              <p className="text-sm font-medium">{member.designation}</p>
            )}
            {member.locality && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{member.locality}</span>
              </p>
            )}
          </div>
        )}

        {member.membership_message ? (
          <div className="mt-5 rounded-lg bg-muted/50 p-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Their introduction
            </p>
            <p className="line-clamp-5 whitespace-pre-wrap text-sm leading-6">
              “{member.membership_message}”
            </p>
          </div>
        ) : null}

        {(member.email || member.mobile) && (
          <div className="mt-4 space-y-2 border-t pt-3">
            {member.email && (
              <a
                href={`mailto:${member.email}`}
                className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
                onClick={(event) => event.stopPropagation()}
              >
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{member.email}</span>
              </a>
            )}
            {member.mobile && (
              <a
                href={`tel:${member.mobile}`}
                className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
                onClick={(event) => event.stopPropagation()}
              >
                <Phone className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{member.mobile}</span>
              </a>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
