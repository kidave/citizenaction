// components/ScopeSelector.js
import { useState, useEffect } from "react";
import { useGeographicScopes } from "@/hooks/useGeographicScopes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ScopeSelector({ 
  onScopeChange, 
  defaultType = "city",
  defaultCountry = "IN" 
}) {
  const [scopeType, setScopeType] = useState(defaultType);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  // Fetch all geographic scopes
  const { data: countries = [] } = useGeographicScopes("country");
  const { data: states = [] } = useGeographicScopes("state", selectedCountry);
  const { data: regions = [] } = useGeographicScopes("region", selectedState);
  const { data: cities = [] } = useGeographicScopes("city", selectedRegion);
  const { data: wards = [] } = useGeographicScopes("ward", selectedCity);

  // Initialize with defaults
  useEffect(() => {
    if (countries.length > 0 && defaultCountry) {
      const defaultCountryObj = countries.find(c => c.code === defaultCountry);
      if (defaultCountryObj) {
        setSelectedCountry(defaultCountry);
        
        // Auto-select scope if country scope type
        if (scopeType === "country") {
          notifyScopeChange("country", defaultCountry);
        }
      }
    }
  }, [countries, defaultCountry, scopeType]);

  // Notify parent of scope change
  const notifyScopeChange = (type, code) => {
    onScopeChange(type, code);
  };

  // Handle scope type change
  const handleScopeTypeChange = (type) => {
    setScopeType(type);
    // Clear all selections
    setSelectedState("");
    setSelectedRegion("");
    setSelectedCity("");
    setSelectedWard("");
    
    // If country scope, notify immediately
    if (type === "country" && selectedCountry) {
      notifyScopeChange(type, selectedCountry);
    } else {
      // Clear the scope until user selects something
      notifyScopeChange("", "");
    }
  };

  // Handle country selection
  const handleCountryChange = (countryCode) => {
    setSelectedCountry(countryCode);
    setSelectedState("");
    setSelectedRegion("");
    setSelectedCity("");
    setSelectedWard("");
    
    if (scopeType === "country") {
      notifyScopeChange("country", countryCode);
    }
  };

  // Handle state selection
  const handleStateChange = (stateCode) => {
    setSelectedState(stateCode);
    setSelectedRegion("");
    setSelectedCity("");
    setSelectedWard("");
    
    if (scopeType === "state") {
      notifyScopeChange("state", stateCode);
    }
  };

  // Handle region selection
  const handleRegionChange = (regionCode) => {
    setSelectedRegion(regionCode);
    setSelectedCity("");
    setSelectedWard("");
    
    if (scopeType === "region") {
      notifyScopeChange("region", regionCode);
    }
  };

  // Handle city selection
  const handleCityChange = (cityCode) => {
    setSelectedCity(cityCode);
    setSelectedWard("");
    
    if (scopeType === "city") {
      notifyScopeChange("city", cityCode);
    }
  };

  // Handle ward selection
  const handleWardChange = (wardCode) => {
    setSelectedWard(wardCode);
    
    if (scopeType === "ward") {
      notifyScopeChange("ward", wardCode);
    }
  };

  // Determine which dropdowns to show
  const showCountry = ["country", "state", "region", "city", "ward"].includes(scopeType);
  const showState = ["state", "region", "city", "ward"].includes(scopeType);
  const showRegion = ["region", "city", "ward"].includes(scopeType);
  const showCity = ["city", "ward"].includes(scopeType);
  const showWard = scopeType === "ward";

  // Get current scope code based on type
  const getCurrentScopeCode = () => {
    switch(scopeType) {
      case "country": return selectedCountry;
      case "state": return selectedState;
      case "region": return selectedRegion;
      case "city": return selectedCity;
      case "ward": return selectedWard;
      default: return "";
    }
  };

  // Validate if scope is complete
  const isScopeComplete = () => {
    const code = getCurrentScopeCode();
    return !!code;
  };

  return (
    <div className="space-y-4">
      {/* Scope Type Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Scope Type</label>
        <Select value={scopeType} onValueChange={handleScopeTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select scope type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="country">Country</SelectItem>
            <SelectItem value="state">State</SelectItem>
            <SelectItem value="region">Region</SelectItem>
            <SelectItem value="city">City</SelectItem>
            <SelectItem value="ward">Ward</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Country Selector */}
      {showCountry && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Country</label>
          <Select 
            value={selectedCountry} 
            onValueChange={handleCountryChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  {country.name} ({country.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* State Selector */}
      {showState && (
        <div className="space-y-2">
          <label className="text-sm font-medium">State</label>
          <Select 
            value={selectedState} 
            onValueChange={handleStateChange}
            disabled={!selectedCountry}
          >
            <SelectTrigger>
              <SelectValue placeholder={!selectedCountry ? "Select country first" : "Select state"} />
            </SelectTrigger>
            <SelectContent>
              {states.map((state) => (
                <SelectItem key={state.code} value={state.code}>
                  {state.name} ({state.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Region Selector */}
      {showRegion && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Region</label>
          <Select 
            value={selectedRegion} 
            onValueChange={handleRegionChange}
            disabled={!selectedState}
          >
            <SelectTrigger>
              <SelectValue placeholder={!selectedState ? "Select state first" : "Select region"} />
            </SelectTrigger>
            <SelectContent>
              {regions.map((region) => (
                <SelectItem key={region.code} value={region.code}>
                  {region.name} ({region.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* City Selector */}
      {showCity && (
        <div className="space-y-2">
          <label className="text-sm font-medium">City</label>
          <Select 
            value={selectedCity} 
            onValueChange={handleCityChange}
            disabled={!selectedRegion}
          >
            <SelectTrigger>
              <SelectValue placeholder={!selectedRegion ? "Select region first" : "Select city"} />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city.code} value={city.code}>
                  {city.name} ({city.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Ward Selector */}
      {showWard && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Ward</label>
          <Select 
            value={selectedWard} 
            onValueChange={handleWardChange}
            disabled={!selectedCity}
          >
            <SelectTrigger>
              <SelectValue placeholder={!selectedCity ? "Select city first" : "Select ward"} />
            </SelectTrigger>
            <SelectContent>
              {wards.map((ward) => (
                <SelectItem key={ward.code} value={ward.code}>
                  {ward.name} ({ward.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Validation Status */}
      <div className="p-3 bg-muted/30 rounded-md">
        <p className="text-sm font-medium mb-1">Scope Status:</p>
        <p className="text-sm">
          {isScopeComplete() ? (
            <span className="text-green-600">✓ Scope selected: {scopeType} ({getCurrentScopeCode()})</span>
          ) : (
            <span className="text-amber-600">Please select all required scope fields</span>
          )}
        </p>
      </div>
    </div>
  );
}