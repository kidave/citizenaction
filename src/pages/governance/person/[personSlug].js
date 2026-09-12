import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import GovernancePageHeader from "@/components/governance/GovernancePageHeader";
import { supabase } from "@/lib/supabase/client";
import { formatGovernanceDate, getGovernanceInitials } from "@/utils/governance";

function getValue(value) {
  if (Array.isArray(value)) return value[0] || null;
  return typeof value === "string" ? value : null;
}

export default function GovernancePersonPage() {
  const router = useRouter();
  const personSlug = getValue(router.query.personSlug);

  const query = useQuery({
    queryKey: ["governance", "person", personSlug],
    enabled: router.isReady && !!personSlug,
    queryFn: async () => {
      const personResult = await supabase.rpc("get_person_by_slug", { p_slug: personSlug });
      if (personResult.error) throw personResult.error;
      const person = personResult.data?.[0] || null;
      if (!person) return null;
      const careerResult = await supabase.rpc("get_person_career", { p_person_id: person.id });
      if (careerResult.error) throw careerResult.error;
      return { person, career: careerResult.data || [] };
    },
  });

  if (query.isLoading) return <div className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">Loading person...</div>;
  if (query.error || !query.data) return <div className="flex min-h-dvh items-center justify-center text-sm">Person not found.</div>;

  const { person, career } = query.data;

  return (
    <div className="flex min-h-dvh w-full flex-col">
      <GovernancePageHeader items={[{ label: "Governance", href: "/governance" }, { label: person.name }]} />
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 rounded-xl"><AvatarImage src={person.image_url || undefined} alt="" /><AvatarFallback className="rounded-xl">{getGovernanceInitials(person.name)}</AvatarFallback></Avatar>
            <div className="min-w-0"><h1 className="text-xl font-semibold">{person.name}</h1>{person.biography && <p className="mt-1 text-sm text-muted-foreground">{person.biography}</p>}</div>
          </div>
          <section className="space-y-3">
            <h2 className="text-sm font-semibold">Career</h2>
            {career.length ? career.map((item) => (
              <Card key={item.appointment_id}>
                <CardContent className="p-4">
                  <div className="text-sm font-medium">{item.position_name}</div>
                  <div className="text-sm text-muted-foreground">{item.organization_name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{formatGovernanceDate(item.started_at)}{item.ended_at ? ` – ${formatGovernanceDate(item.ended_at)}` : " – Present"}</div>
                </CardContent>
              </Card>
            )) : <p className="text-sm text-muted-foreground">No appointments recorded.</p>}
          </section>
        </div>
      </main>
    </div>
  );
}
