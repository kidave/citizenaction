// components/hooks/useWardBoundary.js
import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';

export default function useWardBoundary(wardId, enabled = true) {
  const [boundary, setBoundary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!wardId || !enabled) return;

    setLoading(true);
    setError(null);

    supabase
      .from('ward')
      .select('geom, name')
      .eq('code', wardId)
      .single()
      .then(({ data, error }) => {
        if (error) throw error;
        setBoundary(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [wardId, enabled]);

  return { boundary, loading, error };
}
