// components/hooks/useWardInfo.js
import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';

export default function useWardInfo(wardId, enabled = true) {
  const [wardInfo, setWardInfo] = useState({
    wardName: 'Loading...',
    convenor: 'Loading...',
    coConvenor: 'Loading...',
    convenorEmail: '',
    coConvenorEmail: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!wardId || !enabled) return;

    const fetchWardData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Execute both queries in parallel
        const [wardQuery, committeeQuery] = await Promise.all([
          supabase
            .from('ward')
            .select(`
              code,
              name,
              division_code,
              division:division_code(name),
              city:city_code(name)
            `)
            .eq('code', wardId)
            .single(),

          supabase
            .from('committee')
            .select(`
              first_name,
              last_name,
              email,
              phone,
              is_convenor,
              is_co_convenor
            `)
            .eq('ward_code', wardId)
            .or('is_convenor.eq.true,is_co_convenor.eq.true')
        ]);

        // Handle errors
        if (wardQuery.error) throw wardQuery.error;
        if (committeeQuery.error) throw committeeQuery.error;

        // Process ward data
        const wardData = wardQuery.data;
        if (!wardData) throw new Error('Ward not found');

        // Process committee data
        const committeeData = committeeQuery.data || [];
        const convenors = committeeData.filter(m => m.is_convenor);
        const coConvenors = committeeData.filter(m => m.is_co_convenor);

        // Format names safely
        const formatName = (member) => 
          member ? `${member.first_name} ${member.last_name || ''}`.trim() : 'Not assigned';

        setWardInfo({
          wardName: wardData.name || 'Unknown ward',
          wardCode: wardData.code,
          divisionCode: wardData.division_code,
          divisionName: wardData.division?.name || 'Unknown division',
          cityName: wardData.city?.name || 'Unknown city',
          convenor: convenors.length > 0 ? formatName(convenors[0]) : 'Not assigned',
          convenorEmail: convenors[0]?.email || '',
          convenorPhone: convenors[0]?.phone || '',
          coConvenor: coConvenors.length > 0 ? formatName(coConvenors[0]) : 'Not assigned',
          coConvenorEmail: coConvenors[0]?.email || '',
          coConvenorPhone: coConvenors[0]?.phone || ''
        });

      } catch (err) {
        setError(err.message);
        console.error('Failed to fetch ward info:', err);
        // Maintain last known good state instead of resetting
      } finally {
        setLoading(false);
      }
    };

    fetchWardData();
  }, [wardId, enabled]);

  return { wardInfo, loading, error };
}