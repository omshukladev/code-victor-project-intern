"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// Types matching the backend response structures
interface Product {
  id: number;
  name: string;
  category: string;
  price: string | number;
  created_at: string;
  updated_at: string;
}

interface ApiMeta {
  nextCursor: string | null;
  hasNextPage: boolean;
  limit: number;
}

interface ApiResponse {
  success: boolean;
  data: Product[];
  meta?: ApiMeta;
  error?: any;
}

const CATEGORIES = [
  "All",
  "Electronics",
  "Clothing",
  "Books",
  "Sports",
  "Home & Kitchen",
];

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  
  // Loading & Render Cold Start tracking states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isWakingUp, setIsWakingUp] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Theme state
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const wakingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Read backend API URL from Next.js environment configuration
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  // Synchronize theme configuration with browser localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");
    setTheme(initialTheme);
  }, []);

  // Sync theme class directly onto the document root element
  useEffect(() => {
    if (!mounted) return;
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Core fetch function
  const fetchProducts = useCallback(
    async (cursorToken: string | null, catFilter: string, isAppend = false) => {
      setIsLoading(true);
      setErrorMessage(null);
      
      // Start Render cold-start latency timer tracking
      setElapsedTime(0);
      setIsWakingUp(false);

      if (timerRef.current) clearInterval(timerRef.current);
      if (wakingTimeoutRef.current) clearTimeout(wakingTimeoutRef.current);

      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.round((Date.now() - startTime) / 1000));
      }, 1000);

      // If the query takes more than 2 seconds, trigger the Render wake up warning banner
      wakingTimeoutRef.current = setTimeout(() => {
        setIsWakingUp(true);
      }, 2000);

      try {
        const queryParams = new URLSearchParams();
        queryParams.append("limit", "12"); // Fetch 12 items for a clean 3-column desktop layout

        if (catFilter !== "All") {
          queryParams.append("category", catFilter);
        }
        if (cursorToken) {
          queryParams.append("cursor", cursorToken);
        }

        const fetchUrl = `${apiBaseUrl}/api/products?${queryParams.toString()}`;
        const response = await fetch(fetchUrl);
        
        if (!response.ok) {
          throw new Error(`HTTP Error ${response.status}: Failed to fetch products.`);
        }

        const result: ApiResponse = await response.json();
        
        if (result.success && result.data) {
          if (isAppend) {
            setProducts((prev) => [...prev, ...result.data]);
          } else {
            setProducts(result.data);
          }

          if (result.meta) {
            setNextCursor(result.meta.nextCursor);
            setHasNextPage(result.meta.hasNextPage);
          } else {
            setNextCursor(null);
            setHasNextPage(false);
          }
        } else {
          throw new Error(result.error || "Failed to load product data.");
        }
      } catch (err: any) {
        console.error("Fetch failure:", err);
        setErrorMessage(err.message || "Network Error: Unable to connect to the backend server.");
      } finally {
        setIsLoading(false);
        setIsWakingUp(false);
        if (timerRef.current) clearInterval(timerRef.current);
        if (wakingTimeoutRef.current) clearTimeout(wakingTimeoutRef.current);
      }
    },
    [apiBaseUrl]
  );

  // Trigger initial list render
  useEffect(() => {
    fetchProducts(null, activeCategory, false);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (wakingTimeoutRef.current) clearTimeout(wakingTimeoutRef.current);
    };
  }, [activeCategory, fetchProducts]);

  // Handle pagination load-more requests
  const handleLoadMore = () => {
    if (nextCursor && !isLoading) {
      fetchProducts(nextCursor, activeCategory, true);
    }
  };

  // Handle category changes and reset paginated state bounds
  const handleCategoryChange = (category: string) => {
    if (category === activeCategory) return;
    setProducts([]);
    setNextCursor(null);
    setHasNextPage(false);
    setActiveCategory(category);
  };

  // Formatting date string helper
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  // Prevent server-side rendering hydration mismatches
  if (!mounted) {
    return (
      <div className="flex-1 min-h-screen text-[#171717] dark:text-[#ededed] selection:bg-zinc-200 dark:selection:bg-zinc-800">
        <header className="relative border-b border-[#ebebeb] dark:border-[#222222] bg-white dark:bg-[#101010] overflow-hidden py-16 px-6">
          <div className="max-w-6xl mx-auto flex flex-col gap-4 text-center items-center">
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-[-1.5px] leading-tight text-[#171717] dark:text-[#ededed] max-w-2xl">
              Product Catalog
            </h1>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-6 py-12 flex flex-col gap-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border border-[#ebebeb] dark:border-[#222222] rounded-xl bg-white dark:bg-[#121212] p-5 animate-pulse h-[162px]"></div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen text-[#171717] dark:text-[#ededed] selection:bg-zinc-200 dark:selection:bg-zinc-800 transition-colors duration-200">
      
      {/* Mesh Gradient Hero Section following Vercel aesthetics */}
      <header className="relative border-b border-[#ebebeb] dark:border-[#222222] bg-white dark:bg-[#101010] overflow-hidden py-16 px-6 transition-colors duration-200">
        
        {/* Floating Theme Toggle (Sun / Moon SVG icons) */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex items-center justify-center w-9 h-9 border border-[#ebebeb] dark:border-[#222222] rounded-lg bg-white dark:bg-[#1a1a1a] text-[#4d4d4d] dark:text-[#a1a1a1] hover:border-zinc-300 dark:hover:border-zinc-700 transition cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            {theme === "light" ? (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                ></path>
              </svg>
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707m2.828 9.9a5 5 0 117.072 0l-7.072 0z"
                ></path>
              </svg>
            )}
          </button>
        </div>

        <div className="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none">
          <div className="absolute top-[-50%] left-[-20%] w-[100%] h-[150%] rounded-full bg-gradient-to-tr from-[#007cf0] via-[#7928ca] to-[#ff4d4d] blur-[80px]"></div>
        </div>

        <div className="max-w-6xl mx-auto flex flex-col gap-4 text-center items-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-1 text-xs font-mono text-[#8f8f8f] dark:text-[#a1a1a1]">
            <span>Active Backend:</span>
            <span className="text-[#171717] dark:text-[#ededed] font-semibold">{apiBaseUrl}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-semibold tracking-[-1.5px] leading-tight text-[#171717] dark:text-[#ededed] max-w-2xl">
            Product Catalog
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-lg text-sm sm:text-base">
            Demonstrating drift-invariant keyset cursor pagination, optimized B-Tree composite indexing, and database seeding on 200,000 mock products.
          </p>
        </div>
      </header>

      {/* Main content grid */}
      <main className="max-w-6xl mx-auto px-6 py-12 flex flex-col gap-8">
        
        {/* Render free plan warning banner */}
        {isWakingUp && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 rounded-lg p-4 flex gap-3 items-start animate-fade-in shadow-sm">
            <svg
              className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              ></path>
            </svg>
            <div className="flex-1 flex flex-col gap-1">
              <h4 className="font-semibold text-sm">Backend is waking up (Render Free Plan Cold Start)</h4>
              <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                Because this project runs on Render's free tier, the database and server spin down after 15 minutes of inactivity. 
                Establishing this first connection takes **30–45 seconds**. Thank you for your patience! 
                (Subsequent page clicks will render instantly).
              </p>
              <div className="flex items-center gap-2 mt-2 font-mono text-xs text-amber-600 dark:text-amber-500">
                <span className="animate-pulse">⏳ Waking server...</span>
                <span>({elapsedTime}s elapsed)</span>
              </div>
            </div>
          </div>
        )}

        {/* API Error Display Banner */}
        {errorMessage && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-900 dark:text-red-200 rounded-lg p-4 flex gap-3 items-start">
            <svg
              className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <div className="flex-1">
              <h4 className="font-semibold text-sm">Connection Refused</h4>
              <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">{errorMessage}</p>
              <button
                onClick={() => fetchProducts(null, activeCategory, false)}
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-red-800 dark:text-red-200 border border-red-300 dark:border-red-900 rounded bg-white dark:bg-[#1a1a1a] px-2.5 py-1 hover:bg-red-50 dark:hover:bg-red-900/40 transition"
              >
                🔄 Retry Connection
              </button>
            </div>
          </div>
        )}

        {/* Categories navigation pills */}
        <section className="flex flex-col gap-3">
          <span className="text-xs font-mono text-[#8f8f8f] dark:text-[#a1a1a1] uppercase tracking-wider">
            Filter by Category
          </span>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  disabled={isLoading && !isWakingUp}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition border cursor-pointer ${
                    isActive
                      ? "bg-[#171717] dark:bg-[#ededed] border-[#171717] dark:border-[#ededed] text-white dark:text-[#171717]"
                      : "bg-white dark:bg-[#121212] border-[#ebebeb] dark:border-[#222222] text-[#4d4d4d] dark:text-[#a1a1a1] hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </section>

        {/* Product catalog display board */}
        <section>
          {products.length === 0 && !isLoading ? (
            <div className="border border-dashed border-[#ebebeb] dark:border-[#222222] rounded-xl bg-white dark:bg-[#121212] p-20 text-center flex flex-col items-center gap-2">
              <span className="text-2xl">📭</span>
              <h3 className="font-semibold text-[#171717] dark:text-[#ededed]">No Products Found</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs max-w-xs">
                There are no seeded catalog products matching the selected filters. Verify database state.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              
              {/* Actual loaded products mapping */}
              {products.map((product) => (
                <div
                  key={product.id}
                  className="border border-[#ebebeb] dark:border-[#222222] rounded-xl bg-white dark:bg-[#121212] p-5 flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition duration-200 group hover:shadow-[0_4px_12px_rgba(0,0,0,0.02)]"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-mono text-[#8f8f8f] dark:text-[#a1a1a1] bg-zinc-100 dark:bg-zinc-800/80 rounded px-1.5 py-0.5 border border-zinc-200/50 dark:border-zinc-700/50">
                        ID: {product.id}
                      </span>
                      <span className="text-xs font-mono text-[#8f8f8f] dark:text-[#a1a1a1] bg-zinc-100/50 dark:bg-zinc-800/40 rounded px-1.5 py-0.5">
                        {product.category}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm text-[#171717] dark:text-[#ededed] mt-1 group-hover:text-black dark:group-hover:text-white transition">
                      {product.name}
                    </h3>
                  </div>

                  <div className="border-t border-[#f2f2f2] dark:border-[#222222] mt-4 pt-4 flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono text-[#8f8f8f] dark:text-[#a1a1a1] uppercase">
                        Date Seeded
                      </span>
                      <span className="text-[11px] font-mono text-[#4d4d4d] dark:text-[#a1a1a1] mt-0.5">
                        {formatDate(product.created_at)}
                      </span>
                    </div>
                    <span className="font-mono text-sm font-semibold text-[#171717] dark:text-[#ededed] bg-zinc-50 dark:bg-zinc-800/40 rounded-lg px-2.5 py-1 border border-[#ebebeb] dark:border-[#222222]">
                      ${Number(product.price).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}

              {/* Pulsing loading skeletons */}
              {isLoading &&
                Array.from({ length: products.length > 0 ? 3 : 12 }).map((_, i) => (
                  <div
                    key={`skeleton-${i}`}
                    className="border border-[#ebebeb] dark:border-[#222222] rounded-xl bg-white dark:bg-[#121212] p-5 flex flex-col justify-between animate-pulse h-[162px]"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between">
                        <div className="h-4 w-12 bg-zinc-100 dark:bg-zinc-800 rounded"></div>
                        <div className="h-4 w-20 bg-zinc-100 dark:bg-zinc-800 rounded"></div>
                      </div>
                      <div className="h-5 w-3/4 bg-zinc-200 dark:bg-zinc-700 rounded mt-2"></div>
                    </div>
                    <div className="border-t border-[#f2f2f2] dark:border-[#222222] mt-4 pt-4 flex justify-between items-end">
                      <div className="flex flex-col gap-1 w-1/2">
                        <div className="h-3 w-16 bg-zinc-100 dark:bg-zinc-800 rounded"></div>
                        <div className="h-3 w-28 bg-zinc-100 dark:bg-zinc-800 rounded"></div>
                      </div>
                      <div className="h-7 w-16 bg-zinc-200 dark:bg-zinc-700 rounded-lg"></div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </section>

        {/* Load More pagination button */}
        {hasNextPage && (
          <div className="flex justify-center mt-6">
            <button
              onClick={handleLoadMore}
              disabled={isLoading}
              className="cursor-pointer border border-[#ebebeb] dark:border-[#222222] bg-white dark:bg-[#121212] text-[#171717] dark:text-[#ededed] font-semibold text-xs rounded-lg px-6 py-2.5 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900 active:bg-zinc-100 dark:active:bg-zinc-800/80 transition shadow-[0_1px_2px_rgba(0,0,0,0.02)] disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-1 h-3 w-3 text-zinc-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Loading products...</span>
                </>
              ) : (
                <>
                  <span>Load More Products</span>
                  <span className="text-[10px] font-mono text-[#8f8f8f] dark:text-[#a1a1a1] bg-zinc-100 dark:bg-zinc-800 rounded px-1.5 py-0.5 border border-zinc-200/20 dark:border-zinc-700/20">
                    +12 Items
                  </span>
                </>
              )}
            </button>
          </div>
        )}
      </main>

      {/* Plain details footer */}
      <footer className="border-t border-[#ebebeb] dark:border-[#222222] bg-white dark:bg-[#101010] py-8 px-6 text-center mt-20 transition-colors duration-200">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#8f8f8f] dark:text-[#a1a1a1] font-mono">
          <span>Catalog Endpoint: GET /api/products</span>
          <span>Designed with Vercel Geist styling rules</span>
        </div>
      </footer>
    </div>
  );
}
