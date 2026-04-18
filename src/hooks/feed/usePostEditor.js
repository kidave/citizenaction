"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import { useCreatePost } from "@/hooks/feed/useCreatePost";
import { useUpdatePost } from "@/hooks/feed/useUpdatePost";
import { useDeletePost } from "@/hooks/feed/useDeletePost";

import { postSchema } from "@/schemas/feed/postSchema";

function extractContentMeta(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const hashtagRegex = /#(\w+)/g;

  const links = text.match(urlRegex) || [];
  const hashtags = [...text.matchAll(hashtagRegex)].map((m) => m[1]);

  return { links, hashtags };
}

export function usePostEditor(post = null, profile = null) {
  const { user } = useAuth();

  const { createPost } = useCreatePost();
  const { updatePost } = useUpdatePost();
  const { deletePost } = useDeletePost();

  const [space_id, setSpaceId] = useState(null);

  const [scope_type, setScopeType] = useState(null);
  const [scope_code, setScopeCode] = useState(null);
  const [scope_name, setScopeName] = useState(null);

  const [isGlobal, setIsGlobal] = useState(false);


  useEffect(() => {
    if (post) {
      setSpaceId(post.space_id || null);
      setScopeType(post.scope_type || null);
      setScopeCode(post.scope_code || null);
      setScopeName(post.scope_name || null);
      setIsGlobal(post.is_global || false);
      return;
    }

    if (profile) {
      setSpaceId(profile?.primary_space?.id || null);
    }
  }, [post, profile]);

  const [governance_entities, setSelectedAuthorities] = useState(post?.governance_entities || []);
  const [type, setType] = useState(post?.type || "action");
  const [title, setTitle] = useState(post?.summary || "");
  const [content, setContent] = useState(post?.details || "");
  const [attachments, setAttachments] = useState(post?.attachments || []);

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

  async function submit(onSuccess) {
    if (!content.trim()) {
      toast.error("Enter content.");
      return;
    }

    if (!space_id && !scope_code && !isGlobal) {
      toast.error("Select location, space or mark as global");
      return;
    }

    const result = postSchema.safeParse({ type, date, time });

    if (!result.success) {
      toast.error(result.error.errors[0].message);
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
      const payload = {
        author_id: user.id,
        space_id: space_id || null,

        scope_type: scope_type || null,
        scope_code: scope_code || null,
        scope_name: scope_name || null,

        is_global: isGlobal,
        governance_entities,
        type,
        summary: title || content.slice(0, 200),
        details: content,
        attachments,
        metadata,
      };

      if (post) {
        await updatePost({
          postId: post.id,
          postData: payload,
        });
      } else {
        await createPost(payload);
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

    timeline,
    addTimelineEntry,
    updateTimelineEntry,
    removeTimelineEntry,
    setTimeline,

    space_id,
    setSpaceId,

    scope_type,
    setScopeType,
    scope_code,
    setScopeCode,
    scope_name,
    setScopeName,

    isGlobal,
    setIsGlobal,

    governance_entities,
    setSelectedAuthorities,

    submit,
    remove,
  };
}