// hooks/useWardData.js
import { useQuery } from "@tanstack/react-query";
import { supabase } from "utils/supabaseClient";

const resolveUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return supabase.storage.from("ward").getPublicUrl(path).data.publicUrl;
};

/**
 * Unified data hook (ward-specific + global)
 * Now cached automatically using React Query
 */
export function useWardData(wardId, dataType, options = {}) {
  const { enabled = true, admin = false, limit = null } = options;

  const queryKey = [dataType, wardId || "global", admin, limit];

  const queryFn = async () => {
    const isGlobal = !wardId;
    let query;
    let result;

    switch (dataType) {
      // --- PROJECTS ---
      case "project":
        query = supabase
          .from("project_with_images")
          .select("*");

        if (!admin) query = query.eq("is_published", true);
        if (!isGlobal) query = query.eq("ward_code", wardId);
        query = query.order("start_date", { ascending: false });
        if (limit) query = query.limit(limit);

        result = await query;
        break;

      // --- MEETINGS ---
      case "meeting":
        query = supabase
          .from("meeting_with_images")
          .select("*");
        if (!isGlobal) query = query.eq("ward_code", wardId);
        query = query.order("date", { ascending: false });
        if (limit) query = query.limit(limit);

        result = await query;
        break;

      // --- UPDATES ---
      case "update":
        query = supabase
          .from("update_with_images")
          .select("*");
        if (!isGlobal) query = query.eq("ward_code", wardId);
        query = query.order("date", { ascending: false });
        if (limit) query = query.limit(limit);

        result = await query;
        break;

      // --- COMMITTEE MEMBERS ---
      case "committee":
        result = await supabase
          .from("committee_member_view")
          .select("*")
          .eq("ward_code", wardId)
          .order("joined_at", { ascending: true });
        break;

      // --- HEADER (metadata) ---
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

      // --- RPC CALLS ---
      case "junctions":
        result = await supabase.rpc("get_ward_junctions", { ward_code: wardId });
        break;

      case "roads":
        result = await supabase.rpc("get_roads", { gr_ward_code: wardId });
        break;

      case "boundary":
        result = await supabase
          .from("ward")
          .select("code, name, geom")
          .eq("code", wardId)
          .single();
        break;

      default:
        throw new Error(`Unsupported dataType: ${dataType}`);
    }

    if (result.error) throw result.error;

    // Resolve image URLs
    if (Array.isArray(result.data)) {
      return result.data.map((item) => ({
        ...item,
        images: item.images?.map((img) => ({
          ...img,
          path: resolveUrl(img.path),
        })) || [],
      }));
    } else {
      return result.data || null;
    }
  };

  const query = useQuery({
    queryKey,
    queryFn,
    enabled,
  });

  return {
    data: query.data,
    loading: query.isLoading,
    error: query.error ? query.error.message : null,
    refresh: query.refetch,
    refetch: query.refetch,
  };
}

// ---- Derived hooks ----
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

// ---- Admin versions ----
export const useAdminWardProjects = (wardId, options = {}) =>
  useWardData(wardId, "project", { ...options, admin: true });

export const useAdminWardMeetings = (wardId, options = {}) =>
  useWardData(wardId, "meeting", { ...options, admin: true });

export const useAdminWardUpdates = (wardId, options = {}) =>
  useWardData(wardId, "update", { ...options, admin: true });