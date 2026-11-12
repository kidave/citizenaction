import { spawn } from "child_process";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  const script = path.join(
    process.cwd(),
    "src",
    "standards",
    "engine",
    "extract.py",
  );

  const python = spawn("python", [script]);

  let stdout = "";
  let stderr = "";

  python.stdout.on("data", (data) => {
    stdout += data.toString();
  });

  python.stderr.on("data", (data) => {
    stderr += data.toString();
  });

  python.on("close", (code) => {
    if (code !== 0) {
      return res.status(500).json({
        success: false,
        error: stderr,
      });
    }

    try {
      const result = JSON.parse(stdout);

      return res.status(200).json(result);
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: stdout,
      });
    }
  });
}
