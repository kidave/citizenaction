"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AvatarGroup, Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import AuthoritySearchModal from "@/components/governance/AuthoritySearchModal";

export default function PostAuthoritySelector({
  selectedAuthorities,
  setSelectedAuthorities
}) {

  const [authorityOpen, setAuthorityOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3">
        <HoverCard>
          <HoverCardTrigger>
            <Button
              variant="outline"
              onClick={() => setAuthorityOpen(true)}
            >
              Tag Authority
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-64 text-sm">
            Tag the authority, department, designation, or person related to the action. This links your post to the concerned authority.
          </HoverCardContent>
        </HoverCard>

        {selectedAuthorities.length > 0 && (
          <AvatarGroup>

            {selectedAuthorities.map((e) => (
              <Avatar key={e.id} className="h-6 w-6">
                <AvatarImage src={e.image_url} />
                <AvatarFallback>
                  {e.label?.charAt(0) || "G"}
                </AvatarFallback>
              </Avatar>
            ))}

          </AvatarGroup>
        )}

      </div>

      <AuthoritySearchModal
        open={authorityOpen}
        onOpenChange={setAuthorityOpen}
        selected={selectedAuthorities}
        onChange={setSelectedAuthorities}
      />
    </>
  );
}