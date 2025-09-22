// context/RegionContext.js
import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "utils/supabaseClient";

const RegionContext = createContext();

export function RegionProvider({ children, regionCode, regionInfo: initialRegionInfo }) {
  const code = regionCode || "MMR"; // default to MMR
  const [regionInfo, setRegionInfo] = useState(initialRegionInfo || null);
  const [loading, setLoading] = useState(!initialRegionInfo);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (code && !initialRegionInfo) {
      fetchRegionInfo(code);
    }
  }, [code, initialRegionInfo]);

  const fetchRegionInfo = async (codeParam = code) => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("region")
        .select("*")
        .eq("code", codeParam)
        .single();
      if (error) throw error;
      setRegionInfo(data);
    } catch (err) {
      console.error("Error fetching region info:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const value = { regionCode: code, regionInfo, loading, error, refetchRegionInfo: fetchRegionInfo };

  return <RegionContext.Provider value={value}>{children}</RegionContext.Provider>;
}


export function useRegion() {
  const context = useContext(RegionContext);
  if (!context) {
    throw new Error("useRegion must be used within a RegionProvider");
  }
  return context;
}