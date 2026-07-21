"use client";

import { useState } from "react";

import { useAuth } from "@/context/AuthContext";

import { extractContentMeta } from "@/utils/text/contentMeta";

export function useEditor(item = null) {
  const { user } = useAuth();

  const [spaces, setSpaces] = useState(item?.spaces || []);

  const [is_global, setIsGlobal] = useState(item?.is_global || false);

  const [governance_entities, setSelectedAuthorities] = useState(
    item?.governance_entities || [],
  );

  const [type, setType] = useState(item?.type || "action");

  const [title, setTitle] = useState(item?.summary ?? item?.title ?? "");

  const [content, setContent] = useState(item?.details ?? item?.content ?? "");

  const [attachments, setAttachments] = useState(item?.attachments || []);

  const [start_at, setStartAt] = useState(item?.start_at || null);

  const [end_at, setEndAt] = useState(item?.end_at || null);

  const [lat, setLat] = useState(item?.lat || null);

  const [lng, setLng] = useState(item?.lng || null);

  const [address, setAddress] = useState(item?.address || null);

  const [meeting_link, setMeetingLink] = useState(item?.meeting_link || "");

  function getEditorData() {
    const { links, hashtags } = extractContentMeta(content);

    return {
      author_id: user.id,

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

      governance_entities,

      type,
    };
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

    spaces,
    setSpaces,

    is_global,
    setIsGlobal,

    governance_entities,
    setSelectedAuthorities,

    getEditorData,
  };
}
