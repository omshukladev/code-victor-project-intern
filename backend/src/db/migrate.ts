import fs from "fs";
import path from "path";
import  pool  from "./pool.js";
async function migrate() {
  const dir = path.join(import.meta.dirname, "migrations");

  // Create tracking table if it doesn't exist
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name VARCHAR(255) PRIMARY KEY,
      run_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Get already-run migrations
  const { rows: ran } = await pool.query(
    "SELECT name FROM _migrations ORDER BY name",
  );
  const ranSet = new Set(ran.map((r: { name: string }) => r.name));

  // Read .sql files sorted
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    if (ranSet.has(file)) {
      console.log(`⏭️  Skipping ${file} (already ran)`);
      continue;
    }

    const sql = fs.readFileSync(path.join(dir, file), "utf-8");

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO _migrations (name) VALUES ($1)", [file]);
      await client.query("COMMIT");
      console.log(`✅ Ran migration: ${file}`);
    } catch (err) {
      await client.query("ROLLBACK");
      console.error(`❌ Failed migration: ${file}`);
      throw err;
    } finally {
      client.release();
    }
  }

  console.log("🎉 All migrations up to date.");
  await pool.end();
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
