// hooks/useProjectImages.js
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "context/AuthContext";
import { supabase } from "utils/supabaseClient";

export default function useProjectImages(wardId, projectId) {
  const { getAccessToken } = useAuth();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const resolveUrl = useCallback((path) => {
    if (!path) return "/no-image.svg";
    const { data } = supabase.storage.from("ward").getPublicUrl(path);
    return data?.publicUrl || "/no-image.svg";
  }, []);

  // Fetch images directly from Supabase
  const fetchImages = useCallback(async () => {
    if (!projectId) {
      setImages([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from("project_images")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setImages(data || []);
    } catch (err) {
      console.error("Error fetching images:", err);
      setError(err.message);
      setImages([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  // Upload image directly to Supabase
  const upload = async (file, step = "A", type = "stack") => {
    if (!wardId || !projectId) {
      throw new Error("wardId and projectId required for upload");
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Generate a safe file name
      const safeFileName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
      const destPath = `${wardId}/project/${projectId}/${step}/${safeFileName}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from("ward")
        .upload(destPath, file);

      if (uploadError) throw uploadError;

      // Insert metadata into database
      const { data, error: dbError } = await supabase
        .from("project_images")
        .insert({
          project_id: projectId,
          step,
          type,
          path: destPath
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Update local state
      setImages(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Remove image directly from Supabase
  const remove = async (image) => {
    if (!wardId || !projectId) {
      throw new Error("wardId and projectId required for delete");
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Delete from storage
      if (image.path) {
        const { error: storageError } = await supabase.storage
          .from("ward")
          .remove([image.path]);
        
        if (storageError) console.error("Storage delete error:", storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from("project_images")
        .delete()
        .eq("id", image.id);

      if (dbError) throw dbError;

      // Update local state
      setImages(prev => prev.filter(i => i.id !== image.id));
      return { success: true };
    } catch (err) {
      console.error("Delete error:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { 
    images, 
    loading, 
    error, 
    upload, 
    remove, 
    resolveUrl, 
    refresh: fetchImages 
  };
}