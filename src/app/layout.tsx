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
  title: "Mull — Branch Freely, Never Start Over",
  description: "No more 'let me start a new chat'. Mull lets you explore tangents without polluting your main thread. Branch off, go deep, and always find your way back.",
  keywords: ["mull", "ai chat", "context management", "branching conversations", "learning tool", "research", "no more new chat"],
  authors: [{ name: "starksama", url: "https://github.com/starksama" }],
  openGraph: {
    title: "Mull — Branch Freely, Never Start Over",
    description: "No more 'let me start a new chat'. Explore tangents without polluting your context. Branch off, go deep, return cleanly.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mull — Branch Freely, Never Start Over",
    description: "No more 'let me start a new chat'. Explore tangents without polluting your context. Branch off, go deep, return cleanly.",
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
