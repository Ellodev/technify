import { Suspense } from "react";
import NewsApp from "@/components/NewsApp";

export default function Home() {
  return (
    <Suspense>
      <NewsApp />
    </Suspense>
  );
}
