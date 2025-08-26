// services/wardService.js
import { supabase } from "utils/supabaseClient";

export const wardService = {
  getWardHeader: async (wardId) => {
    const { data, error } = await supabase
      .from("ward")
      .select("*")
      .eq("code", wardId)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  getWardMeetings: async (wardId) => {
    const { data, error } = await supabase
      .from("meeting")
      .select("*")
      .eq("ward_code", wardId)
      .order("date", { ascending: false });
    
    if (error) throw error;
    return data;
  },
  
  getWardUpdates: async (wardId) => {
    const { data, error } = await supabase
      .from("update")
      .select("*")
      .eq("ward_code", wardId)
      .order("date", { ascending: false });

    if (error) throw error;
    return data;
  },

  getWardCommittees: async (wardId) => {
    const { data, error } = await supabase
      .from("committee")
      .select("*")
      .eq("ward_code", wardId);

    if (error) throw error;
    return data;
  },

  getWardRoads: async (wardId) => {
    const { data, error } = await supabase
      .rpc("get_roads", {
        ward_code: wardId,
      });
    if (error) throw error;
    return data;
  },

  getWardJunctions: async (wardId) => {
    const { data, error } = await supabase
      .rpc("get_ward_junctions", {
        ward_code: wardId,
      });
    if (error) throw error;
    return data;
  },

  getWardProjects: async (wardId) => {
    const { data, error } = await supabase
      .from("project")
      .select("*")
      .eq("ward_code", wardId);

    if (error) throw error;
    return data;
  },
};