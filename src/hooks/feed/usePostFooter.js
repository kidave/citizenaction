"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export function usePostFooter(post, user) {

  /* -------------------------
     STATE (SYNC WITH VIEW)
  ------------------------- */
  const [supportCount, setSupportCount] = useState(post.support_count || 0);
  const [contributeCount, setContributeCount] = useState(post.contribute_count || 0);

  const [supported, setSupported] = useState(post.is_supported || false);
  const [contributing, setContributing] = useState(post.is_contributing || false);

  useEffect(() => {
    setSupportCount(post.support_count || 0);
    setContributeCount(post.contribute_count || 0);
    setSupported(post.is_supported || false);
    setContributing(post.is_contributing || false);
  }, [post]);

  /* -------------------------
     SUPPORT
  ------------------------- */
  async function handleSupport(e) {
    e?.stopPropagation();
    if (!user) return;

    if (supported) {
      const { error } = await supabase
        .from("action_support")
        .delete()
        .eq("action_id", post.id)
        .eq("user_id", user.id);

      if (error) return console.error(error);

      setSupported(false);
      setSupportCount((prev) => Math.max(prev - 1, 0));
    } else {
      const { error } = await supabase
        .from("action_support")
        .insert({
          action_id: post.id,
          user_id: user.id,
        });

      if (error) return console.error(error);

      setSupported(true);
      setSupportCount((prev) => prev + 1);
    }
  }

  /* -------------------------
     CONTRIBUTE
  ------------------------- */
  async function handleContribute(e) {
    e?.stopPropagation();
    if (!user) return;

    if (contributing) {
      const { error } = await supabase
        .from("action_contribute")
        .delete()
        .eq("action_id", post.id)
        .eq("user_id", user.id);

      if (error) return console.error(error);

      setContributing(false);
      setContributeCount((prev) => Math.max(prev - 1, 0));
    } else {
      const { error } = await supabase
        .from("action_contribute")
        .insert({
          action_id: post.id,
          user_id: user.id,
        });

      if (error) return console.error(error);

      setContributing(true);
      setContributeCount((prev) => prev + 1);
    }
  }

  return {
    supportCount,
    contributeCount,
    supported,
    contributing,
    handleSupport,
    handleContribute,
  };
}