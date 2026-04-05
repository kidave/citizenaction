"use client";

import { Orbit, Handshake, ArrowBigUpDash } from "lucide-react";
import { useState, useEffect } from "react";

import { useAuth } from "@/context/AuthContext";
import { usePostFooter } from "@/hooks/feed/usePostFooter";
import { useAuthorityActions } from "@/hooks/feed/useAuthorityActions";
import GovernanceAvatarGroups from "@/components/governance/GovernanceAvatarGroups";
import PostShareButton from "@/components/feed/PostShareButton";
import AuthoritySearchModal from "@/components/governance/AuthoritySearchModal";

import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

export default function PostFooter({ post }) {
  const { user } = useAuth();
  const [authorityOpen, setAuthorityOpen] = useState(false);

  const {
    supportCount,
    contributeCount,
    supported,
    contributing,
    handleSupport,
    handleContribute,
  } = usePostFooter(post, user);

  const { updateAuthorities } = useAuthorityActions(post.id, user);

  const [authorities, setAuthorities] = useState(
    post.governance_entities || []
  );

  /* -------------------------
     SYNC WITH POST
  ------------------------- */
  useEffect(() => {
    setAuthorities(post.governance_entities || []);
  }, [post.governance_entities]);

  /* -------------------------
     DEDUPE FOR DISPLAY
  ------------------------- */
  const uniqueAuthorities = Array.from(
    new Map((authorities || []).map((a) => [a.id, a])).values()
  );

  /* -------------------------
     SUBMIT (SINGLE AUTHORITY)
  ------------------------- */
  async function handleAuthoritySubmit(selected) {
    const single = selected?.slice(0, 1); // enforce 1

    const prev = authorities;
    setAuthorities(single);

    try {
      await updateAuthorities(single);
    } catch {
      setAuthorities(prev);
    }
  }

  return (
    <TooltipProvider>
      <div className="flex items-center justify-between text-sm text-muted-foreground">

        {/* ================= LEFT ================= */}
        <div className="flex items-center gap-3">

          {/* BUTTON */}
          {user && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setAuthorityOpen(true);
                  }}
                  className="hover:text-foreground transition"
                >
                  <Orbit className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                Tag authority
              </TooltipContent>
            </Tooltip>
          )}

          {/* GOVERNANCE AVATARS */}
          <GovernanceAvatarGroups entities={authorities} />

        </div>

        {/* ================= RIGHT ================= */}
        <div className="flex items-center gap-6">

          {/* SUPPORT */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleSupport}
                className={`flex items-center gap-2 transition ${
                  supported
                    ? "text-primary font-medium"
                    : "hover:text-foreground"
                }`}
              >
                <ArrowBigUpDash className="w-4 h-4" />
                {supportCount}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {supported ? "Remove support" : "Support this action"}
            </TooltipContent>
          </Tooltip>

          {/* CONTRIBUTE */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleContribute}
                className={`flex items-center gap-2 transition ${
                  contributing
                    ? "text-primary font-medium"
                    : "hover:text-foreground"
                }`}
              >
                <Handshake className="w-4 h-4" />
                {contributeCount}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {contributing
                ? "Withdraw contribution"
                : "Contribute to this action"}
            </TooltipContent>
          </Tooltip>

          <PostShareButton post={post} />

        </div>
      </div>

      {/* ================= MODAL ================= */}
      <AuthoritySearchModal
        open={authorityOpen}
        onOpenChange={setAuthorityOpen}
        selected={uniqueAuthorities.slice(0, 1)} // enforce single
        onChange={(list) => setAuthorities(list.slice(0, 1))}
        onSubmit={handleAuthoritySubmit}
        existingIds={uniqueAuthorities.map((e) => e.id)}
        existingEntities={authorities}
      />
    </TooltipProvider>
  );
}