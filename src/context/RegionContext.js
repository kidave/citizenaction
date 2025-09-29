// context/RegionContext.js
import { createContext, useContext, useMemo } from "react";
import Spinner from "components/shared/ui/Spinner";

const RegionContext = createContext();

export function RegionProvider({ children, regionCode }) {
  // Since we only have MMR region, we can hardcode the info
  const regionInfo = {
    code: regionCode || "MMR",
    name: "Mumbai Metropolitan Region",
    // Add any other static region info you need
  };

  const loading = false; // No loading since data is static
  const error = null; // No error since data is static

  const contextValue = useMemo(
    () => ({
      regionCode: regionCode || "MMR",
      regionInfo,
      loading,
      error,
    }),
    [regionCode] // Only depend on regionCode changes
  );

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