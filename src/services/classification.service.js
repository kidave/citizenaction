// src/services/classification.service.js

import { supabase } from "@/lib/supabase/client";

const SYSTEM_VIEW = "classification_system_view";
const CODE_VIEW = "classification_code_view";

const service = {
  async getSystems() {
    const { data, error } = await supabase
      .from(SYSTEM_VIEW)
      .select("*")
      .order("name");

    if (error) throw error;

    return data ?? [];
  },

  async getSystem(id) {
    const { data, error } = await supabase
      .from("classification_system")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return data;
  },

  async getSystemByCode(code) {
    const { data, error } = await supabase
      .from("classification_system")
      .select("*")
      .eq("code", code)
      .single();

    if (error) throw error;

    return data;
  },

  async getDimensions(systemId) {
    const { data, error } = await supabase
      .from("classification_dimension")
      .select("*")
      .eq("system_id", systemId)
      .order("sort_order")
      .order("name");

    if (error) throw error;

    return data ?? [];
  },

  async getDimension(id) {
    const { data, error } = await supabase
      .from("classification_dimension")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return data;
  },

  async getCodes(dimensionId) {
    const { data, error } = await supabase
      .from(CODE_VIEW)
      .select("*")
      .eq("dimension_id", dimensionId)
      .order("sort_order")
      .order("code");

    if (error) throw error;

    return data ?? [];
  },

  async getCode(id) {
    const { data, error } = await supabase
      .from(CODE_VIEW)
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return data;
  },

  async searchCodes(search, dimensionId = null) {
    let query = supabase
      .from(CODE_VIEW)
      .select("*")
      .or(
        `title.ilike.%${search}%,display_name.ilike.%${search}%,code.ilike.%${search}%`,
      );

    if (dimensionId) {
      query = query.eq("dimension_id", dimensionId);
    }

    const { data, error } = await query.order("sort_order").limit(100);

    if (error) throw error;

    return data ?? [];
  },

  async createCode(values) {
    const { data, error } = await supabase
      .from("classification_code")
      .insert(values)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async updateCode(id, values) {
    const { data, error } = await supabase
      .from("classification_code")
      .update(values)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async deleteCode(id) {
    const { error } = await supabase
      .from("classification_code")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  async createDimension(values) {
    const { data, error } = await supabase
      .from("classification_dimension")
      .insert(values)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async updateDimension(id, values) {
    const { data, error } = await supabase
      .from("classification_dimension")
      .update(values)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async deleteDimension(id) {
    const { error } = await supabase
      .from("classification_dimension")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  async createSystem(values) {
    const { data, error } = await supabase
      .from("classification_system")
      .insert(values)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async updateSystem(id, values) {
    const { data, error } = await supabase
      .from("classification_system")
      .update(values)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async deleteSystem(id) {
    const { error } = await supabase
      .from("classification_system")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  buildTree(rows) {
    const map = {};
    const roots = [];

    rows.forEach((row) => {
      map[row.id] = {
        ...row,
        children: [],
      };
    });

    rows.forEach((row) => {
      if (row.parent_id && map[row.parent_id]) {
        map[row.parent_id].children.push(map[row.id]);
      } else {
        roots.push(map[row.id]);
      }
    });

    return roots;
  },
};

export default service;
