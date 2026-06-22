-- 1. Create the products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create the ultimate composite index for filtering + cursor pagination
-- This is presorted matching our exact access pattern: ORDER BY created_at DESC, id DESC
CREATE INDEX IF NOT EXISTS idx_products_pagination 
ON products (category, created_at DESC, id DESC);