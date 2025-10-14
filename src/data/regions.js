export const REGION_DATA = {
  states: { code: 'MH', name: 'Maharashtra' },
  regions: [
    { code: 'MMR', name: 'Mumbai Metropolitan Region', compositeCode: 'MH-MMR' },
    { code: 'NCR', name: 'National Capital Region', compositeCode: 'DL-NCR' },
    { code: 'BMR', name: 'Bangalore Metropolitan Region', compositeCode: 'KA-BMR' },
    { code: 'CMA', name: 'Chennai Metropolitan Area', compositeCode: 'TN-CMA' },
    { code: 'KMA', name: 'Kolkata Metropolitan Area', compositeCode: 'WB-KMA' },
    { code: 'HMR', name: 'Hyderabad Metropolitan Region', compositeCode: 'TG-HMR' },
    { code: 'PMR', name: 'Pune Metropolitan Region', compositeCode: 'MH-PMR' },
    { code: 'AMR', name: 'Ahmedabad Metropolitan Region', compositeCode: 'GJ-AMR' },
    { code: 'SMR', name: 'Surat Metropolitan Region', compositeCode: 'GJ-SMR' },
  ],
  cities: [
    // Mumbai Metropolitan Region (MMR)
    { code: 'MUM', name: 'Mumbai', status: 'approved', active: true, region_code: 'MMR', compositeCode: 'MH-MMR-MUM' },
    { code: 'THN', name: 'Thane', status: 'pending', active: false, region_code: 'MMR', compositeCode: 'MH-MMR-THN' },
    { code: 'NVM', name: 'Navi Mumbai', status: 'pending', active: false, region_code: 'MMR', compositeCode: 'MH-MMR-NVM' },
    /*{ code: 'MBR', name: 'Mira Bhayandar', status: 'pending', active: false, region_code: 'MMR' },
    { code: 'VVR', name: 'Vasai Virar', status: 'pending', active: false, region_code: 'MMR' },
    { code: 'KLD', name: 'Kalyan Dombivali', status: 'pending', active: false, region_code: 'MMR' },
    
    National Capital Region (NCR)
    { code: 'DEL', name: 'Delhi', status: 'planned', active: false, region_code: 'NCR' },
    { code: 'GGN', name: 'Gurugram', status: 'planned', active: false, region_code: 'NCR' },
    { code: 'NOI', name: 'Noida', status: 'planned', active: false, region_code: 'NCR' },
    { code: 'FBD', name: 'Faridabad', status: 'planned', active: false, region_code: 'NCR' },
    { code: 'GZB', name: 'Ghaziabad', status: 'planned', active: false, region_code: 'NCR' },
    
    // Bangalore Metropolitan Region (BMR)
    { code: 'BLR', name: 'Bangalore', status: 'planned', active: false, region_code: 'BMR' },
    { code: 'WFD', name: 'Whitefield', status: 'planned', active: false, region_code: 'BMR' },
    { code: 'ECY', name: 'Electronic City', status: 'planned', active: false, region_code: 'BMR' },
    
    // Chennai Metropolitan Area (CMA)
    { code: 'CHE', name: 'Chennai', status: 'planned', active: false, region_code: 'CMA' },
    { code: 'SPB', name: 'Sriperumbudur', status: 'planned', active: false, region_code: 'CMA' },
    { code: 'ORG', name: 'Oragadam', status: 'planned', active: false, region_code: 'CMA' },
    
    // Kolkata Metropolitan Area (KMA)
    { code: 'KOL', name: 'Kolkata', status: 'planned', active: false, region_code: 'KMA' },
    { code: 'HWR', name: 'Howrah', status: 'planned', active: false, region_code: 'KMA' },
    { code: 'SLK', name: 'Salt Lake', status: 'planned', active: false, region_code: 'KMA' },
    
    // Hyderabad Metropolitan Region (HMR)
    { code: 'HYD', name: 'Hyderabad', status: 'planned', active: false, region_code: 'HMR' },
    { code: 'CYD', name: 'Cyberabad', status: 'planned', active: false, region_code: 'HMR' },
    { code: 'HTC', name: 'HITEC City', status: 'planned', active: false, region_code: 'HMR' },
    
    // Pune Metropolitan Region (PMR)
    { code: 'PUN', name: 'Pune', status: 'planned', active: false, region_code: 'PMR' },
    { code: 'PCP', name: 'Pimpri-Chinchwad', status: 'planned', active: false, region_code: 'PMR' },
    { code: 'HNW', name: 'Hinjewadi', status: 'planned', active: false, region_code: 'PMR' },
    
    // Ahmedabad Metropolitan Region (AMR)
    { code: 'AMD', name: 'Ahmedabad', status: 'planned', active: false, region_code: 'AMR' },
    { code: 'GND', name: 'Gandhinagar', status: 'planned', active: false, region_code: 'AMR' },
    
    // Surat Metropolitan Region (SMR)
    { code: 'SUR', name: 'Surat', status: 'planned', active: false, region_code: 'SMR' },
    */
  ],

  divisions: [
    // Mumbai Divisions
    { code: 'IC', name: 'Island City', city_code: 'MUM' },
    { code: 'WS', name: 'Western Suburb', city_code: 'MUM' },
    { code: 'ES', name: 'Eastern Suburb', city_code: 'MUM' },
  ],

  wards: [
    // Mumbai Wards
    { code: 'A', name: 'A', division_code: 'IC',
      compositeCode: 'MH-MMR-MUM-A',
      tooltip: {
        areas: ["Colaba", "Fort", "Cuffe Parade"],
        landmarks: ["Gateway of India", "CSMT", "Sassoon Dock"]
      }
    },
    { code: 'B', name: 'B', division_code: 'IC',
      compositeCode: 'MH-MMR-MUM-B',
      tooltip: {
        areas: ["Dongri", "Mandvi"],
        landmarks: ["Bhendi Bazaar", "Jama Masjid"]
      }
    },
    { code: 'C', name: 'C', division_code: 'IC',
      compositeCode: 'MH-MMR-MUM-C',
      tooltip: {
        areas: ["Marine Lines", "Kalbadevi", "Bhuleshwar"],
        landmarks: ["Marine Drive", "Mumbadevi Temple", "Metro Cinema"]
      }
    },
    { code: 'D', name: 'D', division_code: 'IC',
      compositeCode: 'MH-MMR-MUM-D',
      tooltip: {
        areas: ["Malabar Hill", "Walkeshwar", "Grant Road"],
        landmarks: ["Hanging Gardens", "Mani Bhavan", "Babulnath Temple"]
      }
    },
    { code: 'E', name: 'E', division_code: 'IC',
      compositeCode: 'MH-MMR-MUM-E',
      tooltip: {
        areas: ["Byculla", "Mazgaon", "Chinchpokli"],
        landmarks: ["Byculla Zoo", "Mazgaon Dock", "Nagpada"]
      }
    },
    { code: 'FN', name: 'F North', division_code: 'IC',
      compositeCode: 'MH-MMR-MUM-FN',
      tooltip: {
        areas: ["Matunga", "Sion", "Wadala"],
        landmarks: ["Five Gardens", "Sion Fort", "Wadala Truck Terminus"]
      }
    },
    { code: 'FS', name: 'F South', division_code: 'IC',
      compositeCode: 'MH-MMR-MUM-FS',
      tooltip: {
        areas: ["Parel", "Sewri", "Naigaon"],
        landmarks: ["Sewri Fort", "Mahatma Phule Market", "High Street Phoenix"]
      }
    },
    { code: 'GN', name: 'G North', division_code: 'IC',
      compositeCode: 'MH-MMR-MUM-GN',
      tooltip: {
        areas: ["Dadar", "Mahim", "Dharavi"],
        landmarks: ["Siddhivinayak Temple", "Shivaji Park", "Mahim Dargah"]
      }
    },
    { code: 'GS', name: 'G South', division_code: 'IC',
      compositeCode: 'MH-MMR-MUM-GS',
      tooltip: {
        areas: ["Worli", "Prabhadevi"],
        landmarks: ["Worli Sea Face", "Haji Ali Dargah", "Nehru Planetarium"]
      }
    },
    { code: 'HE', name: 'H East', division_code: 'WS',
      compositeCode: 'MH-MMR-MUM-HE',
      tooltip: {
        areas: ["Bandra East", "Santacruz East", "Vakola"],
        landmarks: ["BKC", "Mithi River", "MMRDA Grounds"]
      }
    },
    { code: 'HW', name: 'H West', division_code: 'WS',
      compositeCode: 'MH-MMR-MUM-HW',
      tooltip: {
        areas: ["Bandra West", "Khar West"],
        landmarks: ["Bandra Fort", "Mount Mary Church", "Carter Road"]
      }
    },
    { code: 'KE', name: 'K East', division_code: 'WS',
      compositeCode: 'MH-MMR-MUM-KE',
      tooltip: {
        areas: ["Andheri East", "Jogeshwari East"],
        landmarks: ["SEEPZ", "Powai Lake", "JVLR"]
      }
    },
    { code: 'KW', name: 'K West', division_code: 'WS',
      compositeCode: 'MH-MMR-MUM-KW',
      tooltip: {
        areas: ["Andheri West", "Versova", "Lokhandwala"],
        landmarks: ["Versova Beach", "Gilbert Hill", "Infinity Mall"]
      }
    },
    { code: 'L', name: 'L', division_code: 'ES',
      compositeCode: 'MH-MMR-MUM-L',
      tooltip: {
        areas: ["Kurla", "Chembur"],
        landmarks: ["Phoenix Marketcity", "Chembur Gymkhana"]
      }
    },
    { code: 'ME', name: 'M East', division_code: 'ES',
      compositeCode: 'MH-MMR-MUM-ME',
      tooltip: {
        areas: ["Govandi", "Mankhurd", "Shivaji Nagar"],
        landmarks: ["Deonar Dumping Ground", "Anushakti Nagar"]
      }
    },
    { code: 'MW', name: 'M West', division_code: 'ES',
      compositeCode: 'MH-MMR-MUM-MW',
      tooltip: {
        areas: ["Chembur West", "Mahul"],
        landmarks: ["R. K. Studios", "Mahul Creek"]
      }
    },
    { code: 'N', name: 'N', division_code: 'ES',
      compositeCode: 'MH-MMR-MUM-N',
      tooltip: {
        areas: ["Ghatkopar", "Vikhroli"],
        landmarks: ["R-City Mall", "Vikhroli Mangroves"]
      }
    },
    { code: 'PN', name: 'P North', division_code: 'WS',
      compositeCode: 'MH-MMR-MUM-PN',
      tooltip: {
        areas: ["Malad", "Chincholi", "Marve"],
        landmarks: ["Aksa Beach", "Inorbit Mall", "Marve Beach"]
      }
    },
    { code: 'PS', name: 'P South', division_code: 'WS',
      compositeCode: 'MH-MMR-MUM-PS',
      tooltip: {
        areas: ["Goregaon", "Aarey"],
        landmarks: ["Film City", "Oberoi Mall", "Aarey Colony"]
      }
    },
    { code: 'RC', name: 'R Central', division_code: 'WS',
      compositeCode: 'MH-MMR-MUM-RC',
      tooltip: {
        areas: ["Borivali", "Dahisar"],
        landmarks: ["Sanjay Gandhi National Park", "Essel World", "Kanheri Caves"]
      }
    },
    { code: 'RN', name: 'R North', division_code: 'WS',
      compositeCode: 'MH-MMR-MUM-RN',
      tooltip: {
        areas: ["Dahisar", "Mira Road Border"],
        landmarks: ["Dahisar Check Naka", "Thakur Mall"]
      }
    },
    { code: 'RS', name: 'R South', division_code: 'WS',
      compositeCode: 'MH-MMR-MUM-RS',
      tooltip: {
        areas: ["Kandivali", "Charkop", "Thakur"],
        landmarks: ["Sports Authority of India", "Kandivali Education Society", "Poisar Gymkhana"]
      }
    },
    { code: 'S', name: 'S', division_code: 'ES',
      compositeCode: 'MH-MMR-MUM-S',
      tooltip: {
        areas: ["Bhandup", "Nahur"],
        landmarks: ["Bhandup Complex", "Yogi Hills"]
      }
    },
    { code: 'T', name: 'T', division_code: 'ES',
      compositeCode: 'MH-MMR-MUM-T',
      tooltip: {
        areas: ["Mulund", "Nahur East"],
        landmarks: ["R Mall", "Mulund Check Naka"]
      }
    },
  ]
};

export const REGION_STATUS = {
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

// Enhanced RegionService with new methods
export const RegionService = {
  // Get all regions
  getRegions: () => REGION_DATA.regions,
  
  // Get cities by region
  getCitiesByRegion: (regionCode) => 
    REGION_DATA.cities.filter(city => city.region_code === regionCode),
  
  // Get divisions by city
  getDivisionsByCity: (cityCode) => 
    REGION_DATA.divisions.filter(div => div.city_code === cityCode),
  
  // Get wards by division
  getWardsByDivision: (divisionCode) => 
    REGION_DATA.wards.filter(ward => ward.division_code === divisionCode),
  
  // Get wards by city
  getWardsByCity: (cityCode) => {
    const cityDivisions = REGION_DATA.divisions.filter(div => div.city_code === cityCode);
    const divisionCodes = cityDivisions.map(div => div.code);
    return REGION_DATA.wards.filter(ward => divisionCodes.includes(ward.division_code));
  },
  
  // Get wards by region
  getWardsByRegion: (regionCode) => {
    const regionCities = REGION_DATA.cities.filter(city => city.region_code === regionCode);
    const cityCodes = regionCities.map(city => city.code);
    const regionDivisions = REGION_DATA.divisions.filter(div => cityCodes.includes(div.city_code));
    const divisionCodes = regionDivisions.map(div => div.code);
    return REGION_DATA.wards.filter(ward => divisionCodes.includes(ward.division_code));
  },
  
  // Existing methods
  getCities: () => REGION_DATA.cities,
  
  getCityByCode: (cityCode) => 
    REGION_DATA.cities.find(c => c.code === cityCode),
  
  getDivisionByCode: (divisionCode) =>
    REGION_DATA.divisions.find(d => d.code === divisionCode),
  
  getWardByCode: (wardCode) =>
    REGION_DATA.wards.find(w => w.code === wardCode),
  
  getRegionByCode: (regionCode) =>
    REGION_DATA.regions.find(r => r.code === regionCode),
  
  getFullRegionPath: (wardCode) => {
    const ward = REGION_DATA.wards.find(w => w.code === wardCode);
    if (!ward) return null;
    
    const division = REGION_DATA.divisions.find(d => d.code === ward.division_code);
    const city = REGION_DATA.cities.find(c => c.code === division?.city_code);
    const region = REGION_DATA.regions.find(r => r.code === city?.region_code);
    
    return { region, city, division, ward };
  },
  
  // New method to get available regions with active cities
  getAvailableRegions: () => {
    return REGION_DATA.regions.map(region => {
      const cities = RegionService.getCitiesByRegion(region.code);
      const activeCities = cities.filter(city => city.active);
      return {
        ...region,
        cities: activeCities,
        hasActiveCities: activeCities.length > 0
      };
    }).filter(region => region.hasActiveCities);
  },
  // Get composite code for a ward: STATE-REGION-CITY-WARD
  getWardCompositeCode: (wardCode, stateCode = "MH") => {
    const fullPath = RegionService.getFullRegionPath(wardCode);
    if (!fullPath) return null;
    const { region, city, ward } = fullPath;
    return `${stateCode}-${region.code}-${city.code}-${ward.code}`;
  },

  // Get composite code for a city: STATE-REGION-CITY
  getCityCompositeCode: (cityCode, stateCode = "MH") => {
    const city = RegionService.getCityByCode(cityCode);
    if (!city) return null;
    const region = RegionService.getRegionByCode(city.region_code);
    return `${stateCode}-${region.code}-${city.code}`;
  },

  // Get composite code for a region: STATE-REGION
  getRegionCompositeCode: (regionCode, stateCode = "MH") => {
    const region = RegionService.getRegionByCode(regionCode);
    if (!region) return null;
    return `${stateCode}-${region.code}`;
  },
};