"use client";

import { useEffect, useState } from "react";
import { isPushSubscribed, subscribeToPush, unsubscribeFromPush } from "@/lib/api";

type PushState = "unsupported" | "off" | "on" | "busy";

export default function NotificationToggle() {
  const [state, setState] = useState<PushState>("unsupported");

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    isPushSubscribed()
      .then((subscribed) => setState(subscribed ? "on" : "off"))
      .catch(() => setState("off"));
  }, []);

  if (state === "unsupported") return null;

  const toggle = async () => {
    const current = state;
    setState("busy");
    try {
      if (current === "on") {
        await unsubscribeFromPush();
        setState("off");
      } else {
        const ok = await subscribeToPush([]);
        setState(ok ? "on" : "off");
      }
    } catch {
      setState(current);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={state === "busy"}
      title={state === "on" ? "Disable notifications" : "Get notified about new stories"}
      aria-label={state === "on" ? "Disable notifications" : "Enable notifications"}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition disabled:opacity-50 ${
        state === "on"
          ? "border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:border-cyan-400 dark:text-cyan-300"
          : "border-zinc-300 bg-white text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
      }`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        {state !== "on" && <path d="m3 3 18 18" />}
      </svg>
    </button>
  );
}
