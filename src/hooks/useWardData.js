// hooks/useWardData.js
import { useState, useEffect } from "react";
import { supabase } from "utils/supabaseClient";

export function useWardData(wardId, userId) {
  const [data, setData] = useState({
    wardInfo: null,
    meetings: [],
    updates: [],
    committees: [],
    roads: [],
    junctions: [],
    projects: [],
    loading: true,
    error: null,
    isConvenor: false
  });

  useEffect(() => {
    if (!wardId) return;

    const fetchWardData = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));
        
        // Fetch all data in parallel
        const [
          wardInfoRes,
          meetingsRes,
          updatesRes,
          committeesRes,
          roadsRes,
          junctionsRes,
          projectsRes,
          convenorRes
        ] = await Promise.allSettled([
          fetch(`/api/ward/${wardId}/header`).then(res => res.json()),
          fetch(`/api/ward/${wardId}/meeting`).then(res => res.json()),
          fetch(`/api/ward/${wardId}/update`).then(res => res.json()),
          fetch(`/api/ward/${wardId}/committee`).then(res => res.json()),
          fetch(`/api/ward/${wardId}/road`).then(res => res.json()),
          fetch(`/api/ward/${wardId}/junction`).then(res => res.json()),
          fetch(`/api/ward/${wardId}/project`).then(res => res.json()),
          userId ? supabase
            .from("committee")
            .select("role_id")
            .eq("user_id", userId)
            .eq("ward_code", wardId)
            .single() : Promise.resolve({ data: null })
        ]);

        setData({
          wardInfo: wardInfoRes.status === 'fulfilled' ? wardInfoRes.value : null,
          meetings: meetingsRes.status === 'fulfilled' ? meetingsRes.value : [],
          updates: updatesRes.status === 'fulfilled' ? updatesRes.value : [],
          committees: committeesRes.status === 'fulfilled' ? committeesRes.value : [],
          roads: roadsRes.status === 'fulfilled' ? roadsRes.value : [],
          junctions: junctionsRes.status === 'fulfilled' ? junctionsRes.value : [],
          projects: projectsRes.status === 'fulfilled' ? projectsRes.value : [],
          isConvenor: convenorRes.status === 'fulfilled' && 
                     convenorRes.value.data?.role_id === 1,
          loading: false,
          error: null
        });
      } catch (err) {
        setData(prev => ({ 
          ...prev, 
          loading: false, 
          error: err.message 
        }));
      }
    };

    fetchWardData();
  }, [wardId, userId]);

  return data;
}