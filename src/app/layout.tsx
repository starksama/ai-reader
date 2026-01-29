import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Reader — Explainpaper for Everything",
  description: "A reading-first AI tool. Paste any URL, highlight paragraphs, ask questions, export notes. Clean reader view with no distractions.",
  keywords: ["ai reader", "article reader", "explainpaper", "reading tool", "ai assistant", "note taking"],
  authors: [{ name: "starksama", url: "https://github.com/starksama" }],
  openGraph: {
    title: "AI Reader — Explainpaper for Everything",
    description: "A reading-first AI tool. Paste any URL, highlight paragraphs, ask questions, export notes.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Reader — Explainpaper for Everything",
    description: "A reading-first AI tool. Paste any URL, highlight paragraphs, ask questions, export notes.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
