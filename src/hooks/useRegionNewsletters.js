// hooks/useRegionNewsletters.js
import { useEffect, useState } from "react";
import { supabase } from "utils/supabaseClient";

export default function useRegionNewsletters(regionCode) {
  const [newsletters, setNewsletters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!regionCode) return;

    const fetchNewsletters = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("region_newsletter")
        .select("*")
        .eq("region_code", regionCode)
        .order("created_at", { ascending: false });

      if (error) console.error(error);
      else setNewsletters(data);
      setLoading(false);
    };

    fetchNewsletters();
  }, [regionCode]);

  return { newsletters, loading };
}
