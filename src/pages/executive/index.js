import GovernanceDirectoryPage from "@/components/governance/GovernanceDirectoryPage";

export default function ExecutiveDirectoryPage() {
  return <GovernanceDirectoryPage domain="executive" />;
}
ExecutiveDirectoryPage.getLayout = (page) => page;
