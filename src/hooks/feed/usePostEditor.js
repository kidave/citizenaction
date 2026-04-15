"use client";


import { supabase } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import { useCreatePost } from "@/hooks/feed/useCreatePost";
import { useUpdatePost } from "@/hooks/feed/useUpdatePost";
import { useDeletePost } from "@/hooks/feed/useDeletePost";

import { postSchema } from "@/schemas/feed/postSchema";

/* -------------------- */
/* Helpers              */
/* -------------------- */

function extractContentMeta(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const hashtagRegex = /#(\w+)/g;

  const links = text.match(urlRegex) || [];
  const hashtags = [...text.matchAll(hashtagRegex)].map((m) => m[1]);

  return { links, hashtags };
}

/* -------------------- */
/* Hook                 */
/* -------------------- */

export function usePostEditor(post = null, profile = null) {
  const { user } = useAuth();

  const { createPost } = useCreatePost();
  const { updatePost } = useUpdatePost();
  const { deletePost } = useDeletePost();

  /* -------------------- */
  /* 🔥 SPACE + CLUB STATE */
  /* -------------------- */

  const [space_id, setSpaceId] = useState(null);
  const [club_id, setClubId] = useState(null);

  // 🔥 INITIALIZE FROM POST OR PROFILE

  useEffect(() => {
    if (!profile) return;

    // 🟢 EDIT MODE → use post values
    if (post) {
      setSpaceId(post.space_id);
      setClubId(post.club_id);
      return;
    }

    // 🔵 CREATE MODE → fallback defaults
    setSpaceId((prev) => {
      if (prev) return prev;
      return profile.primary_space?.id || null;
    });

    setClubId((prev) => {
      if (prev) return prev;
      return profile.primary_club?.id || null;
    });
  }, [profile, post]);


  /* -------------------- */
  /* Core State           */
  /* -------------------- */

  const [type, setType] = useState(post?.type || "action");
  const [title, setTitle] = useState(post?.summary || "");
  const [content, setContent] = useState(post?.details || "");
  const [attachments, setAttachments] = useState(post?.attachments || []);
  const [governance_entities, setSelectedAuthorities] =
    useState(post?.governance_entities || []);

  /* -------------------- */
  /* Metadata Fields      */
  /* -------------------- */

  const now = new Date();

  const [date, setDate] = useState(
    post?.date || now.toISOString().split("T")[0]
  );

  const [time, setTime] = useState(
    post?.time || now.toTimeString().slice(0, 5)
  );

  const [location, setLocation] = useState(post?.location || "");
  const [lat, setLat] = useState(post?.lat || null);
  const [lng, setLng] = useState(post?.lng || null);
  const [address, setAddress] = useState(post?.address || null);
  const [place_id, setPlaceId] = useState(post?.place_id || null);

  /* -------------------- */
  /* 🧠 NATURAL LANGUAGE  */
  /* -------------------- */

  function parseNaturalDate(input) {
    if (!input) return null;

    const now = new Date();
    const text = input.toLowerCase();

    let date = new Date(now);

    if (text.includes("tomorrow")) {
      date.setDate(now.getDate() + 1);
    }

    if (text.includes("today")) {
      date = now;
    }

    if (text.includes("next monday")) {
      const day = now.getDay();
      const diff = (8 - day) % 7 || 7;
      date.setDate(now.getDate() + diff);
    }

    const timeMatch = text.match(/(\d{1,2})(:(\d{2}))?\s*(am|pm)?/);

    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[3] || "0");

      if (timeMatch[4] === "pm" && hours < 12) hours += 12;
      if (timeMatch[4] === "am" && hours === 12) hours = 0;

      date.setHours(hours);
      date.setMinutes(minutes);
    }

    return {
      date: date.toISOString().split("T")[0],
      time: date.toTimeString().slice(0, 5),
    };
  }

  /* -------------------- */
  /* Timeline             */
  /* -------------------- */

  const [timeline, setTimeline] = useState(post?.timeline || []);

  function addTimelineEntry(entry, insertIndex = null) {
    setTimeline((prev) => {
      if (insertIndex === null) return [...prev, entry];
      const copy = [...prev];
      copy.splice(insertIndex, 0, entry);
      return copy;
    });
  }

  function updateTimelineEntry(index, updatedEntry) {
    setTimeline((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, ...updatedEntry } : item
      )
    );
  }

  function removeTimelineEntry(index) {
    setTimeline((prev) => prev.filter((_, i) => i !== index));
  }

  /* -------------------- */
  /* Submit               */
  /* -------------------- */

  async function submit(onSuccess) {
    if (!content.trim()) {
      toast.error("Enter content.");
      return;
    }

    if (!club_id || !space_id) {
      toast.error("Select space and club.");
      return;
    }

    const result = postSchema.safeParse({ type, date, time });

    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    const { data: club, error } = await supabase
      .from("club")
      .select("id, scope_type, scope_code")
      .eq("id", club_id)
      .single();

    if (error || !club) {
      toast.error("Invalid club selected");
      return;
    }


    const { links, hashtags } = extractContentMeta(content);

    const metadata = {
      date,
      time,
      location,
      lat,
      lng,
      place_id,
      address,
      links,
      hashtags,
      timeline: timeline.sort(
        (a, b) => new Date(a.at) - new Date(b.at)
      ),
    };

    try {
      if (post) {
        await updatePost({
          postId: post.id,
          postData: {
            author_id: user.id,
            club_id,
            space_id,
            scope_type: club.scope_type,
            scope_code: club.scope_code,
            type,
            details: content,
            summary: title || content.slice(0, 200),
            attachments,
            metadata,
            governance_entities,
          },
        });
      } else {
        await createPost({
          author_id: user.id,
          club_id,
          space_id,
          scope_type: club.scope_type,
          scope_code: club.scope_code,
          type,
          summary: title || content.slice(0, 200),
          details: content,
          attachments,
          governance_entities,
          metadata,
        });
      }

      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Something went wrong");
    }
  }

  async function remove(onSuccess) {
    if (!post) return;

    try {
      await deletePost(post.id);
      onSuccess?.();
    } catch (error) {
      console.error(error);
    }
  }

  return {
    type,
    setType,
    title,
    setTitle,
    content,
    setContent,
    attachments,
    setAttachments,
    governance_entities,
    setSelectedAuthorities,

    date,
    setDate,
    time,
    setTime,
    location,
    setLocation,
    lat,
    setLat,
    lng,
    setLng,
    address,
    setAddress,
    place_id,
    setPlaceId,

    /* 🔥 NEW */
    club_id,
    setClubId,
    space_id,
    setSpaceId,

    timeline,
    addTimelineEntry,
    updateTimelineEntry,
    removeTimelineEntry,
    setTimeline,

    /* 🔥 expose parser */
    parseNaturalDate,

    submit,
    remove,
  };
}