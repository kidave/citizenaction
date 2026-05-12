"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import { useCreatePost } from "@/hooks/feed/useCreatePost";
import { useUpdatePost } from "@/hooks/feed/useUpdatePost";
import { useDeletePost } from "@/hooks/feed/useDeletePost";

import { postSchema } from "@/schemas/feed/postSchema";
import { extractContentMeta } from "@/utils/text/contentMeta";

export function usePostEditor(post = null, profile = null) {
  const { user } = useAuth();

  const { createPost } = useCreatePost();
  const { updatePost } = useUpdatePost();
  const { deletePost } = useDeletePost();

  const [spaces, setSpaces] = useState([]);
  const [is_global, setIsGlobal] = useState(
    post?.is_global || false
  );

  const [governance_entities, setSelectedAuthorities] = useState(
    post?.governance_entities || []
  );

  const [type, setType] = useState(post?.type || "action");
  const [title, setTitle] = useState(post?.summary || "");
  const [content, setContent] = useState(post?.details || "");
  const [attachments, setAttachments] = useState(post?.attachments || []);
  
  const [start_at, setStartAt] = useState(
    post?.start_at || null
  );

  const [end_at, setEndAt] = useState(
    post?.end_at || null
  );

  const [lat, setLat] = useState(post?.lat || null);
  const [lng, setLng] = useState(post?.lng || null);
  const [address, setAddress] = useState(post?.address || null);
  const [meeting_link, setMeetingLink] = useState(
    post?.meeting_link || ""
  );

  const [timeline, setTimeline] = useState(post?.timeline || []);

  if (post) {

    setSpaces(
      post.spaces || []
    );

    setIsGlobal(
      !!post.is_global
    );
  }

  async function submit(onSuccess) {
    if (!content.trim()) {
      toast.error("Enter content.");
      return;
    }

    const result = postSchema.safeParse({ type, start_at, end_at });

    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    const { links, hashtags } = extractContentMeta(content);

    const metadata = {
      links,
      hashtags,
      timeline: [...timeline].sort(
        (a, b) => new Date(a.at) - new Date(b.at)
      ),
    };

    try {
      const payload = {
        author_id: user.id,

        spaces,
        is_global,

        governance_entities,

        type,
        summary: title || content.slice(0, 200),
        details: content,
        attachments,

        start_at: start_at ?? null,
        end_at: end_at ?? null,
        lat: lat ?? null,
        lng: lng ?? null,
        address: address ?? null,

        meeting_link: meeting_link || null,

        metadata,
      };

      if (post) {
        await updatePost({
          postId: post.id,
          postData: payload,
        });

        window.location.reload();

      } else {
        await createPost(payload);

        onSuccess?.();
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
    start_at,
    setStartAt,
    end_at,
    setEndAt,
    lat,
    setLat,
    lng,
    setLng,
    address,
    setAddress,
    meeting_link,
    setMeetingLink,
    timeline,
    setTimeline,
    spaces,
    setSpaces,
    is_global,
    setIsGlobal,
    governance_entities,
    setSelectedAuthorities,
    submit,
    remove,
  };
}