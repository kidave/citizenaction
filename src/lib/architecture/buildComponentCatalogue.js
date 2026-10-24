import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");
const EXTENSIONS = [".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx"];
const SKIP = new Set(["node_modules", ".next", ".git", "coverage", ".storybook"]);

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) return SKIP.has(entry.name) ? [] : walk(path.join(dir, entry.name));
    return EXTENSIONS.includes(path.extname(entry.name)) ? [path.join(dir, entry.name)] : [];
  });
}

function relative(file) {
  return path.relative(ROOT, file).split(path.sep).join("/");
}

function extractVariants(source) {
  const variants = {};
  const start = source.indexOf("variants:");
  if (start < 0) return { variants, defaults: {} };
  const end = source.indexOf("defaultVariants:", start);
  const section = source.slice(start, end > -1 ? end : source.length);
  const variantBlock = /([A-Za-z_$][\w$]*)\s*:\s*\{([\s\S]*?)\n\s*\}/g;
  for (const match of section.matchAll(variantBlock)) {
    const values = [...match[2].matchAll(/(?:^|\n)\s*([A-Za-z_$][\w$]*)\s*:/g)].map((item) => item[1]);
    if (values.length) variants[match[1]] = [...new Set(values)];
  }
  const defaults = {};
  const defaultsStart = source.indexOf("defaultVariants:");
  if (defaultsStart > -1) {
    const defaultsEnd = source.indexOf("}", defaultsStart);
    const block = source.slice(defaultsStart, defaultsEnd > -1 ? defaultsEnd : source.length);
    for (const match of block.matchAll(/([A-Za-z_$][\w$]*)\s*:\s*["']([^"']+)["']/g)) defaults[match[1]] = match[2];
  }
  return { variants, defaults };
}

function extractProps(source) {
  const props = new Set();
  const jsDoc = source.match(/@typedef\s*\{[\s\S]*?\}\s*([A-Za-z_$][\w$]*Props)/);
  if (jsDoc) {
    const typedefStart = source.indexOf("@typedef");
    const typedefEnd = source.indexOf("*/", typedefStart);
    const block = source.slice(typedefStart, typedefEnd > -1 ? typedefEnd : typedefStart + 2000);
    for (const match of block.matchAll(/\b([A-Za-z_$][\w$]*)\??\s*:/g)) props.add(match[1]);
  }
  for (const match of source.matchAll(/\{\s*([^{}\n]{1,300})\s*\}\s*(?:=>|\))/g)) {
    for (const part of match[1].split(",")) {
      const prop = part.trim().match(/^([A-Za-z_$][\w$]*)(?:\s*=|$)/);
      if (prop && !["return", "const", "let", "var"].includes(prop[1])) props.add(prop[1]);
    }
  }
  return [...props].filter((prop) => !["className", "children", "ref", "props"].includes(prop)).sort();
}

function originFor(file, source) {
  if (file.startsWith("src/components/ui/")) {
    if (/class-variance-authority|@radix-ui\/|@base-ui\/|from ["']lucide-react/.test(source)) return "shadcn-based";
    if (/shadcn|@radix-ui\/|@base-ui\//.test(source)) return "shadcn-based";
    return "local UI";
  }
  if (/from ["']@\/components\/ui\//.test(source)) return "custom/composed";
  return "custom";
}

function componentName(file, source) {
  const named = source.match(/(?:function|const|class)\s+([A-Z][A-Za-z0-9_$]*)/);
  if (named) return named[1];
  return path.basename(file).replace(/\.[^.]+$/, "").replace(/(^|-|_)([a-z])/g, (_, __, letter) => letter.toUpperCase());
}

function collectUsages(files, components) {
  for (const file of files) {
    if (file.includes(".stories.") || file.includes(".story.")) continue;
    const source = fs.readFileSync(file, "utf8");
    const rel = relative(file);
    const importAliases = new Map();
    for (const match of source.matchAll(/import\s+(?:\{\s*([\s\S]*?)\s*\}|([A-Za-z_$][\w$]*))\s+from\s+["']([^"']+)["']/g)) {
      const specifier = match[3];
      if (!specifier.startsWith("@/") && !specifier.startsWith(".")) continue;
      const names = (match[1] || match[2] || "").split(",").map((entry) => {
        const parts = entry.trim().split(/\s+as\s+/);
        return { imported: parts[0], local: parts[1] || parts[0] };
      });
      for (const entry of names) {
        const targetName = path.basename(specifier).replace(/\.[^.]+$/, "");
        const target = components.find((item) => item.name === entry.imported || item.file.endsWith("/" + targetName + ".jsx") || item.file.endsWith("/" + targetName + ".js"));
        if (target) importAliases.set(entry.local, target);
      }
    }
    for (const [alias, item] of importAliases) {
      const jsx = new RegExp("<" + alias + "\\b([^>]*)>", "g");
      for (const match of source.matchAll(jsx)) {
        const attributes = {};
        for (const attr of match[1].matchAll(/([A-Za-z_$][\w$:-]*)(?:\s*=\s*(?:["']([^"']*)["']|\{([^}]+)\}))?/g)) {
          const key = attr[1];
          if (key === "key" || key === "ref" || key.startsWith("on")) continue;
          attributes[key] = attr[2] !== undefined ? attr[2] : attr[3] !== undefined ? attr[3].trim() : "true";
        }
        item.usages.push({ file: rel, line: source.slice(0, match.index).split("\n").length, props: attributes });
      }
    }
  }
}

export function buildComponentCatalogue() {
  const files = walk(SRC);
  const componentFiles = files.filter((file) => file.includes("/components/") && !/\.(stories|story)\./.test(file));
  const components = componentFiles.map((file) => {
    const source = fs.readFileSync(file, "utf8");
    const { variants, defaults } = extractVariants(source);
    return {
      name: componentName(file, source),
      file: relative(file),
      origin: originFor(relative(file), source),
      variants,
      defaults,
      props: extractProps(source),
      usages: [],
      dependencies: [...new Set([...source.matchAll(/from\s+["']([^"']+)["']/g)].map((match) => match[1]).filter((name) => name.startsWith("@/components/") || name.startsWith("@/hooks/")))],
      hasStory: files.some((candidate) => candidate.includes(".stories.") && path.basename(candidate).toLowerCase().includes(path.basename(file).replace(/\.[^.]+$/, "").toLowerCase())),
    };
  });
  collectUsages(files, components);
  for (const item of components) {
    const byFile = new Map();
    for (const usage of item.usages) {
      if (!byFile.has(usage.file)) byFile.set(usage.file, []);
      byFile.get(usage.file).push(usage);
    }
    item.consumerCount = byFile.size;
    item.usageCount = item.usages.length;
    item.usages = item.usages.slice(0, 120);
  }
  const uiComponents = components.filter((item) => item.file.startsWith("src/components/ui/"));
  return {
    generatedAt: new Date().toISOString(),
    stats: {
      components: components.length,
      shadcnBased: components.filter((item) => item.origin === "shadcn-based").length,
      withVariants: components.filter((item) => Object.keys(item.variants).length).length,
      reused: components.filter((item) => item.consumerCount > 1).length,
      uiPrimitives: uiComponents.length,
    },
    components: components.sort((a, b) => a.name.localeCompare(b.name)),
  };
}
