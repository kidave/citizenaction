"use client";

import { useEffect, useState } from "react";

export function useResolvedPostContext(editor) {
  const [context, setContext] = useState(null);

  useEffect(() => {
    const payload = {
      title: editor?.title || "",
      content: editor?.content || "",
      start_at: editor?.start_at || null,
      lat: editor?.lat ?? null,
      lng: editor?.lng ?? null,
      address: editor?.address || null,
      spaces: (editor?.spaces || []).map((space) => space.id).filter(Boolean),
      governance: (editor?.governance || []).map((item) => item.id).filter(Boolean),
    };

    if (!payload.title.trim() && !payload.content.trim() && !payload.spaces.length && !payload.governance.length && payload.lat == null) {
      setContext(null);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const response = await fetch("/api/post-context", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled) setContext(data.context ?? null);
      } catch (error) {
        if (!cancelled && process.env.NODE_ENV !== "production") {
          console.warn("Context resolution failed:", error);
        }
      }
    }, 700);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [editor?.title, editor?.content, editor?.start_at, editor?.lat, editor?.lng, editor?.address, editor?.spaces, editor?.governance]);

  return context;
}
