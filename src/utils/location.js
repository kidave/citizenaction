// utils/location.js
import { supabase } from "utils/supabaseClient";

export const LocationService = {
  // Get all regions
  getRegions: async () => {
    const { data, error } = await supabase
      .from("region")
      .select("*")
      .order("name");
    
    if (error) throw error;
    return data || [];
  },

  // Get cities by region
  getCitiesByRegion: async (regionCode) => {
    const { data, error } = await supabase
      .from("city")
      .select("*")
      .eq("region_code", regionCode)
      .order("name");
    
    if (error) throw error;
    return data || [];
  },

  // Get divisions by city
  getDivisionsByCity: async (cityCode) => {
    const { data, error } = await supabase
      .from("division_with_ward_order")
      .select("*")
      .eq("city_code", cityCode)
      .order("first_ward_name");
    
    if (error) throw error;
    return data || [];
  },

  // Get wards by division
  getWardsByDivision: async (divisionCode) => {
    const { data, error } = await supabase
      .from("ward")
      .select("*")
      .eq("division_code", divisionCode)
      .order("name");
    
    if (error) throw error;
    return data || [];
  },

  // Get wards by city
  getWardsByCity: async (cityCode) => {
    const { data, error } = await supabase
      .from("ward")
      .select("*")
      .eq("city_code", cityCode)
      .order("name");
    
    if (error) throw error;
    return data || [];
  },

  // Get single records
  getRegionByCode: async (regionCode) => {
    const { data, error } = await supabase
      .from("region")
      .select("*")
      .eq("code", regionCode)
      .single();
    
    if (error) throw error;
    return data;
  },

  getCityByCode: async (cityCode) => {
    const { data, error } = await supabase
      .from("city")
      .select("*")
      .eq("code", cityCode)
      .single();
    
    if (error) throw error;
    return data;
  },

  getDivisionByCode: async (divisionCode) => {
    const { data, error } = await supabase
      .from("division")
      .select("*")
      .eq("code", divisionCode)
      .single();
    
    if (error) throw error;
    return data;
  },

  getWardByCode: async (wardCode) => {
    const { data, error } = await supabase
      .from("ward")
      .select("*")
      .eq("code", wardCode)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get full hierarchical path for a ward
  getFullRegionPath: async (wardCode) => {
    // Get ward with division, city, and region info
    const { data: ward, error: wardError } = await supabase
      .from("ward")
      .select(`
        *,
        division:division_code (
          *,
          city:city_code (
            *,
            region:region_code (*)
          )
        )
      `)
      .eq("code", wardCode)
      .single();
    
    if (wardError) throw wardError;
    if (!ward) return null;

    return {
      ward: ward,
      division: ward.division,
      city: ward.division.city,
      region: ward.division.city.region
    };
  },

  // Get all cities
  getCities: async () => {
    const { data, error } = await supabase
      .from("city")
      .select("*")
      .order("name");
    
    if (error) throw error;
    return data || [];
  },

  // Get available regions with active cities
  getAvailableRegions: async () => {
    const regions = await LocationService.getRegions();
    
    const regionsWithCities = await Promise.all(
      regions.map(async (region) => {
        const cities = await LocationService.getCitiesByRegion(region.code);
        const activeCities = cities.filter(city => city.status === 'approved');
        
        return {
          ...region,
          cities: activeCities,
          hasActiveCities: activeCities.length > 0
        };
      })
    );
    
    return regionsWithCities.filter(region => region.hasActiveCities);
  }
};

export const LOCATION_STATUS = {
  planned: { 
    color: "red", 
    label: "Planned", 
    disabled: true,
    tooltip: "Coming soon"
  },
  pending: { 
    color: "orange", 
    label: "In Development", 
    disabled: true,
    tooltip: "Under development"
  },
  approved: { 
    color: "green", 
    label: "Available", 
    disabled: false,
    tooltip: "Click to select"
  },
};