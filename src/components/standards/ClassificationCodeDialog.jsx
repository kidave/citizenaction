"use client";

import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Switch } from "@/components/ui/switch";

export default function ClassificationCodeDialog({
  open,
  onOpenChange,
  dimensions = [],
  parents = [],
  value,
  onSave,
}) {
  const [form, setForm] = useState({});

  useEffect(() => {
    setForm(
      value || {
        code: "",
        title: "",
        description: "",
        dimension_id: "",
        parent_id: "",
        verified: true,
      },
    );
  }, [value]);

  function update(key, value) {
    setForm((p) => ({
      ...p,
      [key]: value,
    }));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{value ? "Edit Code" : "Create Code"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <Input
            placeholder="Code"
            value={form.code || ""}
            onChange={(e) => update("code", e.target.value)}
          />

          <Input
            placeholder="Title"
            value={form.title || ""}
            onChange={(e) => update("title", e.target.value)}
          />

          <Textarea
            rows={8}
            placeholder="Description"
            value={form.description || ""}
            onChange={(e) => update("description", e.target.value)}
          />

          <Select
            value={form.dimension_id || ""}
            onValueChange={(v) => update("dimension_id", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Dimension" />
            </SelectTrigger>

            <SelectContent>
              {dimensions.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={form.parent_id || "none"}
            onValueChange={(v) => update("parent_id", v === "none" ? null : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Parent" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="none">None</SelectItem>

              {parents.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.display_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center justify-between">
            <span>Verified</span>

            <Switch
              checked={form.verified}
              onCheckedChange={(v) => update("verified", v)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <Button onClick={() => onSave(form)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
