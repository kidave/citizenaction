// lib/db.js
import pkg from 'pg';
const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("❌ DATABASE_URL is missing in environment variables");
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }  // REQUIRED for Supabase
});

export async function query(text, params) {
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (err) {
    console.error("❌ DB ERROR:", err);
    throw err;
  }
}

export default pool;
