// hooks/usePendingApplications.js
import { useEffect, useState } from "react";
import { useAuth } from "context/AuthContext";

export default function usePendingApplications(wardId, enabled = true) {
  const { getAccessToken } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPending = async () => {
    if (!wardId || !enabled) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      const res = await fetch(`/api/ward/${wardId}/committee/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setApplications(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, [wardId, enabled]);

  return { applications, loading, error, refresh: fetchPending };
}
