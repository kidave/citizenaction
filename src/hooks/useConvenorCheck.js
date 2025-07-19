import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { useForum } from '../context/ForumContext';
import { useWard } from '../context/WardContext';

export default function useConvenorCheck() {
  const { user } = useForum();
  const { wardId } = useWard();
  const [isConvenor, setIsConvenor] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkConvenorStatus = async () => {
      if (!user || !wardId) {
        setIsConvenor(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profile')
          .select('is_convenor, is_co_convenor, ward_code')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        setIsConvenor(
          (data?.is_convenor || data?.is_co_convenor) && 
          data?.ward_code === wardId
        );
      } catch (err) {
        console.error('Convenor check failed:', err);
        setIsConvenor(false);
      } finally {
        setLoading(false);
      }
    };

    checkConvenorStatus();
  }, [user, wardId]);

  return { isConvenor, loading };
}