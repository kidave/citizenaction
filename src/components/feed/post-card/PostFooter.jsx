"use client";

import { Orbit, ArrowBigUpDash } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { usePostStats } from "@/hooks/feed/usePostStats";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

import AttendeeAvatarGroup from "@/components/feed/post-meeting/AttendeeAvatarGroup";
import GovernanceAvatarGroups from "@/components/governance/GovernanceAvatarGroups";
import PostShareButton from "@/components/feed/PostShareButton";
import { usePostMeeting } from "@/hooks/feed/usePostMeeting";
import { usePostGovernance } from "@/hooks/feed/usePostGovernance";

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

export default function PostFooter({ post }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data } = usePostStats(post.id, user?.id);

  const supportCount = data?.support_count || 0;
  const contributeCount = data?.contribute_count || 0;

  const supported = data?.is_supported || false;
  const contributing = data?.is_contributing || false;

  const { data: contributors = [] } = usePostMeeting(post?.id);
  const { data: governance = [] } = usePostGovernance(post?.id);

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

  async function handleContribute(e) {
    e?.stopPropagation();

    if (!user) return;

    queryClient.setQueryData(["post-stats", post.id, user?.id], (old) => {
      if (!old) return old;

      return {
        ...old,
        contribute_count: contributing
          ? old.contribute_count - 1
          : old.contribute_count + 1,
        is_contributing: !contributing,
      };
    });

    try {
      if (contributing) {
        await supabase
          .from("action_contribute")
          .delete()
          .eq("action_id", post.id)
          .eq("user_id", user.id);
      } else {
        await supabase.from("action_contribute").insert({
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

  return (
    <TooltipProvider>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-3">
          <GovernanceAvatarGroups entities={governance} />
          <AttendeeAvatarGroup attendees={contributors} />
        </div>

        <div className="flex items-center gap-6">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleSupport}
                className={`flex items-center gap-2 hover:text-primary ${
                  supported ? "font-medium text-primary" : ""
                }`}
              >
                <ArrowBigUpDash className="h-4 w-4" />
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
                  contributing ? "font-medium text-primary" : ""
                }`}
              >
                <Orbit className="h-4 w-4" />
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
