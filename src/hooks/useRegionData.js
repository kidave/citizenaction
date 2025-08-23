// hooks/useRegionData.js
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useWardTabs } from "./useWardTabs";
import { RegionService, REGION_STATUS } from "data/regions";

export const useRegionData = () => {
  const router = useRouter();
  const { wardId } = router.query;
  const { activeTab } = useWardTabs();
  
  const [selectedCity, setSelectedCity] = useState("MUM");
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [wards, setWards] = useState([]);

  const [navigatingWard, setNavigatingWard] = useState(null);

  // Initialize with current ward if in ward route
  useEffect(() => {
    if (!wardId) return;
    const regionPath = RegionService.getFullRegionPath(wardId);
    if (!regionPath) return;

    setSelectedCity(regionPath.city.code);
    setSelectedDivision(regionPath.division.code);
    setWards(RegionService.getWardsByDivision(regionPath.division.code));
  }, [wardId]);

  const handleCityChange = (cityCode) => {
    const city = RegionService.getCityByCode(cityCode);
    if (REGION_STATUS[city?.status]?.disabled) return;
    
    setSelectedCity(cityCode);
    setSelectedDivision(null);
    setWards([]);
  };

  const handleDivisionChange = (divisionCode) => {
    setSelectedDivision(divisionCode);
    setWards(RegionService.getWardsByDivision(divisionCode));
  };

  const handleWardChange = useCallback((wardCode) => {
    setNavigatingWard(wardCode);
    router.push(`/ward/${wardCode}/${activeTab || 'meeting'}`);
  }, [activeTab, router, setNavigatingWard]);

  return {
    // Data
    cities: RegionService.getCities(),
    divisions: selectedCity 
      ? RegionService.getDivisionsByCity(selectedCity) 
      : [],
    wards,
    
    // State
    selectedCity,
    selectedDivision,
    navigatingWard,
    setNavigatingWard,

    // Config
    statusConfig: REGION_STATUS,
    
    // Handlers
    handleCityChange,
    handleDivisionChange,
    handleWardChange,
  };
};
