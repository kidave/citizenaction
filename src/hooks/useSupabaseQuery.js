// hooks/useSupabaseQuery.js
import { useState, useEffect } from "react";
import { supabase } from "utils/supabaseClient";

export default function useSupabaseQuery(table, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    select = "*",
    filters = {},
    orderBy = { column: "created_at", ascending: false },
    enabled = true,
    dependencies = []
  } = options;

  useEffect(() => {
    if (!table || !enabled) return;

    setLoading(true);
    setError(null);

    let query = supabase.from(table).select(select);

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });

    // Apply ordering
    if (orderBy) {
      query = query.order(orderBy.column, { ascending: orderBy.ascending });
    }

    query
      .then(({ data: result, error }) => {
        if (error) throw error;
        setData(result);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [table, JSON.stringify(filters), JSON.stringify(orderBy), enabled, ...dependencies]);

  return { data, loading, error, refetch: () => setLoading(true) };
}