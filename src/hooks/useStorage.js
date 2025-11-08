// hooks/useStorage.js
import { useState, useEffect, useCallback } from "react";
import { supabase } from "utils/supabaseClient";

export default function useStorage(entityType, entityId, wardCode) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const tableMap = {
    meeting: 'ward_meeting_file',
    update: 'ward_update_file',
    project: 'ward_project_file'
  };

  const table = tableMap[entityType];

  const fetchFiles = useCallback(async () => {
    if (!entityId || !table) return;
    
    setLoading(true);
    
    let selectQuery = "id, path, is_main, type";
    
    if (entityType === 'project') {
      selectQuery = "id, path, step, type, caption, is_main, display_order";
    }
    
    const { data, error } = await supabase
      .from(table)
      .select(selectQuery)
      .eq(`${entityType}_id`, entityId);

    if (!error) setFiles(data || []);
    setError(error?.message || null);
    setLoading(false);
  }, [entityId, table, entityType]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const resolveUrl = (path) =>
    supabase.storage.from("ward").getPublicUrl(path).data.publicUrl;

  const upload = async (file, step = "A", type = "image") => {
    if (!wardCode || !entityId) {
      throw new Error("wardCode and entityId required for upload");
    }
    
    setLoading(true);
    try {
      const safeFileName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
      
      let destPath;
      if (entityType === 'project') {
        // CLEAN STRUCTURE: Direct step folders under project
        destPath = `${wardCode}/project/${entityId}/${step}/${type}/${safeFileName}`;
      } else if (entityType === 'meeting') {
        // Meeting files structure
        destPath = `${wardCode}/meeting/${entityId}/${type}/${safeFileName}`;
      } else if (entityType === 'update') {
        // Update files structure  
        destPath = `${wardCode}/update/${entityId}/${type}/${safeFileName}`;
      }

      const { error: uploadError } = await supabase.storage
        .from("ward")
        .upload(destPath, file);

      if (uploadError) throw uploadError;

      const insertData = {
        [`${entityType}_id`]: entityId,
        path: destPath,
        is_main: false,
        type: type
      };

      if (entityType === 'project') {
        insertData.step = step;
      }

      const { data, error: dbError } = await supabase
        .from(table)
        .insert(insertData)
        .select()
        .single();

      if (dbError) throw dbError;
      
      // Refresh files after upload
      await fetchFiles();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const remove = async (file) => {
    setLoading(true);
    try {
      if (file.path) {
        await supabase.storage.from("ward").remove([file.path]);
      }
      await supabase.from(table).delete().eq("id", file.id);
      
      // Refresh files after delete
      await fetchFiles();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { files, loading, error, upload, remove, resolveUrl, refresh: fetchFiles };
}

// Specialized file hooks with consistent parameter order
export const useMeetingFiles = (meetingId, wardCode) => 
  useStorage('meeting', meetingId, wardCode);

export const useUpdateFiles = (updateId, wardCode) => 
  useStorage('update', updateId, wardCode);

export const useProjectFiles = (wardCode, projectId) => 
  useStorage('project', projectId, wardCode);