import { useEffect, useState } from "react";

export default function useWardJunctions(wardId, enabled = true) {
  const [junctions, setJunctions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!wardId || !enabled) return;
    setLoading(true);
    setError(null);

    fetch(`/api/junction/${wardId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setJunctions(data || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [wardId, enabled]);

  return { junctions, loading, error };
}
