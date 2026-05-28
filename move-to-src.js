/**
 * Move specific folders into src/ and fix imports everywhere.
 * Also updates jsconfig.json to set baseUrl = "src".
 */

const fs = require("fs");
const path = require("path");
const glob = require("glob");

const SRC_DIR = path.join(process.cwd(), "src");
if (!fs.existsSync(SRC_DIR)) fs.mkdirSync(SRC_DIR, { recursive: true });

const foldersToMove = ["pages", "components", "styles", "utils"];
const exts = [".js", ".jsx", ".ts", ".tsx"];
const extGlob = `{${exts.map((e) => e.slice(1)).join(",")}}`;

// Ignore these paths when searching for code files
const ignorePatterns = [
  "node_modules/**",
  ".next/**",
  "dist/**",
  "build/**",
  "coverage/**",
  "public/**",
];

// --- Update import paths ---
function rewriteSpecifier(spec, filePath) {
  const normalized = spec.replace(/\\/g, "/");

  // 1. ../../src/foo → foo
  const intoSrcMatch = normalized.match(/^(?:\.\.\/|\.\/)+src\/(.+)$/);
  if (intoSrcMatch) return intoSrcMatch[1];

  // 2. src/foo → foo
  if (normalized.startsWith("src/")) return normalized.slice(4);

  // 3. Absolute from /src/foo → foo
  if (normalized.startsWith("/src/")) return normalized.slice(5);

  // 4. Relative path inside src → convert to absolute
  if (normalized.startsWith(".") && filePath.includes("/src/")) {
    const absImportPath = path
      .resolve(path.dirname(filePath), normalized)
      .replace(process.cwd() + path.sep + "src" + path.sep, "")
      .replace(/\\/g, "/");
    return absImportPath;
  }

  return spec;
}

function rewriteCodeImports(code, filePath) {
  return code
    .replace(
      /(from\s+['"])([^'"]+)(['"])/g,
      (_, a, spec, c) => a + rewriteSpecifier(spec, filePath) + c,
    )
    .replace(
      /(export\s+[^;]*\sfrom\s+['"])([^'"]+)(['"])/g,
      (_, a, spec, c) => a + rewriteSpecifier(spec, filePath) + c,
    )
    .replace(
      /(require\(\s*['"])([^'"]+)(['"]\s*\))/g,
      (_, a, spec, c) => a + rewriteSpecifier(spec, filePath) + c,
    )
    .replace(
      /(import\(\s*['"])([^'"]+)(['"]\s*\))/g,
      (_, a, spec, c) => a + rewriteSpecifier(spec, filePath) + c,
    );
}

// --- Step 1: Move target folders ---
foldersToMove.forEach((folder) => {
  const srcPath = path.join(process.cwd(), folder);
  if (fs.existsSync(srcPath)) {
    const destPath = path.join(SRC_DIR, folder);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.renameSync(srcPath, destPath);
    console.log(`📦 Moved folder: ${folder} → src/${folder}`);
  }
});

// --- Step 2: Fix imports everywhere ---
const allFiles = glob.sync(`**/*.${extGlob}`, { ignore: ignorePatterns });

allFiles.forEach((file) => {
  const absPath = path.join(process.cwd(), file);
  const original = fs.readFileSync(absPath, "utf8");
  const rewritten = rewriteCodeImports(original, absPath);

  if (rewritten !== original) {
    fs.writeFileSync(absPath, rewritten, "utf8");
    console.log(`🔧 Fixed imports in: ${file}`);
  }
});

// --- Step 3: Update jsconfig.json ---
const jsConfigPath = path.join(process.cwd(), "jsconfig.json");
let jsConfig = {};
if (fs.existsSync(jsConfigPath)) {
  jsConfig = JSON.parse(fs.readFileSync(jsConfigPath, "utf8"));
}
jsConfig.compilerOptions = jsConfig.compilerOptions || {};
jsConfig.compilerOptions.baseUrl = "src";
fs.writeFileSync(jsConfigPath, JSON.stringify(jsConfig, null, 2));
console.log("🛠 Updated jsconfig.json baseUrl → src");

console.log("\n✅ Migration complete! Run:");
console.log("   npx prettier --write .");
