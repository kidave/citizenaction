export function getGovernanceHref(entity) {
  if (!entity?.slug) return null;
  return `/governance/${entity.slug}`;
}

export function getGovernanceLabel(entity) {
  return entity?.short_name || entity?.label || entity?.name || "Governance";
}
