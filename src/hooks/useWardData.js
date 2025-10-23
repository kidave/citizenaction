// hooks/useWardData.js
import { useState, useEffect, useCallback } from "react";
import { supabase } from "utils/supabaseClient";

// Helper to resolve Supabase storage URLs
const resolveUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return supabase.storage.from("ward").getPublicUrl(path).data.publicUrl;
};

/**
 * Generic hook for all ward data (public and admin)
 */
export function useWardData(wardId, dataType, options = {}) {
  const { enabled = true, admin = false } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!enabled || !wardId) return;

    setLoading(true);
    setError(null);
    try {
      let result;

      switch (dataType) {
        // Projects (with images) - Admin sees all, public sees only published
        case "project":
          let projectQuery = supabase
            .from("project_with_images")
            .select("*")
            .eq("ward_code", wardId);

          if (!admin) {
            projectQuery = projectQuery.eq("is_published", true);
          }

          result = await projectQuery.order("created_at", { ascending: false });
          break;

        // Meetings (with images)
        case "meeting":
          result = await supabase
            .from("meeting_with_images")
            .select("*")
            .eq("ward_code", wardId)
            .order("date", { ascending: false });
          break;

        // Updates (with images)
        case "update":
          result = await supabase
            .from("update_with_images")
            .select("*")
            .eq("ward_code", wardId)
            .order("date", { ascending: false });
          break;

        // Committee members (no publish status)
        case "committee":
          result = await supabase
            .from("committee_member_view")
            .select("*")
            .eq("ward_code", wardId)
            .order("joined_at", { ascending: true });
          break;

        // Header (minimal: ward_code, ward_name, convenor_name, co_convenor_name)
        case "header":
          result = await supabase
            .from("ward_header_view")
            .select("*")
            .eq("ward_code", wardId)
            .single();

          if (!result.error && result.data) {
            const w = result.data;
            result.data = {
              wardName: w.ward_name,
              convenor: w.convenor_name ? { name: w.convenor_name } : null,
              coConvenor: w.co_convenor_name ? { name: w.co_convenor_name } : null,
            };
          }
          break;

        // Junctions (RPC)
        case "junctions":
          result = await supabase.rpc("get_ward_junctions", { ward_code: wardId });
          break;

        // Roads (RPC)
        case "roads":
          result = await supabase.rpc("get_roads", { gr_ward_code: wardId });
          break;

        // Boundary (RPC)
        case "boundary":
          result = await supabase.rpc("get_ward_boundary", { ward_code: wardId });
          break;

        default:
          throw new Error(`Unsupported dataType: ${dataType}`);
      }

      if (result?.error) throw result.error;

      // Resolve image URLs for items that have images
      if (Array.isArray(result?.data)) {
        const items = result.data.map((item) => {
          if (item.images?.length) {
            return {
              ...item,
              images: item.images.map((img) => ({
                ...img,
                path: resolveUrl(img.path),
              })),
            };
          }
          return item;
        });
        setData(items);
      } else {
        setData(result?.data || result || null);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [wardId, dataType, enabled, admin]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refresh function to manually trigger data refetch
  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { 
    data, 
    loading, 
    error, 
    refresh,
    refetch: refresh // alias for consistency with other hooks
  };
}

// Public hooks (only published items)
export const useWardProjects = (wardId, options = {}) => 
  useWardData(wardId, "project", { ...options, admin: false });

export const useWardMeetings = (wardId, options = {}) => 
  useWardData(wardId, "meeting", { ...options, admin: false });

export const useWardUpdates = (wardId, options = {}) => 
  useWardData(wardId, "update", { ...options, admin: false });

export const useWardCommittees = (wardId, options = {}) => 
  useWardData(wardId, "committee", options);

export const useWardHeader = (wardId, options = {}) => 
  useWardData(wardId, "header", options);

export const useWardJunctions = (wardId, options = {}) => 
  useWardData(wardId, "junctions", options);

export const useWardRoads = (wardId, options = {}) => 
  useWardData(wardId, "roads", options);

export const useWardBoundary = (wardId, options = {}) => 
  useWardData(wardId, "boundary", options);

// Admin hooks (all items - published and unpublished)
export const useAdminWardProjects = (wardId, options = {}) => 
  useWardData(wardId, "project", { ...options, admin: true });

export const useAdminWardMeetings = (wardId, options = {}) => 
  useWardData(wardId, "meeting", { ...options, admin: true });

export const useAdminWardUpdates = (wardId, options = {}) => 
  useWardData(wardId, "update", { ...options, admin: true });