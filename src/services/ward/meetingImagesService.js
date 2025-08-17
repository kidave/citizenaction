export async function fetchMeetingImages(meetingId) {
  const { data, error } = await supabase
    .from("meeting_images")
    .select("id, path")
    .eq("meeting_id", meetingId);

  if (error) throw error;
  return data;
}