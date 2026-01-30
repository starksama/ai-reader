import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

// UI font - clean, modern
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Reading font - elegant serif for article content
const sourceSerif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Mull — Your Second Brain for Complex Ideas",
  description: "Dive into rabbit holes. Never lose the thread. Mull manages your context tree so you can explore freely without losing your way back.",
  keywords: ["mull", "second brain", "learning tool", "ai reader", "context management", "research", "understanding", "knowledge"],
  authors: [{ name: "starksama", url: "https://github.com/starksama" }],
  openGraph: {
    title: "Mull — Your Second Brain for Complex Ideas",
    description: "Dive into rabbit holes. Never lose the thread. Explore complex content with AI while maintaining perfect context.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mull — Your Second Brain for Complex Ideas",
    description: "Dive into rabbit holes. Never lose the thread. Explore complex content with AI while maintaining perfect context.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${sourceSerif.variable} antialiased`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
