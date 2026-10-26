import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourceRoots = ["src/pages", "src/components", "src/hooks", "src/lib", "src/context", "src/utils", "src/services"];
const extensions = new Set([".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"]);
const ignoredName = /\.(?:stories|story|test|spec)\.[^.]+$/i;
const references = [];
const scannedFiles = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".next", "dist", "build", "coverage", ".storybook"].includes(entry.name)) continue;
      walk(fullPath);
    } else if (extensions.has(path.extname(entry.name)) && !ignoredName.test(entry.name)) {
      scanFile(fullPath);
    }
  }
}

function addReference(file, source, index, kind, target) {
  const line = source.slice(0, index).split(/\r?\n/).length;
  const expression = (source.split(/\r?\n/)[line - 1] ?? "").trim().replace(/\s+/g, " ").slice(0, 180);
  references.push({
    sourceFile: path.relative(root, file).split(path.sep).join("/"),
    line, kind, target, expression, evidence: "static-source-reference"
  });
}

function scanFile(file) {
  const source = fs.readFileSync(file, "utf8");
  scannedFiles.push(path.relative(root, file).split(path.sep).join("/"));
  const patterns = [
    { kind: "supabase-table-or-view", regex: /\.from\s*\(\s*([\'"])([^\'"\\]+)\1\s*\)/g, filter: (m, index) => {
      const before = source.slice(Math.max(0, index - 70), index);
      return !/\.storage\s*$/.test(before) && !/\bArray\s*$/.test(before);
    } },
    { kind: "supabase-storage-bucket", regex: /\.storage\s*\.\s*from\s*\(\s*([\'"])([^\'"\\]+)\1\s*\)/g },
    { kind: "supabase-rpc", regex: /\.rpc\s*\(\s*([\'"])([^\'"\\]+)\1/g },
    { kind: "supabase-edge-function", regex: /\.functions\s*\.\s*invoke\s*\(\s*([\'"])([^\'"\\]+)\1/g },
    { kind: "http-api-route", regex: /\bfetch\s*\(\s*([\'"`])((?:\/api\/)[^\'"`]+)\1/g }
  ];
  for (const pattern of patterns) {
    pattern.regex.lastIndex = 0;
    let match;
    while ((match = pattern.regex.exec(source)) !== null) {
      if (pattern.filter && !pattern.filter(match, match.index)) continue;
      addReference(file, source, match.index, pattern.kind, match[2]);
    }
  }
}

for (const relativeRoot of sourceRoots) walk(path.join(root, relativeRoot));
references.sort((a, b) => a.sourceFile.localeCompare(b.sourceFile) || a.line - b.line || a.kind.localeCompare(b.kind) || a.target.localeCompare(b.target));

const outputDir = path.join(root, "artifacts", "component-map");
fs.mkdirSync(outputDir, { recursive: true });
const report = {
  generatedAt: new Date().toISOString(),
  repositoryRef: process.env.GITHUB_SHA ?? "local",
  scannedFileCount: scannedFiles.length,
  referenceCount: references.length,
  notes: [
    "This report finds literal source-code references; it does not prove that a call runs at runtime.",
    "Dynamic table names, wrapped clients, SQL assembled indirectly, and generated API calls can be missed.",
    "Backend references are not yet joined to ReactGraph import relationships in this first report.",
    "A reference does not prove the object exists in live Supabase; validate against live schema or migrations."
  ],
  references
};
fs.writeFileSync(path.join(outputDir, "supabase-usage.json"), JSON.stringify(report, null, 2) + "\n");
const csvValue = (value) => '"' + String(value ?? "").replaceAll('"', '""') + '"' ;
const headers = ["sourceFile", "line", "kind", "target", "expression", "evidence"];
const csv = [headers.join(","), ...references.map((row) => headers.map((key) => csvValue(row[key])).join(","))].join("\n");
fs.writeFileSync(path.join(outputDir, "supabase-usage.csv"), csv + "\n");
const counts = references.reduce((acc, item) => { acc[item.kind] = (acc[item.kind] ?? 0) + 1; return acc; }, {});
const lines = [
  "# Component map: Supabase references",
  "",
  "Generated: " + report.generatedAt,
  "Source files scanned: " + report.scannedFileCount,
  "Literal references found: " + report.referenceCount,
  "",
  "## Reference counts",
  "",
  ...Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => "- " + key + ": " + value),
  "",
  "## Limitations",
  "",
  ...report.notes.map((note) => "- " + note),
  ""
];
fs.writeFileSync(path.join(outputDir, "README.md"), lines.join("\n"));
console.log("Scanned " + scannedFiles.length + " source files; found " + references.length + " literal backend references.");
console.log("Wrote artifacts/component-map/supabase-usage.json and supabase-usage.csv");
