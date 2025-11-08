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
export function useWardData(wardCode, dataType, options = {}) {
  const { enabled = true, admin = false, limit = null } = options;

  const queryKey = [dataType, wardCode || "global", admin, limit];

  const queryFn = async () => {
    const isGlobal = !wardCode;
    let query;
    let result;

    switch (dataType) {
      // --- PROJECTS ---
      case "ward_project":
        query = supabase
          .from("ward_project_with_files")
          .select("*");

        if (!admin) query = query.eq("is_published", true);
        if (!isGlobal) query = query.eq("ward_code", wardCode);
        query = query.order("start_date", { ascending: false });
        if (limit) query = query.limit(limit);

        result = await query;
        break;

      // --- MEETINGS ---
      case "ward_meeting":
        query = supabase
          .from("ward_meeting_with_files")
          .select("*");
        if (!isGlobal) query = query.eq("ward_code", wardCode);
        query = query.order("date", { ascending: false });
        if (limit) query = query.limit(limit);

        result = await query;
        break;

      // --- UPDATES ---
      case "ward_update":
        query = supabase
          .from("ward_update_with_files")
          .select("*");
        if (!isGlobal) query = query.eq("ward_code", wardCode);
        query = query.order("date", { ascending: false });
        if (limit) query = query.limit(limit);

        result = await query;
        break;

      // --- COMMITTEE MEMBERS ---
      case "committee":
        result = await supabase
          .from("committee_member_view")
          .select("*")
          .eq("ward_code", wardCode)
          .order("joined_at", { ascending: true });
        break;

      // --- HEADER (metadata) ---
      case "header":
        result = await supabase
          .from("ward_header_view")
          .select("*")
          .eq("ward_code", wardCode)
          .single();

        if (result.error) {
          if (result.error.code === 'PGRST116') {
            return null;
          }
          throw result.error;
        }

        if (!result.data) {
          return null;
        }

        const w = result.data;
        return {
          wardName: w.ward_name,
          wardConvenor: w.convenor_name ? { name: w.convenor_name } : null,
          wardCoConvenor: w.co_convenor_name ? { name: w.co_convenor_name } : null,
        };

      // --- RPC CALLS ---
      case "junctions":
        result = await supabase.rpc("get_junctions", { gj_ward_code: wardCode });
        break;

      case "roads":
        result = await supabase.rpc("get_roads", { gr_ward_code: wardCode });
        break;

      case "boundary":
        result = await supabase
          .from("ward")
          .select("code, name, geom")
          .eq("code", wardCode)
          .single();
        break;

      default:
        throw new Error(`Unsupported dataType: ${dataType}`);
    }

    if (result.error) throw result.error;

    // Resolve file URLs
    if (Array.isArray(result.data)) {
      return result.data.map((item) => ({
        ...item,
        files: item.files?.map((file) => ({
          ...file,
          path: resolveUrl(file.path),
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
export const useWardProjects = (wardCode, options = {}) =>
  useWardData(wardCode, "ward_project", { ...options, admin: false });

export const useWardMeetings = (wardCode, options = {}) =>
  useWardData(wardCode, "ward_meeting", { ...options, admin: false });

export const useWardUpdates = (wardCode, options = {}) =>
  useWardData(wardCode, "ward_update", { ...options, admin: false });

export const useWardCommittees = (wardCode, options = {}) =>
  useWardData(wardCode, "committee", options);

export const useWardHeader = (wardCode, options = {}) =>
  useWardData(wardCode, "header", options);

export const useWardJunctions = (wardCode, options = {}) =>
  useWardData(wardCode, "junctions", options);

export const useWardRoads = (wardCode, options = {}) =>
  useWardData(wardCode, "roads", options);

export const useWardBoundary = (wardCode, options = {}) =>
  useWardData(wardCode, "boundary", options);

// ---- Admin versions ----
export const useAdminWardProjects = (wardCode, options = {}) =>
  useWardData(wardCode, "ward_project", { ...options, admin: true });

export const useAdminWardMeetings = (wardCode, options = {}) =>
  useWardData(wardCode, "ward_meeting", { ...options, admin: true });

export const useAdminWardUpdates = (wardCode, options = {}) =>
  useWardData(wardCode, "ward_update", { ...options, admin: true });