"use client";

import { Orbit, Handshake, ArrowBigUpDash } from "lucide-react";
import { useState, useEffect, useMemo } from "react";

import { useAuth } from "@/context/AuthContext";
import { usePostFooter } from "@/hooks/feed/usePostFooter";
import { useAuthorityActions } from "@/hooks/feed/useAuthorityActions";

import GovernanceAvatarGroups from "@/components/governance/GovernanceAvatarGroups";
import PostShareButton from "@/components/feed/PostShareButton";
import AuthoritySelectorModal from "@/components/governance/AuthoritySelectorModal";

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

  /* -------------------------
     🔹 MY AUTHORITIES (FROM DB)
  ------------------------- */
  const myAuthorities = useMemo(() => {
    return (post.governance_entities || [])
      .filter((e) => e.tagged_by === user?.id)
      .map((e) => ({
        id: e.id,
        label: e.label,
        image_url: e.image_url,
      }));
  }, [post.governance_entities, user?.id]);

  /* -------------------------
     🔹 LOCAL STATE (OPTIMISTIC)
  ------------------------- */
  const [selectedAuthorities, setSelectedAuthorities] =
    useState(myAuthorities);

  useEffect(() => {
    setSelectedAuthorities(myAuthorities);
  }, [myAuthorities]);

  /* -------------------------
     🔹 OPTIMISTIC DISPLAY (KEY FIX)
  ------------------------- */
  const displayAuthorities = useMemo(() => {
    const others = (post.governance_entities || []).filter(
      (e) => e.tagged_by !== user?.id
    );

    const mine = selectedAuthorities.map((e) => ({
      ...e,
      tagged_by: user?.id,
      tagged_by_name: "You",
      tagged_by_avatar: null,
    }));

    return [...others, ...mine];
  }, [post.governance_entities, selectedAuthorities, user?.id]);

  /* -------------------------
     🔹 SUBMIT (OPTIMISTIC)
  ------------------------- */
  async function handleAuthoritySubmit(selected) {
    const prev = selectedAuthorities;

    // ✅ instant UI update
    setSelectedAuthorities(selected);

    try {
      await updateAuthorities(selected);
    } catch (err) {
      console.error(err);

      // ❌ rollback if failed
      setSelectedAuthorities(prev);
    }
  }

  return (
    <TooltipProvider>
      <div className="flex items-center justify-between text-sm text-muted-foreground">

        {/* ================= LEFT ================= */}
        <div className="flex items-center gap-3">

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
              <TooltipContent>Tag authority</TooltipContent>
            </Tooltip>
          )}

          {/* 🔥 THIS NOW UPDATES INSTANTLY */}
          <GovernanceAvatarGroups entities={displayAuthorities} />

        </div>

        {/* ================= RIGHT ================= */}
        <div className="flex items-center gap-6">

          {/* SUPPORT */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleSupport}
                className={`flex items-center gap-2 transition ${
                  supported ? "text-primary font-medium" : "hover:text-foreground"
                }`}
              >
                <ArrowBigUpDash className="w-4 h-4" />
                {supportCount}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {supported ? "Remove support" : "Support"}
            </TooltipContent>
          </Tooltip>

          {/* CONTRIBUTE */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleContribute}
                className={`flex items-center gap-2 transition ${
                  contributing ? "text-primary font-medium" : "hover:text-foreground"
                }`}
              >
                <Handshake className="w-4 h-4" />
                {contributeCount}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {contributing ? "Withdraw" : "Contribute"}
            </TooltipContent>
          </Tooltip>

          <PostShareButton post={post} />

        </div>
      </div>

      {/* ================= MODAL ================= */}
      <AuthoritySelectorModal
        open={authorityOpen}
        onOpenChange={setAuthorityOpen}
        selected={selectedAuthorities}
        onChange={setSelectedAuthorities}
        onSubmit={handleAuthoritySubmit}
      />
    </TooltipProvider>
  );
}