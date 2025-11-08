// context/WardContext.js
import { createContext, useContext, useMemo, useEffect, useState } from "react";
import { useWardHeader } from "hooks/useWardData";
import Spinner from "components/shared/ui/Spinner";
import { useLocationData } from "hooks/useLocation";
import { useRouter } from "next/router";

const WardContext = createContext();

export function WardProvider({ children, wardCode }) {
  const router = useRouter();
  const { 
    setNavigatingWard,
    selectedCity,
    selectedDivision,
    divisions,
    wards,
    handleDivisionChange,
    handleWardChange,
    loading: locationLoading
  } = useLocationData();
  
  // Use the new simplified hook
  const { data: wardInfo, loading: infoLoading, error: infoError } = useWardHeader(wardCode);
  const [wardNotFound, setWardNotFound] = useState(false);

  const loading = infoLoading || locationLoading;

  useEffect(() => {
    if (!loading && wardCode) {
      setNavigatingWard(null);
      
      // Check if ward doesn't exist
      if (!infoLoading && !wardInfo && !infoError) {
        setWardNotFound(true);
      }
    }
  }, [loading, wardCode, setNavigatingWard, wardInfo, infoLoading, infoError]);

  // Redirect to 404 if ward doesn't exist
  useEffect(() => {
    if (wardNotFound) {
      console.log(`Ward ${wardCode} not found, redirecting to 404`);
      router.replace('/404');
    }
  }, [wardNotFound, wardCode, router]);

  const error = infoError;

  const contextValue = useMemo(
    () => ({
      wardCode,
      wardInfo: wardInfo || {
        wardName: "",
        wardConvenor: null,
        wardCoConvenor: null,
      },
      // Include location data in context
      locationData: {
        selectedCity,
        selectedDivision,
        divisions,
        wards,
        handleDivisionChange,
        handleWardChange
      },
      loading,
      error,
      wardNotFound,
    }),
    [wardCode, wardInfo, selectedCity, selectedDivision, divisions, wards, handleDivisionChange, handleWardChange, loading, error, wardNotFound]
  );

  // Show loading spinner while checking ward existence
  if (loading) {
    return <Spinner mode="fullscreen" />;
  }

  // Don't render children if ward doesn't exist (redirect will happen)
  if (wardNotFound) {
    return <Spinner mode="fullscreen" message="Redirecting..." />;
  }

  return (
    <WardContext.Provider value={contextValue}>
      {children}
    </WardContext.Provider>
  );
}

export function useWard() {
  const context = useContext(WardContext);
  if (!context) throw new Error("useWard must be used within a WardProvider");
  return context;
}