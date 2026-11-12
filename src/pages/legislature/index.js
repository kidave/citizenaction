import GovernanceDirectoryPage from "@/components/governance/GovernanceDirectoryPage";

export default function LegislatureDirectoryPage() {
  return <GovernanceDirectoryPage domain="legislature" />;
}
LegislatureDirectoryPage.getLayout = (page) => page;
