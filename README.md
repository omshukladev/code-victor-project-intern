# Technical Submission Note

## What I Chose and Why

When I first read this assignment, I knew the single biggest objective was making sure the API could handle and fetch massive bulk data fast. That is exactly why I decided to use Fastify instead of Express or Hono. Fastify has much lower overhead and handles routing faster under heavy loads. For the exact same performance reasons, I completely skipped Prisma or any other ORM and chose to use raw SQL with the native pg connection driver. An ORM would have created a massive performance bottleneck by wrapping every single record in JavaScript memory objects. Instead, raw SQL allows us to talk directly to the database engine. I also created a tailored composite database index to ensure that searching and sorting are instant and completely bypass slow sequential table scans.

## What I Learned and Engineered

Through this project, I deeply analyzed how data management scales. First, I learned that there are three distinct levels of database seeding. The first way is using a standard JavaScript loop, which most people do commonly, but running an insert statement 200,000 times would take a massive amount of time and likely crash the app. The second way is inserting data using group arrays, but it still introduces network lag. The third and absolute best way is database-native generation. By executing generate series directly inside PostgreSQL, we let the database core handle the creation in its native runtime environment. This dropped our seeding time from minutes down to a few milliseconds.

In the controller layer, I used Zod to act as a strict bouncer to validate all incoming client inputs. While most developers blindly reach for traditional offset and limit pagination, I learned that it introduces severe flaws on shifting datasets. If new products are added to the top of the stream concurrently while a user is scrolling, old items shift down and cause the user to see duplicate items on page two. To fix this, I engineered keyset cursor pagination. By passing a base64 encoded bookmark of the last seen product's timestamp and sequential ID, the database uses our composite index to execute a precise lookup. This ensures a consistent, drift-invariant timeline view even during heavy concurrent writes. I also utilized a lookahead fetch strategy by requesting one extra row beyond the client limit, saving us an entire extra count query just to determine if a next page exists.

## Future Improvements

If I had more time to expand this project, I would introduce a Redis caching layer to store frequently requested first pages and category filters, reducing the direct hit count on our Postgres pool. I would also add comprehensive integration testing using Vitest to continuously replicate heavy simultaneous write scenarios and automate database pool exhaustion limits.

## How I Used AI

I used GenAI as an architectural pair-programmer to explore optimal strategies for multi-column cursor conditions. It was incredibly helpful for drafting structural patterns and clean TypeScript interfaces. However, it did make a mistake early on by suggesting a standard pagination strategy that used string interpolation for dynamic variables. I immediately caught this because string interpolation exposes the database to severe SQL injection vulnerabilities. I corrected it by refactoring the queries to use parameterized placeholder inputs instead, keeping the raw database layer fully secure.
> docs folder contains all the AI audit logs and chat transcripts for reference.

----

# Command Line Instructions

 ### 1. Installing Dependencies

    cd backend
    npm install

  ### 2. Building the Project (Compiling TS to JS)

    npm run build

  ### 3. Running Database Migrations

    npm run migrate

  ### 4. Seeding the Database (Populating 200,000 products natively)

    npm run seed

  ### 5. Running the Local Server

  • Development Mode (auto-reload on save):
    npm run dev

  • Production Mode (running compiled JS):
    npm run start


  ### 6. Running the Test Suite (Vitest)

  • Watch Mode (stays active):
    npm run test

  • Single Run (runs once and exits):
    npm run test -- --run


# Backend routes 


> deployed on render free tier so it sleep after 15 minutes of inactivity. First request take time to wake up the server.

- MAIN : https://code-victor-project-intern.onrender.com/
- health check : https://code-victor-project-intern.onrender.com/api/health
- products : https://code-victor-project-intern.onrender.com/api/products