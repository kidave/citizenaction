import { useState, useEffect } from "react";
import { supabase } from "utils/supabaseClient";

export default function useWardProjects(wardId) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!wardId) return;
    setLoading(true);

    supabase
      .from("project")
      .select(`
        *,
        project_images (id, step, type, path)
      `)
      .eq("ward_code", wardId)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error);
        else setProjects(data || []);
      })
      .finally(() => setLoading(false));
  }, [wardId]);

  const resolveUrl = (path) =>
    supabase.storage.from("ward").getPublicUrl(path).data.publicUrl;

  return { projects, loading, error, resolveUrl };
}
