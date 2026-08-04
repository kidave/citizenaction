import { Card } from "@/components/ui/card";
import PrivacyPolicy from "@/components/system/PrivacyPolicy";

export default function PrivacyPage() {
  return (
    <div className="min-h-dvh bg-muted/30 px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <Card className="p-10">
          <PrivacyPolicy />
        </Card>
      </div>
    </div>
  );
}
