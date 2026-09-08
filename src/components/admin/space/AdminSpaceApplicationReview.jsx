import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock3, XCircle } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useAdminSpaceApplication } from "@/hooks/admin/useAdminSpaceApplication";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

function StatusBadge({ status }) {
  if (status === "approved") return <Badge variant="secondary" className="gap-1"><CheckCircle2 className="h-3.5 w-3.5" />Approved</Badge>;
  if (status === "rejected") return <Badge variant="destructive" className="gap-1"><XCircle className="h-3.5 w-3.5" />Rejected</Badge>;
  return <Badge variant="outline" className="gap-1"><Clock3 className="h-3.5 w-3.5" />Pending</Badge>;
}

function Info({ label, value }) {
  return <div><div className="text-xs text-muted-foreground">{label}</div><div className="mt-1 whitespace-pre-wrap text-sm">{value || "—"}</div></div>;
}

export default function AdminSpaceApplicationReview({ id }) {
  const { user, loading: authLoading } = useAuth();
  const { loading, application, categories, error } = useAdminSpaceApplication(id);
  const [isAdmin, setIsAdmin] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    supabase.from("profile").select("role").eq("user_id", user.id).single().then(({ data }) => setIsAdmin(data?.role === "admin"));
  }, [user?.id]);

  useEffect(() => {
    if (application) {
      setCategoryId(application.category_id || "");
      setAdminNotes(application.admin_notes || "");
    }
  }, [application]);

  const selectedCategory = useMemo(() => categories.find((item) => item.id === categoryId), [categories, categoryId]);

  async function review(action) {
    if (!application) return;
    if (action === "approve" && !categoryId) return toast.error("Select an official category before approving");
    setSaving(true);
    const rpc = action === "approve" ? "approve_space_application" : "reject_space_application";
    const params = action === "approve"
      ? { p_application_id: application.id, p_category_id: categoryId, p_admin_notes: adminNotes.trim() || null }
      : { p_application_id: application.id, p_admin_notes: adminNotes.trim() || null };
    const { error: reviewError } = await supabase.rpc(rpc, params);
    if (reviewError) toast.error(reviewError.message);
    else toast.success(action === "approve" ? "Space application approved" : "Space application rejected");
    setSaving(false);
  }

  if (authLoading || loading) return <main className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">Loading application...</main>;
  if (!user || !isAdmin) return <main className="mx-auto min-h-dvh max-w-4xl px-4 py-10 text-center text-sm text-muted-foreground">Administrator access required.</main>;
  if (error || !application) return <main className="mx-auto min-h-dvh max-w-4xl px-4 py-10 text-center"><h1 className="text-xl font-semibold">Application not found</h1><Button asChild variant="outline" className="mt-4"><Link href="/admin/space"><ArrowLeft className="mr-2 h-4 w-4" />Back to Spaces</Link></Button></main>;

  const pending = application.status === "pending";

  return <main className="min-h-dvh bg-muted/30 px-4 py-6 sm:px-6 sm:py-8"><div className="mx-auto max-w-4xl space-y-6">
    <Button variant="ghost" asChild className="-ml-3"><Link href="/admin/space"><ArrowLeft className="mr-2 h-4 w-4" />Back to Spaces</Link></Button>
    <Card><CardHeader><div className="flex flex-wrap items-start justify-between gap-3"><div><CardTitle className="text-2xl">{application.proposed_name}</CardTitle><p className="mt-1 text-sm text-muted-foreground">Application #{application.id.slice(0, 8).toUpperCase()}</p></div><StatusBadge status={application.status} /></div></CardHeader>
      <CardContent className="space-y-8">
        <section className="grid gap-6 sm:grid-cols-2"><Info label="Requested URL" value={`/${application.proposed_slug}`} /><Info label="Contact email" value={application.email} /><Info label="Contact number" value={application.contact_number} /><Info label="Website" value={application.website} /><Info label="Address" value={application.address} /><Info label="Applicant category" value={application.category} /><div className="sm:col-span-2"><Info label="Description" value={application.description} /></div><div className="sm:col-span-2"><Info label="Why should this Space exist?" value={application.justification} /></div></section>
        {pending && <><Separator /><section className="space-y-4"><div><h2 className="font-semibold">Official classification</h2><p className="text-sm text-muted-foreground">Select the Citizen Action category that best represents this Space.</p></div><Select value={categoryId} onValueChange={setCategoryId} disabled={saving}><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger><SelectContent>{categories.map((category) => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}</SelectContent></Select>{selectedCategory?.description && <p className="text-sm text-muted-foreground">{selectedCategory.description}</p>}</section><section className="space-y-2"><Label>Admin notes</Label><Textarea value={adminNotes} onChange={(event) => setAdminNotes(event.target.value)} placeholder="Add review notes..." rows={5} disabled={saving} /></section><div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button variant="destructive" onClick={() => review("reject")} disabled={saving}><XCircle className="mr-2 h-4 w-4" />Reject application</Button><Button onClick={() => review("approve")} disabled={saving || !categoryId}><CheckCircle2 className="mr-2 h-4 w-4" />Approve application</Button></div></>}
      </CardContent>
    </Card>
  </div></main>;
}
