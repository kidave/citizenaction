import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useWardTabs } from "./useWardTabs";
import { supabase } from "utils/supabaseClient";
import { LOCATION_STATUS } from "utils/location";

export const useDetect = () => {
  const router = useRouter();
  const { activeTab } = useWardTabs();

  const [cities, setCities] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [wards, setWards] = useState([]);

  const [selectedCity, setSelectedCity] = useState("MH-MMR-MUM");
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [navigatingWard, setNavigatingWard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("city").select("*").order("name");
      setCities(data);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);

      const { data, error } = await supabase.rpc("get_city_hierarchy", {
        city_code_input: "MH-MMR-MUM"
      });

      if (error || !data) {
        console.error("Hierarchy load failed:", error);
        setLoading(false);
        return;
      }

      const flatDivisions = data.divisions.map((d) => ({
        code: d.division.code,
        name: d.division.name
      }));

      setDivisions(flatDivisions);

      if (flatDivisions.length > 0) {
        const firstDivision = flatDivisions[0];
        setSelectedDivision(firstDivision.code);

        const wardSet = data.divisions[0].wards;
        setWards(wardSet);
      }

      setLoading(false);
    })();
  }, []);

  const handleDivisionChange = useCallback(async (divisionCode) => {
    setSelectedDivision(divisionCode);

    const { data } = await supabase.rpc("get_city_hierarchy", {
      city_code_input: "MH-MMR-MUM"
    });

    const match = data.divisions.find(d => d.division.code === divisionCode);
    if (match) setWards(match.wards);
  }, []);

  const handleCityChange = useCallback(async (cityCode) => {
    setSelectedCity(cityCode);
  }, []);

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
    loading,
    statusConfig: LOCATION_STATUS,
    handleCityChange,
    handleDivisionChange,
    handleWardChange
  };
};
