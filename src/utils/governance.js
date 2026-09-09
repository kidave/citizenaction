export function getGovernanceHref(entity) {
  if (!entity) return null;
  if (entity.path) return entity.path;
  return `/governance/${entity.slug}`;
}

export function getGovernanceLabel(entity) {
  return entity?.name || entity?.label || "Governance";
}

export function getGovernanceTreeLabel(entity) {
  return entity?.short_name || entity?.name || entity?.label || "Governance";
}
