"use client";

import { useState, useEffect } from "react";

import { useAuth } from "@/context/AuthContext";

import { extractContentMeta } from "@/utils/text/contentMeta";

export function useEditor(item = null) {
  const { user } = useAuth();

  const [spaces, setSpaces] = useState([]);
  const [is_global, setIsGlobal] = useState(false);
  const [governance_entities, setSelectedAuthorities] = useState([]);

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

  useEffect(() => {
    setSpaces(item?.spaces ?? []);

    setIsGlobal(item?.is_global ?? false);

    setSelectedAuthorities(item?.governance_entities ?? []);

    setType(item?.type ?? "action");

    setTitle(item?.summary ?? item?.title ?? "");

    setContent(item?.details ?? item?.content ?? "");

    setAttachments(item?.attachments ?? []);

    setStartAt(item?.start_at ?? null);

    setEndAt(item?.end_at ?? null);

    setLat(item?.lat ?? null);

    setLng(item?.lng ?? null);

    setAddress(item?.address ?? null);

    setMeetingLink(item?.meeting_link ?? "");
  }, [item]);

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
