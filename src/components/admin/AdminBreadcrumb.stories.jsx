import AdminBreadcrumb from "./AdminBreadcrumb";

const meta = {
  title: "Admin/Navigation/Administration Breadcrumb",
  component: AdminBreadcrumb,
};

export default meta;

export const GovernanceDirectory = {
  args: {
    items: [
      { label: "Governance", href: "/admin/governance" },
      { label: "Organizations", href: "/admin/governance/organizations" },
      { label: "Mumbai Civic Forum" },
    ],
  },
};

export const AdminHome = {
  args: {
    items: [],
  },
};
