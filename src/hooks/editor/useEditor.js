"use client";

import { useState, useEffect, useMemo, useRef } from "react";

import { useAuth } from "@/context/AuthContext";
import { extractContentMeta } from "@/utils/text/contentMeta";

const DRAFT_STORAGE_PREFIX = "citizen-action:post-draft:v1";

export function useEditor(item = null, initialSpace = null) {
  const { user } = useAuth();

  const [spaces, setSpaces] = useState([]);
  const [is_global, setIsGlobal] = useState(false);
  const [governance, setSelectedAuthorities] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [contentJson, setContentJson] = useState(null);
  const [contentFormat, setContentFormat] = useState("text");
  const [attachments, setAttachments] = useState([]);
  const [start_at, setStartAt] = useState(null);
  const [end_at, setEndAt] = useState(null);
  const [datePrecision, setDatePrecision] = useState(null);
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [address, setAddress] = useState(null);
  const [links, setLinks] = useState([]);
  const [draftStatus, setDraftStatus] = useState("idle");

  const draftLoadedRef = useRef(false);

  const addAttachments = (files) => {
    const list = Array.isArray(files) ? files : [files];
    setAttachments((prev) => [...prev, ...list]);
  };

  const replaceAttachments = (files) => {
    setAttachments(Array.isArray(files) ? files : []);
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAttachments = () => {
    setAttachments([]);
  };

  const updateAttachment = (index, updates) => {
    setAttachments((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...updates } : item)),
    );
  };

  const moveAttachment = (from, to) => {
    setAttachments((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 1, item);
      return next;
    });
  };

  const attachmentCount = attachments.length;
  const hasAttachments = attachmentCount > 0;

  const addLinks = (newLinks) => {
    const list = Array.isArray(newLinks) ? newLinks : [newLinks];
    setLinks((prev) => [...prev, ...list]);
  };

  const replaceLinks = (newLinks) => {
    setLinks(Array.isArray(newLinks) ? newLinks : []);
  };

  const removeLink = (index) => {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const clearLinks = () => {
    setLinks([]);
  };

  const updateLink = (index, updates) => {
    setLinks((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...updates } : item)),
    );
  };

  const moveLink = (from, to) => {
    setLinks((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 1);
      return next;
    });
  };

  const normalizeAttachment = (attachment) => {
    if (!attachment) return null;

    return {
      ...attachment,
      file_name: attachment.file_name ?? attachment.file?.name ?? "",
      mime_type: attachment.mime_type ?? attachment.file?.type ?? "",
      file_size: attachment.file_size ?? attachment.file?.size ?? null,
      credit_name: attachment.credit_name ?? "",
      credit_url: attachment.credit_url ?? "",
      description: attachment.description ?? "",
      width: attachment.width ?? null,
      height: attachment.height ?? null,
      duration: attachment.duration ?? null,
      sort_order: attachment.sort_order ?? 0,
    };
  };

  useEffect(() => {
    if (!item) return;

    setSpaces(item.spaces ?? []);
    setIsGlobal(item.is_global ?? false);
    setSelectedAuthorities(item.governance ?? []);
    setTitle(item.title ?? "");
    setContent(item.content ?? "");
    setContentJson(item.content_json ?? null);
    setContentFormat(item.content_format === "editorjs" ? "editorjs" : "text");
    replaceAttachments(
      Array.isArray(item.attachments)
        ? item.attachments.map(normalizeAttachment).filter(Boolean)
        : [],
    );
    replaceLinks(item.links ?? []);
    setStartAt(item.start_at ?? null);
    setEndAt(item.end_at ?? null);
    setDatePrecision(item.metadata?.date_precision ?? null);
    setLat(item.lat ?? null);
    setLng(item.lng ?? null);
    setAddress(item.address ?? null);
    setDraftStatus("idle");
  }, [item]);

  function reset() {
    if (initialSpace) {
      setSpaces([initialSpace]);
      setIsGlobal(false);
    } else {
      setSpaces([]);
      setIsGlobal(false);
    }

    setSelectedAuthorities([]);
    setTitle("");
    setContent("");
    setContentJson(null);
    setContentFormat("text");
    replaceAttachments([]);
    replaceLinks([]);
    setStartAt(null);
    setEndAt(null);
    setDatePrecision(null);
    setLat(null);
    setLng(null);
    setAddress(null);
    setDraftStatus("idle");
    draftLoadedRef.current = false;
  }

  function clearDraft() {
    if (typeof window === "undefined" || !user?.id) return;

    try {
      window.localStorage.removeItem(
        DRAFT_STORAGE_PREFIX + ":" + user.id,
      );
    } catch {
      // Ignore storage failures.
    }

    setDraftStatus("idle");
  }

  useEffect(() => {
    if (item || !user?.id || draftLoadedRef.current) return;

    draftLoadedRef.current = true;

    try {
      const raw = window.localStorage.getItem(
        DRAFT_STORAGE_PREFIX + ":" + user.id,
      );

      if (!raw) {
        setDraftStatus("idle");
        return;
      }

      const draft = JSON.parse(raw);

      setSpaces(draft.spaces ?? (initialSpace ? [initialSpace] : []));
      setIsGlobal(draft.is_global ?? false);
      setSelectedAuthorities(draft.governance ?? []);
      setTitle(draft.title ?? "");
      setContent(draft.content ?? "");
      setContentJson(draft.contentJson ?? null);
      setContentFormat(
        draft.contentFormat === "editorjs" ? "editorjs" : "text",
      );
      setStartAt(draft.start_at ?? null);
      setEndAt(null);
      setDatePrecision(draft.datePrecision ?? null);
      setLat(draft.lat ?? null);
      setLng(draft.lng ?? null);
      setAddress(draft.address ?? null);
      replaceLinks(draft.links ?? []);
      setDraftStatus(draft.content || draft.title ? "saved" : "idle");
    } catch {
      setDraftStatus("idle");
    }
  }, [item, user?.id, initialSpace]);

  useEffect(() => {
    if (item || !user?.id || !draftLoadedRef.current) return;

    const hasDraft =
      title ||
      content ||
      contentJson ||
      links.length ||
      start_at ||
      address ||
      datePrecision ||
      spaces.length ||
      governance.length;

    if (!hasDraft) return;

    setDraftStatus("saving");

    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(
          DRAFT_STORAGE_PREFIX + ":" + user.id,
          JSON.stringify({
            version: 1,
            saved_at: Date.now(),
            title,
            content,
            contentJson,
            contentFormat,
            start_at,
            datePrecision,
            lat,
            lng,
            address,
            links,
            spaces,
            is_global,
            governance,
          }),
        );
        setDraftStatus("saved");
      } catch {
        setDraftStatus("idle");
      }
    }, 500);

    return () => window.clearTimeout(timer);
  }, [
    item,
    user?.id,
    title,
    content,
    contentJson,
    contentFormat,
    start_at,
    datePrecision,
    lat,
    lng,
    address,
    links,
    spaces,
    is_global,
    governance,
  ]);

  useEffect(() => {
    if (!item && !user?.id) {
      draftLoadedRef.current = false;
    }
  }, [item, user?.id]);

  const editorData = useMemo(() => {
    const { extracted_links, hashtags } = extractContentMeta(content);

    return {
      author_id: user?.id ?? null,
      title,
      content,
      content_json: contentJson,
      content_format: contentFormat,
      attachments,
      links,
      start_at,
      end_at: null,
      lat,
      lng,
      address,
      metadata: {
        extracted_links,
        hashtags,
        ...(datePrecision ? { date_precision: datePrecision } : {}),
      },
      spaces,
      is_global,
      governance,
    };
  }, [
    user,
    title,
    content,
    contentJson,
    contentFormat,
    attachments,
    links,
    start_at,
    datePrecision,
    lat,
    lng,
    address,
    spaces,
    is_global,
    governance,
  ]);

  return {
    title,
    setTitle,
    content,
    setContent,
    contentJson,
    setContentJson,
    contentFormat,
    setContentFormat,
    attachments,
    attachmentCount,
    hasAttachments,
    setAttachments,
    replaceAttachments,
    addAttachments,
    removeAttachment,
    clearAttachments,
    updateAttachment,
    moveAttachment,
    links,
    setLinks,
    replaceLinks,
    addLinks,
    removeLink,
    clearLinks,
    updateLink,
    moveLink,
    start_at,
    setStartAt,
    end_at,
    setEndAt,
    datePrecision,
    setDatePrecision,
    lat,
    setLat,
    lng,
    setLng,
    address,
    setAddress,
    spaces,
    setSpaces,
    is_global,
    setIsGlobal,
    governance,
    setSelectedAuthorities,
    draftStatus,
    clearDraft,
    reset,
    editorData,
    getEditorData: () => editorData,
  };
}
