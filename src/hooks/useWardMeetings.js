import { useEffect, useState } from "react";

export default function useWardMeetings(wardId) {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!wardId) return;
    setLoading(true);

    fetch(`/api/ward/${wardId}/meeting/public`)
      .then((res) => res.json())
      .then((data) => {
        setMeetings(data || []);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [wardId]);

  return { meetings, loading, error, setMeetings };
}