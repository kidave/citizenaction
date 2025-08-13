import { useEffect, useState } from "react";

export default function useWardUpdates(wardId, enabled = true) {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!wardId || !enabled) return;
    setLoading(true);
    setError(null);

    fetch(`/api/update/${wardId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setUpdates(data || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [wardId, enabled]);

  return { updates, loading, error };
}
