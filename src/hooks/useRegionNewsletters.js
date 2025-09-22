// hooks/useRegionNewsletters.js
import { useEffect, useState } from "react";
import { supabase } from "utils/supabaseClient";

export default function useRegionNewsletters(regionCode) {
  const [newsletters, setNewsletters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!regionCode) {
      setLoading(false);
      return;
    }

    const fetchNewsletters = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from("region_newsletter")
          .select("*")
          .eq("region_code", regionCode)
          .order("created_at", { ascending: false });

        if (error) {
          setError(error.message);
          console.error("Error fetching newsletters:", error);
        } else {
          setNewsletters(data || []);
        }
      } catch (err) {
        setError(err.message);
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsletters();
  }, [regionCode]);

  return { newsletters, loading, error };
}