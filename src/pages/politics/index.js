import GovernanceDirectoryPage from "@/components/governance/GovernanceDirectoryPage";

export default function PoliticsDirectoryPage() {
  return <GovernanceDirectoryPage domain="politics" />;
}
PoliticsDirectoryPage.getLayout = (page) => page;
