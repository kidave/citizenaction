"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useEditor } from "@/hooks/editor/useEditor";
import { useCreatePost } from "@/hooks/post/useCreatePost";
import { useUpdatePost } from "@/hooks/post/useUpdatePost";
import { useDeletePost } from "@/hooks/post/useDeletePost";
import { postSchema } from "@/schemas/feed/postSchema";
import { supabase } from "@/lib/supabase/client";

function snapshot(editor) {
  return JSON.stringify({
    title: editor.title,
    content: editor.content,
    contentJson: editor.contentJson,
    contentFormat: editor.contentFormat,
    links: editor.links,
    start_at: editor.start_at,
    end_at: editor.end_at,
    datePrecision: editor.datePrecision,
    lat: editor.lat,
    lng: editor.lng,
    address: editor.address,
    spaces: editor.spaces,
    is_global: editor.is_global,
    governance: editor.governance,
  });
}

export function usePostEditor(item = null, initialSpace = null, options = {}) {
  const editor = useEditor(item, initialSpace);
  const { createPost } = useCreatePost();
  const { updatePost } = useUpdatePost();
  const { deletePost } = useDeletePost();
  const [draftId, setDraftId] = useState(item?.status === "draft" ? item.id : null);
  const [draftStatus, setDraftStatus] = useState("idle");
  const draftIdRef = useRef(draftId);
  const baselineRef = useRef(null);
  const saveTimerRef = useRef(null);
  const saveInFlightRef = useRef(false);

  useEffect(() => {
    draftIdRef.current = draftId;
  }, [draftId]);

  useEffect(() => {
    setDraftId(item?.status === "draft" ? item.id : null);
    setDraftStatus("idle");
    baselineRef.current = null;
  }, [item?.id]);

  useEffect(() => {
    if (baselineRef.current === null) baselineRef.current = snapshot(editor);
  });

  const draftPayload = useCallback(() => {
    const data = editor.getEditorData();
    return {
      p_space_ids: data.spaces?.map((space) => space.id) ?? [],
      p_title: data.title || null,
      p_content: data.content || null,
      p_metadata: data.metadata ?? {},
      p_start_at: data.start_at ?? null,
      p_end_at: data.end_at ?? null,
      p_lat: data.lat ?? null,
      p_lng: data.lng ?? null,
      p_address: data.address ?? null,
      p_governance_ids: data.governance?.map((g) => g.id) ?? [],
      p_content_json: data.content_json ?? null,
      p_content_format: data.content_format ?? "text",
    };
  }, [editor]);

  const saveDraftNow = useCallback(async () => {
    if (item || saveInFlightRef.current) return draftIdRef.current;

    saveInFlightRef.current = true;
    setDraftStatus("saving");

    try {
      const payload = draftPayload();
      let saved;

      if (!draftIdRef.current) {
        const { data, error } = await supabase.rpc("create_post_draft", payload);
        if (error) throw error;
        saved = data;
        const id = data?.id ?? data?.[0]?.id;
        if (!id) throw new Error("Draft was created without an id.");
        setDraftId(id);
        draftIdRef.current = id;
      } else {
        const { data, error } = await supabase.rpc("update_post", {
          p_post_id: draftIdRef.current,
          ...payload,
        });
        if (error) throw error;
        saved = data;
      }

      setDraftStatus("saved");
      return saved;
    } catch (error) {
      setDraftStatus("error");
      if (process.env.NODE_ENV !== "production") console.error("Draft save failed:", error);
      return null;
    } finally {
      saveInFlightRef.current = false;
    }
  }, [draftPayload, item]);

  useEffect(() => {
    if (item || baselineRef.current === null) return;
    if (snapshot(editor) === baselineRef.current) return;

    setDraftStatus("saving");
    window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      saveDraftNow();
    }, 900);

    return () => window.clearTimeout(saveTimerRef.current);
  }, [editor, item, saveDraftNow]);

  async function submit(onSuccess) {
    if (!editor.title.trim()) {
      toast.error("Enter a post title.");
      return;
    }
    if (!editor.content.trim()) {
      toast.error("Enter content.");
      return;
    }

    const result = postSchema.safeParse({
      start_at: editor.start_at,
      end_at: editor.end_at,
      address: editor.address,
      lat: editor.lat,
      lng: editor.lng,
    });
    if (!result.success) {
      toast.error(result.error.issues[0]?.message || "Check the post details.");
      return;
    }

    const data = editor.getEditorData();
    const payload = {
      author_id: data.author_id,
      spaces: data.spaces,
      is_global: data.is_global,
      governance: data.governance,
      title: data.title.trim(),
      content: data.content,
      content_json: data.content_json,
      content_format: data.content_format,
      attachments: data.attachments,
      start_at: data.start_at,
      end_at: data.end_at,
      lat: data.lat,
      lng: data.lng,
      address: data.address,
      links: data.links,
      metadata: data.metadata,
    };

    try {
      if (!item) await saveDraftNow();

      let savedPost;
      if (item) {
        savedPost = await updatePost({ postId: item.id, postData: payload });
      } else if (draftIdRef.current) {
        savedPost = await updatePost({ postId: draftIdRef.current, postData: payload });
        const { data: published, error } = await supabase.rpc("publish_post", {
          p_post_id: draftIdRef.current,
        });
        if (error) throw error;
        savedPost = published || savedPost;
      } else {
        savedPost = await createPost(payload);
      }

      setDraftStatus("idle");
      setDraftId(null);
      draftIdRef.current = null;
      onSuccess?.(savedPost);
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Failed to save post", { message: error?.message, code: error?.code, status: error?.status });
      }
      toast.error(error?.message || "Something went wrong");
    }
  }

  async function remove(onSuccess) {
    if (!item) return;
    try {
      await deletePost(item.id);
      onSuccess?.();
    } catch (error) {
      if (process.env.NODE_ENV !== "production") console.error("Failed to delete post", error);
      toast.error(error?.message || "Failed to delete post");
    }
  }

  return { ...editor, draftId, draftStatus, saveDraftNow, submit, remove };
}
