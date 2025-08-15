// hooks/useMeetingImages.js
import { useState, useEffect } from "react";
import { supabase } from "utils/supabaseClient";

export default function useMeetingImages(meetingId) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!meetingId) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("meeting_images")
        .select("id, path") // keep id for deletion
        .eq("meeting_id", meetingId);

      if (!error && data) {
        setImages(data);
      }
      setLoading(false);
    })();
  }, [meetingId]);

  const uploadImage = async (file) => {
    if (!file || !meetingId) return;
    const filePath = `${meetingId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase
      .storage.from("project-images")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data, error: insertError } = await supabase
      .from("meeting_images")
      .insert([{ meeting_id: meetingId, path: filePath }])
      .select()
      .single();

    if (insertError) throw insertError;

    setImages(prev => [...prev, data]);
  };

  const deleteImage = async (imageId, imagePath) => {
    // delete from storage
    await supabase.storage.from("project-images").remove([imagePath]);
    // delete from db
    await supabase.from("meeting_images").delete().eq("id", imageId);
    setImages(prev => prev.filter(img => img.id !== imageId));
  };

  const resolveUrl = (path) =>
    supabase.storage.from("project-images").getPublicUrl(path).data.publicUrl;

  return { images, loading, uploadImage, deleteImage, resolveUrl };
}
