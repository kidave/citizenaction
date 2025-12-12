// hooks/useScopeData.js
import { useQuery } from "@tanstack/react-query";
import { supabase } from "utils/supabaseClient";

/**
 * Generic data-fetching hook for ANY scope and ANY resource.
 * 
 * @param {"ward"|"region"|"city"|"state"} scope 
 * @param {string} code - wardCode, regionCode, cityCode...
 * @param {string} resource - e.g. "meeting", "announcement"
 * @param {object} options 
 */
export default function useScopeData(scope, code, resource, options = {}) {
  const {
    enabled = true,
    admin = false,
    limit = null
  } = options;

  const queryKey = ["scopeData", scope, code, resource, admin, limit];

  const queryFn = async () => {
    // 🔥 For Step 2: Only ward is implemented
    if (scope !== "ward") {
      console.warn("Only ward scope supported in Step 2 migration.");
      return null;
    }

    let query;
    let result;

    switch (resource) {
      case "meeting":
        query = supabase
          .from("ward_meeting_with_files")
          .select("*")
          .eq("ward_code", code)
          .order("date", { ascending: false });

        if (!admin) query = query.eq("is_published", true);
        if (limit) query = query.limit(limit);

        result = await query;
        break;

      case "announcement":
        query = supabase
          .from("ward_announcement_with_files")
          .select("*")
          .eq("ward_code", code);

        if (!admin) query = query.eq("is_published", true);

        query = query
          .order("scheduled_date", { ascending: true })
          .order("created_at", { ascending: false });

        if (limit) query = query.limit(limit);

        result = await query;
        break;

      case "project":
        query = supabase
          .from("ward_project_with_files")
          .select("*")
          .eq("ward_code", code)
          .order("start_date", { ascending: false });

        if (!admin) query = query.eq("is_published", true);
        if (limit) query = query.limit(limit);

        result = await query;
        break;

      case "update":
        query = supabase
          .from("ward_update_with_files")
          .select("*")
          .eq("ward_code", code)
          .order("date", { ascending: false });

        if (limit) query = query.limit(limit);

        result = await query;
        break;

      case "committee":
        result = await supabase
          .from("committee_member_view")
          .select("*")
          .eq("ward_code", code)
          .order("joined_at", { ascending: true });
        break;

      default:
        throw new Error(`Unsupported resource: ${resource}`);
    }

    if (result.error) throw result.error;

    // Resolve file URLs
    return Array.isArray(result.data)
      ? result.data.map((item) => ({
          ...item,
          files:
            item.files?.map((file) => ({
              ...file,
              path: resolveUrl(file.path),
            })) ?? [],
        }))
      : result.data;
  };

  const query = useQuery({ queryKey, queryFn, enabled });

  return {
    data: query.data,
    loading: query.isLoading,
    error: query.error?.message || null,
    refresh: query.refetch,
  };
}

const resolveUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return supabase.storage.from("ward").getPublicUrl(path).data.publicUrl;
};
