import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';

export default function useWardMembers(wardId, enabled = true) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!wardId || !enabled) return;
    setLoading(true);
    setError(null);
    supabase
      .from('committee')
      .select('*')
      .eq('ward_code', wardId)
      .then(({ data, error }) => {
        setMembers(data || []);
        setError(error ? error.message : null);
        setLoading(false);
      });
  }, [wardId, enabled]);

  return { members, loading, error };
}