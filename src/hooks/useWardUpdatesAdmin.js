// hooks/useWardUpdatesAdmin.js
import { useEffect, useState } from "react";
import { useAuth } from "context/AuthContext";

export default function useWardUpdatesAdmin(wardId, enabled = true) {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { getAccessToken, user } = useAuth();

  useEffect(() => {
    if (!wardId || !enabled || !user) return;
    
    const fetchUpdates = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = await getAccessToken();
        const response = await fetch(`/api/ward/${wardId}/update/admin`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setUpdates(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUpdates();
  }, [wardId, enabled, user, getAccessToken]);

  return { updates, loading, error, setUpdates };
}