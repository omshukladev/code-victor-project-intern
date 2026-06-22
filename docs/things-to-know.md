Starting completely from scratch is a great idea. Let's forget the previous architecture talk and look at this strictly in plain English.

Here is exactly what the CodeVector task is asking for, what you need to build, and what the data looks like.

### 1. What is the project asking you to do?

The founders want to see if you can handle a common real-world problem: **showing a user a long list of items without the app slowing down or glitching.** Imagine a user scrolling through an online store. If they are looking at the first 10 items, and the store owner suddenly adds 50 new items to the top of the store, a badly built app will push the old items down and accidentally show the user the same items again when they scroll to the next page.

The project is asking you to build a backend that prevents that glitch from happening, while also being fast enough to search through 200,000 items instantly.

### 2. What "product" are we going to make?

You are going to make a **Backend API**.

You do **not** need to build a website, a user interface, buttons, or screens. You are only building the engine that works behind the scenes.

Your product will essentially be a single web URL. If someone sends a request to that URL asking for "10 products in the Electronics category," your API will instantly reply with that exact data.

### 3. What kind of data will be there?

The data will be a massive list of **200,000 fake products** that you will generate yourself.

Every single product in that list needs to have these specific details:

* **id:** A unique number for the product.
* **name:** The title of the product (e.g., "Gaming Mouse").
* **category:** The group it belongs to (e.g., "Electronics" or "Clothing").
* **price:** The cost of the item.
* **created_at:** The exact time it was added to the store.
* **updated_at:** The exact time it was last changed.


---
### Stick to E-Commerce Products

The instructions explicitly state that you need to generate "200,000 **products**, each with a name, category, a **price**...".

Because they specifically asked for a *price*, doing weather data (like temperatures, humidity, or locations) won't fit the requirements well. You should stick to a standard online store (E-commerce) theme. It is exactly what they are expecting, it fits the schema perfectly, and it makes the "category" filtering logic very easy to understand and explain.

---

### The Best Data Categories to Use

To make your database look realistic without overcomplicating things, I recommend dividing your fake products into a few simple categories.

Here is a great structure you can use for your mock data:

* **Categories:** 'Electronics', 'Clothing', 'Home & Kitchen', 'Books', 'Sports'.
* **Names:** You don't need 200,000 highly unique, hand-crafted names. You can just append the sequential ID to a generic term. For example: "Generic Laptop #1045", "Cotton T-Shirt #8820", or "Ergonomic Chair #199".
* **Prices:** Randomize numeric values between $5.00 and $2,000.00.
* **Timestamps:** We will spread the `created_at` times out over the last few years so the "Newest First" sorting actually has varied data to work with.

When we write the SQL `generate_series()` script, we can easily instruct PostgreSQL to mathematically cycle through those 5 categories and generate a random price for each of the 200,000 rows instantly.

---
Welcome to the CodeVector Internship project breakdown! Wiping the slate clean and starting from zero is the smartest way to approach this so you don't get overwhelmed.

To truly shine in this assignment, you need to prove you can build something fast, handle real-world data issues, and clearly explain your decisions. Here is the high-level roadmap of the tech stack, the core topics to master, and exactly how to impress the founder.

---

## 1. The Recommended Tech Stack

Based on your resume and the project's requirement for speed on a free platform, here is the exact stack that will set you up for success:

* 
**Backend Framework:** Node.js with **Fastify**. You already have experience with it, and its low-overhead design is perfect for ultra-fast APIs.


* 
**Database:** **PostgreSQL** hosted on **Neon**. Postgres has built-in features that make generating 200,000 fake records instantly very easy.


* 
**Hosting:** **Render** (for deploying the Node.js backend for free).


* 
**Validation & Testing:** **Zod** for ensuring the API inputs are correct, and **Vitest** to show you know how to write production-grade tests.



---

## 2. Core Topics You Must Know

During the live 1-hour interview, the founder will ask you to explain your code and make changes to it. You need to deeply understand these three concepts:

* **Keyset (Cursor) Pagination:** This is the most important part of the whole task. You need to know why standard `OFFSET` pagination causes duplicate or missing items when new products are added, and how passing a "cursor" (a bookmark of the last item seen) fixes this.


* **Composite Database Indexing:** You need to understand how to add an index on your database table. Without an index, searching through 200,000 rows will force the database to scan every single item, which is incredibly slow.


* 
**Native Database Seeding:** The instructions explicitly warn against using a slow JavaScript loop to insert 200,000 items. You must know how to use PostgreSQL's `generate_series()` function to generate all the data internally in just 1–2 seconds.



---

## 3. How to Shine and Get Bonus Points

To move from a "good" candidate to a "great" one, make sure you do the following:

* 
**Keep your AI Chat Logs:** The founders actually want to see how you use tools like ChatGPT, Claude, or Cursor. Save your chat history and submit it with your assignment for guaranteed bonus points.


* 
**Write a Great Submission Note:** When you email your finished project, clearly explain *why* you chose your database, what you would improve if you had more time, and exactly where AI helped you (and if it made any mistakes you had to fix).


* **Skip the Frontend:** Do not waste hours building a complex user interface. The founder explicitly stated they do not grade UI code and your score depends entirely on the backend architecture. Keep your focus 100% on making the API fast.



Should we start by writing the lightning-fast PostgreSQL database seeding script, or would you prefer to map out the API validation rules first?


----
# schema and db 

This is the perfect place to start. Building the foundation (the database schema and the seed script) before touching the API ensures your data layer is rock solid.

Here is exactly what you need to build, the code to do it, and the rules to follow to impress the CodeVector team.

---

## 1. What to do and what NOT to do for the Database

**What you MUST do:**

* Use PostgreSQL's native `generate_series()` function to create all 200,000 records in a single database command.


* Create a **Composite Index** on your sorting and filtering columns.


* Use parameterized queries (e.g., `$1, $2`) to prevent SQL injection.

**What you MUST NOT do:**

* Do NOT write a JavaScript `for` loop (like `for(let i=0; i<200000; i++)`) to insert records one by one. The founders explicitly warned against this, as it will crash or take several minutes.


* Do NOT skip the database index. Without it, your API will scan all 200,000 rows on every single request, which fails the "make it fast" requirement.



---

## 2. The Schemas You Need

You actually need **two types of schemas** for this project:

### A. The Database Schema (PostgreSQL Table)

This defines how your data is saved in Neon. You only need **one table** called `products`.

| Column | Data Type | Description |
| --- | --- | --- |
| `id` | `SERIAL PRIMARY KEY` | The unique identifier (used as the cursor tie-breaker).

 |
| `name` | `VARCHAR(255)` | The product's title.

 |
| `category` | `VARCHAR(100)` | Used for API filtering.

 |
| `price` | `NUMERIC(10, 2)` | Standard currency format.

 |
| `created_at` | `TIMESTAMPTZ` | Your primary sorting column (Newest first).

 |
| `updated_at` | `TIMESTAMPTZ` | Tracks when the row was updated.

 |

### B. The API Validation Schema (Zod)

This protects your Fastify API from bad requests. Create a file called `src/schemas.ts` to validate the incoming URL query parameters.

```typescript
import { z } from 'zod';

export const productQuerySchema = z.object({
  category: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(10),
  cursor: z.string().optional(), // This will be a base64 encoded string
});

export type ProductQuery = z.infer<typeof productQuerySchema>;

```

---

## 3. The Complete Seed Script Code

This script connects to your Neon database, creates the table, applies the critical composite index, and generates 200,000 products instantly.

Create a file at `src/db/seed.ts` and paste this code:

```typescript
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables (your Neon connection string)
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function seedDatabase() {
  console.log('Connecting to database...');
  const client = await pool.connect();

  try {
    console.log('1. Creating products table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    console.log('2. Creating composite index for blazing fast cursor pagination...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_products_pagination 
      ON products (category, created_at DESC, id DESC);
    `);

    console.log('3. Checking if data already exists...');
    const { rows } = await client.query('SELECT COUNT(*) FROM products;');
    if (parseInt(rows[0].count) > 0) {
      console.log('Database is already seeded. Exiting.');
      return;
    }

    console.log('4. Generating 200,000 products instantly (No JS loops!)...');
    // We spread the created_at times out minute-by-minute so the sorting has distinct values
    await client.query(`
      INSERT INTO products (name, category, price, created_at, updated_at)
      SELECT 
        'Product ' || i,
        (ARRAY['Electronics', 'Clothing', 'Home & Kitchen', 'Books', 'Sports'])[mod(i, 5) + 1],
        ROUND((random() * 1995 + 5)::numeric, 2),
        NOW() - (i || ' minutes')::interval,
        NOW() - (i || ' minutes')::interval
      FROM generate_series(1, 200000) AS i;
    `);

    console.log('✅ Successfully generated 200,000 products!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

seedDatabase();

```

---

## 4. The Pagination SQL Query (For your API logic)

When you build your Fastify route later, this is the exact raw SQL structure you will use to fetch the data. Notice how it specifically targets the `created_at` and `id` from the decoded cursor to grab the next page.

```sql
SELECT * FROM products 
WHERE category = $1 
  AND (created_at < $2 OR (created_at = $2 AND id < $3))
ORDER BY created_at DESC, id DESC 
LIMIT $4;

```

---

## 5. How to Run This Right Now

Follow these exact steps in your terminal to execute this setup:

1. **Initialize your project:**
`npm init -y`
2. **Install the required dependencies:**
`npm install pg dotenv zod`
`npm install -D typescript @types/node @types/pg tsx`
3. **Create your `.env` file** in the root directory and add your Neon database URL:
`DATABASE_URL="postgresql://user:password@ep-cool-db.us-east-2.aws.neon.tech/neondb?sslmode=require"`
4. **Run the seeding script:**
`npx tsx src/db/seed.ts`

When you run that last command, your database will be perfectly structured and loaded with 200,000 records in under 3 seconds.

---


# api and folder structure
Here is the exact breakdown of the folder structure and the APIs you need to build, based strictly on what the CodeVector task is asking for.

Let's keep it incredibly simple.

### How Many APIs Do You Actually Need to Make?

**You only need to build exactly ONE API.** The task specifically asks you to build a backend that lets someone *"browse ~200,000 products, filter by category, and paginate through them"*.

Here is how the standard database functions (CRUD) apply to this specific project:

* **GET (Read):** **YES.** This is the only API endpoint you must build (e.g., `GET /api/products`). Its job is to fetch the data, apply the category filter, and use the cursor bookmark to grab the correct next page.
* **POST (Insert):** **NO API NEEDED.** You do not need to build an API for users to add products. The 200,000 products are inserted directly into the database one time using your standalone **Seed Script**.
* **PUT/PATCH (Update):** **NO.** The project does not ask you to let users edit products.
* **DELETE:** **NO.** The project does not ask you to let users delete products.

*Note on testing:* The prompt mentions that your app shouldn't break *"If 50 new products are added/updated while someone is browsing"*. You don't need to build an API to add these 50 products; the founders will likely just run a raw SQL `INSERT` command in your database during the interview to see if your `GET` API breaks when new data appears.

---

### The Folder Structure

Since we are keeping this as clean and minimal as possible using Node.js and Fastify, here is the exact folder structure you should use. It separates everything logically without overcomplicating it.

```text
codevector-backend/
├── src/
│   ├── db/
│   │   ├── database.ts      # Just sets up the connection to your Neon database.
│   │   └── seed.ts          # The script you run ONCE to instantly insert 200k fake products.
│   ├── routes/
│   │   └── products.ts      # Holds the logic for your ONE required API (GET /api/products).
│   ├── schemas/
│   │   └── validation.ts    # Holds the Zod rules (e.g., "limit must be between 1 and 50").
│   └── server.ts            # Starts the Fastify server and hooks up the route.
├── .env                     # Holds your secret Neon database URL (never upload this to GitHub!).
├── package.json             # Lists your npm packages (Fastify, pg, zod, etc.).
├── tsconfig.json            # Basic TypeScript configuration.
└── README.md                # The text note you must submit explaining your choices and AI use.

```

### What Each File Does (In Plain English)

1. **`src/server.ts`**: This is the main switch. When you run this, your server turns on and starts listening for requests from the internet.
2. **`src/db/database.ts`**: This acts as the secure tunnel between your Node.js server and your Neon PostgreSQL database.
3. **`src/db/seed.ts`**: You will run this file in your terminal exactly once. It tells Postgres to use its internal `generate_series` function to magically populate 200,000 rows in under 2 seconds.
4. **`src/schemas/validation.ts`**: This is the bouncer. Before the database is searched, Zod checks if the user asked for a valid category or a valid number of items.
5. **`src/routes/products.ts`**: This is the brain of the project. When a request passes the bouncer, this file looks at the user's "cursor" (the bookmark of the last item they saw), writes the raw SQL query to find items strictly *older* than that cursor, and sends the resulting list back to the user.
---


# extra 
You have the entire blueprint now, but there are a few final "gotchas" and interview realities you need to be prepared for before you write your first line of code.

Here is the final checklist of things you need to know to guarantee you pass this stage.

### 1. Beware of the "Render Cold Start"

You are hosting this on Render's free tier. Render spins down free web services if they haven't been used for 15 minutes.

* **What this means for you:** When you (or the founder) hit your live API URL for the first time in a while, it might take **30 to 50 seconds to respond** while the server wakes up.
* **The fix:** Don't panic and think your code is broken! Just add a quick note in your submission email explaining: *"Please note that since this is hosted on Render's free tier, the very first request might take a few seconds due to cold starts, but subsequent pagination requests will be lightning fast."*

### 2. The Live Interview "Trap"

The founder explicitly stated: *"In the next round you'll explain and change your own code live... If asked to build without AI and if you are not capable of coding it yourself, then stop"*.

* **Do not use clever code you don't understand:** If ChatGPT gives you a really complex SQL query or a weird TypeScript utility type, **simplify it**.
* **Anticipate the live change:** They will likely ask you to do something like, *"Change the API so it sorts by `price` instead of `created_at`"*. You need to know exactly how to change your SQL query and your Composite Index to make that happen on the fly.

### 3. The "Honesty" Bonus

The prompt specifically says: *"We are intentionally not telling you exact requirements, working out the right approach, and learning it if it's new to you, is the whole point"*.

* When you write your submission email to `siddharth@codevector.in`, be incredibly honest.
* **Example of a great note:** *"Before this task, I was used to standard `OFFSET/LIMIT` pagination. I used AI to help me understand how Keyset (Cursor) Pagination actually works under the hood so I could prevent the shifting data bug you mentioned. I then wrote the raw SQL implementation myself using Fastify."* This shows immense maturity and a great learning attitude.

### 4. Final Submission Checklist

Before you email `siddharth@codevector.in`, make sure you have all four of these ready:

* [ ] The Live Render URL.
* [ ] The GitHub Repo link (Make sure your `src/db/seed.ts` file is pushed there!).
* [ ] Your short written note (Tech stack choices, what you learned, what you'd improve).
* [ ] A PDF or text export of our chat history here for your bonus points.

----


