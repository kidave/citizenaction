// hooks/useMeetingImages.js
import { useState, useEffect } from "react";
import { supabase } from "utils/supabaseClient";

export default function useMeetingImages(meetingId) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!meetingId) return;
    
    const fetchImages = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("meeting_images")
          .select("id, path")
          .eq("meeting_id", meetingId);

        if (!error && data) {
          setImages(data);
        }
      } catch (error) {
        console.error("Error fetching meeting images:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [meetingId]);


  const resolveUrl = (path) =>
    supabase.storage.from("project-images").getPublicUrl(path).data.publicUrl;

  return { 
    images, 
    loading, 
    resolveUrl 
  };
}