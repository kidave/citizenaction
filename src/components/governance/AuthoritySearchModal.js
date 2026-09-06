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
import { useGovernance } from "@/hooks/governance/useGovernance";
import { UserIdentity } from "@/components/profile/UserIdentity";
import Image from "next/image";

export default function AuthoritySearchModal({
  open,
  onOpenChange,
  selected = [],
  onChange = () => {},
  onSubmit = () => {},
  existingAuthorities = [],
}) {
  const [search, setSearch] = useState("");

  const { data: directory = [], isLoading } = useGovernance({
    search,
    entityType: "all",
    enabled: open,
  });

  function handleToggle(item) {
    const exists = selected.some((e) => e.id === item.id);
    onChange(exists ? selected.filter((e) => e.id !== item.id) : [...selected, item]);
  }

  function getTaggedUser(entityId) {
    const found = existingAuthorities.find((e) => e.id === entityId);
    if (!found || !found.tagged_by) return null;
    return {
      username: found.tagged_by_username,
      name: found.tagged_by_name,
      avatar: found.tagged_by_avatar,
    };
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col p-0">
        <DialogHeader className="border-b p-4">
          <DialogTitle>Manage Governance</DialogTitle>
        </DialogHeader>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          <Input
            placeholder="Search governance..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="space-y-2">
            {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}

            {!isLoading && directory.length === 0 && (
              <p className="text-sm text-muted-foreground">No governance records found.</p>
            )}

            {directory.map((item) => {
              const isSelected = selected.some((e) => e.id === item.id);
              const taggedUser = getTaggedUser(item.id);
              const label = item.short_name || item.label || item.name;

              return (
                <Card
                  key={item.id}
                  className={`cursor-pointer border p-3 ${
                    isSelected ? "border-primary bg-primary/5" : "hover:bg-accent"
                  }`}
                  onClick={() => handleToggle(item)}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isSelected} />
                    <Image
                      src={item.image_url || "/user1.png"}
                      width={32}
                      height={32}
                      alt=""
                      className={item.entity_type === "person" ? "rounded-full" : "rounded-md"}
                    />
                    <div className="flex-1 space-y-1">
                      <div className="text-sm font-medium">{label}</div>
                      {taggedUser && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Tagged by</span>
                          <UserIdentity {...taggedUser} size="sm" hideName />
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="border-t p-4">
          <Button
            className="w-full"
            onClick={() => {
              onSubmit(selected);
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
