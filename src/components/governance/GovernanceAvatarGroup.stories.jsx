import GovernanceAvatarGroup from "./GovernanceAvatarGroup";

const authorities = [
  {
    id: "municipal-corporation",
    name: "Mumbai Municipal Corporation",
  },
  {
    id: "transport-department",
    name: "Transport Department",
  },
  {
    id: "ward-office",
    name: "Ward Office",
  },
  {
    id: "public-works",
    name: "Public Works Department",
  },
  {
    id: "traffic-police",
    name: "Mumbai Traffic Police",
  },
  {
    id: "planning-office",
    name: "Urban Planning Office",
  },
];

const meta = {
  title: "Governance/Directory/Governance Avatar Group",
  component: GovernanceAvatarGroup,
};

export default meta;

export const SeveralAuthorities = {
  args: {
    authorities,
  },
};

export const CompactGroup = {
  args: {
    authorities,
    maxVisible: 3,
  },
};
