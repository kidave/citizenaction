"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AvatarGroup,
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import AuthoritySearchModal from "@/components/governance/AuthoritySearchModal";

export default function PostAuthoritySelector({
  governance_entities,
  setSelectedAuthorities,
  onSubmit,
  mode = "editor"
}) {
  const [authorityOpen, setAuthorityOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3">

        <Button
          variant="outline"
          onClick={() => setAuthorityOpen(true)}
        >
          Tag Authority
        </Button>

        {governance_entities.length > 0 && (
          <AvatarGroup>
            {governance_entities.map((e) => (
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
        selected={governance_entities}
        onChange={setSelectedAuthorities}
        mode="editor"
      />
    </>
  );
}