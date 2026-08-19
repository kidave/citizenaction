"use client";

import { useState, useEffect, useMemo } from "react";

import { useAuth } from "@/context/AuthContext";

import { extractContentMeta } from "@/utils/text/contentMeta";

export function useEditor(item = null, initialSpace = null) {
  const { user } = useAuth();

  const [spaces, setSpaces] = useState([]);

  const [is_global, setIsGlobal] = useState(false);

  const [governance, setSelectedAuthorities] = useState([]);

  const [type, setType] = useState("action");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // ==========================================================
  // Structured content
  // ==========================================================

  const [contentJson, setContentJson] = useState(null);

  const [contentFormat, setContentFormat] = useState("text");

  const [attachments, setAttachments] = useState([]);

  const [start_at, setStartAt] = useState(null);
  const [end_at, setEndAt] = useState(null);

  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);

  const [address, setAddress] = useState(null);

  const [links, setLinks] = useState([]);

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
  // Link Helpers
  // ==========================================================

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

      next.splice(to, 0, item);

      return next;
    });
  };

  // ==========================================================
  // Load Existing Item / Initial Space
  // ==========================================================

  useEffect(() => {
    /*
     * ========================================================
     * EDIT EXISTING POST
     * ========================================================
     *
     * Existing post spaces always take priority.
     */

    if (item) {
      setSpaces(item.spaces ?? []);

      setIsGlobal(item.is_global ?? false);

      setSelectedAuthorities(item.governance ?? []);

      setType(item.type ?? "action");

      setTitle(item.title ?? "");

      setContent(item.content ?? "");

      setContentJson(item.content_json ?? null);

      setContentFormat(
        item.content_format === "editorjs" ? "editorjs" : "text",
      );

      replaceAttachments(item.attachments ?? []);

      replaceLinks(item.links ?? []);

      setStartAt(item.start_at ?? null);

      setEndAt(item.end_at ?? null);

      setLat(item.lat ?? null);

      setLng(item.lng ?? null);

      setAddress(item.address ?? null);

      return;
    }

    /*
     * ========================================================
     * NEW POST
     * ========================================================
     *
     * If the editor was opened from a Space page,
     * automatically select that Space.
     */

    if (initialSpace) {
      setSpaces([initialSpace]);

      setIsGlobal(false);
    } else {
      setSpaces([]);

      setIsGlobal(false);
    }

    setSelectedAuthorities([]);

    setType("action");

    setTitle("");

    setContent("");

    setContentJson(null);

    setContentFormat("text");

    replaceAttachments([]);

    replaceLinks([]);

    setStartAt(null);

    setEndAt(null);

    setLat(null);

    setLng(null);

    setAddress(null);
  }, [item, initialSpace]);

  // ==========================================================
  // Editor Data
  // ==========================================================

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

      end_at,

      lat,

      lng,

      address,

      metadata: {
        extracted_links,

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
    contentJson,
    contentFormat,
    attachments,
    links,
    start_at,
    end_at,
    lat,
    lng,
    address,
    spaces,
    is_global,
    governance,
    type,
  ]);

  return {
    // ========================================================
    // Type
    // ========================================================

    type,
    setType,

    // ========================================================
    // Content
    // ========================================================

    title,
    setTitle,

    content,
    setContent,

    // ========================================================
    // Structured content
    // ========================================================

    contentJson,
    setContentJson,

    contentFormat,
    setContentFormat,

    // ========================================================
    // Attachments
    // ========================================================

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

    // ========================================================
    // Links
    // ========================================================

    links,

    setLinks,

    replaceLinks,

    addLinks,

    removeLink,

    clearLinks,

    updateLink,

    moveLink,

    // ========================================================
    // Dates
    // ========================================================

    start_at,
    setStartAt,

    end_at,
    setEndAt,

    // ========================================================
    // Location
    // ========================================================

    lat,
    setLat,

    lng,
    setLng,

    address,
    setAddress,

    // ========================================================
    // Spaces
    // ========================================================

    spaces,
    setSpaces,

    is_global,
    setIsGlobal,

    // ========================================================
    // Governance
    // ========================================================

    governance,
    setSelectedAuthorities,

    // ========================================================
    // Helpers
    // ========================================================

    editorData,

    getEditorData: () => editorData,
  };
}
