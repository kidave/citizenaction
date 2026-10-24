import fs from "node:fs";
import path from "node:path";

const reportDir = path.resolve("artifacts/engineering");
fs.mkdirSync(reportDir, { recursive: true });

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(path.join(reportDir, file), "utf8"));
  } catch {
    return null;
  }
}

function readExitCode(file) {
  try {
    const value = Number.parseInt(fs.readFileSync(path.join(reportDir, file), "utf8").trim(), 10);
    return Number.isInteger(value) ? value : null;
  } catch {
    return null;
  }
}

const knip = readJson("knip.json");
const jscpd = readJson("jscpd/jscpd-report.json");
const knipIssues = Array.isArray(knip?.issues) ? knip.issues : [];
const countKnipFindings = (key) =>
  knipIssues.reduce((total, issue) => total + (Array.isArray(issue[key]) ? issue[key].length : 0), 0);
const cloneStats = jscpd?.statistics?.total ?? {};
const knipExitCode = readExitCode("knip-exit-code.txt");
const jscpdExitCode = readExitCode("jscpd-exit-code.txt");

const statusLabel = (code, report) => {
  if (!report) return "Report unavailable";
  if (code === null) return "Report generated; exit status unavailable";
  if (code === 0) return "Completed (exit 0)";
  return `Findings or tool issue (exit ${code}); review detailed report`;
};

const topClones = (Array.isArray(jscpd?.duplicates) ? jscpd.duplicates : [])
  .map((clone) => ({
    lines: clone.lines ?? 0,
    first: clone.firstFile,
    second: clone.secondFile,
  }))
  .filter((clone) => clone.first && clone.second)
  .sort((a, b) => b.lines - a.lines)
  .slice(0, 8);

const lines = [
  "# Engineering code health report",
  "",
  `- **Commit:** ${process.env.GITHUB_SHA || "local"}`,
  `- **Branch/ref:** ${process.env.GITHUB_REF_NAME || "local"}`,
  `- **Generated:** ${new Date().toISOString()}`,
  "",
  "## Summary",
  "",
  "| Check | Result |",
  "|---|---|",
  `| Knip status | ${statusLabel(knipExitCode, knip)} |`,
  `| Potentially unused files | ${Array.isArray(knip?.files) ? knip.files.length : "Unavailable"} |`,
  `| Potentially unused exports | ${knip ? countKnipFindings("exports") : "Unavailable"} |`,
  `| Potentially unused dependencies | ${knip ? countKnipFindings("dependencies") + countKnipFindings("devDependencies") + countKnipFindings("optionalPeerDependencies") : "Unavailable"} |`,
  `| Unlisted dependencies / imports | ${knip ? countKnipFindings("unlisted") : "Unavailable"} |`,
  `| jscpd status | ${statusLabel(jscpdExitCode, jscpd)} |`,
  `| Duplicate code blocks | ${cloneStats.clones ?? "Unavailable"} |`,
  `| Duplicated source lines | ${cloneStats.duplicatedLines ?? "Unavailable"} |`,
  `| Duplicated source percentage | ${cloneStats.percentage == null ? "Unavailable" : `${cloneStats.percentage}%`} |`,
  "",
  "Knip counts are candidates, not deletion instructions. Dynamic imports, Next.js page conventions, scripts, generated assets, and framework entry points can affect detection. Review each candidate before removing it.",
  "",
  "## Largest duplicate-code candidates",
  "",
  ...(topClones.length
    ? [
        "| Lines | First location | Second location |",
        "|---:|---|---|",
        ...topClones.map(({ lines: count, first, second }) =>
          `| ${count} | \`${first.name}:${first.startLoc?.line ?? first.start}\` | \`${second.name}:${second.startLoc?.line ?? second.start}\` |`),
      ]
    : ["No duplicate locations are available in the report."]),
  "",
  "These are ranked for review, not automatic extraction. Similar UI flows may intentionally differ in permissions, data loading, or side effects.",
  "",
  "## Detailed reports",
  "",
  "- `knip.json`: potentially unused files and issue categories.",
  "- `knip-stderr.log` and `knip-exit-code.txt`: diagnostics and exit status.",
  "- `jscpd/jscpd-report.json` and `jscpd-exit-code.txt`: duplicate locations and command status.",
  "",
  "Package dependency/security insights belong to GitHub's native Dependency Graph and Dependabot. Internal imports are covered by the separate Component Architecture Map workflow.",
  "",
  "Findings are report-only while we establish a trustworthy baseline. Do not delete or consolidate code based only on scanner output; confirm call sites and preserve behavior, then run the production build.",
  "",
  "The report is attached to this GitHub Actions run as an artifact and does not contain environment variable values or secrets.",
  "",
];

fs.writeFileSync(path.join(reportDir, "SUMMARY.md"), lines.join("\n"));
