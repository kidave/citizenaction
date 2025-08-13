import { useEffect, useState } from "react";
import { supabase } from "utils/supabaseClient";

export default function useWardMetrics(wardId) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!wardId) return;
    setLoading(true);
    setError(null);

    supabase
      .from("metrics")
      .select("*")
      .eq("ward_code", wardId)
      .single()
      .then(({ data, error }) => {
        setMetrics(data);
        setError(error ? error.message : null);
        setLoading(false);
      });
  }, [wardId]);

  return { metrics, loading, error };
}
