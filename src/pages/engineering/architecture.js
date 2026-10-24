import Head from "next/head";
import { useMemo, useState } from "react";
import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  Boxes,
  Database,
  GitBranch,
  Search,
  Workflow,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buildArchitectureMap } from "@/lib/architecture/buildArchitectureMap";

const kinds = [
  { value: "all", label: "All modules" },
  { value: "component", label: "Components" },
  { value: "hook", label: "Hooks" },
  { value: "page", label: "Pages" },
  { value: "utility", label: "Utilities & services" },
];

function shortPath(path = "") {
  return path.replace(/^src\//, "");
}

function ModuleRow({ item, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item.path)}
      className={`w-full rounded-lg border p-3 text-left transition hover:bg-muted/60 ${selected ? "border-primary bg-muted/50" : "border-transparent"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="min-w-0 break-words text-sm font-medium">{item.name}</span>
        <Badge variant="secondary" className="shrink-0 capitalize">{item.kind}</Badge>
      </div>
      <p className="mt-1 break-all text-xs text-muted-foreground">{shortPath(item.path)}</p>
      <p className="mt-2 text-xs text-muted-foreground">
        {item.imports.length} dependencies · {item.usedBy.length} consumers
      </p>
    </button>
  );
}

function RelationList({ title, icon: Icon, items, emptyText, onSelect }) {
  return (
    <section className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <Icon className="h-4 w-4 text-muted-foreground" /> {title}
        <Badge variant="outline">{items.length}</Badge>
      </h3>
      {items.length ? (
        <div className="space-y-2">
          {items.map((item) => (
            <button
              key={item.path}
              type="button"
              onClick={() => onSelect(item.path)}
              className="flex w-full items-start justify-between gap-3 rounded-md border p-3 text-left hover:bg-muted/50"
            >
              <span className="min-w-0">
                <span className="block break-words text-sm font-medium">{item.name}</span>
                <span className="mt-1 block break-all text-xs text-muted-foreground">{shortPath(item.path)}</span>
              </span>
              <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          ))}
        </div>
      ) : (
        <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">{emptyText}</p>
      )}
    </section>
  );
}

export default function ArchitecturePage({ architecture }) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [selectedPath, setSelectedPath] = useState("");
  const [activeTab, setActiveTab] = useState("dependencies");

  const modules = architecture.modules || [];
  const selected = modules.find((item) => item.path === selectedPath) || modules[0];
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return modules.filter((item) => {
      const kindMatch = kind === "all" || item.kind === kind;
      const text = `${item.name} ${item.path} ${item.backend.map((entry) => entry.target).join(" ")}`.toLowerCase();
      return kindMatch && (!needle || text.includes(needle));
    }).slice(0, 250);
  }, [modules, query, kind]);

  const byPath = useMemo(() => new Map(modules.map((item) => [item.path, item])), [modules]);
  const importedBy = (selected?.usedBy || []).map((path) => byPath.get(path)).filter(Boolean);
  const imports = (selected?.imports || []).map((path) => byPath.get(path) || { path, name: path.split("/").pop(), kind: "external" }).filter(Boolean);

  return (
    <>
      <Head>
        <title>Architecture Explorer | Citizen Action</title>
        <meta name="description" content="Explore how Citizen Action pages, components, hooks, utilities and backend references relate to each other." />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Workflow className="h-4 w-4" /> Engineering / Architecture
          </div>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Architecture Explorer</h1>
              <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                Search the codebase, select a module, and trace what it imports, what uses it, and which backend objects it references.
                This is a build-time static analysis—not a live runtime trace.
              </p>
            </div>
            <a className="text-sm font-medium underline underline-offset-4" href="/engineering/components">
              Explore component catalogue →
            </a>
            <a className="text-sm font-medium underline underline-offset-4" href="https://github.com/kidave/citizenaction/pull/111" target="_blank" rel="noreferrer">
              View analysis workflow on GitHub
            </a>
          </div>
        </header>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Analyzed modules", value: architecture.stats.modules, icon: Boxes },
            { label: "Import relationships", value: architecture.stats.edges, icon: GitBranch },
            { label: "Backend references", value: architecture.stats.backendRefs, icon: Database },
            { label: "Storybook matches", value: architecture.stats.storyMatches, icon: Activity },
          ].map(({ label, value, icon: Icon }) => (
            <Card key={label}>
              <CardContent className="flex items-center justify-between p-4">
                <div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold tabular-nums">{value.toLocaleString()}</p></div>
                <Icon className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid min-w-0 gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
          <Card className="min-w-0">
            <CardHeader className="space-y-3">
              <CardTitle className="text-base">Find a module</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search components, files, tables…" className="pl-9" />
              </div>
              <div className="flex flex-wrap gap-2">
                {kinds.map((item) => (
                  <Button key={item.value} size="sm" variant={kind === item.value ? "default" : "outline"} onClick={() => setKind(item.value)}>{item.label}</Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Showing {filtered.length} of {modules.length} modules</p>
            </CardHeader>
            <CardContent className="max-h-[70vh] space-y-2 overflow-y-auto pt-0">
              {filtered.map((item) => <ModuleRow key={item.path} item={item} selected={selected?.path === item.path} onSelect={setSelectedPath} />)}
              {!filtered.length && <p className="py-8 text-center text-sm text-muted-foreground">No modules match that search.</p>}
            </CardContent>
          </Card>

          <div className="min-w-0 space-y-4">
            {selected ? (
              <>
                <Card>
                  <CardHeader>
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div className="min-w-0">
                        <Badge variant="secondary" className="mb-2 capitalize">{selected.kind}</Badge>
                        <CardTitle className="break-words text-xl">{selected.name}</CardTitle>
                        <p className="mt-2 break-all font-mono text-xs text-muted-foreground">{selected.path}</p>
                      </div>
                      <a href={`https://github.com/kidave/citizenaction/blob/main/${selected.path}`} target="_blank" rel="noreferrer" className="shrink-0 text-sm font-medium underline underline-offset-4">Open source ↗</a>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg bg-muted/50 p-3"><p className="text-xs text-muted-foreground">Imports</p><p className="mt-1 text-xl font-semibold">{selected.imports.length}</p></div>
                    <div className="rounded-lg bg-muted/50 p-3"><p className="text-xs text-muted-foreground">Used by</p><p className="mt-1 text-xl font-semibold">{selected.usedBy.length}</p></div>
                    <div className="rounded-lg bg-muted/50 p-3"><p className="text-xs text-muted-foreground">Backend refs</p><p className="mt-1 text-xl font-semibold">{selected.backend.length}</p></div>
                  </CardContent>
                </Card>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="h-auto flex-wrap justify-start">
                    <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
                    <TabsTrigger value="backend">Backend</TabsTrigger>
                    <TabsTrigger value="storybook">Storybook & design</TabsTrigger>
                  </TabsList>
                  <TabsContent value="dependencies" className="mt-4">
                    <div className="grid gap-4 lg:grid-cols-2">
                      <Card><CardContent className="p-4"><RelationList title="Imports / depends on" icon={ArrowUpRight} items={imports} emptyText="No local imports detected." onSelect={setSelectedPath} /></CardContent></Card>
                      <Card><CardContent className="p-4"><RelationList title="Used by / consumers" icon={ArrowDownLeft} items={importedBy} emptyText="No incoming static imports detected." onSelect={setSelectedPath} /></CardContent></Card>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">Arrows describe source imports: A → B means A imports B. Dynamic imports, indirect registries and runtime-only rendering can be missed.</p>
                  </TabsContent>
                  <TabsContent value="backend" className="mt-4">
                    <Card><CardHeader><CardTitle className="text-base">Backend references in this file</CardTitle></CardHeader><CardContent>
                      {selected.backend.length ? <div className="space-y-2">{selected.backend.map((entry, index) => <div key={`${entry.kind}-${entry.target}-${index}`} className="flex flex-col gap-1 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2"><Database className="h-4 w-4 shrink-0 text-muted-foreground" /><span className="break-all text-sm font-medium">{entry.target}</span></div><div className="flex items-center gap-2"><Badge variant="outline">{entry.kind}</Badge><span className="text-xs text-muted-foreground">line {entry.line}</span></div></div>)}</div> : <p className="text-sm text-muted-foreground">No literal backend reference detected in this file. Shared services or dynamically named objects may be referenced indirectly.</p>}
                      <p className="mt-4 text-xs text-muted-foreground">References are inferred from source text. They are not proof that the table, RPC or endpoint exists or is reachable in the live Supabase project.</p>
                    </CardContent></Card>
                  </TabsContent>
                  <TabsContent value="storybook" className="mt-4">
                    <Card><CardContent className="space-y-3 p-4">
                      {selected.stories.length ? <><p className="text-sm">Potential Storybook story matches found by component/file name:</p>{selected.stories.map((story) => <a key={story} className="block break-all rounded-md border p-3 text-sm underline underline-offset-4" href={`https://github.com/kidave/citizenaction/blob/main/${story}`} target="_blank" rel="noreferrer">{story}</a>)}</> : <p className="text-sm text-muted-foreground">No story file with a matching base name was found. This does not guarantee the component has no story; stories may use a different naming convention.</p>}
                      <a href="https://github.com/kidave/citizenaction/tree/main/src/stories" target="_blank" rel="noreferrer" className="inline-block text-sm font-medium underline underline-offset-4">Browse Storybook stories ↗</a>
                    </CardContent></Card>
                  </TabsContent>
                </Tabs>
              </>
            ) : <Card><CardContent className="p-8 text-sm text-muted-foreground">Choose a module to inspect its relationships.</CardContent></Card>}
          </div>
        </div>
        <footer className="flex flex-col gap-1 border-t pt-4 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <span>Generated from source files during the Next.js build.</span>
          <span>Analysis timestamp: {architecture.generatedAt}</span>
        </footer>
      </div>
    </>
  );
}

export async function getStaticProps() {
  return { props: { architecture: buildArchitectureMap() } };
}
