import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';

export default function useWardProjects(wardId) {
  const [projects, setProjects] = useState([]); // ⬅ Default to []
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!wardId) return;
    setLoading(true);
    setError(null);

    supabase
      .from('project')
      .select('*')
      .eq('ward_code', wardId)
      .then(({ data, error }) => {
        setProjects(data || []); // ⬅ Never null
        setError(error ? error.message : null);
        setLoading(false);
      });
  }, [wardId]);

  return { projects, loading, error };
}
