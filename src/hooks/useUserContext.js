// hooks/useUserContext.js
import { useEffect, useState } from "react";
import { useAuth } from "context/AuthContext";

export default function useUserContext() {
  const { getAccessToken, user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setData(null);
      return;
    }

    let active = true; // cancel flag

    const fetchContext = async () => {
      setLoading(true);
      try {
        const token = await getAccessToken();
        const res = await fetch("/api/user/context", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        if (active) setData(json);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchContext();
    return () => {
      active = false;
    };
  }, [user, getAccessToken]);

  return { data, loading, error };
}
