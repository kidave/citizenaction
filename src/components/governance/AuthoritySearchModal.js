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
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useMemo } from "react";
import { useGovernanceDirectory } from "@/hooks/useGovernanceDirectory";
import ScopeSelector from "@/components/shared/ScopeSelector";
import Image from "next/image";

export default function AuthoritySearchModal({
  open,
  onOpenChange,
  selected = [],
  onChange = () => {},
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

            {directory.map((item) => {
              const isSelected = selected.find((e) => e.id === item.id);

              return (
                <Card
                  key={item.id}
                  className={`p-3 cursor-pointer transition-colors border ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "hover:bg-accent"
                  }`}
                >
                  <div className="flex items-center gap-3">

                    {/* Checkbox indicator */}
                    <Checkbox
                      checked={!!isSelected}
                      onCheckedChange={(checked) => {
                        const exists = selected.find((e) => e.id === item.id);

                        if (exists) {
                          onChange(selected.filter((e) => e.id !== item.id));
                        } else {
                          onChange([...selected, item]);
                        }
                      }}
                    />

                    <Image
                      src={item.image_url || "/user1.png"}
                      width={32}
                      height={32}
                      alt=""
                      className={`${
                        item.entity_type === "person"
                          ? "rounded-full"
                          : "rounded-md"
                      }`}
                    />

                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {item.label}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}

          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}