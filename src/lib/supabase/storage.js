import { supabase } from "./client";

/**
 * Upload file to Supabase storage with proper error handling
 */
export const uploadFile = async (bucket, path, file, options = {}) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { 
      upsert: true,
      ...options 
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return publicUrl;
};

/**
 * Delete file from Supabase storage
 */
export const deleteFile = async (bucket, path) => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) throw error;
  
  return true;
};

/**
 * Get public URL for a file
 */
export const getPublicUrl = (bucket, path) => {
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return publicUrl;
};

/**
 * Extract filename from storage URL
 */
export const extractFileNameFromUrl = (url) => {
  if (!url) return null;
  return url.split('/').pop();
};