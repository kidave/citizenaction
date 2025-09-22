import { useState, useEffect } from "react";
import { supabase } from "utils/supabaseClient";

export default function useUpdateImages(updateId) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!updateId) return;
    setLoading(true);

    supabase
      .from("update_images")
      .select("id, path")
      .eq("update_id", updateId)
      .then(({ data, error }) => {
        if (!error) setImages(data || []);
      })
      .finally(() => setLoading(false));
  }, [updateId]);

  const resolveUrl = (path) =>
    supabase.storage.from("ward").getPublicUrl(path).data.publicUrl;

  const upload = async (wardId, file) => {
    const filePath = `${wardId}/update/${updateId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("ward")
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data, error: dbError } = await supabase
      .from("update_images")
      .insert({ update_id: updateId, path: filePath })
      .select("id, path")
      .single();

    if (dbError) throw dbError;
    setImages((prev) => [...prev, data]);
  };

  const remove = async (img) => {
    await supabase.storage.from("ward").remove([img.path]);
    await supabase.from("update_images").delete().eq("id", img.id);
    setImages((prev) => prev.filter((i) => i.id !== img.id));
  };

  return { images, setImages, loading, resolveUrl, upload, remove };
}