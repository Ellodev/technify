"use client";

import { useState } from "react";
import type { Article } from "@/types/news";

function timeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  const days = Math.floor(seconds / 86400);
  return days === 1 ? "1 day ago" : `${days} days ago`;
}

type ArticleCardProps = {
  article: Article;
  categoryLabel?: string;
  featured?: boolean;
};

export default function ArticleCard({ article, categoryLabel, featured = false }: ArticleCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = article.image_url && !imageFailed;

  return (
    <a
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-500/60 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-cyan-400/60 ${
        featured ? "sm:col-span-2 lg:col-span-3 lg:flex-row" : ""
      }`}
    >
      <div
        className={`relative shrink-0 overflow-hidden ${
          featured ? "aspect-[16/9] lg:aspect-auto lg:w-1/2" : "aspect-[16/9]"
        }`}
      >
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.image_url!}
            alt=""
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="card-image-fallback flex h-full w-full items-center justify-center">
            <span className="text-4xl opacity-70">⚡</span>
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          {categoryLabel ?? article.category}
        </span>
      </div>

      <div className={`flex flex-1 flex-col p-4 ${featured ? "lg:justify-center lg:p-8" : ""}`}>
        <h2
          className={`font-bold leading-snug group-hover:text-cyan-600 dark:group-hover:text-cyan-400 ${
            featured ? "text-xl lg:text-3xl" : "text-base"
          }`}
        >
          {article.title}
        </h2>
        {article.summary && (
          <p
            className={`mt-2 text-sm text-zinc-600 dark:text-zinc-400 ${
              featured ? "line-clamp-4 lg:text-base" : "line-clamp-3"
            }`}
          >
            {article.summary}
          </p>
        )}
        <div className="mt-auto flex items-center gap-2 pt-4 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="font-semibold text-zinc-700 dark:text-zinc-300">{article.source_name}</span>
          <span aria-hidden>·</span>
          <time dateTime={article.published_at}>{timeAgo(article.published_at)}</time>
          {article.author && (
            <>
              <span aria-hidden>·</span>
              <span className="truncate">{article.author}</span>
            </>
          )}
        </div>
      </div>
    </a>
  );
}

export function ArticleCardSkeleton({ featured = false }: { featured?: boolean }) {
  return (
    <div
      className={`animate-pulse overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${
        featured ? "sm:col-span-2 lg:col-span-3" : ""
      }`}
    >
      <div className="aspect-[16/9] bg-zinc-200 dark:bg-zinc-800" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-4/5 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-3 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-3 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}
