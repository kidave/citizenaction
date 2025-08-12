import { useEffect, useState } from 'react';

export default function useWardCommittees(wardId, enabled = true) {
  const [committees, setCommittees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!wardId || !enabled) return;
    setLoading(true);
    setError(null);

    fetch(`/api/committee/${wardId}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setCommittees(data || []);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [wardId, enabled]);

  return { committees, loading, error };
}