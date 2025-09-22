// hooks/useRegionMeetings.js
import { useState, useEffect } from "react";
import { supabase } from "utils/supabaseClient";

export default function useRegionMeetings(regionCode) {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!regionCode) {
      setLoading(false);
      return;
    }

    const fetchMeetings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from("region_meeting")
          .select(`
            id, title, meeting_date, location,
            meet_link, recording_url, transcript, transcript_json,
            attendees, action_items, minutes_url
          `)
          .eq("region_code", regionCode)
          .order("meeting_date", { ascending: false });

        if (error) throw error;
        setMeetings(data || []);
        
      } catch (err) {
        console.error("Error fetching region meetings:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, [regionCode]);

  return { meetings, loading, error };
}