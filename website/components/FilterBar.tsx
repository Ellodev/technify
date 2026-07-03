"use client";

import { useEffect, useRef, useState } from "react";
import type { Category, Filters, Source } from "@/types/news";

const CATEGORY_EMOJI: Record<string, string> = {
  ai: "🤖",
  security: "🔐",
  gadgets: "📱",
  gaming: "🎮",
  science: "🔭",
  startups: "💼",
  dev: "🧑‍💻",
  mobility: "🚗",
  crypto: "🪙",
  general: "📰",
};

type FilterBarProps = {
  filters: Filters;
  sources: Source[];
  categories: Category[];
  onChange: (filters: Filters) => void;
  onClear: () => void;
  activeCount: number;
};

export default function FilterBar({
  filters,
  sources,
  categories,
  onChange,
  onClear,
  activeCount,
}: FilterBarProps) {
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setSourcesOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const toggleCategory = (id: string) => {
    const next = filters.categories.includes(id)
      ? filters.categories.filter((c) => c !== id)
      : [...filters.categories, id];
    onChange({ ...filters, categories: next });
  };

  const toggleSource = (id: string) => {
    const next = filters.sources.includes(id)
      ? filters.sources.filter((s) => s !== id)
      : [...filters.sources, id];
    onChange({ ...filters, sources: next });
  };

  const chipBase =
    "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition select-none";
  const chipOff =
    "border-zinc-300 bg-white text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-500";
  const chipOn =
    "border-cyan-500 bg-cyan-500/10 text-cyan-700 dark:border-cyan-400 dark:text-cyan-300";

  return (
    <div className="sticky top-[57px] z-10 -mx-4 bg-zinc-100/90 px-4 py-3 backdrop-blur-md dark:bg-zinc-950/90">
      {/* Category chips */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        <button
          className={`${chipBase} ${filters.categories.length === 0 ? chipOn : chipOff}`}
          onClick={() => onChange({ ...filters, categories: [] })}
        >
          ✨ All
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            className={`${chipBase} ${filters.categories.includes(category.id) ? chipOn : chipOff}`}
            onClick={() => toggleCategory(category.id)}
          >
            {CATEGORY_EMOJI[category.id] ?? "🏷️"} {category.label}
          </button>
        ))}
      </div>

      {/* Sources, time range, sort */}
      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
        <div className="relative" ref={popoverRef}>
          <button
            onClick={() => setSourcesOpen((open) => !open)}
            className={`${chipBase} ${filters.sources.length ? chipOn : chipOff}`}
          >
            Sources{filters.sources.length ? ` · ${filters.sources.length}` : ""} ▾
          </button>
          {sourcesOpen && (
            <div className="absolute left-0 top-full z-30 mt-2 max-h-72 w-64 overflow-y-auto rounded-xl border border-zinc-200 bg-white p-2 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
              {sources.map((source) => (
                <label
                  key={source.id}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <input
                    type="checkbox"
                    className="accent-cyan-500"
                    checked={filters.sources.includes(source.id)}
                    onChange={() => toggleSource(source.id)}
                  />
                  <span>{source.name}</span>
                </label>
              ))}
              {filters.sources.length > 0 && (
                <button
                  className="mt-1 w-full rounded-lg px-2.5 py-2 text-left text-cyan-600 hover:bg-zinc-100 dark:text-cyan-400 dark:hover:bg-zinc-800"
                  onClick={() => onChange({ ...filters, sources: [] })}
                >
                  Clear sources
                </button>
              )}
            </div>
          )}
        </div>

        <select
          value={filters.sinceHours ?? ""}
          onChange={(e) =>
            onChange({ ...filters, sinceHours: e.target.value ? Number(e.target.value) : null })
          }
          className="rounded-full border border-zinc-300 bg-white px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="">Any time</option>
          <option value="6">Last 6 hours</option>
          <option value="24">Last 24 hours</option>
          <option value="72">Last 3 days</option>
          <option value="168">Last week</option>
        </select>

        <select
          value={filters.sort}
          onChange={(e) => onChange({ ...filters, sort: e.target.value as Filters["sort"] })}
          className="rounded-full border border-zinc-300 bg-white px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>

        {activeCount > 0 && (
          <button
            onClick={onClear}
            className="ml-auto text-zinc-500 underline-offset-2 hover:text-zinc-800 hover:underline dark:hover:text-zinc-200"
          >
            Clear all ({activeCount})
          </button>
        )}
      </div>
    </div>
  );
}
