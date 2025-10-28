// hooks/useRegionData.js
import { useQuery } from "@tanstack/react-query";
import { supabase } from "utils/supabaseClient";

const resolveUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return supabase.storage.from("region").getPublicUrl(path).data.publicUrl;
};

/**
 * Unified data hook for region-specific data
 * Cached automatically using React Query
 */
export function useRegionData(regionCode, dataType, options = {}) {
  const { enabled = true, admin = false, limit = null } = options;

  const queryKey = [dataType, regionCode || "global", admin, limit];

  const queryFn = async () => {
    const isGlobal = !regionCode;
    let query;
    let result;

    switch (dataType) {
      // --- REGION PROJECTS ---
      case "project":
        query = supabase
          .from("region_project_with_images")
          .select("*");

        if (!admin) query = query.eq("is_published", true);
        if (!isGlobal) query = query.eq("region_code", regionCode);
        query = query.order("start_date", { ascending: false });
        if (limit) query = query.limit(limit);

        result = await query;
        break;

      // --- REGION MEETINGS ---
      case "meeting":
        query = supabase
          .from("region_meeting_with_images")
          .select("*");
        if (!isGlobal) query = query.eq("region_code", regionCode);
        query = query.order("date", { ascending: false });
        if (limit) query = query.limit(limit);

        result = await query;
        break;

      // --- REGION UPDATES ---
      case "update":
        query = supabase
          .from("region_update_with_images")
          .select("*");
        if (!isGlobal) query = query.eq("region_code", regionCode);
        query = query.order("date", { ascending: false });
        if (limit) query = query.limit(limit);

        result = await query;
        break;

      // --- REGION NEWSLETTERS ---
      case "newsletter":
        query = supabase
          .from("region_newsletter_with_images")
          .select("*");
        if (!isGlobal) query = query.eq("region_code", regionCode);
        query = query.order("created_at", { ascending: false });
        if (limit) query = query.limit(limit);

        result = await query;
        break;

      // --- REGION POLICIES ---
      case "policy":
        query = supabase
          .from("region_policy_with_images")
          .select("*");
        if (!isGlobal) query = query.eq("region_code", regionCode);
        query = query.order("created_at", { ascending: false });
        if (limit) query = query.limit(limit);

        result = await query;
        break;

      // --- REGION COMMITTEE MEMBERS ---
      case "committee":
        result = await supabase
          .from("region_committee_member_view")
          .select("*")
          .eq("region_code", regionCode)
          .order("joined_at", { ascending: true });
        break;

      // --- REGION HEADER (metadata) ---
      case "header":
        result = await supabase
          .from("region_header_view")
          .select("*")
          .eq("region_code", regionCode)
          .single();

        if (!result.error && result.data) {
          const r = result.data;
          result.data = {
            regionName: r.region_name,
            coordinator: r.coordinator_name ? { name: r.coordinator_name } : null,
            coCoordinator: r.co_coordinator_name ? { name: r.co_coordinator_name } : null,
            cities: r.cities || [],
            stats: r.stats || {}
          };
        }
        break;

      // --- REGION BOUNDARY ---
      case "boundary":
        result = await supabase
          .from("region")
          .select("code, name, geom")
          .eq("code", regionCode)
          .single();
        break;

      // --- REGION CITIES ---
      case "cities":
        result = await supabase
          .from("city")
          .select("*, region:region_code(*)")
          .eq("region_code", regionCode)
          .order("name");
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

// ---- Derived hooks for regions ----
export const useRegionProjects = (regionCode, options = {}) =>
  useRegionData(regionCode, "project", { ...options, admin: false });

export const useRegionMeetings = (regionCode, options = {}) =>
  useRegionData(regionCode, "meeting", { ...options, admin: false });

export const useRegionUpdates = (regionCode, options = {}) =>
  useRegionData(regionCode, "update", { ...options, admin: false });

export const useRegionNewsletters = (regionCode, options = {}) =>
  useRegionData(regionCode, "newsletter", options);

export const useRegionPolicies = (regionCode, options = {}) =>
  useRegionData(regionCode, "policy", options);

export const useRegionCommittees = (regionCode, options = {}) =>
  useRegionData(regionCode, "committee", options);

export const useRegionHeader = (regionCode, options = {}) =>
  useRegionData(regionCode, "header", options);

export const useRegionBoundary = (regionCode, options = {}) =>
  useRegionData(regionCode, "boundary", options);

export const useRegionCities = (regionCode, options = {}) =>
  useRegionData(regionCode, "cities", options);

// ---- Admin versions for regions ----
export const useAdminRegionProjects = (regionCode, options = {}) =>
  useRegionData(regionCode, "project", { ...options, admin: true });

export const useAdminRegionMeetings = (regionCode, options = {}) =>
  useRegionData(regionCode, "meeting", { ...options, admin: true });

export const useAdminRegionUpdates = (regionCode, options = {}) =>
  useRegionData(regionCode, "update", { ...options, admin: true });