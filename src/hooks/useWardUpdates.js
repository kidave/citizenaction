import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';

export default function useWardUpdates(wardId, enabled = true) {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!wardId || !enabled) return;

    setLoading(true);
    setError(null);

    (async () => {
      try {
        const { data, error } = await supabase
          .from('update')
          .select('*')
          .eq('ward_code', wardId)
          .order('date', { ascending: false });

        if (error) throw error;
        setUpdates(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [wardId, enabled]);

  return { updates, loading, error };
}