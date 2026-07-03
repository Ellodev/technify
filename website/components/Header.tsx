"use client";

import NotificationToggle from "./NotificationToggle";

type HeaderProps = {
  query: string;
  onQueryChange: (q: string) => void;
};

export default function Header({ query, onQueryChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200/80 bg-zinc-100/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <a href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-cyan-500 text-lg text-white">
            ⚡
          </span>
          <span className="hidden bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-xl font-extrabold tracking-tight text-transparent sm:block">
            technify
          </span>
        </a>

        <div className="relative ml-auto w-full max-w-sm">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search stories…"
            className="w-full rounded-full border border-zinc-300 bg-white py-2 pl-9 pr-4 text-sm outline-none transition placeholder:text-zinc-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-cyan-400"
          />
        </div>

        <NotificationToggle />
      </div>
    </header>
  );
}
