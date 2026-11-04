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
  "ward",
  "station",
  "legislature",
  "legislative_house",
  "political_party",
];


export const GOVERNANCE_DOMAINS = [
  { value: "politics", label: "Politics", description: "Political parties and institutions" },
  { value: "legislature", label: "Legislature", description: "Parliament and legislative bodies" },
  { value: "executive", label: "Executive", description: "Government and public administration" },
  { value: "judiciary", label: "Judiciary", description: "Courts and tribunals" },
];

export const GOVERNANCE_DOMAIN_VALUES = GOVERNANCE_DOMAINS.map(({ value }) => value);

export function formatGovernanceDomain(value) {
  if (!value) return "Unassigned";
  return GOVERNANCE_DOMAINS.find((item) => item.value === value)?.label || value;
}

export function getGovernanceDomainHref(domain) {
  return GOVERNANCE_DOMAIN_VALUES.includes(domain) ? `/${domain}` : "/governance";
}

export const GOVERNANCE_STATUS_OPTIONS = [
  ["active", "Active"],
  ["inactive", "Inactive"],
  ["deprecated", "Deprecated"],
];

export const GOVERNANCE_DIRECTORY_TABS = [
  ["organizations", "Organizations"],
  ["people", "People"],
];

export const GOVERNANCE_ROOT_TYPES = ["all", ...GOVERNANCE_TYPES];

export function getGov¶»§q«^