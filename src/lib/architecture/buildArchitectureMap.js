import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");
const CODE_EXTENSIONS = [".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx"];
const IGNORED_DIRS = new Set(["node_modules", ".next", ".git", "coverage"]);

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) return IGNORED_DIRS.has(entry.name) ? [] : walk(path.join(directory, entry.name));
    return CODE_EXTENSIONS.includes(path.extname(entry.name)) ? [path.join(directory, entry.name)] : [];
  });
}

function resolveImport(specifier, fromFile, fileSet) {
  if (!specifier.startsWith("@/") && !specifier.startsWith(".")) return null;
  const base = specifier.startsWith("@/")
    ? path.join(SRC, specifier.slice(2))
    : path.resolve(path.dirname(fromFile), specifier);
  const candidates = [
    base,
    ...CODE_EXTENSIONS.map((extension) => base + extension),
    ...CODE_EXTENSIONS.map((extension) => path.join(base, "index" + extension)),
  ];
  const match = candidates.find((candidate) => fileSet.has(candidate));
  return match ? path.relative(ROOT, match).replaceAll(path.sep, "/") : null;
}

function classify(relativePath) {
  if (relativePath.startsWith("src/pages/") && !relativePath.startsWith("src/pages/api/")) return "page";
  if (relativePath.startsWith("src/hooks/")) return "hook";
  if (relativePath.startsWith("src/components/")) return "component";
  return "utility";
}

function findBackendReferences(source) {
  const result = [];
  const patterns = [
    { kind: "table/view", regex: /\.from\(\s*["'`]([^"'`]+)["'`]\s*\)/g },
    { kind: "rpc", regex: /\.rpc\(\s*["'`]([^"'`]+)["'`]/g },
    { kind: "edge function", regex: /\.functions\.invoke\(\s*["'`]([^"'`]+)["'`]/g },
    { kind: "storage bucket", regex: /\.storage\.from\(\s*["'`]([^"'`]+)["'`]\s*\)/g },
    { kind: "API route", regex: /(?:fetch|axios\.(?:get|post|put|patch|delete))\(\s*["'`]([^"'`]*\/api\/[^"'`?]*)/g },
  ];
  for (const { kind, regex } of patterns) {
    for (const match of source.matchAll(regex)) {
      const offset = match.index || 0;
      result.push({ kind, target: match[1], line: source.slice(0, offset).split("\n").length });
    }
  }
  return result.sort((a, b) => a.line - b.line);
}

function findStories(modules, files) {
  const storyPaths = files.map((file) => path.relative(ROOT, file).replaceAll(path.sep, "/"))
    .filter((file) => /\.(stories|story)\.[jt]sx?$/.test(file));
  const storyNames = new Map();
  for (const storyPath of storyPaths) {
    const base = path.basename(storyPath).replace(/\.(stories|story)\.[jt]sx?$/, "").toLowerCase();
    if (!storyNames.has(base)) storyNames.set(base, []);
    storyNames.get(base).push(storyPath);
  }
  for (const item of modules) {
    const base = path.basename(item.path).replace(/\.[^.]+$/, "").toLowerCase();
    item.stories = storyNames.get(base) || [];
  }
}

export function buildArchitectureMap() {
  const files = walk(SRC);
  const fileSet = new Set(files);
  const records = new Map();

  for (const absolutePath of files) {
    const relativePath = path.relative(ROOT, absolutePath).replaceAll(path.sep, "/");
    const source = fs.readFileSync(absolutePath, "utf8");
    const imports = new Set();
    const importPattern = /(?:\bimport\s+(?:[\s\S]*?\s+from\s+)?|\bexport\s+(?:[\s\S]*?\s+from\s+))["']([^"']+)["']|\bimport\(\s*["']([^"']+)["']\s*\)/g;
    for (const match of source.matchAll(importPattern)) {
      const target = resolveImport(match[1] || match[2], absolutePath, fileSet);
      if (target && target !== relativePath) imports.add(target);
    }
    records.set(relativePath, {
      path: relativePath,
      name: path.basename(relativePath).replace(/\.[^.]+$/, ""),
      kind: classify(relativePath),
      imports: [...imports].sort(),
      usedBy: [],
      backend: findBackendReferences(source),
      stories: [],
    });
  }

  for (const item of records.values()) {
    for (const dependency of item.imports) {
      const target = records.get(dependency);
      if (target) target.usedBy.push(item.path);
    }
  }
  for (const item of records.values()) item.usedBy.sort();

  const modules = [...records.values()].sort((a, b) => a.path.localeCompare(b.path));
  findStories(modules, files);
  return {
    generatedAt: new Date().toISOString(),
    stats: {
      modules: modules.length,
      edges: modules.reduce((sum, item) => sum + item.imports.length, 0),
      backendRefs: modules.reduce((sum, item) => sum + item.backend.length, 0),
      storyMatches: modules.filter((item) => item.stories.length).length,
    },
    modules,
  };
}
