import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';

export default function useWardRoads(wardId, enabled = true) {
  const [roads, setRoads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!wardId || !enabled) return;
    
    setLoading(true);
    setError(null);

    supabase
      .rpc('get_ward_roads', { gr_ward_id: wardId })
      .then(({ data, error }) => {
        if (error) throw error;
        setRoads(data || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [wardId, enabled]);

  return { roads, loading, error };
}