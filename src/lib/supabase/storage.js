import { supabase } from "./client";

/**
 * Upload file to post-attachments bucket
 * @param {File} file - File to upload
 * @param {string} userId - User ID for path organization
 * @returns {Promise<{url: string, name: string, type: string, size: number}>}
 */
export async function uploadPostAttachment(file, userId) {
  // Create path: userId/timestamp-filename
  const timestamp = Date.now();
  const fileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_'); // Sanitize filename
  const path = `${userId}/${timestamp}-${fileName}`;

  // Upload file
  const { error: uploadError } = await supabase.storage
    .from("post-attachments")
    .upload(path, file, { 
      upsert: false,
      cacheControl: '3600'
    });

  if (uploadError) throw uploadError;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from("post-attachments")
    .getPublicUrl(path);

  return {
    url: publicUrl,
    name: file.name,
    type: file.type,
    size: file.size,
    path // Store path for potential deletion
  };
}

/**
 * Delete attachment from storage
 */
export async function deletePostAttachment(path) {
  const { error } = await supabase.storage
    .from("post-attachments")
    .remove([path]);

  if (error) throw error;
  return true;
}

/**
 * Get file type category for display
 */
export function getFileCategory(mimeType) {
  if (mimeType?.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType?.includes('word')) return 'document';
  if (mimeType?.includes('spreadsheet')) return 'spreadsheet';
  if (mimeType?.startsWith('text/')) return 'text';
  return 'file';
}