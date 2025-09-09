// hooks/useAdminUpdates.js
import { useState, useEffect } from "react";
import { useAuth } from "context/AuthContext";

export default function useAdminUpdates(wardId) {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { getAccessToken } = useAuth();

  useEffect(() => {
    if (!wardId) return;
    
    const fetchUpdates = async () => {
      setLoading(true);
      try {
        const token = await getAccessToken();
        const res = await fetch(`/api/ward/${wardId}/update/admin`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!res.ok) {
          throw new Error("Failed to fetch updates");
        }
        
        const data = await res.json();
        setUpdates(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUpdates();
  }, [wardId, getAccessToken]);

  return { updates, loading, error, setUpdates };
}