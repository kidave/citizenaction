import fs from "node:fs";
import path from "node:path";
import Head from "next/head";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Code2, Search, CopyCheck, Settings2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");
const EXT = new Set([".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx"]);
const SKIP = new Set(["node_modules", ".next", ".git", "coverage", "dist", "build", ".storybook"]);
const relative = (file) => path.relative(ROOT, file).split(path.sep).join("/");

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return SKIP.has(entry.name) ? [] : walk(full);
    return EXT.has(path.extname(entry.name)) && !/\.(stories|story|test|spec)\.[^.]+$/i.test(entry.name) ? [full] : [];
  });
}

function bodyAt(source, start) {
  let depth = 0, quote = "", escaped = false, lineComment = false, blockComment = false;
  for (let i = start; i < source.length; i += 1) {
    const c = source[i], next = source[i + 1];
    if (lineComment) { if (c === "\n") lineComment = false; continue; }
    if (blockComment) { if (c === "*" && next === "/") { blockComment = false; i += 1; } continue; }
    if (quote) { if (escaped) { escaped = false; continue; } if (c === "\\") { escaped = true; continue; } if (c === quote) quote = ""; continue; }
    if (c === "/" && next === "/") { lineComment = true; i += 1; continue; }
    if (c === "/" && next === "*") { blockComment = true; i += 1; continue; }
    if (c === "\"" || c === "'" || c === "`") { quote = c; continue; }
    if (c === "{") depth += 1;
    if (c === "}" && --depth === 0) return source.slice(start + 1, i);
  }
  return "";
}

function scanFunctions(file, source) {
  const found = [];
  const patterns = [
    { type: "function", regex: /\b(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{/g },
    { type: "arrow", regex: /\b(?:export\s+)?(?:const|let)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>\s*\{/g },
  ];
  for (const pattern of patterns) for (const match of source.matchAll(pattern.regex)) {
    const start = match.index + match[0].lastIndexOf("{");
    const body = bodyAt(source, start);
    if (body.length < 12) continue;
    const normalized = body.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "").replace(/\s+/g, " ").trim();
    found.push({ name: match[1], type: pattern.type, file, line: source.slice(0, match.index).split(/\r?\n/).length, normalized });
  }
  return found;
}

function buildCatalogue() {
  const files = walk(SRC);
  const functions = files.flatMap((file) => scanFunctions(relative(file), fs.readFileSync(file, "utf8")));
  const bodies = new Map();
  for (const item of functions) {
    if (item.normalized.length < 30) continue;
    if (!bodies.has(item.normalized)) bodies.set(item.normalized, []);
    bodies.get(item.normalized).push({ name: item.name, type: item.type, file: item.file, line: item.line });
  }
  const duplicates = [...bodies.entries()].filter(([, matches]) => matches.length > 1).map(([body, matches]) => ({
    matches, preview: body.slice(0, 220), confidence: "exact-normalized-body",
  })).sort((a, b) => b.matches.length - a.matches.length);
  const rootFiles = fs.readdirSync(ROOT).filter((name) => {
    try {
      if (!fs.statSync(path.join(ROOT, name)).isFile()) return false;
    } catch { return false; }
    return /(?:config|constants?)[^/]*\.(?:js|jsx|mjs|cjs|json|ts|yml|yaml)$|^(?:next\.config|tailwind\.config|postcss\.config|eslint\.config|vitest\.config|next-sitemap\.config)\./i.test(name);
  }).map((name) => ({ file: name, category: /tailwind|next\.config|postcss|eslint|vitest|storybook|sitemap/i.test(name) ? "tooling" : "configuration candidate" }));
  const configs = [...files.map(relative).filter((file) => file.startsWith("src/config/") || /(?:config|constants?)[^/]*\.(?:js|jsx|mjs|cjs|json|ts|yml|yaml)$/i.test(path.basename(file))).map((file) => ({ file, category: file.startsWith("src/config/") ? "application config" : "constants/config candidate" }), ...rootFiles]
    .filter((item, index, list) => list.findIndex((other) => other.file === item.file) === index)
    .sort((a, b) => a.file.localeCompare(b.file));
  return {
    generatedAt: new Date().toISOString(),
    stats: { sourceFiles: files.length, functions: functions.length, duplicateGroups: duplicates.length, configurationFiles: configs.length },
    functions: functions.map(({ normalized, ...item }) => item).sort((a, b) => a.name.localeCompare(b.name) || a.file.localeCompare(b.file)),
    duplicates, configs,
    notes: [
      "Function extraction is regex-based static analysis, not a JavaScript AST. It can miss methods, callbacks, expressions without block bodies, and complex syntax.",
      "Duplicate groups require identical normalized function bodies. Similar logic with different names, constants, or formatting may not be detected.",
      "Configuration inventory lists paths only. It does not read or expose environment variable values or secrets.",
      "A local function is not automatically a shared-function candidate. Review side effects, domain ownership, and behavior before consolidating.",
    ],
  };
}

export default function CodeArchitecturePage({ catalogue }) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("functions");
  const needle = query.trim().toLowerCase();
  const functions = useMemo(() => catalogue.functions.filter((item) => !needle || `${item.name} ${item.file} ${item.type}`.toLowerCase().includes(needle)).slice(0, 500), [catalogue.functions, needle]);
  const duplicates = useMemo(() => catalogue.duplicates.filter((group) => !needle || group.matches.some((item) => `${item.name} ${item.file}`.toLowerCase().includes(needle))), [catalogue.duplicates, needle]);
  const configs = useMemo(() => catalogue.configs.filter((item) => !needle || `${item.file} ${item.category}`.toLowerCase().includes(needle)), [catalogue.configs, needle]);

  return <>
    <Head><title>Functions & Configuration | Citizen Action</title><meta name="robots" content="noindex, nofollow" /></Head>
    <main className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Code2 className="h-4 w-4" /> Engineering / Code architecture</div>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div><h1 className="text-3xl font-semibold tracking-tight">Functions & configuration</h1><p className="mt-2 max-w-3xl text-sm text-muted-foreground">Inventory local functions, exact duplicate implementations, and configuration files to help identify single-source-of-truth candidates.</p></div>
          <div className="flex flex-wrap gap-4 text-sm"><Link className="underline underline-offset-4" href="/engineering/components">Components</Link><Link className="underline underline-offset-4" href="/engineering/architecture">Architecture explorer</Link></div>
        </div>
      </header>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[[ "Source files", catalogue.stats.sourceFiles ], [ "Functions detected", catalogue.stats.functions ], [ "Exact duplicate groups", catalogue.stats.duplicateGroups ], [ "Configuration files", catalogue.stats.configurationFiles ]].map(([label, value]) => <Card key={label}><CardContent className="p-4"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold tabular-nums">{value.toLocaleString()}</p></CardContent></Card>)}
      </div>
      <Card><CardHeader className="space-y-3"><CardTitle className="text-base">Code catalogue</CardTitle><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search function, path, or configuration…" /></div>
        <Tabs value={tab} onValueChange={setTab}><TabsList className="h-auto flex-wrap"><TabsTrigger value="functions">Functions ({catalogue.stats.functions})</TabsTrigger><TabsTrigger value="duplicates">Duplicates ({catalogue.stats.duplicateGroups})</TabsTrigger><TabsTrigger value="config">Configuration ({catalogue.stats.configurationFiles})</TabsTrigger></TabsList>
          <TabsContent value="functions" className="mt-4 space-y-2">{functions.map((item, index) => <div key={item.file + item.name + item.line + index} className="rounded-md border p-3"><div className="flex flex-wrap items-center justify-between gap-2"><span className="font-mono text-sm font-medium">{item.name}()</span><Badge variant="outline">{item.type}</Badge></div><p className="mt-1 break-all text-xs text-muted-foreground">{item.file}:{item.line}</p><a className="mt-2 inline-block text-xs underline underline-offset-4" href={`https://github.com/kidave/citizenaction/blob/main/${item.file}#L${item.line}`} target="_blank" rel="noreferrer">Open source ↗</a></div>)}{!functions.length && <p className="py-6 text-sm text-muted-foreground">No functions match the search.</p>}{functions.length === 500 && <p className="text-xs text-muted-foreground">Showing the first 500 matching functions.</p>}</TabsContent>
          <TabsContent value="duplicates" className="mt-4 space-y-3">{duplicates.map((group, index) => <section key={group.matches.map((item) => item.file + item.line).join("|") + index} className="rounded-lg border p-4"><div className="mb-2 flex flex-wrap items-center gap-2"><CopyCheck className="h-4 w-4 text-muted-foreground" /><h3 className="text-sm font-semibold">Potential duplicate implementation</h3><Badge variant="outline">{group.matches.length} copies</Badge><Badge variant="secondary">Exact normalized body</Badge></div><div className="space-y-2">{group.matches.map((item) => <div key={item.file + item.line} className="flex flex-wrap items-center justify-between gap-2 text-sm"><span><span className="font-mono">{item.name}()</span><span className="text-muted-foreground"> — {item.file}:{item.line}</span></span><a className="text-xs underline underline-offset-4" href={`https://github.com/kidave/citizenaction/blob/main/${item.file}#L${item.line}`} target="_blank" rel="noreferrer">Open ↗</a></div>)}</div><pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words rounded-md bg-muted p-3 text-xs">{group.preview}{group.preview.length === 220 ? "…" : ""}</pre></section>)}{!duplicates.length && <p className="py-6 text-sm text-muted-foreground">No exact duplicate bodies detected for this search. Similar logic may still exist with different names or constants.</p>}</TabsContent>
          <TabsContent value="config" className="mt-4 space-y-2">{configs.map((item) => <div key={item.file} className="flex flex-col justify-between gap-2 rounded-md border p-3 sm:flex-row sm:items-center"><div><p className="break-all font-mono text-sm">{item.file}</p><p className="mt-1 text-xs text-muted-foreground">{item.category}</p></div><a className="text-xs underline underline-offset-4" href={`https://github.com/kidave/citizenaction/blob/main/${item.file}`} target="_blank" rel="noreferrer">Open source ↗</a></div>)}{!configs.length && <p className="py-6 text-sm text-muted-foreground">No configuration files match the search.</p>}<p className="mt-3 text-xs text-muted-foreground">Only file paths are inventoried; environment values and secrets are not read or displayed.</p></TabsContent>
        </Tabs>
      </CardHeader></Card>
      <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Settings2 className="h-4 w-4" /> Interpretation notes</CardTitle></CardHeader><CardContent className="space-y-2 text-sm text-muted-foreground">{catalogue.notes.map((note) => <p key={note}>{note}</p>)}<p>Generated at build time · {catalogue.generatedAt}</p></CardContent></Card>
    </main>
  </>;
}

export async function getStaticProps() {
  return { props: { catalogue: buildCatalogue() } };
}
