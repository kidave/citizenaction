// context/RegionContext.js
import { createContext, useContext, useMemo, useEffect, useState } from "react";
import { LocationService } from "utils/location";
import Spinner from "components/shared/ui/Spinner";

const RegionContext = createContext();

export function RegionProvider({ children, regionCode }) {
  const [regionInfo, setRegionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRegionData = async () => {
      try {
        setLoading(true);
        const regionData = await LocationService.getRegionByCode(regionCode || "MMR");
        setRegionInfo(regionData);
      } catch (err) {
        console.error("Error loading region data:", err);
        setError(err.message);
        // Fallback to static data if DB fails
        setRegionInfo({
          code: regionCode || "MH-MMR",
          name: "Mumbai Metropolitan Region",
        });
      } finally {
        setLoading(false);
      }
    };

    loadRegionData();
  }, [regionCode]);

  const contextValue = useMemo(
    () => ({
      regionCode: regionCode || "MH-MMR",
      regionInfo: regionInfo || {
        code: regionCode || "MH-MMR",
        name: "Mumbai Metropolitan Region",
      },
      loading,
      error,
    }),
    [regionCode, regionInfo, loading, error]
  );

  if (loading) {
    return <Spinner />;
  }

  return (
    <RegionContext.Provider value={contextValue}>
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion() {
  const context = useContext(RegionContext);
  if (!context) throw new Error("useRegion must be used within a RegionProvider");
  return context;
}