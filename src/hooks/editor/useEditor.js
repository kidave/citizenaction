"use client";

import { useState, useEffect, useMemo } from "react";

import { useAuth } from "@/context/AuthContext";

import { extractContentMeta } from "@/utils/text/contentMeta";

export function useEditor(item = null) {
  const { user } = useAuth();

  const [spaces, setSpaces] = useState([]);
  const [is_global, setIsGlobal] = useState(false);
  const [governance, setSelectedAuthorities] = useState([]);

  const [type, setType] = useState("action");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [attachments, setAttachments] = useState([]);

  const [start_at, setStartAt] = useState(null);
  const [end_at, setEndAt] = useState(null);

  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);

  const [address, setAddress] = useState(null);

  const [meeting_link, setMeetingLink] = useState("");

  // ==========================================================
  // Attachment Helpers
  // ==========================================================

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

      next.splice(to, 0, item);

      return next;
    });
  };

  const attachmentCount = attachments.length;

  const hasAttachments = attachmentCount > 0;

  // ==========================================================
  // Load Existing Item
  // ==========================================================

  useEffect(() => {
    setSpaces(item?.spaces ?? []);

    setIsGlobal(item?.is_global ?? false);

    setSelectedAuthorities(item?.governance ?? []);

    setType(item?.type ?? "action");

    setTitle(item?.summary ?? item?.title ?? "");

    setContent(item?.details ?? item?.content ?? "");

    replaceAttachments(item?.attachments ?? []);

    setStartAt(item?.start_at ?? null);

    setEndAt(item?.end_at ?? null);

    setLat(item?.lat ?? null);

    setLng(item?.lng ?? null);

    setAddress(item?.address ?? null);

    setMeetingLink(item?.meeting_link ?? "");
  }, [item]);

  // ==========================================================
  // Editor Data
  // ==========================================================

  const editorData = useMemo(() => {
    const { links, hashtags } = extractContentMeta(content);

    return {
      author_id: user?.id ?? null,

      title,
      content,

      attachments,

      start_at,
      end_at,

      lat,
      lng,

      address,

      meeting_link: meeting_link || null,

      metadata: {
        links,
        hashtags,
      },

      spaces,

      is_global,

      governance,

      type,
    };
  }, [
    user,
    title,
    content,
    attachments,
    start_at,
    end_at,
    lat,
    lng,
    address,
    meeting_link,
    spaces,
    is_global,
    governance,
    type,
  ]);

  return {
    // Type
    type,
    setType,

    // Content
    title,
    setTitle,

    content,
    setContent,

    // Attachments
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

    // Dates
    start_at,
    setStartAt,

    end_at,
    setEndAt,

    // Location
    lat,
    setLat,

    lng,
    setLng,

    address,
    setAddress,

    // Meeting
    meeting_link,
    setMeetingLink,

    // Spaces
    spaces,
    setSpaces,

    is_global,
    setIsGlobal,

    governance,
    setSelectedAuthorities,

    // Helpers
    editorData,

    getEditorData: () => editorData,
  };
}
