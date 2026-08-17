"use client";

import { useState } from "react";
import { Orbit, ArrowBigUpDash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

import ContributorAvatarGroup from "@/components/feed/contribution/ContributorAvatarGroup";
import PostShareButton from "@/components/feed/PostShareButton";
import ContributionDrawer from "@/components/feed/contribution/ContributionDrawer";
import { LoginModal } from "@/components/auth/LoginModal";

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

export default function PostFooter({ post, queryKey, forceExpanded = false }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginAction, setLoginAction] = useState("continue");

  const stats = post.stats ?? {};

  const supportCount = stats.support_count ?? 0;
  const contributorCount = stats.contributor_count ?? 0;

  const supported = stats.is_supported ?? false;

  const contributors = post.contributors ?? [];

  function openLoginModal(action) {
    setLoginAction(action);
    setLoginOpen(true);
  }

  async function handleSupport(e) {
    e?.stopPropagation();

    if (!user) {
      openLoginModal("support");
      return;
    }

    if (!queryKey) {
      toast.error("Unable to update support right now.");
      return;
    }

    // ----------------------------------------
    // Optimistic update
    // ----------------------------------------

    queryClient.setQueryData(queryKey, (oldPosts) => {
      if (!Array.isArray(oldPosts)) {
        return oldPosts;
      }

      return oldPosts.map((item) => {
        if (item.id !== post.id) {
          return item;
        }

        const currentStats = item.stats ?? {};

        return {
          ...item,

          stats: {
            ...currentStats,

            support_count: supported
              ? Math.max(0, (currentStats.support_count ?? 0) - 1)
              : (currentStats.support_count ?? 0) + 1,

            is_supported: !supported,
          },
        };
      });
    });

    // ----------------------------------------
    // Database mutation
    // ----------------------------------------

    try {
      let error;

      if (supported) {
        ({ error } = await supabase
          .from("action_support")
          .delete()
          .eq("action_id", post.id)
          .eq("user_id", user.id));
      } else {
        ({ error } = await supabase.from("action_support").insert({
          action_id: post.id,
          user_id: user.id,
        }));
      }

      if (error) {
        throw error;
      }

      // ----------------------------------------
      // Reconcile with database
      // ----------------------------------------

      await queryClient.invalidateQueries({
        queryKey,
      });
    } catch (error) {
      // ----------------------------------------
      // Roll back optimistic update
      // ----------------------------------------

      queryClient.setQueryData(queryKey, (oldPosts) => {
        if (!Array.isArray(oldPosts)) {
          return oldPosts;
        }

        return oldPosts.map((item) => {
          if (item.id !== post.id) {
            return item;
          }

          const currentStats = item.stats ?? {};

          return {
            ...item,

            stats: {
              ...currentStats,

              support_count: supported
                ? (currentStats.support_count ?? 0) + 1
                : Math.max(0, (currentStats.support_count ?? 0) - 1),

              is_supported: supported,
            },
          };
        });
      });

      console.error("Failed to update post support", {
        message: error?.message,
        code: error?.code,
      });

      toast.error(error?.message || "Unable to update support.");
    }
  }

  function handleContributors(e) {
    e?.stopPropagation();

    if (!user) {
      openLoginModal("contribute");
      return;
    }

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
          {/* ----------------------------------------
              Contributors
          ----------------------------------------- */}

          <div className="flex items-center gap-2">
            {contributorCount > 0 && (
              <div
                onClick={(event) => {
                  // Prevent the post/card click handler
                  // from seeing avatar-group clicks.
                  event.stopPropagation();
                }}
              >
                <ContributorAvatarGroup contributors={contributors} />
              </div>
            )}
          </div>

          {/* ----------------------------------------
              Actions
          ----------------------------------------- */}

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

      <LoginModal
        open={loginOpen}
        onOpenChange={(open) => {
          setLoginOpen(open);

          if (!open) {
            setLoginAction("continue");
          }
        }}
        post={post}
        action={loginAction}
      />
    </>
  );
}
