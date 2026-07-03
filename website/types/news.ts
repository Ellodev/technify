export type Article = {
  id: string;
  source_id: string;
  source_name: string;
  title: string;
  link: string;
  author: string | null;
  summary: string | null;
  image_url: string | null;
  category: string;
  published_at: string;
  fetched_at: string;
};

export type ArticlesResponse = {
  items: Article[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
};

export type Source = {
  id: string;
  name: string;
  homepage: string;
};

export type Category = {
  id: string;
  label: string;
};

export type Filters = {
  sources: string[];
  categories: string[];
  q: string;
  sinceHours: number | null;
  sort: "newest" | "oldest";
};
