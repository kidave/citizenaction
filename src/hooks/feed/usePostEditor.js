"use client";

import { useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import { useCreatePost } from "@/hooks/feed/useCreatePost";
import { useUpdatePost } from "@/hooks/feed/useUpdatePost";
import { useDeletePost } from "@/hooks/feed/useDeletePost";

import { postSchema } from "@/schemas/feed/postSchema";
import { set } from "date-fns";

function extractContentMeta(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const hashtagRegex = /#(\w+)/g;

  const links = text.match(urlRegex) || [];
  const hashtags = [...text.matchAll(hashtagRegex)].map((m) => m[1]);

  return { links, hashtags };
}

export function usePostEditor(post = null) {
  const { user } = useAuth();

  const { createPost } = useCreatePost();
  const { updatePost } = useUpdatePost();
  const { deletePost } = useDeletePost();

  const scopeType = "country";
  const scopeCode = "IN";

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

  const [date, setDate] = useState(post?.date || "");
  const [time, setTime] = useState(post?.time ?? null);
  const [location, setLocation] = useState(post?.location || "");
  const [scope_type, setScopeType] = useState(post?.scope_type || "");
  const [scope_code, setScopeCode] = useState(post?.scope_code || "");

  /* -------------------- */
  /* Timeline State       */
  /* -------------------- */

  const [timeline, setTimeline] = useState(
    post?.timeline || []
  );

  /* -------------------- */
  /* Timeline Helpers     */
  /* -------------------- */

  function addTimelineEntry(entry, insertIndex = null) {
    setTimeline((prev) => {
      if (insertIndex === null) {
        return [...prev, entry];
      }

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
    setTimeline((prev) =>
      prev.filter((_, i) => i !== index)
    );
  }

  /* -------------------- */
  /* Submit               */
  /* -------------------- */

  async function submit(onSuccess) {
    if (!content.trim()) {
      toast.error("Enter content.");
      return;
    }

    const result = postSchema.safeParse({
      type,
      date,
      time,
    });

    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    const { links, hashtags } = extractContentMeta(content);

    const metadata = {
      date,
      time,
      location,
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
            type,
            details: content,
            summary: title || content.slice(0, 200),
            attachments,
            metadata,
            governance_entities: governance_entities,
          },
        });
      } else {
        await createPost({
          author_id: user.id,
          scope_type: scopeType,
          scope_code: scopeCode,
          type,
          summary: title || content.slice(0, 200),
          details: content,
          attachments,
          governance_entities: governance_entities,
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
    /* state */
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
    scope_type,
    setScopeType,
    scope_code,
    setScopeCode,

    timeline,

    /* timeline helpers */
    addTimelineEntry,
    updateTimelineEntry,
    removeTimelineEntry,
    setTimeline,

    /* actions */
    submit,
    remove,
  };
}