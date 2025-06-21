// components/shared/maps/utils/layerStyles.js
export const tileLayers = {
  transport: {
    name: 'Transport Map',
    url: 'https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=6170aad10dfd42a38d4d8c709a536f38',
    attribution: '&copy; <a href="https://www.thunderforest.com/">Thunderforest</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  osm: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  cycle: {
    name: 'Cycle Map',
    url: 'https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=6170aad10dfd42a38d4d8c709a536f38',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">CycleMap</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }
};

export const getRoadStyle = (styleOptions, isSelected = false) => {
    const styleMap = {
              // Major Roads (5110)
              motorway: { color: '#e74c3c', weight: 4 },
              trunk: { color: '#e67e22', weight: 4 },
              primary: { color: '#f1c40f', weight: 4 },
              
              // Minor Roads (5120)
              secondary: { color: '#2ecc71', weight: 3 },
              tertiary: { color: '#1abc9c', weight: 3 },
              unclassified: { color: '#95a5a6', weight: 2 },
              residential: { color: '#3498db', weight: 2 },
              living_street: { color: '#9b59b6', weight: 2 },
              pedestrian: { color: '#34495e', weight: 2 },
              busway: { color: '#d35400', weight: 2 },
              
              // Highway Links (5130)
              motorway_link: { color: '#e74c3c', weight: 3, dashArray: '5,5' },
              trunk_link: { color: '#e67e22', weight: 3, dashArray: '5,5' },
              primary_link: { color: '#f1c40f', weight: 3, dashArray: '5,5' },
              secondary_link: { color: '#2ecc71', weight: 3, dashArray: '5,5' },
              tertiary_link: { color: '#1abc9c', weight: 3, dashArray: '5,5' },
              
              // Small Roads (5140)
              service: { color: '#7f8c8d', weight: 1 },
              track: { color: '#8e44ad', weight: 1 },
              
              // No Cars (5150)
              bridleway: { color: '#16a085', weight: 1, dashArray: '3,3' },
              cycleway: { color: '#27ae60', weight: 1, dashArray: '3,3' },
              footway: { color: '#2980b9', weight: 1, dashArray: '3,3' },
              path: { color: '#8e44ad', weight: 1, dashArray: '3,3' },
              steps: { color: '#c0392b', weight: 1, dashArray: '1,1' },
              
              // Default
              default: { color: '#95a5a6', weight: 2 }
    };

  const baseStyle = styleMap[styleOptions.fclass] || styleMap.default;

  return {
    ...baseStyle,
    ...styleOptions,
    color: isSelected ? '#9A4EAE' : baseStyle.color,
    weight: isSelected ? 8 : baseStyle.weight,
    opacity: isSelected ? 0.7 : 0.3
  };
};