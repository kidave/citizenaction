// hooks/useFetch.js
import { useState, useEffect } from "react";

export default function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { enabled = true, dependencies = [] } = options;

  useEffect(() => {
    if (!url || !enabled) return;

    setLoading(true);
    setError(null);

    fetch(url)
      .then(res => res.json())
      .then(result => {
        if (result.error) throw new Error(result.error);
        setData(result);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [url, enabled, ...dependencies]);

  return { data, loading, error, refetch: () => setLoading(true) };
}