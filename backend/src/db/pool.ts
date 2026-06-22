import pg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  // If DATABASE_URL is missing, we don't throw immediately so build/test steps can pass without env set up,
  // but we warn and will fail on queries.
  console.warn("⚠️ Warning: DATABASE_URL is not set in environment variables.");
}


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default pool;
