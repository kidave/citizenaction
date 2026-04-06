export function getEntityHierarchy(entity, allEntities) {
  const result = [entity];

  let current = entity;

  while (current?.parent_id) {
    const parent = allEntities.find(
      (e) => e.id === current.parent_id
    );

    if (!parent) break;

    result.push(parent);
    current = parent;
  }

  return result;
}