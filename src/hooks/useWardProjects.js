import { useEffect, useState } from "react";

export default function useWardProjects(wardId, enabled = true) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!wardId || !enabled) return;
    setLoading(true);
    setError(null);

    fetch(`/api/project/${wardId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setProjects(data || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [wardId, enabled]);

  return { projects, loading, error };
}
