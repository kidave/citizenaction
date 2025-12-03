// hooks/useMeetingAttendance.js (update if needed)
import { useState, useEffect } from 'react';
import { supabase } from 'utils/supabaseClient';

export default function useMeetingAttendance(meetingId, regionCode) {
  const [attendance, setAttendance] = useState([]);
  const [currentUserAttendance, setCurrentUserAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load current user's profile and attendance status
  const getCurrentUserAttendance = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setCurrentUserAttendance(null);
      return null;
    }
    
    const { data: attendanceData } = await supabase
      .from('region_meeting_attendance')
      .select('*')
      .eq('meeting_id', meetingId)
      .eq('user_id', user.id)
      .single();
    
    setCurrentUserAttendance(attendanceData);
    return attendanceData;
  };

  // Fetch attendees for this meeting with user profiles
  const fetchAttendance = async () => {
    if (!meetingId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('region_meeting_attendance')
        .select(`
          id,
          user_id,
          meeting_id,
          status,
          created_at,
          profile:user_id (
            name,
            avatar_url,
            designation,
            email
          )
        `)
        .eq('meeting_id', meetingId)
        .eq('status', 'attending');
      
      if (error) throw error;
      
      setAttendance(data || []);
      
      // Also check current user's attendance
      await getCurrentUserAttendance();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle user attendance
  const toggleAttendance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Please login to mark attendance');
      }

      setLoading(true);
      
      // Check if already attending
      const { data: existing } = await supabase
        .from('region_meeting_attendance')
        .select('id, status')
        .eq('meeting_id', meetingId)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        // Remove attendance
        const { error } = await supabase
          .from('region_meeting_attendance')
          .delete()
          .eq('id', existing.id);
        
        if (error) throw error;
        setCurrentUserAttendance(null);
        setAttendance(prev => prev.filter(a => a.user_id !== user.id));
      } else {
        // Add attendance
        const { data, error } = await supabase
          .from('region_meeting_attendance')
          .insert({
            meeting_id: meetingId,
            user_id: user.id,
            status: 'attending',
            region_code: regionCode
          })
          .select(`
            id,
            user_id,
            meeting_id,
            status,
            created_at,
            profile:user_id (
              name,
              avatar_url,
              designation,
              email
            )
          `)
          .single();
        
        if (error) throw error;
        setCurrentUserAttendance(data);
        setAttendance(prev => [...prev, data]);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [meetingId]);

  return {
    attendance,
    currentUserAttendance,
    loading,
    error,
    toggleAttendance,
    refresh: fetchAttendance
  };
}