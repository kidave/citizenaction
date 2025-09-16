// hooks/useAdminProjects.js
import { useState, useEffect } from "react";
import { useAuth } from "context/AuthContext";

export default function useAdminProjects(wardId) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getAccessToken } = useAuth();

  const fetchProjects = async () => {
    if (!wardId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = await getAccessToken();
      const res = await fetch(`/api/ward/${wardId}/project/admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch projects: ${res.status}`);
      }

      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [wardId]);

  return { projects, loading, error, setProjects, refresh: fetchProjects };
}