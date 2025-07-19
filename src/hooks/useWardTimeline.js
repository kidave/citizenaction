import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';


export default function useWardTimeline(wardId, enabled = true) {
  const [timeline, setTimeline] = useState([]);
  const [wardInfo, setWardInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!wardId || !enabled) return;

    setLoading(true);
    setError(null);

    (async () => {
      try {
        const { data: convenorData } = await supabase
          .from('committee')
          .select('*')
          .eq('ward_code', wardId)
          .is('is_convenor', true)
          .maybeSingle();

        const { data: coConvenorData } = await supabase
          .from('committee')
          .select('*')
          .eq('ward_code', wardId)
          .is('is_co_convenor', true)
          .maybeSingle();

        const { data: wardData, error: wardError } = await supabase
          .from('ward')
          .select('name')
          .eq('code', wardId)
          .single();

        if (wardError) throw wardError;

        const { data: meeting, error: meetingError } = await supabase
          .from('meeting')
          .select('*')
          .eq('ward_code', wardId)
          .order('date', { ascending: false });

        const { data: update, error: updateError } = await supabase
          .from('update')
          .select('*')
          .eq('ward_code', wardId)
          .order('date', { ascending: false });

        if (meetingError || updateError) throw meetingError || updateError;

        const combinedData = [
          ...(meeting?.map(meeting => ({
            id: meeting.id,                     // ✅ integer for DB
            key: `meeting-${meeting.id}`,      // ✅ string for React key
            type: 'meeting',
            date: new Date(meeting.date),
            title: meeting.title || 'Committee Meeting',
            location: meeting.location,
            notable_attendees: meeting.notable_attendees,
            discussion: meeting.discussion,
            mood_rating: meeting.mood_rating,
          })) || []),
          ...(update?.map(update => ({
            id: update.id,
            key: `update-${update.id}`,
            type: 'update',
            date: new Date(update.date),
            title: update.ward_name ? `${update.ward_name.trim()} Update` : 'Monthly Update',
            description: update.description,
            operation: update.operation,
            support: update.support,
          })) || [])
        ].sort((a, b) => b.date - a.date);

        setTimeline(combinedData);

        const formatName = (user) => {
          if (!user) return 'Not assigned';
          return [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Not assigned';
        };

        setWardInfo({
          wardName: wardData?.name || 'Unknown',
          convenor: formatName(convenorData),
          convenorEmail: convenorData?.email || null,
          coConvenor: formatName(coConvenorData),
          coConvenorEmail: coConvenorData?.email || null
        });

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    })();
  }, [wardId, enabled]);

  return { timeline, wardInfo, loading, error };
}
