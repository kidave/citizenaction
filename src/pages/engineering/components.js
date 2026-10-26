import Head from "next/head";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Blocks, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buildComponentCatalogue } from "@/lib/architecture/buildComponentCatalogue";

export default function ComponentCataloguePage({ catalogue }) {
  const [query, setQuery] = useState("");
  const [origin, setOrigin] = useState("all");
  const [selectedFile, setSelectedFile] = useState("");
  const [tab, setTab] = useState("api");
  const items = catalogue.components || [];
  const selected = items.find((item) => item.file === selectedFile) || items[0];
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((item) => (origin === "all" || item.origin === origin) &&
      (!needle || [item.name, item.file, item.origin, ...item.props, ...Object.keys(item.variants)].join(" ").toLowerCase().includes(needle)));
  }, [items, query, origin]);

  return <>
    <Head><title>Component Catalogue | Citizen Action</title><meta name="robots" content="noindex, nofollow" /></Head>
    <main className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Blocks className="h-4 w-4" /> Engineering / Components</div>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><h1 className="text-3xl font-semibold tracking-tight">Component catalogue</h1><p className="mt-2 max-w-3xl text-sm text-muted-foreground">Explore component origins, props, variants, and detected usage locations. Source analysis is heuristic and may not resolve dynamic JSX or complex types.</p></div><div className="flex flex-wrap gap-4"><Link href="/engineering/architecture" className="text-sm underline underline-offset-4">← Architecture explorer</Link><Link href="/engineering/code" className="text-sm underline underline-offset-4">Functions & configuration →</Link></div></div>
      </header>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {Object.entries({ "Components scanned": catalogue.stats.components, "shadcn-based": catalogue.stats.shadcnBased, "UI primitives": catalogue.stats.uiPrimitives, "With variants": catalogue.stats.withVariants, "Reused components": catalogue.stats.reused }).map(([label, value]) => <Card key={label}><CardContent className="p-4"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold tabular-nums">{value.toLocaleString()}</p></CardContent></Card>)}
      </div>
      <div className="grid min-w-0 gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Card className="min-w-0"><CardHeader className="space-y-3"><CardTitle className="text-base">Browse components</CardTitle><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, prop, file…" /></div><div className="flex flex-wrap gap-2">{["all", "shadcn-based", "custom/composed", "custom", "local UI"].map((value) => <button key={value} type="button" onClick={() => setOrigin(value)} className={`rounded-md border px-2 py-1 text-xs ${origin === value ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>{value === "all" ? "All origins" : value}</button>)}</div><p className="text-xs text-muted-foreground">Showing {filtered.length} of {items.length}</p></CardHeader><CardContent className="max-h-[70vh] space-y-2 overflow-y-auto pt-0">
          {filtered.map((item) => <button key={item.file} type="button" onClick={() => setSelectedFile(item.file)} className={`w-full rounded-lg border p-3 text-left hover:bg-muted/50 ${selected?.file === item.file ? "border-primary bg-muted/50" : "border-transparent"}`}><div className="flex items-start justify-between gap-2"><span className="break-words text-sm font-medium">{item.name}</span><Badge variant={item.origin === "shadcn-based" ? "secondary" : "outline"}>{item.origin}</Badge></div><p className="mt-1 break-all text-xs text-muted-foreground">{item.file.replace(/^src\//, "")}</p><p className="mt-2 text-xs text-muted-foreground">{item.consumerCount} consumer files · {item.usageCount} detected usages</p></button>)}
        </CardContent></Card>
        {selected ? <div className="min-w-0 space-y-4">
          <Card><CardHeader><div className="flex flex-col justify-between gap-3 sm:flex-row"><div><Badge variant={selected.origin === "shadcn-based" ? "secondary" : "outline"}>{selected.origin}</Badge><CardTitle className="mt-2 break-words text-xl">{selected.name}</CardTitle><p className="mt-2 break-all font-mono text-xs text-muted-foreground">{selected.file}</p></div><a className="text-sm underline underline-offset-4" href={`https://github.com/kidave/citizenaction/blob/main/${selected.file}`} target="_blank" rel="noreferrer">Open source ↗</a></div></CardHeader><CardContent className="grid gap-3 sm:grid-cols-3">{[["Props", selected.props.length], ["Variant groups", Object.keys(selected.variants).length], ["Consumer files", selected.consumerCount]].map(([label, value]) => <div key={label} className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-xl font-semibold">{value}</p></div>)}</CardContent></Card>
          <Tabs value={tab} onValueChange={setTab}><TabsList className="h-auto flex-wrap"><TabsTrigger value="api">Props & variants</TabsTrigger><TabsTrigger value="usage">Usage</TabsTrigger><TabsTrigger value="composition">Composition</TabsTrigger></TabsList>
            <TabsContent value="api" className="mt-4 space-y-4"><Card><CardHeader><CardTitle className="text-base">Variants and defaults</CardTitle></CardHeader><CardContent className="space-y-4">{Object.entries(selected.variants).length ? Object.entries(selected.variants).map(([name, values]) => <section key={name}><div className="mb-2 flex justify-between gap-2 text-sm font-semibold"><span>{name}</span><span className="text-xs text-muted-foreground">Default: {selected.defaults[name] || "not detected"}</span></div><div className="flex flex-wrap gap-2">{values.map((value) => <Badge key={value} variant={selected.defaults[name] === value ? "default" : "outline"}>{value}</Badge>)}</div></section>) : <p className="text-sm text-muted-foreground">No class-variance-authority variant map detected.</p>}</CardContent></Card><Card><CardHeader><CardTitle className="text-base">Props detected in source</CardTitle></CardHeader><CardContent>{selected.props.length ? <div className="flex flex-wrap gap-2">{selected.props.map((prop) => <Badge key={prop} variant="outline">{prop}</Badge>)}</div> : <p className="text-sm text-muted-foreground">No explicit props detected. Check source for inferred, forwarded, or spread props.</p>}<p className="mt-3 text-xs text-muted-foreground">Static inventory only. Native HTML props, spread attributes, dynamic values, and complex types may require manual interpretation.</p></CardContent></Card></TabsContent>
            <TabsContent value="usage" className="mt-4"><Card><CardHeader><CardTitle className="text-base">Detected usages ({selected.usageCount})</CardTitle></CardHeader><CardContent className="space-y-2">{selected.usages.length ? selected.usages.map((usage, index) => <div key={usage.file + usage.line + index} className="rounded-md border p-3"><div className="flex flex-col justify-between gap-2 sm:flex-row"><div><p className="break-all text-sm font-medium">{usage.file.replace(/^src\//, "")}</p><p className="text-xs text-muted-foreground">Line {usage.line}</p></div><a href={`https://github.com/kidave/citizenaction/blob/main/${usage.file}#L${usage.line}`} target="_blank" rel="noreferrer" className="text-xs underline">Open usage ↗</a></div><div className="mt-2 flex flex-wrap gap-1.5">{Object.entries(usage.props).map(([key, value]) => <Badge key={key} variant="outline">{key}={String(value).slice(0, 45)}</Badge>)}</div></div>) : <p className="text-sm text-muted-foreground">No usages found via statically recognized imports and JSX tags.</p>}{selected.usageCount > selected.usages.length && <p className="text-xs text-muted-foreground">Showing first {selected.usages.length} locations.</p>}</CardContent></Card></TabsContent>
            <TabsContent value="composition" className="mt-4 space-y-4"><Card><CardHeader><CardTitle className="text-base">Local component dependencies</CardTitle></CardHeader><CardContent className="space-y-2">{selected.dependencies.length ? selected.dependencies.map((dep) => <p key={dep} className="break-all rounded-md border p-3 font-mono text-xs">{dep}</p>) : <p className="text-sm text-muted-foreground">No local component or hook imports detected.</p>}</CardContent></Card><Card><CardContent className="p-4 text-sm text-muted-foreground">“shadcn-based” is a heuristic classification, not a guarantee that local code is unchanged from upstream shadcn/ui. The local UI folder can also contain custom utilities and wrappers.</CardContent></Card></TabsContent>
          </Tabs>
        </div> : <Card><CardContent className="p-8 text-sm text-muted-foreground">Select a component to inspect it.</CardContent></Card>}
      </div>
      <footer className="border-t pt-4 text-xs text-muted-foreground">Generated at build time · {catalogue.generatedAt} · Static analysis can miss dynamic component rendering.</footer>
    </main>
  </>;
}

export async function getStaticProps() {
  return { props: { catalogue: buildComponentCatalogue() } };
}
