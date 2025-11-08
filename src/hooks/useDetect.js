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

  const [selectedCity, setSelectedCity] = useState("MH-MMR-MUM"); // ✅ Default city to Mumbai
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [navigatingWard, setNavigatingWard] = useState(null);

  // Load cities initially
  useEffect(() => {
    (async () => {
      const cityList = await LocationService.getCities();
      setCities(cityList);

      // ✅ If MH-MMR-MUM exists, pre-load its divisions
      const defaultCity = cityList.find(c => c.code === "MH-MMR-MUM");
      if (defaultCity) {
        setSelectedCity(defaultCity.code);
        const divList = await LocationService.getDivisionsByCity(defaultCity.code);
        setDivisions(divList);

        // ✅ Auto-select the first division
        if (divList.length > 0) {
          const firstDivision = divList[0];
          setSelectedDivision(firstDivision.code);

          const wardList = await LocationService.getWardsByDivision(firstDivision.code);
          setWards(wardList);
        }
      }
    })();
  }, []);

  // Handle city change
  const handleCityChange = useCallback(async (cityCode, preserveDivision = false) => {
    const city = await LocationService.getCityByCode(cityCode);
    if (LOCATION_STATUS[city?.status]?.disabled) return;

    setSelectedCity(cityCode);
    if (!preserveDivision) {
      setSelectedDivision(null);
      setWards([]);
    }

    const divList = await LocationService.getDivisionsByCity(cityCode);
    setDivisions(divList);

    // ✅ Automatically load first division + wards (only if not preserving)
    if (!preserveDivision && divList.length > 0) {
      const firstDivision = divList[0];
      setSelectedDivision(firstDivision.code);
      const wardList = await LocationService.getWardsByDivision(firstDivision.code);
      setWards(wardList);
    }
  }, []);


  // Handle division change
  const handleDivisionChange = useCallback(async (divisionCode) => {
    setSelectedDivision(divisionCode);
    const wardList = await LocationService.getWardsByDivision(divisionCode);
    setWards(wardList);
  }, []);

  // Handle ward navigation
  const handleWardChange = useCallback(
    (wardCode) => {
      setNavigatingWard(wardCode);
      router.push(`/ward/${wardCode}/${activeTab || "meeting"}`);
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
    setNavigatingWard,
    statusConfig: LOCATION_STATUS,
    handleCityChange,
    handleDivisionChange,
    handleWardChange,
  };
};
