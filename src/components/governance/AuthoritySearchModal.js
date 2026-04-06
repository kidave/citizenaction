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

import { useState } from "react";
import { useGovernance } from "@/hooks/useGovernance";

import { UserIdentity } from "@/components/profile/UserIdentity";

import ScopeSelector from "@/components/shared/ScopeSelector";
import Image from "next/image";

export default function AuthoritySearchModal({
  open,
  onOpenChange,
  selected = [],
  onChange = () => {},
  onSubmit = () => {},
  existingEntities = [],
}) {
  const [search, setSearch] = useState("");

  const [scope, setScope] = useState({
    scope_type: "",
    scope_code: "",
  });

  const { data: directory = [], isLoading } = useGovernance({
    scopeType: scope.scope_type || null,
    scopeCode: scope.scope_code || null,
    search,
    entityType: "all",
    enabled: open,
  });

  function handleToggle(item) {
    const exists = selected.find((e) => e.id === item.id);

    if (exists) {
      onChange([]);
    } else {
      onChange([item]);
    }
  }

  function getTaggedUser(entityId) {
    const found = existingEntities.find((e) => e.id === entityId);
    if (!found || !found.tagged_by) return null;

    return {
      username: found.tagged_by_username,
      name: found.tagged_by_name,
      avatar: found.tagged_by_avatar,
    };
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 flex flex-col">

        {/* HEADER */}
        <DialogHeader className="p-4 border-b">
          <DialogTitle>Manage Authority</DialogTitle>
        </DialogHeader>

        {/* BODY */}
        <div className="p-4 space-y-3 flex-1 overflow-y-auto">

          {/* SEARCH */}
          <Input
            placeholder="Search authority..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* SCOPE */}
          <ScopeSelector value={scope} onChange={setScope} />

          {/* RESULTS */}
          <div className="space-y-2">

            {isLoading && (
              <p className="text-sm text-muted-foreground">
                Loading...
              </p>
            )}

            {!isLoading && directory.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No authorities found.
              </p>
            )}

            {directory.map((item) => {
              const isSelected = selected.find(
                (e) => e.id === item.id
              );

              const taggedUser = getTaggedUser(item.id);

              return (
                <Card
                  key={item.id}
                  className={`p-3 cursor-pointer border ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "hover:bg-accent"
                  }`}
                  onClick={() => handleToggle(item)}
                >
                  <div className="flex items-center gap-3">

                    <Checkbox checked={!!isSelected} />

                    <Image
                      src={item.image_url || "/user1.png"}
                      width={32}
                      height={32}
                      alt=""
                      className={
                        item.entity_type === "person"
                          ? "rounded-full"
                          : "rounded-md"
                      }
                    />

                    <div className="flex-1 space-y-1">

                      {/* LABEL */}
                      <div className="text-sm font-medium">
                        {item.label}
                      </div>

                      {taggedUser && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            Tagged by
                          </span>

                          <UserIdentity
                            {...taggedUser}
                            size="sm"
                            hideName
                          />
                        </div>
                      )}

                    </div>

                  </div>
                </Card>
              );
            })}

          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t">
          <Button
            className="w-full"
            onClick={() => {
              onSubmit(selected.slice(0, 1));
              onOpenChange(false);
            }}
          >
            Save Changes
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}