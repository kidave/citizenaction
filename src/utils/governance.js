export const GOVERNANCE_ENTITY_TYPES = [
  "authority",
  "unit",
  "position",
  "person",
  "organisation",
  "committee",
  "programme",
  "project",
  "ministry",
  "department",
  "division",
  "office",
  "ward",
  "station",
  "zone",
];

export const GOVERNANCE_UNIT_TYPES = [
  "authority",
  "ministry",
  "department",
  "directorate",
  "division",
  "zone",
  "ward",
  "region",
  "office",
  "branch",
  "station",
  "court",
  "bench",
  "committee",
  "board",
  "commission",
  "unit",
  "other",
];

export const GOVERNANCE_STATUS_OPTIONS = [
  ["active", "Active"],
  ["inactive", "Inactive"],
  ["deprecated", "Deprecated"],
];

const UNIT_TYPE_BY_ENTITY_TYPE = {
  authority: "authority",
  ministry: "ministry",
  department: "department",
  division: "division",
  office: "office",
  ward: "ward",
  station: "station",
  zone: "zone",
};

export function getGovernanceHref(entity) {
  if (!entity) return null;
  if (entity.path) return entity.path;
  return entity.slug ? `/governance/${entity.slug}` : null;
}

export function getGovernanceLabel(entity) {
  return entity?.short_name || entity?.name || "Governance";
}

export function getGovernanceName(entity) {
  return entity?.name || entity?.short_name || "Governance";
}

export function getGovernanceTreeLabel(entity) {
  return entity?.short_name || entity?.name || entity?.label || "Governance";
}

export function formatGovernanceType(value) {
  const type =
    typeof value === "string"
      ? value
      : value?.unit_type && value.unit_type !== "authority"
        ? value.unit_type
        : value?.entity_type;
  if (!type) return "Governance";
  if (type === "other") return "Organisation";
  return type.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getGovernanceInitials(value) {
  return (
    value
      ?.split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "G"
  );
}

export function getDefaultGovernanceUnitType(entityType) {
  return UNIT_TYPE_BY_ENTITY_TYPE[entityType] || "unit";
}

export function toGovernanceDateInput(value) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}

export function toGovernanceIsoStart(value) {
  return value ? new Date(`${value}T00:00:00`).toISOString() : null;
}

export function toGovernanceIsoEnd(value) {
  return value ? new Date(`${value}T23:59:59.999`).toISOString() : null;
}

export function formatGovernanceDate(value) {
  if (!value) return null;
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function governanceRequiresValidTo(status) {
  return status === "inactive" || status === "deprecated";
}

export function wouldCreateGovernanceCycle(sourceId, targetId, records = []) {
  if (!sourceId || !targetId || sourceId === targetId) return true;
  const byId = new Map(records.map((record) => [record.id, record]));
  let current = byId.get(targetId);
  const seen = new Set();
  while (current?.parent_id && !seen.has(current.id)) {
    if (current.parent_id === sourceId) return true;
    seen.add(current.id);
    current = byId.get(current.parent_id);
  }
  return false;
}
