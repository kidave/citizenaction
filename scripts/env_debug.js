import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

console.log("---- ENV DEBUG START ----");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("SCRIPT DIR:", __dirname);
console.log("CWD:", process.cwd());

// Try 1: load relative
const load1 = dotenv.config({ path: ".env.local" });
console.log("LOAD 1 (.env.local relative):", load1);
console.log("DB URL #1:", process.env.DATABASE_URL);

// Try 2: load from script directory
const load2 = dotenv.config({ path: path.join(__dirname, "../.env.local") });
console.log("LOAD 2 (../.env.local):", load2);
console.log("DB URL #2:", process.env.DATABASE_URL);

// Try 3: load absolute path
const absolutePath = path.resolve(__dirname, "../.env.local");
console.log("ABSOLUTE PATH:", absolutePath);
const load3 = dotenv.config({ path: absolutePath });
console.log("LOAD 3 (absolute):", load3);
console.log("DB URL #3:", process.env.DATABASE_URL);

console.log("---- ENV DEBUG END ----");
