// config/scopeConfig.js

export const COUNTRY_CODE = "IN";

export const SCOPE_CONFIG = {
  state: {
    label: "State",
    fetch: { type: "state", parent: null },
    requires: [],
  },

  region: {
    label: "Region",
    fetch: { type: "region", parent: "state" },
    requires: ["state"],
  },

  city: {
    label: "City",
    fetch: { type: "city", parent: ["region", "state"] },
    requires: [],
  },

  ward: {
    label: "Ward",
    fetch: { type: "ward", parent: "city" },
    requires: ["city"],
  },
};

export const SCOPE_TYPES = Object.keys(SCOPE_CONFIG);