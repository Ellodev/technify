"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fetchArticles, fetchCategories, fetchSources } from "@/lib/api";
import type { Article, Category, Filters, Source } from "@/types/news";
import Header from "./Header";
import FilterBar from "./FilterBar";
import ArticleCard, { ArticleCardSkeleton } from "./ArticleCard";

const EMPTY_FILTERS: Filters = {
  sources: [],
  categories: [],
  q: "",
  sinceHours: null,
  sort: "newest",
};

function filtersFromParams(params: URLSearchParams): Filters {
  return {
    sources: params.get("sources")?.split(",").filter(Boolean) ?? [],
    categories: params.get("categories")?.split(",").filter(Boolean) ?? [],
    q: params.get("q") ?? "",
    sinceHours: params.get("since") ? Number(params.get("since")) : null,
    sort: params.get("sort") === "oldest" ? "oldest" : "newest",
  };
}

function paramsFromFilters(filters: Filters): string {
  const params = new URLSearchParams();
  if (filters.sources.length) params.set("sources", filters.sources.join(","));
  if (filters.categories.length) params.set("categories", filters.categories.join(","));
  if (filters.q) params.set("q", filters.q);
  if (filters.sinceHours) params.set("since", String(filters.sinceHours));
  if (filters.sort !== "newest") params.set("sort", filters.sort);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export default function NewsApp() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<Filters>(() =>
    filtersFromParams(new URLSearchParams(searchParams.toString())),
  );
  const [sources, setSources] = useState<Source[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  useEffect(() => {
    fetchSources().then(setSources).catch(() => {});
    fetchCategories().then(setCategories).catch(() => {});
  }, []);

  // Reload page 1 whenever filters change (debounced for typing in search).
  useEffect(() => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    const timer = setTimeout(async () => {
      try {
        const data = await fetchArticles(filters, 1);
        if (id !== requestId.current) return;
        setArticles(data.items);
        setTotal(data.total);
        setPage(1);
        setHasMore(data.has_more);
      } catch {
        if (id !== requestId.current) return;
        setError("Couldn't load the news. Is the backend running?");
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    }, 250);

    window.history.replaceState(null, "", `/${paramsFromFilters(filters)}`);
    return () => clearTimeout(timer);
  }, [filters]);

  const loadMore = useCallback(async () => {
    setLoadingMore(true);
    try {
      const next = page + 1;
      const data = await fetchArticles(filters, next);
      setArticles((prev) => {
        const seen = new Set(prev.map((a) => a.id));
        return [...prev, ...data.items.filter((a) => !seen.has(a.id))];
      });
      setPage(next);
      setHasMore(data.has_more);
    } catch {
      setError("Couldn't load more articles.");
    } finally {
      setLoadingMore(false);
    }
  }, [filters, page]);

  const activeFilterCount = useMemo(
    () =>
      filters.sources.length +
      filters.categories.length +
      (filters.q ? 1 : 0) +
      (filters.sinceHours ? 1 : 0),
    [filters],
  );

  return (
    <div className="min-h-screen">
      <Header
        query={filters.q}
        onQueryChange={(q) => setFilters((f) => ({ ...f, q }))}
      />

      <main className="mx-auto max-w-6xl px-4 pb-20">
        <FilterBar
          filters={filters}
          sources={sources}
          categories={categories}
          onChange={setFilters}
          onClear={() => setFilters(EMPTY_FILTERS)}
          activeCount={activeFilterCount}
        />

        {error && (
          <div className="mt-8 rounded-xl border border-red-300 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        )}

        {!error && !loading && (
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
            {total} {total === 1 ? "story" : "stories"}
            {activeFilterCount > 0 && " matching your filters"}
          </p>
        )}

        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 9 }, (_, i) => <ArticleCardSkeleton key={i} featured={i === 0} />)
            : articles.map((article, i) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  featured={i === 0 && page >= 1 && filters.sort === "newest"}
                  categoryLabel={categories.find((c) => c.id === article.category)?.label}
                />
              ))}
        </div>

        {!loading && !error && articles.length === 0 && (
          <div className="mt-16 text-center text-zinc-500 dark:text-zinc-400">
            <p className="text-4xl">🛰️</p>
            <p className="mt-3 font-medium">Nothing matches those filters.</p>
            <button
              className="mt-2 text-cyan-600 underline dark:text-cyan-400"
              onClick={() => setFilters(EMPTY_FILTERS)}
            >
              Clear all filters
            </button>
          </div>
        )}

        {hasMore && !loading && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="rounded-full border border-zinc-300 bg-white px-6 py-2.5 text-sm font-medium shadow-sm transition hover:border-cyan-500 hover:text-cyan-600 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-cyan-400 dark:hover:text-cyan-400"
            >
              {loadingMore ? "Loading…" : "Load more stories"}
            </button>
          </div>
        )}
      </main>

      <footer className="border-t border-zinc-200 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        technify — free &amp;{" "}
        <a
          className="underline hover:text-cyan-600 dark:hover:text-cyan-400"
          href="https://github.com/Ellodev/technify"
          target="_blank"
          rel="noopener noreferrer"
        >
          open source
        </a>
      </footer>
    </div>
  );
}
