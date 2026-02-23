"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { useState, useMemo } from "react";
import { useGovernanceDirectory } from "@/hooks/useGovernanceDirectory";
import ScopeSelector from "@/components/shared/ScopeSelector";
import Image from "next/image";

export default function AuthoritySearchModal({
  open,
  onOpenChange,
  onSelect,
}) {
  const [search, setSearch] = useState("");

  const [scope, setScope] = useState({
    scope_type: "",
    scope_code: "",
  });

  const { data: directory = [], isLoading } =
    useGovernanceDirectory({
      scopeType: scope.scope_type || null,
      scopeCode: scope.scope_code || null,
      search,
      entityType: "all",
      enabled: true,
    });

  const clearFilters = () => {
    setScope({
      scope_type: "",
      scope_code: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">

        <DialogHeader className="p-4 border-b">
          <DialogTitle>Select Authority</DialogTitle>
        </DialogHeader>

        <div className="px-4 space-y-2">

          {/* SEARCH */}
          <Input
            placeholder="Search authority..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          {/* SCOPE FILTER */}
          <div className="space-y-3">

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Filter by Jurisdiction
              </span>

              {(scope.scope_type ||
                scope.scope_code) && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clearFilters}
                >
                  Clear
                </Button>
              )}
            </div>

            <ScopeSelector
              value={scope}
              onChange={setScope}
            />
          </div>

          {/* RESULTS */}
          <div className="space-y-3 max-h-[300px] overflow-y-auto">

            {isLoading && (
              <p className="text-sm text-muted-foreground">
                Loading...
              </p>
            )}

            {!isLoading &&
              directory.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No authorities found.
                </p>
              )}

            {directory.map((item) => (
              <Card
                key={item.id}
                className="p-3 cursor-pointer hover:bg-accent transition-colors"
                onClick={() => {
                  onSelect(item);
                  onOpenChange(false);
                }}
              >
                <div className="flex items-center gap-3">

                  <Image
                    src={
                      item.authority_logo ||
                      "/user1.png"
                    }
                    width={32}
                    height={32}
                    alt=""
                    className="rounded"
                  />

                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {item.label}
                    </div>
                  </div>

                </div>
              </Card>
            ))}

          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}