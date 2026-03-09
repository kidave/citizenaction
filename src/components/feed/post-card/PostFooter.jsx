"use client";

import { useState, useEffect } from "react";
import { Handshake, Orbit, ArrowBigUpDash } from "lucide-react";
import PostShareButton from "@/components/feed/PostShareButton";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase/client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function PostFooter({ post }) {
  const { user } = useAuth();

  const [supportCount, setSupportCount] = useState(post.support_count || 0);
  const [contributeCount, setContributeCount] = useState(post.contribute_count || 0);

  const [supported, setSupported] = useState(false);
  const [contributing, setContributing] = useState(false);

  /* -------------------------
     Load initial state
  ------------------------- */

  useEffect(() => {
    if (!user) return;

    async function checkState() {
      const { data: support } = await supabase
        .from("action_support")
        .select("action_id")
        .eq("action_id", post.id)
        .eq("user_id", user.id)
        .maybeSingle();

      setSupported(!!support);

      const { data: contribute } = await supabase
        .from("action_contribute")
        .select("action_id")
        .eq("action_id", post.id)
        .eq("user_id", user.id)
        .maybeSingle();

      setContributing(!!contribute);
    }

    checkState();
  }, [user, post.id]);

  /* -------------------------
     Support Toggle
  ------------------------- */

  async function handleSupport(e) {
    e.stopPropagation();
    if (!user) return;

    if (supported) {
      const { error } = await supabase
        .from("action_support")
        .delete()
        .eq("action_id", post.id)
        .eq("user_id", user.id);

      if (!error) {
        setSupported(false);
        setSupportCount((prev) => Math.max(prev - 1, 0));
      }
    } else {
      const { error } = await supabase
        .from("action_support")
        .insert({
          action_id: post.id,
          user_id: user.id,
        });

      if (!error) {
        setSupported(true);
        setSupportCount((prev) => prev + 1);
      }
    }
  }

  /* -------------------------
     Contribute Toggle
  ------------------------- */

  async function handleContribute(e) {
    e.stopPropagation();
    if (!user) return;

    if (contributing) {
      const { error } = await supabase
        .from("action_contribute")
        .delete()
        .eq("action_id", post.id)
        .eq("user_id", user.id);

      if (!error) {
        setContributing(false);
        setContributeCount((prev) => Math.max(prev - 1, 0));
      }
    } else {
      const { error } = await supabase
        .from("action_contribute")
        .insert({
          action_id: post.id,
          user_id: user.id,
        });

      if (!error) {
        setContributing(true);
        setContributeCount((prev) => prev + 1);
      }
    }
  }

  /* -------------------------
     Escalate
  ------------------------- */

  async function handleEscalate(e) {
    e.stopPropagation();
    if (!user) return;
    if (!post.governance_entities?.length) return;

    const authority = post.governance_entities[0];

    await supabase.from("action_escalate").insert({
      action_id: post.id,
      governance_entity_id: authority.id,
      escalated_by: user.id,
    });
  }

  return (
    <TooltipProvider>
      <div className="flex items-center justify-end gap-6 text-sm text-muted-foreground">

        {/* Support */}
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

        {/* Contribute */}
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

        {/* Escalate */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleEscalate}
              className="flex items-center gap-2 hover:text-foreground transition"
            >
              <Orbit className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            Tag
          </TooltipContent>
        </Tooltip>

        <PostShareButton post={post} />

      </div>
    </TooltipProvider>
  );
}