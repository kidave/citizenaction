import { useEffect, useState } from 'react';

export default function useWardMeetings(wardId, enabled = true) {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!wardId || !enabled) return;
    setLoading(true);
    setError(null);

    fetch(`/api/meeting/${wardId}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setMeetings(data || []);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [wardId, enabled]);

  return { meetings, loading, error };
}