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

  const directoryProps = useMemo(
    () => ({ geographyId: focusGeographyId }),
    [focusGeographyId],
  );

  const handleTabChange = (value) => {
    if (!value) return;
    setTab(value);
  };

  const governanceControls = (
    <div className="flex min-w-0 items-center gap-1">
      <GeographyFocusSelector
        value={focusGeographyId}
        onValueChange={setFocusGeographyId}
      />
      <ToggleGroup
        type="single"
        value={tab}
        onValueChange={handleTabChange}
        variant="outline"
        className="shrink-0"
        aria-label="Governance directory view"
      >
        {GOVERNANCE_DIRECTORY_TABS.map(([value, label]) => (
          <ToggleGroupItem
            key={value}
            value={value}
            className="px-2.5 sm:px-3"
          >
            {label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );

  return (
    <div className="flex min-h-dvh w-full flex-col">
      <GovernancePageHeader items={[{ label: "Governance" }]} actions={governanceControls} />
      <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-6xl">
          {tab === "organizations" && (
            <OrganizationDirectory {...directoryProps} />
          )}
          {tab === "positions" && <PositionDirectory {...directoryProps} />}
          {tab === "people" && <PersonDirectory {...directoryProps} />}
        </div>
      </main>
    </div>
  );
}

GovernancePage.getLayout = (page) => page;
