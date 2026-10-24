import fs from "node:fs";
import path from "node:path";

const reportDir = path.resolve("artifacts/engineering");
fs.mkdirSync(reportDir, { recursive: true });

const readJson = (file) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(reportDir, file), "utf8"));
  } catch {
    return null;
  }
};
const exists = (file) => fs.existsSync(path.join(reportDir, file));
const knip = readJson("knip.json");
const jscpd = readJson("jscpd/jscpd-report.json") || readJson("jscpd/jscpd-report.json");
const depCruiser = readJson("dependency-cruiser.json");

const countKnip = (key) => Array.isArray(knip?.[key]) ? knip[key].length : null;
const cloneCount = jscpd?.statistics?.total?.clones ?? jscpd?.statistics?.clones ?? null;
const clonePercentage = jscpd?.statistics?.total?.percentage ?? jscpd?.statistics?.percentage ?? null;
const violations = Array.isArray(depCruiser?.summary?.violations)
  ? depCruiser.summary.violations.length
  : Array.isArray(depCruiser?.modules)
    ? depCruiser.modules.reduce((total, module) => total + (module.dependencies || []).filter((dependency) => dependency.rule?.severity === "error" || dependency.rule?.severity === "warn").length, 0)
    : null;

const lines = [
  "# Engineering code health report",
  "",
  `- **Commit:** ${process.env.GITHUB_SHA || "local"}`,
  `- **Branch/ref:** ${process.env.GITHUB_REF_NAME || "local"}`,
  `- **Generated:** ${new Date().toISOString()}`,
  "",
  "## Analysis results",
  "",
  "| Check | Result |",
  "|---|---|",
  `| Knip — unused files | ${countKnip("files") ?? (knip ? "See JSON report" : "No valid report")} |`,
  `| Knip — unused exports | ${countKnip("exports") ?? (knip ? "See JSON report" : "No valid report")} |`,
  `| Knip — unused dependencies | ${countKnip("dependencies") ?? (knip ? "See JSON report" : "No valid report")} |`,
  `| jscpd — duplicate clones | ${cloneCount ?? (jscpd ? "See JSON report" : "No valid report")} |`,
  `| jscpd — duplicated lines (%) | ${clonePercentage ?? (jscpd ? "See JSON report" : "No valid report")} |`,
  `| dependency-cruiser — reported dependency findings | ${violations ?? (depCruiser ? "See JSON report" : "No valid report")} |`,
  "",
  "## Reports",
  "",
  "- `knip.json` and `knip-stderr.log`: unused files, exports, dependencies, and configuration findings.",
  "- `jscpd/`: duplicated-code report.",
  "- `dependency-cruiser.json` and `dependency-cruiser.txt`: module graph and dependency-rule output.",
  "",
  "## Interpretation",
  "",
  "These are automated candidates for review, not automatic deletion instructions. Review false positives, dynamic imports, framework conventions, and behavior before refactoring.",
  "",
  "The report is attached to this GitHub Actions run as an artifact. It does not contain environment variable values or secrets.",
  "",
];

fs.writeFileSync(path.join(reportDir, "SUMMARY.md"), lines.join("\n"));
