import type { ArticlesResponse, Category, Filters, Source } from "@/types/news";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`API ${path} failed with ${res.status}`);
  return res.json();
}

export function fetchArticles(filters: Filters, page: number): Promise<ArticlesResponse> {
  const params = new URLSearchParams();
  if (filters.sources.length) params.set("sources", filters.sources.join(","));
  if (filters.categories.length) params.set("categories", filters.categories.join(","));
  if (filters.q) params.set("q", filters.q);
  if (filters.sinceHours) params.set("since_hours", String(filters.sinceHours));
  if (filters.sort !== "newest") params.set("sort", filters.sort);
  params.set("page", String(page));
  return get(`/api/articles?${params.toString()}`);
}

export function fetchSources(): Promise<Source[]> {
  return get("/api/sources");
}

export function fetchCategories(): Promise<Category[]> {
  return get("/api/categories");
}

export async function subscribeToPush(categories: string[]): Promise<boolean> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return false;

  const { publicKey } = await get<{ publicKey: string }>("/api/push/public-key");
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });

  const res = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subscription: subscription.toJSON(), categories }),
  });
  return res.ok;
}

export async function unsubscribeFromPush(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;
  await fetch("/api/push/unsubscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint: subscription.endpoint }),
  });
  await subscription.unsubscribe();
}

export async function isPushSubscribed(): Promise<boolean> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;
  const registration = await navigator.serviceWorker.ready;
  return (await registration.pushManager.getSubscription()) !== null;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from(rawData, (char) => char.charCodeAt(0));
}
