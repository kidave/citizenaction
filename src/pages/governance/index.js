import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GovernancePageHeader from "@/components/governance/GovernancePageHeader";
import GeographyFocusSelector from "@/components/geography/GeographyFocusSelector";
import OrganizationDirectory from "@/components/governance/OrganizationDirectory";
import PositionDirectory from "@/components/governance/PositionDirectory";
import PersonDirectory from "@/components/governance/PersonDirectory";
import { useMyProfile } from "@/hooks/user/useMyProfile";
import { GOVERNANCE_DIRECTORY_TABS } from "@/utils/governance";

const VALID_TABS = new Set(GOVERNANCE_DIRECTORY_TABS.map(([value]) => value));

function getTab(value) {
  const tab = Array.isArray(value) ? value[0] : value;
  return VALID_TABS.has(tab) ? tab : "organizations";
}

export default function GovernancePage() {
  const router = useRouter();
  const [tab, setTab] = useState("organizations");
  const [focusGeographyId, setFocusGeographyId] = useState(null);
  const { data: profile } = useMyProfile();
  const canManage = profile?.role === "admin";

  useEffect(() => {
    if (!router.isReady) return;

    const nextTab = getTab(router.query.tab);
    setTab(nextTab);

    if (router.query.tab !== nextTab) {
      router.replace(
        { pathname: "/governance", query: { ...router.query, tab: nextTab } },
        undefined,
        { shallow: true },
      );
    }
  }, [router.isReady, router.query.tab]);

  const handleTabChange = (nextTab) => {
    if (!VALID_TABS.has(nextTab) || nextTab === tab) return;
    setTab(nextTab);
    router.push(
      { pathname: "/governance", query: { ...router.query, tab: nextTab } },
      undefined,
      { shallow: true },
    );
  };

  const directoryProps = useMemo(
    () => ({ geographyId: focusGeographyId, canManage }),
    [focusGeographyId, canManage],
  );

  return (
    <div className="flex min-h-dvh w-full flex-col">
      <GovernancePageHeader
        items={[{ label: "Governance" }]}
        actions={
          <GeographyFocusSelector
            value={focusGeographyId}
            onValueChange={setFocusGeographyId}
          />
        }
      />
      <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <Tabs value={tab} onValueChange={handleTabChange} className="mb-5">
            <TabsList className="w-max max-w-full">
              {GOVERNANCE_DIRECTORY_TABS.map(([value, label]) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="px-3 sm:px-4"
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {tab === "organizations" && <OrganizationDirectory {...directoryProps} />}
          {tab === "positions" && <PositionDirectory {...directoryProps} />}
          {tab === "people" && <PersonDirectory {...directoryProps} />}
        </div>
      </main>
    </div>
  );
}

GovernancePage.getLayout = (page) => page;
