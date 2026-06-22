import pool from "./pool.js";

async function seed() {
  console.log("⏳ Checking current database state...");
  
  const client = await pool.connect();
  try {
    // Check if data already exists to prevent duplicate seeding
    const { rows } = await client.query("SELECT COUNT(*) FROM products;");
    const count = parseInt(rows[0].count, 10);

    if (count > 0) {
      console.log(`⏭️  Database already contains ${count} records. Skipping seeding.`);
      return;
    }

    console.log("⚡ Database is empty. Seeding 200,000 products instantly via native SQL...");
    console.time("⏱️  Seeding execution time");

    // Execute single batch insert natively using generate_series
    // We deduct 'i * interval' to spread timestamps sequentially backward, ensuring ordering variation
    await client.query(`
      INSERT INTO products (name, category, price, created_at, updated_at)
      SELECT 
        'Product ' || i AS name,
        (ARRAY['Electronics', 'Clothing', 'Books', 'Sports', 'Home & Kitchen'])[mod(i, 5) + 1] AS category,
        ROUND((random() * 1995 + 5)::numeric, 2) AS price,
        NOW() - (i || ' minutes')::interval AS created_at,
        NOW() - (i || ' minutes')::interval AS updated_at
      FROM generate_series(1, 200000) AS i;
    `);

    console.timeEnd("⏱️  Seeding execution time");
    console.log("✅ Successfully generated 200,000 production-ready products!");

  } catch (error) {
    console.error("❌ Error running seed script:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();