// config/scopeConfig.js

export const COUNTRY_CODE = "IN";

export const SCOPE_CONFIG = {
  region: {
    label: "Region",
    fetch: { type: "region", parent: null },
    requires: [],
  },

  city: {
    label: "City",
    fetch: { type: "city", parent: null },
    requires: [],
  },

  ward: {
    label: "Ward",
    fetch: { type: "ward", parent: "city" },
    requires: ["city"],
  },
};

export const SCOPE_TYPES = Object.keys(SCOPE_CONFIG);
