import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';

export default function useWardMeetings(wardId, enabled = true) {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!wardId || !enabled) return;

    setLoading(true);
    setError(null);

    (async () => {
      try {
        const { data, error } = await supabase
          .from('meeting')
          .select('*')
          .eq('ward_code', wardId)
          .order('date', { ascending: false });

        if (error) throw error;
        setMeetings(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [wardId, enabled]);

  return { meetings, loading, error };
}