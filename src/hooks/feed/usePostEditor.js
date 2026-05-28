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

  const [is_global, setIsGlobal] = useState(post?.is_global || false);

  const [governance_entities, setSelectedAuthorities] = useState(
    post?.governance_entities || [],
  );

  const [type, setType] = useState(post?.type || "action");

  const [title, setTitle] = useState(post?.summary || "");

  const [content, setContent] = useState(post?.details || "");

  const [attachments, setAttachments] = useState(post?.attachments || []);

  const [start_at, setStartAt] = useState(post?.start_at || null);

  const [end_at, setEndAt] = useState(post?.end_at || null);

  const [lat, setLat] = useState(post?.lat || null);

  const [lng, setLng] = useState(post?.lng || null);

  const [address, setAddress] = useState(post?.address || null);

  const [meeting_link, setMeetingLink] = useState(post?.meeting_link || "");

  const [timeline, setTimeline] = useState(post?.timeline || []);

  useEffect(() => {
    console.log("EDITOR MOUNT");

    if (!post) return;

    console.log("POST LOADED", post);

    setSpaces(post.spaces || []);

    setIsGlobal(!!post.is_global);
  }, [post]);

  async function submit(onSuccess) {
    console.log("SUBMIT START");

    if (!content.trim()) {
      console.log("CONTENT EMPTY");

      toast.error("Enter content.");

      return;
    }

    const result = postSchema.safeParse({
      type,
      start_at,
      end_at,
    });

    console.log("VALIDATION RESULT", result);

    if (!result.success) {
      console.log("VALIDATION FAILED", result.error);

      toast.error(result.error.errors[0].message);

      return;
    }

    const { links, hashtags } = extractContentMeta(content);

    const metadata = {
      links,
      hashtags,

      timeline: [...timeline].sort((a, b) => new Date(a.at) - new Date(b.at)),
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

      console.log("PAYLOAD", payload);

      if (post) {
        console.log("UPDATING POST", post.id);

        await updatePost({
          postId: post.id,

          postData: payload,
        });

        console.log("UPDATE SUCCESS");
      } else {
        console.log("CREATING POST");

        const created = await createPost(payload);

        console.log("CREATE SUCCESS", created);
      }

      console.log("RUNNING SUCCESS CALLBACK");

      onSuccess?.();

      console.log("SUCCESS CALLBACK FINISHED");
    } catch (error) {
      console.error("SUBMIT ERROR");

      console.error(error);

      toast.error(error.message || "Something went wrong");
    }
  }

  async function remove(onSuccess) {
    if (!post) return;

    try {
      console.log("DELETING POST", post.id);

      await deletePost(post.id);

      console.log("DELETE SUCCESS");

      onSuccess?.();
    } catch (error) {
      console.error("DELETE ERROR");

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
