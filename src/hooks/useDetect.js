import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useWardTabs } from "./useWardTabs";
import { LocationService, LOCATION_STATUS } from "utils/location";

export const useDetect = () => {
  const router = useRouter();
  const { wardId } = router.query;
  const { activeTab } = useWardTabs();

  const [cities, setCities] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [wards, setWards] = useState([]);

  const [selectedCity, setSelectedCity] = useState("MH-MMR-MUM");
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [navigatingWard, setNavigatingWard] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load cities initially
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const cityList = await LocationService.getCities();
        setCities(cityList);

        const defaultCity = cityList.find(c => c.code === "MH-MMR-MUM");
        if (defaultCity) {
          setSelectedCity(defaultCity.code);
          const divList = await LocationService.getDivisionsByCity(defaultCity.code);
          setDivisions(divList);

          if (divList.length > 0) {
            const firstDivision = divList[0];
            setSelectedDivision(firstDivision.code);
            const wardList = await LocationService.getWardsByDivision(firstDivision.code);
            setWards(wardList);
          }
        }
      } catch (error) {
        console.error("Failed to load initial data:", error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Handle city change
  const handleCityChange = useCallback(async (cityCode, preserveDivision = false) => {
    const city = await LocationService.getCityByCode(cityCode);
    if (LOCATION_STATUS[city?.status]?.disabled) return;

    setIsLoading(true);
    try {
      setSelectedCity(cityCode);
      
      if (!preserveDivision) {
        setSelectedDivision(null);
        setWards([]);
      }

      const divList = await LocationService.getDivisionsByCity(cityCode);
      setDivisions(divList);

      // Only auto-select first division if not preserving current division
      if (!preserveDivision && divList.length > 0) {
        const firstDivision = divList[0];
        setSelectedDivision(firstDivision.code);
        const wardList = await LocationService.getWardsByDivision(firstDivision.code);
        setWards(wardList);
      }
    } catch (error) {
      console.error("Failed to change city:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle division change
  const handleDivisionChange = useCallback(async (divisionCode) => {
    setIsLoading(true);
    try {
      setSelectedDivision(divisionCode);
      const wardList = await LocationService.getWardsByDivision(divisionCode);
      setWards(wardList);
    } catch (error) {
      console.error("Failed to change division:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle ward navigation
  const handleWardChange = useCallback(
    (wardCode) => {
      setNavigatingWard(wardCode);
      router.push(`/ward/${wardCode}/${activeTab || "project"}`);
    },
    [activeTab, router]
  );

  return {
    cities,
    divisions,
    wards,
    selectedCity,
    selectedDivision,
    navigatingWard,
    isLoading,
    setNavigatingWard,
    statusConfig: LOCATION_STATUS,
    handleCityChange,
    handleDivisionChange,
    handleWardChange,
  };
};