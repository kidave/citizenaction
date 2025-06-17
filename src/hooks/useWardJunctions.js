import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';

export default function useWardJunctions(wardId, enabled = true) {
  const [junctions, setJunctions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!wardId || !enabled) return;
    
    setLoading(true);
    setError(null);
    
    supabase
      .rpc('get_ward_junctions', { ward_id: parseInt(wardId) })
      .then(({ data, error }) => {
        if (error) throw error;
        setJunctions(data || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [wardId, enabled]);

  return { junctions, loading, error };
}