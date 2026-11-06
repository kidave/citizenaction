import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import GovernancePageHeader from "@/components/governance/GovernancePageHeader";
import PersonDirectory from "@/components/governance/PersonDirectory";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GOVERNANCE_DOMAINS, GOVERNANCE_DOMAIN_VALUES } from "@/utils/governance";

const VALID_DOMAINS = new Set(GOVERNANCE_DOMAIN_VALUES);

function getDomain(value) {
  const candidate = Array.isArray(value) ? value[0] : value;
  return VALID_DOMAINS.has(candidate) ? candidate : "all";
}

export default function PeopleDirectoryPage() {
  const router = useRouter();
  const [domain, setDomain] = useState("all");

  useEffect(() => {
    if (!router.isReady) return;
    const nextDomain = getDomain(router.query.domain);
    setDomain(nextDomain);
    const expected = nextDomain === "all" ? undefined : nextDomain;
    if (router.query.domain !== expected) {
      const query = { ...router.query };
      if (expected) query.domain = expected;
      else delete query.domain;
      router.replace({ pathname: "/person", query }, undefined, { shallow: true });
    }
  }, [router.isReady, router.query.domain]);

  const handleDomainChange = (nextDomain) => {
    if (nextDomain === domain) return;
    setDomain(nextDomain);
    const query = { ...router.query };
    if (nextDomain === "all") delete query.domain;
    else query.domain = nextDomain;
    router.push({ pathname: "/person", query }, undefined, { shallow: true });
  };

  return (
    <div className="flex min-h-dvh w-full max-w-full flex-col overflow-x-hidden">
      <GovernancePageHeader items={[{ label: "Governance" }, { label: "People" }]} />
      <main className="min-w-0 flex-1 overflow-x-hidden px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-6xl space-y-4">
          <Tabs value={domain} onValueChange={handleDomainChange}>
            <TabsList className="h-auto max-w-full flex-wrap justify-start">
              <TabsTrigger value="all">All</TabsTrigger>
              {GOVERNANCE_DOMAINS.map((item) => (
                <TabsTrigger key={item.value} value={item.value}>{item.label}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <PersonDirectory domain={domain === "all" ? undefined : domain} />
        </div>
      </main>
    </div>
  );
}

PeopleDirectoryPage.getLayout = (page) => page;
