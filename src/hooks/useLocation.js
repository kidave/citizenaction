import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useWardTabs } from "./useWardTabs";
import { useRegionTabs } from "./useRegionTabs";
import { LocationService, LOCATION_STATUS } from "utils/location";

export const useLocationData = () => {
  const router = useRouter();
  const { wardCode } = router.query;
  const { activeWardTab } = useWardTabs();
  const { activeRegionTab } = useRegionTabs();

  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [wards, setWards] = useState([]);
  const [cities, setCities] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const [navigatingWard, setNavigatingWard] = useState(null);
  const [navigatingRegion, setNavigatingRegion] = useState(null);

  // 🔹 Load cities and optionally ward hierarchy
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const citiesData = await LocationService.getCities();
        setCities(citiesData);

        if (wardCode) {
          // Load hierarchy for current ward
          const regionPath = await LocationService.getFullRegionPath(wardCode);
          if (regionPath) {
            setSelectedCity(regionPath.city.code);
            const divisionsData = await LocationService.getDivisionsByCity(regionPath.city.code);
            setDivisions(divisionsData);
            setSelectedDivision(regionPath.division.code);
            const wardsData = await LocationService.getWardsByDivision(regionPath.division.code);
            setWards(wardsData);
          }
        } else {
          // 👇 Default to Mumbai (MH-MMR-MUM)
          const defaultCityCode = "MH-MMR-MUM";
          setSelectedCity(defaultCityCode);

          // Load its divisions & wards automatically
          const divisionsData = await LocationService.getDivisionsByCity(defaultCityCode);
          setDivisions(divisionsData);

          if (divisionsData.length > 0) {
            const firstDivision = divisionsData[0];
            setSelectedDivision(firstDivision.code);
            const wardsData = await LocationService.getWardsByDivision(firstDivision.code);
            setWards(wardsData);
          }
        }
      } catch (error) {
        console.error("Error loading region data:", error);
      } finally {
        setLoading(false);
        setInitialLoadComplete(true);
      }
    };

    loadInitialData();
  }, [wardCode]);

  // 🔹 Load divisions when city changes
  useEffect(() => {
    const loadDivisions = async () => {
      if (!selectedCity || wardCode) return;
      try {
        const divisionsData = await LocationService.getDivisionsByCity(selectedCity);
        setDivisions(divisionsData);
        if (divisionsData.length > 0) {
          const firstDivision = divisionsData[0];
          setSelectedDivision(firstDivision.code);
          const wardsData = await LocationService.getWardsByDivision(firstDivision.code);
          setWards(wardsData);
        }
      } catch (error) {
        console.error("Error loading divisions:", error);
      }
    };
    if (initialLoadComplete) loadDivisions();
  }, [selectedCity, initialLoadComplete, wardCode]);

  // 🔹 Load wards when division changes
  useEffect(() => {
    const loadWards = async () => {
      if (!selectedDivision || wardCode) return;
      try {
        const wardsData = await LocationService.getWardsByDivision(selectedDivision);
        setWards(wardsData);
      } catch (error) {
        console.error("Error loading wards:", error);
      }
    };
    if (initialLoadComplete) loadWards();
  }, [selectedDivision, initialLoadComplete, wardCode]);

  const handleCityChange = useCallback(async (cityCode) => {
    const city = cities.find((c) => c.code === cityCode);
    if (LOCATION_STATUS[city?.status]?.disabled) return;

    setSelectedCity(cityCode);
    setSelectedDivision(null);
    setWards([]);

    const divisionsData = await LocationService.getDivisionsByCity(cityCode);
    setDivisions(divisionsData);
  }, [cities]);

  const handleDivisionChange = useCallback(async (divisionCode) => {
    setSelectedDivision(divisionCode);
    const wardsData = await LocationService.getWardsByDivision(divisionCode);
    setWards(wardsData);
  }, []);

  const handleWardChange = useCallback((wardCode) => {
    setNavigatingWard(wardCode);
    router.push(`/ward/${wardCode}/${activeWardTab || "meeting"}`);
  }, [activeWardTab, router]);

  const handleRegionChange = useCallback((regionCode) => {
    setNavigatingRegion(regionCode);
    router.push(`/region/${regionCode}/${activeRegionTab || "meeting"}`);
  }, [activeRegionTab, router]);

  return {
    // Data
    cities,
    divisions,
    wards,
    loading,

    // State
    selectedCity,
    selectedDivision,
    navigatingWard,
    navigatingRegion,
    setNavigatingWard,
    setNavigatingRegion,

    // Config
    statusConfig: LOCATION_STATUS,

    // Handlers
    handleCityChange,
    handleDivisionChange,
    handleWardChange,
    handleRegionChange,
  };
};
