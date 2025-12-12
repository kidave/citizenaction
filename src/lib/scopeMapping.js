// lib/scopeMapping.js

export const SCOPE_TABLES = {
  ward: {
    meeting: {
      base: "ward_meeting",
      file: "ward_meeting_file",
      view: "ward_meeting_with_files",
      key: "ward_code"
    },
    update: {
      base: "ward_update",
      file: "ward_update_file",
      view: "ward_update_with_files",
      key: "ward_code"
    },
    project: {
      base: "ward_project",
      file: "ward_project_file",
      view: "ward_project_with_files",
      key: "ward_code"
    },
    announcement: {
      base: "ward_announcement",
      file: "ward_announcement_file",
      view: "ward_announcement_with_files",
      key: "ward_code"
    },
    road: {
      base: "roads",
      key: "ward_code"
    },
    junction: {
      base: "junction",
      key: "ward_code"
    },
    committee: {
      base: "committee",
      view: "committee_member_view",
      key: "ward_code"
    },
    committee_form: {
      base: "committee_form",
      view: "committee_form_with_profile",
      key: null
    },
    user_committee_status: {
      base: "user_committee_status",
      key: "ward_code"
    },
    header: {
      view: "ward_header_view",
      key: "ward_code"
    }
  },

  region: {
    meeting: {
      base: "region_meeting",
      view: "region_meeting_view",
      key: "region_code"
    },
    meeting_attendance: {
      base: "region_meeting_attendance",
      key: "region_code"
    },
    policy: {
      base: "region_policy",
      key: "region_code"
    },
    project: {
      base: "region_project",
      key: "region_code"
    },
    newsletter: {
      base: "region_newsletter",
      key: "region_code"
    },
    update: {
      base: "region_update",
      key: "region_code"
    }
  },

  city: {
    city: { base: "city", key: "code" },
    update: { base: "city_update", key: "city_code" }
  },

  state: {
    state: { base: "state", key: "code" },
    policy: { base: "state_policy", key: "state_code" }
  }
};
