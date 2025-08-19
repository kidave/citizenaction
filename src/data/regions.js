export const REGION_DATA = {
  cities: [
    { code: 'MUM', name: 'Mumbai', status: 'Approved', active: true },
    { code: 'TH', name: 'Thane', status: 'Pending', active: false },
    { code: 'NM', name: 'Navi Mumbai', status: 'Pending', active: false }
  ],
  divisions: [
    { code: 'IC', name: 'Island City', city_code: 'MUM' },
    { code: 'WS', name: 'Western Suburb', city_code: 'MUM' },
    { code: 'ES', name: 'Eastern Suburb', city_code: 'MUM' },
  ],
  wards: [
    { code: 'A', name: 'A', division_code: 'IC',
      tooltip: {
        areas: ["Colaba", "Fort", "Cuffe Parade"],
        landmarks: ["Gateway of India", "CSMT", "Sassoon Dock"]
      }
    },

    { code: 'B', name: 'B', division_code: 'IC'},
    { code: 'C', name: 'C', division_code: 'IC' },
    { code: 'D', name: 'D', division_code: 'IC'},
    { code: 'E', name: 'E', division_code: 'IC'},
    { code: 'FN', name: 'F North', division_code: 'IC'},
    { code: 'FS', name: 'F South', division_code: 'IC' },
    { code: 'GN', name: 'G North', division_code: 'IC' },
    { code: 'GS', name: 'G South', division_code: 'IC' },
    { code: 'HE', name: 'H East', division_code: 'WS' },
    { code: 'HW', name: 'H West', division_code: 'WS' },
    { code: 'KE', name: 'K East', division_code: 'WS' },
    { code: 'KW', name: 'K West', division_code: 'WS' },
    { code: 'L', name: 'L', division_code: 'ES' },
    { code: 'ME', name: 'M East', division_code: 'ES' },
    { code: 'MW', name: 'M West', division_code: 'ES' },
    { code: 'N', name: 'N', division_code: 'ES' },
    { code: 'PN', name: 'P North', division_code: 'WS' },
    { code: 'PS', name: 'P South', division_code: 'WS' },
    { code: 'RC', name: 'R Central', division_code: 'WS' },
    { code: 'RN', name: 'R North', division_code: 'WS' },

    { code: 'RS', name: 'R South', division_code: 'WS', 
      tooltip: {
        areas: ["Kandivali", "Charkop", "Thakur"],
        landmarks: ["Sports Authority of India", "Kandivali Education Society", "Poisar Gymkhana"]
      }
    },

    { code: 'S', name: 'S', division_code: 'ES' },
    { code: 'T', name: 'T', division_code: 'ES' },
  ]
};

export const REGION_STATUS = {
  Pending: { 
    color: "#ff9800", 
    label: "Planned", 
    disabled: true,
  },
  Approved: { 
    color: "#4caf50", 
    label: "Available", 
    disabled: false,
    tooltip: "click to select"
  },
};

// Core data operations
export const RegionService = {
  getCities: () => REGION_DATA.cities,
  
  getDivisionsByCity: (cityCode) => 
    REGION_DATA.divisions.filter(d => d.city_code === cityCode),
  
  getWardsByDivision: (divisionCode) => 
    REGION_DATA.wards.filter(w => w.division_code === divisionCode),
  
  getCityByCode: (cityCode) => 
    REGION_DATA.cities.find(c => c.code === cityCode),
  
  getDivisionByCode: (divisionCode) =>
    REGION_DATA.divisions.find(d => d.code === divisionCode),
  
  getWardByCode: (wardCode) =>
    REGION_DATA.wards.find(w => w.code === wardCode),
  
  getFullRegionPath: (wardCode) => {
    const ward = REGION_DATA.wards.find(w => w.code === wardCode);
    if (!ward) return null;
    
    const division = REGION_DATA.divisions.find(d => d.code === ward.division_code);
    const city = REGION_DATA.cities.find(c => c.code === division?.city_code);
    
    return { city, division, ward };
  }
};
