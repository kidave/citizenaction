import { createContext, useContext, useMemo, useEffect } from "react";
import { useWardHeader } from "hooks/useWardData";
import Spinner from "components/shared/ui/Spinner";
import { useRegionData } from "hooks/useRegionData";

const WardContext = createContext();

export function WardProvider({ children, wardId }) {
  const { setNavigatingWard } = useRegionData();
  
  // Use the new simplified hook
  const { data: wardInfo, loading: infoLoading, error: infoError } = useWardHeader(wardId);
  
  const loading = infoLoading;

  useEffect(() => {
    if (!loading) {
      setNavigatingWard(null);
    }
  }, [loading, setNavigatingWard]);

  const error = infoError;

  const contextValue = useMemo(
    () => ({
      wardId,
      wardInfo: wardInfo || {
        wardName: "",
        convenor: null,
        coConvenor: null,
      },
      loading,
      error,
    }),
    [wardId, wardInfo, loading, error]
  );

  return (
    <WardContext.Provider value={contextValue}>
      {loading ? <Spinner mode="fullscreen" /> : children}
    </WardContext.Provider>
  );
}

export function useWard() {
  const context = useContext(WardContext);
  if (!context) throw new Error("useWard must be used within a WardProvider");
  return context;
}