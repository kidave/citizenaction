export const REGION_DATA = {
  region: { code: 'MMR', name: 'Mumbai Metropolitan Region' },
  cities: [
    { code: 'MUM', name: 'Mumbai', status: 'approved', active: true },
    { code: 'TH', name: 'Thane', status: 'pending', active: false },
    { code: 'NM', name: 'Navi Mumbai', status: 'pending', active: false },
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
    { code: 'B', name: 'B', division_code: 'IC',
      tooltip: {
        areas: ["Dongri", "Mandvi"],
        landmarks: ["Bhendi Bazaar", "Jama Masjid"]
      }
    },
    { code: 'C', name: 'C', division_code: 'IC',
      tooltip: {
        areas: ["Marine Lines", "Kalbadevi", "Bhuleshwar"],
        landmarks: ["Marine Drive", "Mumbadevi Temple", "Metro Cinema"]
      }
    },
    { code: 'D', name: 'D', division_code: 'IC',
      tooltip: {
        areas: ["Malabar Hill", "Walkeshwar", "Grant Road"],
        landmarks: ["Hanging Gardens", "Mani Bhavan", "Babulnath Temple"]
      }
    },
    { code: 'E', name: 'E', division_code: 'IC',
      tooltip: {
        areas: ["Byculla", "Mazgaon", "Chinchpokli"],
        landmarks: ["Byculla Zoo", "Mazgaon Dock", "Nagpada"]
      }
    },
    { code: 'FN', name: 'F North', division_code: 'IC',
      tooltip: {
        areas: ["Matunga", "Sion", "Wadala"],
        landmarks: ["Five Gardens", "Sion Fort", "Wadala Truck Terminus"]
      }
    },
    { code: 'FS', name: 'F South', division_code: 'IC',
      tooltip: {
        areas: ["Parel", "Sewri", "Naigaon"],
        landmarks: ["Sewri Fort", "Mahatma Phule Market", "High Street Phoenix"]
      }
    },
    { code: 'GN', name: 'G North', division_code: 'IC',
      tooltip: {
        areas: ["Dadar", "Mahim", "Dharavi"],
        landmarks: ["Siddhivinayak Temple", "Shivaji Park", "Mahim Dargah"]
      }
    },
    { code: 'GS', name: 'G South', division_code: 'IC',
      tooltip: {
        areas: ["Worli", "Prabhadevi"],
        landmarks: ["Worli Sea Face", "Haji Ali Dargah", "Nehru Planetarium"]
      }
    },
    { code: 'HE', name: 'H East', division_code: 'WS',
      tooltip: {
        areas: ["Bandra East", "Santacruz East", "Vakola"],
        landmarks: ["BKC", "Mithi River", "MMRDA Grounds"]
      }
    },
    { code: 'HW', name: 'H West', division_code: 'WS',
      tooltip: {
        areas: ["Bandra West", "Khar West"],
        landmarks: ["Bandra Fort", "Mount Mary Church", "Carter Road"]
      }
    },
    { code: 'KE', name: 'K East', division_code: 'WS',
      tooltip: {
        areas: ["Andheri East", "Jogeshwari East"],
        landmarks: ["SEEPZ", "Powai Lake", "JVLR"]
      }
    },
    { code: 'KW', name: 'K West', division_code: 'WS',
      tooltip: {
        areas: ["Andheri West", "Versova", "Lokhandwala"],
        landmarks: ["Versova Beach", "Gilbert Hill", "Infinity Mall"]
      }
    },
    { code: 'L', name: 'L', division_code: 'ES',
      tooltip: {
        areas: ["Kurla", "Chembur"],
        landmarks: ["Phoenix Marketcity", "Chembur Gymkhana"]
      }
    },
    { code: 'ME', name: 'M East', division_code: 'ES',
      tooltip: {
        areas: ["Govandi", "Mankhurd", "Shivaji Nagar"],
        landmarks: ["Deonar Dumping Ground", "Anushakti Nagar"]
      }
    },
    { code: 'MW', name: 'M West', division_code: 'ES',
      tooltip: {
        areas: ["Chembur West", "Mahul"],
        landmarks: ["R. K. Studios", "Mahul Creek"]
      }
    },
    { code: 'N', name: 'N', division_code: 'ES',
      tooltip: {
        areas: ["Ghatkopar", "Vikhroli"],
        landmarks: ["R-City Mall", "Vikhroli Mangroves"]
      }
    },
    { code: 'PN', name: 'P North', division_code: 'WS',
      tooltip: {
        areas: ["Malad", "Chincholi", "Marve"],
        landmarks: ["Aksa Beach", "Inorbit Mall", "Marve Beach"]
      }
    },
    { code: 'PS', name: 'P South', division_code: 'WS',
      tooltip: {
        areas: ["Goregaon", "Aarey"],
        landmarks: ["Film City", "Oberoi Mall", "Aarey Colony"]
      }
    },
    { code: 'RC', name: 'R Central', division_code: 'WS',
      tooltip: {
        areas: ["Borivali", "Dahisar"],
        landmarks: ["Sanjay Gandhi National Park", "Essel World", "Kanheri Caves"]
      }
    },
    { code: 'RN', name: 'R North', division_code: 'WS',
      tooltip: {
        areas: ["Dahisar", "Mira Road Border"],
        landmarks: ["Dahisar Check Naka", "Thakur Mall"]
      }
    },
    { code: 'RS', name: 'R South', division_code: 'WS',
      tooltip: {
        areas: ["Kandivali", "Charkop", "Thakur"],
        landmarks: ["Sports Authority of India", "Kandivali Education Society", "Poisar Gymkhana"]
      }
    },
    { code: 'S', name: 'S', division_code: 'ES',
      tooltip: {
        areas: ["Bhandup", "Nahur"],
        landmarks: ["Bhandup Complex", "Yogi Hills"]
      }
    },
    { code: 'T', name: 'T', division_code: 'ES',
      tooltip: {
        areas: ["Mulund", "Nahur East"],
        landmarks: ["R Mall", "Mulund Check Naka"]
      }
    },
  ]
};


export const REGION_STATUS = {
  pending: { 
    color: "#ff9800", 
    label: "Planned", 
    disabled: true,
  },
  approved: { 
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
