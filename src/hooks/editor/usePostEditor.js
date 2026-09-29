"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useEditor } from "@/hooks/editor/useEditor";
import { useCreatePost } from "@/hooks/post/useCreatePost";
import { useUpdatePost } from "@/hooks/post/useUpdatePost";
import { useDeletePost } from "@/hooks/post/useDeletePost";
import { postSchema } from "@/schemas/feed/postSchema";
import { supabase } from "@/lib/supabase/client";

function snapshot(editor, expectedSpaces = editor.spaces, expectedFormat = editor.contentFormat) {
  return JSON.stringify({
    title: editor.title,
    content: editor.content,
    contentJson: editor.contentJson,
    contentFormat: expectedFormat,
    links: editor.links,
    start_at: editor.start_at,
    end_at: editor.end_at,
    datePrecision: editor.datePrecision,
    lat: editor.lat,
    lng: editor.lng,
    address: editor.address,
    spaces: expectedSpaces,
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

  useEffect(() => { draftIdRef.current = draftId; }, [draftId]);

  useEffect(() => {
    setDraftId(item?.status === "draft" ? item.id : null);
    setDraftStatus("idle");
    baselineRef.current = null;
  }, [item?.id]);

  useEffect(() => {
    if (baselineRef.current !== null) return;

    const expectedSpaces = item?.spaces ?? (initialSpace ? [initialSpace] : []);
    const expectedFormat = item?.content_format === "editorjs" ? "editorjs" : "text";

    if (item?.status === "draft") {
      const hydrated =
        editor.title === (item.title ?? "") &&
        editor.content === (item.content ?? "") &&
        JSON.stringify(editor.contentJson ?? null) === JSON.stringify(item.content_json ?? null) &&
        JSON.stringify(editor.links ?? []) === JSON.stringify(item.links ?? []);

      if (!hydrated) return;
    }

    baselineRef.current = snapshot(editor, expectedSpaces, expectedFormat);
  }, [item, initialSpace?.id, editor.title, editor.content, editor.contentJson, editor.contentFormat, editor.spaces, editor.is_global, editor.governance, editor.links, editor.start_at, editor.end_at, editor.datePrecision, editor.lat, editor.lng, editor.address]);

  const draftPayload = useCallback(() => ({
    p_space_ids: editor.spaces?.map((space) => space.id) ?? [],
    p_title: editor.title || null,
    p_content: editor.content || null,
    p_metadata: editor.datePrecision ? { date_precision: editor.datePrecision } : {},
    p_start_at: editor.start_at ?? null,
    p_end_at: editor.end_at ?? null,
    p_lat: editor.lat ?? null,
    p_lng: editor.lng ?? null,
    p_address: editor.address ?? null,
    p_governance_ids: editor.governance?.map((g) => g.id) ?? [],
    p_content_json: editor.contentJson ?? null,
    p_content_format: editor.contentFormat ?? "text",
  }), [editor.spaces, editor.title, editor.content, editor.datePrecision, editor.start_at, editor.end_at, editor.lat, editor.lng, editor.address, editor.governance, editor.contentJson, editor.contentFormat]);

  const saveDraftLinks = useCallback(async (postId) => {
    const links = Array.isArray(editor.links)
      ? editor.links.map((link, index) => ({
          url: link.url,
          type: link.type ?? "website",
          title: link.title ?? null,
          description: link.description ?? null,
          hostname: link.hostname ?? null,
          image_url: link.image_url ?? null,
          icon_url: link.icon_url ?? null,
          sort_order: index,
        }))
      : [];

    const { error } = await supabase.rpc("upsert_post_links", {
      p_post_id: postId,
      p_links: links,
    });

    if (error) throw error;
  }, [editor.links]);

  const resolvePostContext = useCallback(async (postId) => {
    if (!postId) return null;
    const { data, error } = await supabase.rpc("resolve_post_context", { p_post_id: postId });
    if (error) {
      if (process.env.NODE_ENV !== "production") console.error("Post context resolution failed:", error);
      return null;
    }
    return data;
  }, []);

  const saveDraftNow = useCallback(async () => {
    if ((item && item.status !== "draft") || saveInFlightRef.current) {
      return draftIdRef.current;
    }

    saveInFlightRef.current = true;
    setDraftStatus("saving");
    try {
      const payload = draftPayload();
      let saved;
      let id = draftIdRef.current;

      if (!id) {
        const { data, error } = await supabase.rpc("create_post_draft", payload);
        if (error) throw error;
        saved = data;
        id = data?.id ?? data?.[0]?.id;
        if (!id) throw new Error("Draft was created without an id.");
        setDraftId(id);
        draftIdRef.current = id;
      } else {
        const { data, error } = await supabase.rpc("update_post", { p_post_id: id, ...payload });
        if (error) throw error;
        saved = data;
      }

      await saveDraftLinks(id);
      setDraftStatus("saved");
      return saved;
    } catch (error) {
      setDraftStatus("error");
      if (process.env.NODE_ENV !== "production") console.error("Draft save failed:", error);
      return null;
    } finally {
      saveInFlightRef.current = false;
    }
  }, [draftPayload, item, saveDraftLinks]);

  useEffect(() => {
    const isDraftEditor = !item || item.status === "draft";
    if (!isDraftEditor || baselineRef.current === null) return;
    if (snapshot(editor) === baselineRef.current) return;

    setDraftStatus("saving");
    window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => { saveDraftNow(); }, 900);
    return () => window.clearTimeout(saveTimerRef.current);
  }, [item, editor.title, editor.content, editor.contentJson, editor.contentFormat, editor.links, editor.start_at, editor.end_at, editor.datePrecision, editor.lat, editor.lng, editor.address, editor.spaces, editor.is_global, editor.governance, saveDraftNow]);

  async function submit(onSuccess) {
    if (!editor.title.trim()) { toast.error("Enter a post title."); return; }

    const data = editor.getEditorData();
    const hasEditorBlocks =
      data.content_format === "editorjs" &&
      Array.isArray(data.content_json?.blocks) &&
      data.content_json.blocks.length > 0;

    if (!data.content.trim() && !hasEditorBlocks) {
      toast.error("Enter content.");
      return;
    }

    const result = postSchema.safeParse({ start_at: editor.start_at, end_at: editor.end_at, address: editor.address, lat: editor.lat, lng: editor.lng });
    if (!result.success) { toast.error(result.error.issues[0]?.message || "Check the post details."); return; }

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
      if (!item && !draftIdRef.current) await saveDraftNow();
      let savedPost;
      if (item) {
        savedPost = await updatePost({ postId: item.id, postData: payload });
        await resolvePostContext(item.id);
      } else if (draftIdRef.current) {
        savedPost = await updatePost({ postId: draftIdRef.current, postData: payload });
        const { data: published, error } = await supabase.rpc("publish_post", { p_post_id: draftIdRef.current });
        if (error) throw error;
        savedPost = published || savedPost;
        await resolvePostContext(draftIdRef.current);
      } else {
        savedPost = await createPost(payload);
        await resolvePostContext(savedPost?.id ?? savedPost?.post?.id);
      }
      setDraftStatus("idle");
      setDraftId(null);
      draftIdRef.current = null;
      onSuccess?.(savedPost);
    } catch (error) {
      if (process.env.NODE_ENV !== "production") console.error("Failed to save post", { message: error?.message, code: error?.code, status: error?.status });
      toast.error(error?.message || "Something went wrong");
    }
  }

  async function remove(onSuccess) {
    if (!item) return;
    try { await deletePost(item.id); onSuccess?.(); }
    catch (error) {
      if (process.env.NODE_ENV !== "production") console.error("Failed to delete post", error);
      toast.error(error?.message || "Failed to delete post");
    }
  }

  return { ...editor, draftId, draftStatus, saveDraftNow, submit, remove };
}
