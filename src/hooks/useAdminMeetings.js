// hooks/useAdminMeetings.js
import { useState, useEffect } from "react";
import { useAuth } from "context/AuthContext";

export default function useAdminMeetings(wardId) {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getAccessToken } = useAuth();

  useEffect(() => {
    if (!wardId) return;
    
    const fetchMeetings = async () => {
      setLoading(true);
      try {
        const token = await getAccessToken();
        const res = await fetch(`/api/ward/${wardId}/meeting/admin`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!res.ok) {
          throw new Error("Failed to fetch meetings");
        }
        
        const data = await res.json();
        setMeetings(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, [wardId, getAccessToken]);

  return { meetings, loading, error, setMeetings };
}