import { useMemo, useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import GovernancePageHeader from "@/components/governance/GovernancePageHeader";
import GeographyFocusSelector from "@/components/geography/GeographyFocusSelector";
import OrganizationDirectory from "@/components/governance/OrganizationDirectory";
import PositionDirectory from "@/components/governance/PositionDirectory";
import PersonDirectory from "@/components/governance/PersonDirectory";
import { GOVERNANCE_DIRECTORY_TABS } from "@/utils/governance";

export default function GovernancePage() {
  const [tab, setTab] = useState("organizations");
  const [focusGeographyId, setFocusGeographyId] = useState(null);

  const directoryProps = useMemo(() => ({ geographyId: focusGeographyId }), [focusGeographyId]);

  const handleTabChange = (value) => {
    if (!value) return;
    setTab(value);
  };

  return (
    <div className="flex min-h-dvh w-full flex-col">
      <GovernancePageHeader items={[{ label: "Governance" }]} />
      <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <ToggleGroup type="single" value={tab} onValueChange={handleTabChange} variant="outline" className="w-full sm:w-auto" aria-label="Governance directory view">
              {GOVERNANCE_DIRECTORY_TABS.map(([value, label]) => (
                <ToggleGroupItem key={value} value={value} className="flex-1 px-4 sm:flex-none">{label}</ToggleGroupItem>
              ))}
            </ToggleGroup>
            <GeographyFocusSelector value={focusGeographyId} onValueChange={setFocusGeographyId} />
          </div>

          {tab === "organizations" && <OrganizationDirectory {...directoryProps} />}
          {tab === "positions" && <PositionDirectory {...directoryProps} />}
          {tab === "people" && <PersonDirectory {...directoryProps} />}
        </div>
      </main>
    </div>
  );
}
