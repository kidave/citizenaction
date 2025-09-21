// context/RegionContext.js
import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { supabase } from "utils/supabaseClient";

const RegionContext = createContext();

export function RegionProvider({ children, regionCode }) {
  const [regionInfo, setRegionInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (regionCode) {
      fetchRegionInfo();
    }
  }, [regionCode]);

  const fetchRegionInfo = async () => {
    try {
      const { data, error } = await supabase
        .from("region")
        .select("*")
        .eq("code", regionCode)
        .single();

      if (error) throw error;
      setRegionInfo(data);
    } catch (error) {
      console.error("Error fetching region info:", error);
    } finally {
      setLoading(false);
    }
  };

  const contextValue = useMemo(
    () => ({ regionCode, regionInfo, loading, refetchRegionInfo: fetchRegionInfo }),
    [regionCode, regionInfo, loading]
  );

  return (
    <RegionContext.Provider value={contextValue}>
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion() {
  const context = useContext(RegionContext);
  if (!context) throw new Error("useRegion must be used within RegionProvider");
  return context;
}