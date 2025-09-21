// components/region/tabs/RegionMeetingTab.js
import { useEffect, useState } from "react";
import { supabase } from "utils/supabaseClient";
import { useRegion } from "context/RegionContext";
import styles from "styles/layout/region.module.css";

export default function RegionMeetingTab() {
  const { regionCode } = useRegion();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!regionCode) return;

    const fetchMeetings = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("region_meeting")
        .select("*")
        .eq("region_code", regionCode)
        .order("meeting_date", { ascending: false });

      if (error) console.error(error);
      else setMeetings(data || []);
      setLoading(false);
    };

    fetchMeetings();
  }, [regionCode]);

  if (loading) return <div className={styles.loading}>Loading meetings...</div>;
  if (!meetings.length) return <div className={styles.noData}>No meetings found for this region.</div>;

  return (
    <div className={styles.tabContent}>
      <h2>Regional Meetings</h2>
      <div className={styles.cardGrid}>
        {meetings.map((meeting) => (
          <div key={meeting.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>{meeting.title}</h3>
              <span className={styles.date}>
                {new Date(meeting.meeting_date).toLocaleDateString()}
              </span>
            </div>
            <div className={styles.cardBody}>
              <p>{meeting.description}</p>
              {meeting.location && (
                <p className={styles.location}>
                  <strong>Location:</strong> {meeting.location}
                </p>
              )}
              {meeting.minutes_url && (
                <a href={meeting.minutes_url} target="_blank" rel="noreferrer" className={styles.link}>
                  View Minutes
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}