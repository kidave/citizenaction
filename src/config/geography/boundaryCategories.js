export const GEOGRAPHY_BOUNDARY_CATEGORIES = [
  {
    value: "administrative",
    label: "Administrative",
    description: "State, district and sub-district government boundaries",
    types: ["country", "state", "district", "subdistrict", "other"],
  },
  {
    value: "local_government",
    label: "Local Body",
    description: "Municipal and civic boundaries",
    types: ["metropolitan_area", "local_government", "zone", "ward"],
  },
  {
    value: "political",
    label: "Political",
    description: "Parliamentary and assembly constituencies",
    types: ["parliamentary_constituency", "assembly_constituency"],
  },
];

export const GEOGRAPHY_TYPE_LABELS = {
  country: "Country",
  state: "State / Union territory",
  district: "District",
  subdistrict: "Sub-district / Taluka / Tehsil",
  metropolitan_area: "Metropolitan area",
  local_government: "Municipal corporation / Municipality / Nagar Panchayat",
  zone: "Municipal corporation zone",
  ward: "Ward",
  parliamentary_constituency: "Parliamentary constituency",
  assembly_constituency: "Assembly constituency",
  other: "Other",
};

export function getGeographyBoundaryCategory(item) {
  return item?.boundary_category || (
    GEOGRAPHY_BOUNDARY_CATEGORIES.find((category) =>
      category.types.includes(item?.geography_type)
    )?.value || "administrative"
  );
}

export function getGeographyTypeLabel(type) {
  return GEOGRAPHY_TYPE_LABELS[type] || "Boundary";
}

export function getGeographyCategoryLabel(category) {
  return GEOGRAPHY_BOUNDARY_CATEGORIES.find((item) => item.value === category)?.label || "Administrative";
}
