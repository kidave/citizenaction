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

const readExitCode = (file) => {
  try {
    const value = Number.parseInt(fs.readFileSync(path.join(reportDir, file), "utf8").trim(), 10);
    return Number.isInteger(value) ? value : null;
  } catch {
    return null;
  }
};

const knip = readJson("knip.json");
const jscpd = readJson("jscpd/jscpd-report.json");
const countKnip = (key) => Array.isArray(knip?.[key]) ? knip[key].length : null;
const cloneCount = jscpd?.statistics?.total?.clones ?? jscpd?.statistics?.clones ?? null;
const clonePercentage = jscpd?.statistics?.total?.percentage ?? jscpd?.statistics?.percentage ?? null;
const knipExitCode = readExitCode("knip-exit-code.txt");
const jscpdExitCode = readExitCode("jscpd-exit-code.txt");

const statusLabel = (code, report) => {
  if (!report) return "Report unavailable";
  if (code === null) return "Report generated; exit status unavailable";
  if (code === 0) return "Completed (exit 0)";
  return `Findings or tool issue (exit ${code}); review report/log`;
};

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
  `| Knip status | ${statusLabel(knipExitCode, knip)} |`,
  `| Knip — unused files | ${countKnip("files") ?? (knip ? "See JSON report (format may differ)" : "No valid report")} |`,
  `| Knip — unused exports | ${countKnip("exports") ?? (knip ? "See JSON report (format may differ)" : "No valid report")} |`,
  `| Knip — unused dependencies | ${countKnip("dependencies") ?? (knip ? "See JSON report (format may differ)" : "No valid report")} |`,
  `| jscpd status | ${statusLabel(jscpdExitCode, jscpd)} |`,
  `| jscpd — duplicate clones | ${cloneCount ?? (jscpd ? "See JSON report (format may differ)" : "No valid report")} |`,
  `| jscpd — duplicated lines (%) | ${clonePercentage ?? (jscpd ? "See JSON report (format may differ)" : "No valid report")} |`,
  "",
  "## Reports",
  "",
  "- `knip.json`, `knip-stderr.log`, and `knip-exit-code.txt`: unused files, exports, dependencies, and tool diagnostics.",
  "- `jscpd/jscpd-report.json` and `jscpd-exit-code.txt`: duplicated-code report and command status.",
  "",
  "## Interpretation",
  "",
  "Non-zero tool exit codes can indicate findings; they are not automatically treated as a build failure. Review the detailed report and stderr before deciding what to change.",
  "",
  "These are automated candidates for review, not automatic deletion instructions. Review false positives, dynamic imports, framework conventions, and behavior before refactoring.",
  "",
  "Package dependency and vulnerability insights are handled by GitHub's native Dependency Graph and Dependabot, not duplicated here.",
  "",
  "The report is attached to this GitHub Actions run as an artifact. It does not contain environment variable values or secrets.",
  "",
];

fs.writeFileSync(path.join(reportDir, "SUMMARY.md"), lines.join("\n"));
