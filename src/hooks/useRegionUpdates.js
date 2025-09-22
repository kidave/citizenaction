// hooks/useRegionUpdates.js
import { useState, useEffect } from "react";
import { supabase } from "utils/supabaseClient";

export default function useRegionUpdates(regionCode) {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!regionCode) {
      setLoading(false);
      return;
    }

    const fetchUpdates = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from("region_update")
          .select("*")
          .eq("region_code", regionCode)
          .order("update_date", { ascending: false });

        if (error) throw error;
        setUpdates(data || []);
        
      } catch (err) {
        console.error("Error fetching region updates:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUpdates();
  }, [regionCode]);

  return { updates, loading, error };
}