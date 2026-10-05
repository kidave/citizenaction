"use client";

import { useRouter } from "next/router";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminSettingsShell({
  title,
  description,
  badge,
  tabs,
  children,
  className = "",
}) {
  const router = useRouter();
  const requestedTab = Array.isArray(router.query.tab)
    ? router.query.tab[0]
    : router.query.tab;
  const activeTab = tabs.some((tab) => tab.value === requestedTab)
    ? requestedTab
    : tabs[0]?.value;

  function changeTab(value) {
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, tab: value },
      },
      undefined,
      { shallow: true },
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={changeTab} className={className}>
      <div className="border-b bg-background">
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
          <div className="flex min-h-20 items-center gap-3 py-5">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-xl font-semibold tracking-tight">{title}</h1>
                {badge}
              </div>
              {description ? (
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              ) : null}
            </div>
          </div>

          <div className="overflow-x-auto">
            <TabsList className="h-10 w-max min-w-full justify-start rounded-none bg-transparent p-0">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="h-10 rounded-none border-b-2 border-transparent bg-transparent px-1 mr-6 shadow-none data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </Tabs>
  );
}
