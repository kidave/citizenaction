import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const GEOGRAPHY_TYPES = {
  all: "All geography",
  country: "Country",
  state: "State / Union territory",
  division: "Division",
  district: "District",
  subdistrict: "Subdistrict / Taluka",
  city: "City",
  local_government: "Local government",
  metropolitan_area: "Metropolitan area",
  zone: "Zone",
  ward: "Ward",
  other: "Other",
};

export function geographyTypeLabel(type) {
  return GEOGRAPHY_TYPES[type] || type || "Other";
}

export default function GeographyTypeFilter({ value = "all", onValueChange, className }) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className || "w-full"}>
        <SelectValue placeholder="Geography type" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(GEOGRAPHY_TYPES).map(([key, label]) => (
          <SelectItem key={key} value={key}>{label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
