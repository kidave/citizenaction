"use client";

import { useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import { useCreatePost } from "@/hooks/feed/useCreatePost";
import { useUpdatePost } from "@/hooks/feed/useUpdatePost";
import { useDeletePost } from "@/hooks/feed/useDeletePost";

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

  const now = new Date();

  const [type, setType] = useState(post?.type || "action");
  const [content, setContent] = useState(post?.details || "");
  const [attachments, setAttachments] = useState(post?.attachments || []);
  const [selectedAuthorities, setSelectedAuthorities] = useState(post?.governance_entities || []);

  const [date, setDate] = useState(post?.metadata?.date || "");
  const [time, setTime] = useState(post?.metadata?.time ?? null)
  const [location, setLocation] = useState(post?.metadata?.location || "");
  const [status, setStatus] = useState(post?.status || "");

  async function submit(onSuccess) {

    if (!content.trim()) {
      toast.error("Enter content.");
      return;
    }

    const { links, hashtags } = extractContentMeta(content);

    const metadata = {
      date,
      time,
      location,
      links,
      hashtags
    };

    try {

      if (post) {

        await updatePost({
          postId: post.id,
          postData: {
            author_id: user.id,
            type,
            details: content,
            summary: content.slice(0, 200),
            attachments,
            metadata,
            status,
            governance_entities: selectedAuthorities
          }
        });

      } else {

        await createPost({
          author_id: user.id,
          scope_type: scopeType,
          scope_code: scopeCode,
          type,
          summary: content.slice(0, 200),
          details: content,
          attachments,
          governance_entities: selectedAuthorities,
          metadata,
          status
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

    content,
    setContent,

    attachments,
    setAttachments,

    selectedAuthorities,
    setSelectedAuthorities,

    date,
    setDate,

    time,
    setTime,

    location,
    setLocation,

    status,
    setStatus,

    /* actions */

    submit,
    remove
  };
}