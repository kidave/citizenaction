import { useEffect, useState } from "react";

export default function useWardRoads(wardId, enabled = true) {
  const [roads, setRoads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!wardId || !enabled) return;
    setLoading(true);
    setError(null);

    fetch(`/api/road/${wardId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setRoads(data || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [wardId, enabled]);

  return { roads, loading, error };
}
