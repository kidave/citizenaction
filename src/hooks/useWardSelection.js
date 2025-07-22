import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../utils/supabaseClient';
import { useWardTabs } from './useWardTabs';

export function useWardSelection() {
  const router = useRouter();
  const { wardId } = router.query;
  const { activeTab } = useWardTabs();

  const [divisions, setDivisions] = useState([]);
  const [wards, setWards] = useState([]);
  const [currentDivision, setCurrentDivision] = useState(null);
  const [loadingDivisions, setLoadingDivisions] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // Fetch all divisions
  useEffect(() => {
    const fetchDivisions = async () => {
      setLoadingDivisions(true);
      try {
        const { data, error } = await supabase
          .from('division')
          .select('code, name')
          .order('code', { ascending: true });
        if (error) throw error;
        setDivisions(data || []);
      } finally {
        setLoadingDivisions(false);
      }
    };
    fetchDivisions();
  }, []);

  // Fetch current division based on wardId
  useEffect(() => {
    if (!wardId) return;

    const fetchDivisionForWard = async () => {
      const { data, error } = await supabase
        .from('ward')
        .select('division_code')
        .eq('code', wardId)
        .single();

      if (!error && data) {
        setCurrentDivision(data.division_code);
      }
    };

    fetchDivisionForWard();
  }, [wardId]);

  // Fetch wards of the current division
  useEffect(() => {
    if (!currentDivision) return;

    const fetchWards = async () => {
      setLoadingWards(true);
      try {
        const { data, error } = await supabase
          .from('ward')
          .select('code, name')
          .eq('division_code', currentDivision)
          .order('name', { ascending: true });
        if (error) throw error;
        setWards(data || []);
      } finally {
        setLoadingWards(false);
      }
    };
    fetchWards();
  }, [currentDivision]);

  const handleDivisionChange = (divisionCode) => {
    setCurrentDivision(divisionCode);
    setWards([]);
  };

  const handleWardChange = (newWardId) => {
    if (newWardId) {
      router.push(`/ward/${newWardId}/${activeTab}`);
    }
  };

  return {
    divisions,
    wards,
    currentDivision,
    loadingDivisions,
    loadingWards,
    handleDivisionChange,
    handleWardChange,
  };
}
