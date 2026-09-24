"use client";

import { useRouter } from "next/navigation";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function BackButton({ label, fallbackHref = "/" }) {
  const router = useRouter();

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();

      return;
    }

    router.push(fallbackHref);
  }

  return (
    <Button
      variant="ghost"
      onClick={handleBack}
      className="inline-flex items-center gap-2"
    >
      <ArrowLeft className="h-4 w-4" />

      {label && <span>{label}</span>}
    </Button>
  );
}
