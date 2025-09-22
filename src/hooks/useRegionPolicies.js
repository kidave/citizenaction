// hooks/useRegionPolicies.js
import { useState, useEffect } from "react";
import { supabase } from "utils/supabaseClient";

export default function useRegionPolicies(regionCode) {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!regionCode) {
      setLoading(false);
      return;
    }

    const fetchPolicies = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from("region_policy")
          .select("*")
          .eq("region_code", regionCode)
          .order("proposed_date", { ascending: false });

        if (error) throw error;
        setPolicies(data || []);
        
      } catch (err) {
        console.error("Error fetching region policies:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicies();
  }, [regionCode]);

  return { policies, loading, error };
}