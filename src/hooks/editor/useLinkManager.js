"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase/client";

import {
  detectLinkType,
  getHostname,
  normalizeUrl,
} from "@/utils/text/detectLinkType";

function createFallbackLink(url) {
  const normalizedUrl = normalizeUrl(url);

  return {
    url: normalizedUrl,
    type: detectLinkType(normalizedUrl),
    title: null,
    description: null,
    hostname: getHostname(normalizedUrl),
    image_url: null,
    icon_url: null,
    provider_name: null,
    provider_url: null,
    sort_order: 0,
  };
}

export function useLinkManager(value = [], onChange) {
  const [links, setLinks] = useState(Array.isArray(value) ? value : []);

  const [draft, setDraft] = useState("");
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    setLinks(Array.isArray(value) ? value : []);
  }, [value]);

  function updateLinks(nextLinks) {
    setLinks(nextLinks);
    onChange?.(nextLinks);
  }

  async function resolveLink(url) {
    setResolving(true);

    try {
      const { data, error } = await supabase.functions.invoke("resolve-link", {
        body: { url },
      });

      if (error) throw error;

      if (!data?.link) {
        throw new Error("No link data returned");
      }

      return data.link;
    } catch {
      return createFallbackLink(url);
    } finally {
      setResolving(false);
    }
  }

  async function addLink() {
    if (resolving) return;

    const url = normalizeUrl(draft);

    if (!url) return;

    try {
      new URL(url);
    } catch {
      return;
    }

    const alreadyExists = links.some((link) => normalizeUrl(link.url) === url);

    if (alreadyExists) {
      setDraft("");
      return;
    }

    const resolvedLink = await resolveLink(url);

    const nextLinks = [
      ...links,
      {
        ...resolvedLink,
        sort_order: links.length,
      },
    ];

    updateLinks(nextLinks);

    setDraft("");
  }

  function removeLink(index) {
    const nextLinks = links
      .filter((_, i) => i !== index)
      .map((link, index) => ({
        ...link,
        sort_order: index,
      }));

    updateLinks(nextLinks);
  }

  function moveLink(from, to) {
    if (to < 0 || to >= links.length) {
      return;
    }

    const nextLinks = [...links];

    const [item] = nextLinks.splice(from, 1);

    nextLinks.splice(to, 0, item);

    updateLinks(
      nextLinks.map((link, index) => ({
        ...link,
        sort_order: index,
      })),
    );
  }

  function clearLinks() {
    updateLinks([]);
  }

  return {
    links,
    draft,
    setDraft,

    resolving,

    addLink,
    removeLink,
    moveLink,
    clearLinks,
  };
}
