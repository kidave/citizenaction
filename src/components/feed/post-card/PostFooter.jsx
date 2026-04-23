"use client";

import { Orbit, ArrowBigUpDash } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { usePostFooter } from "@/hooks/feed/usePostFooter";

import GovernanceAvatarGroups from "@/components/governance/GovernanceAvatarGroups";
import PostShareButton from "@/components/feed/PostShareButton";

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

export default function PostFooter({ post }) {
  const { user } = useAuth();

  const {
    supportCount,
    contributeCount,
    supported,
    contributing,
    handleSupport,
    handleContribute,
  } = usePostFooter(post, user);

  return (
    <TooltipProvider>
      <div className="flex items-center justify-between text-sm text-muted-foreground">

        {/* LEFT */}
        <div className="flex items-center gap-3">

          <GovernanceAvatarGroups
            entities={post.governance_entities || []}
          />

        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-6">

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleSupport}
                className={`flex items-center gap-2 hover:text-primary ${
                  supported ? "text-primary font-medium" : ""
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

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleContribute}
                className={`flex items-center gap-2 hover:text-primary ${
                  contributing ? "text-primary font-medium" : ""
                }`}
              >
                <Orbit className="w-4 h-4" />
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
    </TooltipProvider>
  );
}