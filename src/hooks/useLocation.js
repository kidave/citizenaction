// hooks/useLocation.js
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

  // Load initial data and sync with current ward
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const citiesData = await LocationService.getCities();
        setCities(citiesData);
        
        // If we're in a ward route, initialize with current ward data
        if (wardCode) {
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
          // Set default city if no ward is selected
          if (!selectedCity && citiesData.length > 0) {
            const defaultCity = citiesData.find(city => city.status === 'approved') || citiesData[0];
            setSelectedCity(defaultCity.code);
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
  }, [wardCode]); // Only depend on wardCode changes

  // Load divisions when city changes
  useEffect(() => {
    const loadDivisions = async () => {
      if (!selectedCity) return;
      
      try {
        const divisionsData = await LocationService.getDivisionsByCity(selectedCity);
        setDivisions(divisionsData);
        
        // Only reset division if we're not in a specific ward route
        if (!wardCode) {
          setSelectedDivision(null);
          setWards([]);
        }
      } catch (error) {
        console.error("Error loading divisions:", error);
      }
    };

    if (initialLoadComplete) {
      loadDivisions();
    }
  }, [selectedCity, initialLoadComplete, wardCode]);

  // Load wards when division changes
  useEffect(() => {
    const loadWards = async () => {
      if (!selectedDivision) return;
      
      try {
        const wardsData = await LocationService.getWardsByDivision(selectedDivision);
        setWards(wardsData);
      } catch (error) {
        console.error("Error loading wards:", error);
      }
    };

    if (initialLoadComplete) {
      loadWards();
    }
  }, [selectedDivision, initialLoadComplete]);

  const handleCityChange = useCallback(async (cityCode) => {
    const city = cities.find(c => c.code === cityCode);
    if (LOCATION_STATUS[city?.status]?.disabled) return;
    
    setSelectedCity(cityCode);
    // Don't reset division if we're in a ward route - let the URL drive the state
    if (!wardCode) {
      setSelectedDivision(null);
      setWards([]);
    }
  }, [cities, wardCode]);

  const handleDivisionChange = useCallback(async (divisionCode) => {
    setSelectedDivision(divisionCode);
  }, []);

  const handleWardChange = useCallback((wardCode) => {
    setNavigatingWard(wardCode);
    router.push(`/ward/${wardCode}/${activeWardTab || 'meeting'}`);
  }, [activeWardTab, router]);

  const handleRegionChange = useCallback((regionCode) => {
    setNavigatingRegion(regionCode);
    router.push(`/region/${regionCode}/${activeRegionTab || 'meeting'}`);
  }, [activeRegionTab, router]);

  return {
    // Data
    cities,
    divisions,
    wards,
    
    // State
    selectedCity,
    selectedDivision,
    navigatingWard,
    navigatingRegion,
    setNavigatingWard,
    setNavigatingRegion,
    loading,

    // Config
    statusConfig: LOCATION_STATUS,
    
    // Handlers
    handleCityChange,
    handleDivisionChange,
    handleWardChange,
    handleRegionChange,
  };
};