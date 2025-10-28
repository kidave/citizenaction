import { useState } from "react";
import { supabase } from "utils/supabaseClient";

export default function useRegionCRUD(tableName = "region_meeting", regionCode = "MMR") {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const create = async (formData) => {
    try {
      setLoading(true);
      const { error } = await supabase.from(tableName).insert([{ ...formData, region_code: regionCode }]);
      if (error) throw error;
    } catch (err) {
      console.error("Create error:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id, formData) => {
    try {
      setLoading(true);
      const { error } = await supabase.from(tableName).update(formData).eq("id", id);
      if (error) throw error;
    } catch (err) {
      console.error("Update error:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    try {
      setLoading(true);
      const { error } = await supabase.from(tableName).delete().eq("id", id);
      if (error) throw error;
    } catch (err) {
      console.error("Delete error:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, update, remove, loading, error };
}
