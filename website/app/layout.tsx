import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tech News",
  description: "Tech News Site",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
    <head>
        <script defer src="https://ellostats.vercel.app/script.js" data-website-id="5433c551-3455-4409-b33f-c01922c3956a"></script>
    </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
