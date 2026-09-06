export function getGovernanceHref(entity) {
  if (!entity?.slug && !entity?.path) return null;
  if (entity.path) return entity.path;
  return `/governance/${entity.slug}`;
}

export function getGovernanceLabel(entity) {
  return entity?.short_name || entity?.label || entity?.name || "Governance";
}
