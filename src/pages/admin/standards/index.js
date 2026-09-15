import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/layout/PageHeader";

export default function StandardsPage() {
  return (
    <div className="min-h-dvh">
      <PageHeader
        items={[{ label: "Home", href: "/" }, { label: "Standards" }]}
      />

      <main className="container mx-auto space-y-6 px-4 py-6">
        <div>
          <h1 className="text-3xl font-bold">Standards</h1>
          <p className="mt-2 text-muted-foreground">Import and manage planning standards.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>LBCS (Land Based Classification Standards)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div><p className="text-sm text-muted-foreground">Source</p><Badge>PDF Found</Badge></div>
              <div><p className="text-sm text-muted-foreground">Extract</p><Badge variant="outline">Pending</Badge></div>
              <div><p className="text-sm text-muted-foreground">Validate</p><Badge variant="outline">Pending</Badge></div>
              <div><p className="text-sm text-muted-foreground">Import</p><Badge variant="outline">Pending</Badge></div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button id="extract">Extract PDF</Button>
              <Button variant="outline" disabled>Validate</Button>
              <Button variant="outline" disabled>Import</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
