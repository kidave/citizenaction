// hooks/useLatestItems.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "lib/supabase/client";

// Simple cache implementation
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const resolveUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return supabase.storage.from("ward").getPublicUrl(path).data.publicUrl;
};

export default function useLatestItems(type, limit = 3) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cacheKey = `latest-${type}-${limit}`;

  const fetchData = useCallback(async () => {
    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setData(cached.data);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query;
      switch (type) {
        case "meeting":
          query = supabase
            .from("ward_meeting_with_files")
            .select(`*, ward:ward_code (name, division:division_code (city:city_code (code, name)))`)
            .order("date", { ascending: false })
            .limit(limit);
          break;
        case "project":
          query = supabase
            .from("ward_project_with_files")
            .select(`*, ward:ward_code (name, division:division_code (city:city_code (code, name)))`)
            .eq("is_published", true)
            .order("start_date", { ascending: false })
            .limit(limit);
          break;
        case "update":
          query = supabase
            .from("ward_update_with_files")
            .select(`*, ward:ward_code (name, division:division_code (city:city_code (code, name)))`)
            .order("date", { ascending: false })
            .limit(limit);
          break;
        default:
          throw new Error("Unsupported type for useLatestItems");
      }

      const { data: rows, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      const items = (rows || []).map((item) => {
        if (item.images?.length) {
          return {
            ...item,
            images: item.images.map((img) => ({ ...img, path: resolveUrl(img.path) })),
          };
        }
        return item;
      });

      // Cache the result
      cache.set(cacheKey, {
        data: items,
        timestamp: Date.now()
      });

      setData(items);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }, [type, limit, cacheKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(() => {
    cache.delete(cacheKey);
    fetchData();
  }, [fetchData, cacheKey]);

  return { 
    data, 
    loading, 
    error, 
    refresh,
    refetch: refresh 
  };
}