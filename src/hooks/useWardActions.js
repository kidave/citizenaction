import { useEffect, useState } from "react";
import { supabase } from "utils/supabaseClient";

export default function useWardActions(wardId, enabled = true) {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!wardId || !enabled) return;
    setLoading(true);
    setError(null);
    supabase
      .from("action")
      .select("*")
      .eq("ward_code", wardId)
      .then(({ data, error }) => {
        setActions(data || []);
        setError(error ? error.message : null);
        setLoading(false);
      });
  }, [wardId, enabled]);

  return { actions, loading, error };
}
