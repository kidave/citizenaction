// hooks/useTimelineData.js
import { useState, useEffect } from "react";

export const useTimelineData = (resource, wardId, isPublic = false) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!wardId) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const endpoint = isPublic 
          ? `/api/ward/${wardId}/${resource}/public`
          : `/api/ward/${wardId}/${resource}`;
        
        const res = await fetch(endpoint);
        const result = await res.json();
        
        if (!res.ok) throw new Error(result.error || "Failed to fetch");
        setData(result || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [wardId, resource, isPublic]);

  return { data, loading, error, setData };
};