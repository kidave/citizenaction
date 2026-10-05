"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { cn } from "@/lib/utils";

export default function AdminSettingsShell({
  title,
  description,
  badge,
  tabs,
  children,
}) {
  const router = useRouter();
  const activeTab =
    typeof router.query.tab === "string" ? router.query.tab : tabs[0]?.value;

  return (
    <div className="w-full">
      <div className="border-b bg-background">
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
          <div className="flex min-h-20 items-center justify-between gap-4 py-5">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-xl font-semibold tracking-tight">{title}</h1>
                {badge}
              </div>
              {description ? (
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              ) : null}
            </div>
          </div>
          <nav className="flex gap-6 overflow-x-auto" aria-label="Administration">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.value;
              return (
                <Link
                  key={tab.value}
                  href={{
                    pathname: router.pathname,
                    query: { ...router.query, tab: tab.value },
                  }}
                  className={cn(
                    "relative whitespace-nowrap border-b-2 px-0 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
