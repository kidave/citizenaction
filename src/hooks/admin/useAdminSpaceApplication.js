import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export function useAdminSpaceApplication(id) {
  const [state, setState] = useState({ loading: true, application: null, categories: [], error: null });

  useEffect(() => {
    if (!id) return;
    let active = true;

    async function load() {
      const [{ data: application, error: applicationError }, { data: categories, error: categoryError }] = await Promise.all([
        supabase.from("space_application").select("*, official_category:category_id (id,name,slug)").eq("id", id).single(),
        supabase.from("category").select("id,name,slug,description,sort_order").order("sort_order", { ascending: true }),
      ]);
      if (!active) return;
      setState({ loading: false, application: applicationError ? null : application, categories: categoryError ? [] : categories || [], error: applicationError || categoryError || null });
    }

    load();
    return () => { active = false; };
  }, [id]);

  return state;
}
