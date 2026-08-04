"use client";

import { useState } from "react";
import { Orbit, ArrowBigUpDash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

import ContributorAvatarGroup from "@/components/feed/contribution/ContributorAvatarGroup";
import PostShareButton from "@/components/feed/PostShareButton";
import ContributionDrawer from "@/components/feed/contribution/ContributionDrawer";

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

export default function PostFooter({ post, forceExpanded = false }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const stats = post.stats ?? {};

  const supportCount = stats.support_count ?? 0;

  const contributionCount = stats.contribution_count ?? 0;

  const contributorCount = stats.contributor_count ?? 0;

  const supported = stats.is_supported ?? false;

  const contributors = post.contributors ?? [];

  async function handleSupport(e) {
    e?.stopPropagation();

    if (!user) return;

    queryClient.setQueryData(["post-stats", post.id, user?.id], (old) => {
      if (!old) return old;

      return {
        ...old,
        support_count: supported
          ? old.support_count - 1
          : old.support_count + 1,
        is_supported: !supported,
      };
    });

    try {
      if (supported) {
        await supabase
          .from("action_support")
          .delete()
          .eq("action_id", post.id)
          .eq("user_id", user.id);
      } else {
        await supabase.from("action_support").insert({
          action_id: post.id,
          user_id: user.id,
        });
      }
    } catch (err) {
      console.error(err);

      queryClient.invalidateQueries({
        queryKey: ["post-stats", post.id],
      });
    }
  }

  function handleContributors(e) {
    e?.stopPropagation();

    if (forceExpanded) {
      document.getElementById("post-contributions")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      return;
    }

    setDrawerOpen(true);
  }

  return (
    <>
      <TooltipProvider>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            {contributorCount > 0 && (
              <Button onClick={handleContributors} variant="ghost">
                <ContributorAvatarGroup contributors={contributors} />
              </Button>
            )}
          </div>

          <div className="flex items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={handleSupport}
                  className={`flex items-center gap-2 hover:text-primary ${
                    supported ? "font-medium text-primary" : ""
                  }`}
                >
                  <ArrowBigUpDash className="h-4 w-4" />
                  {supportCount}
                </Button>
              </TooltipTrigger>

              <TooltipContent>
                {supported ? "Remove support" : "Support"}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={handleContributors}
                  className="flex items-center gap-2 hover:text-primary"
                >
                  <Orbit className="h-4 w-4" />
                  {contributorCount}
                </Button>
              </TooltipTrigger>

              <TooltipContent>Contribute</TooltipContent>
            </Tooltip>

            <PostShareButton post={post} />
          </div>
        </div>
      </TooltipProvider>

      {!forceExpanded && (
        <ContributionDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          post={post}
        />
      )}
    </>
  );
}
