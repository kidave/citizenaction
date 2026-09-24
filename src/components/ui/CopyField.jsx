// components/classification/CopyField.jsx

"use client";

import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

export default function CopyField({ label, value }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!value) return;

    await navigator.clipboard.writeText(String(value));

    setCopied(true);
    toast.success(`${label} copied`);

    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border p-3">
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">
          {label}
        </div>

        <div className="mt-1 break-all text-sm font-medium">{value || "—"}</div>
      </div>

      {value && (
        <Button variant="ghost" size="icon" onClick={handleCopy}>
          {copied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );
}
