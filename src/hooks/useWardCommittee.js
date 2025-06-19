import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';

export default function useWardCommittee(wardId) {
  const [committee, setCommittee] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!wardId) return;
    setLoading(true);
    setError(null);

    supabase
      .from('committee')
      .select('*')
      .eq('ward_code', wardId)
      .then(({ data, error }) => {
        setCommittee(data || []);
        setError(error ? error.message : null);
        setLoading(false);
      });
  }, [wardId]);

  return { committee, loading, error };
}