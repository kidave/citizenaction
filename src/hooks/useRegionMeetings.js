// hooks/useRegionMeetings.js
import { useState, useEffect } from "react";
import { supabase } from "lib/supabase/client";

// hooks/useRegionMeetings.js
export default function useRegionMeetings(regionCode) {
  const [state, setState] = useState({
    meetings: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!regionCode) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    const fetchMeetings = async () => {
      try {
        const { data, error } = await supabase
          .from("region_meeting_attendance_action")
          .select("*")
          .eq("region_code", regionCode)
          .order("meeting_date", { ascending: false });

        if (error) throw error;

        setState({
          meetings: data || [],
          loading: false,
          error: null
        });
      } catch (err) {
        setState({
          meetings: [],
          loading: false,
          error: err.message
        });
      }
    };

    fetchMeetings();
  }, [regionCode]);

  return state;
}