export const GOVERNANCE_TYPES = [
  "government",
  "ministry",
  "department",
  "authority",
  "corporation",
  "committee",
  "organization",
  "agency",
  "board",
  "commission",
  "council",
  "regulator",
  "office",
  "tribunal",
  "court",
  "division",
  "zone",
];

export const GOVERNANCE_ENTITY_TYPES = GOVERNANCE_TYPES;

export const GOVERNANCE_STATUS_OPTIONS = [
  ["active", "Active"],
  ["inactive", "Inactive"],
  ["deprecated", "Deprecated"],
];

export const GOVERNANCE_DIRECTORY_TABS = [
  ["organizations", "Organizations"],
  ["positions", "Positions"],
  ["people", "People"],
];

export const GOVERNANCE_ROOT_TYPES = ["all", ...GOVERNANCE_TYPES];

export function getGovernanceHref(entity) {
  if (!entity) return null;
  if (entity.path) return entity.path;
  if (entity.tab === "people" || entity.type === "person") return entity.slug ? `/governance/person/${entity.slug}` : null;
  if (entity.tab === "positions" || entity.type === "position") {
    if (entity.parent_slug && entity.slug) return `/governance/${entity.parent_slug}/${entity.slug}`;
    return null;
  }
  if (entity.slug) return `/governance/${entity.slug}`;
  return null;
}

export function getGovernanceLabel(entity) {
  return entity?.short_name || entity?.name || entity?.label || "Governance";
}

export function getGovernanceName(entity) {
  return entity?.name || entity?.short_name || entity?.label || "Governance";
}

export function getGovernanceTreeLabel(entity) {
  return getGovernanceLabel(entity);
}

export function formatGovernanceType(value) {
  const type = typeof value === "string" ? value : value?.type;
  if (!type) return "Governance";
  return type.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatGovernanceFilterType(value) {
  if (!value || value === "all") return "All types";
  return formatGovernanceType(value);
}

export function getGovernanceInitials(value) {
  return value?.split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "G";
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
  return new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function governanceRequiresValidTo(status) {
  return status === "inactive" || status === "deprecated";
}

export function createGovernanceTreeIndex(records = []) {
  const byId = new Map();
  const childrenByParent = new Map();
  for (const record of records) {
    if (!record?.id) continue;
    byId.set(record.id, record);
    if (!record.parent_id) continue;
    const children = childrenByParent.get(record.parent_id) || [];
    children.push(record.id);
    childrenByParent.set(record.parent_id, children);
  }
  return { byId, childrenByParent };
}

export function getGovernanceRoots(records = []) { return records.filter((record) => !record?.parent_id); }

export function getGovernanceDescendantCount(treeIndex, rootId) {
  if (!rootId) return 0;
  const { childrenByParent } = treeIndex;
  let count = 0;
  const queue = [...(childrenByParent.get(rootId) || [])];
  const visited = new Set();
  while (queue.length) {
    const id = queue.shift();
    if (!id || visited.has(id)) continue;
    visited.add(id); count += 1; queue.push(...(childrenByParent.get(id) || []));
  }
  return count;
}

export function getGovernanceAncestorIds(records = [], selectedId) {
  if (!selectedId) return [];
  const { byId } = createGovernanceTreeIndex(records);
  const ids = []; const seen = new Set(); let current = byId.get(selectedId);
  while (current?.parent_id && !seen.has(current.parent_id)) {
    seen.add(current.parent_id); ids.push(current.parent_id); current = byId.get(current.parent_id);
  }
  return ids;
}

export function buildGovernanceTree(records = []) {
  const nodes = new Map(records.filter((record) => record?.id).map((record) => [record.id, { ...record, children: [] }]));
  const roots = [];
  nodes.forEach((node) => {
    if (node.parent_id && nodes.has(node.parent_id)) nodes.get(node.parent_id).children.push(node);
    else roots.push(node);
  });
  const sortNodes = (items) => {
    items.sort((a, b) => getGovernanceTreeLabel(a).localeCompare(getGovernanceTreeLabel(b)));
    items.forEach((item) => sortNodes(item.children));
  };
  sortNodes(roots);
  return roots;
}

export function wouldCreateGovernanceCycle(sourceId, targetId, records = []) {
  if (!sourceId || !targetId || sourceId === targetId) return true;
  const { byId } = createGovernanceTreeIndex(records);
  let current = byId.get(targetId); const seen = new Set();
  while (current?.parent_id && !seen.has(current.id)) {
    if (current.parent_id === sourceId) return true;
    seen.add(current.id); current = byId.get(current.parent_id);
  }
  return false;
}
