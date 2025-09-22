// hooks/useRegionProjects.js
import { useState, useEffect } from "react";
import { supabase } from "utils/supabaseClient";

export default function useRegionProjects(regionCode) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!regionCode) {
      setLoading(false);
      return;
    }

    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from("region_project")
          .select("*")
          .eq("region_code", regionCode)
          .order("start_date", { ascending: false });

        if (error) throw error;
        setProjects(data || []);
        
      } catch (err) {
        console.error("Error fetching region projects:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [regionCode]);

  return { projects, loading, error };
}