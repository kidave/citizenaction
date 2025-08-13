import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

export const transformCoordinates = (coords) => {
  if (Math.abs(coords[0]) > 180 || Math.abs(coords[1]) > 90) {
    const x = coords[0];
    const y = coords[1];
    const lon = (x / 20037508.34) * 180;
    const lat =
      (Math.atan(Math.exp((y / 20037508.34) * Math.PI)) * 360) / Math.PI - 90;
    return [lon, lat];
  }
  return coords;
};

export const transformGeoJSON = (geoJSON) => {
  if (!geoJSON || !geoJSON.coordinates) return geoJSON;

  const processCoordinateArray = (coords) => {
    return Array.isArray(coords[0])
      ? coords.map(processCoordinateArray)
      : transformCoordinates(coords);
  };

  return {
    ...geoJSON,
    coordinates: processCoordinateArray(geoJSON.coordinates),
  };
};

export const setupLeafletIcons = () => {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: markerIcon.src,
    iconRetinaUrl: markerIcon2x.src,
    shadowUrl: markerShadow.src,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41],
  });
};
