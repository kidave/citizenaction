export function getUsersFromEntities(entities = []) {
  const map = new Map();

  entities.forEach((e) => {
    if (!e.tagged_by) return;

    map.set(e.tagged_by, {
      id: e.tagged_by,
      name: e.tagged_by_name,
      username: e.tagged_by_username,
      avatar: e.tagged_by_avatar,
    });
  });

  return Array.from(map.values());
}