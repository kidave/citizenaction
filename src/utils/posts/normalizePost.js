export default function normalizePost(row) {
  if (!row) return null;

  const metadata = row.metadata || {};

  return {
    id: row.id,

    /* ---------- Core ---------- */

    type: row.type || "action",
    summary: row.summary || "",
    details: row.details || "",

    created_at: row.created_at || null,
    updated_at: row.updated_at || null,

    /* ---------- Author ---------- */

    author_id: row.author_id || null,
    author_name:
      row.profile?.name ||
      row.author_name ||
      "Citizen",

    author_username:
      row.profile?.username ||
      row.author_username ||
      null,

    author_avatar:
      row.profile?.avatar_url ||
      row.author_avatar ||
      null,

    /* ---------- Attachments ---------- */

    attachments: Array.isArray(row.attachments)
      ? row.attachments
      : [],

    /* ---------- Governance ---------- */

    governance_entities:
      row.governance_entities ||
      row.feed_governance_entities?.map(
        (g) => g.governance_entity
      ) ||
      [],

    /* ---------- Metadata ---------- */

    metadata: {
      date: metadata.date || null,
      time: metadata.time || null,
      location: metadata.location || null,
      links: metadata.links || [],
      hashtags: metadata.hashtags || [],
    },

    /* ---------- Status ---------- */

    status: row.status || null,

    /* ---------- Scope ---------- */

    scope_type: row.scope_type || null,
    scope_code: row.scope_code || null,

    /* ---------- Club ---------- */

    club_id: row.club_id || null,
  };
}