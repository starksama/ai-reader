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
  title: "Mull — Think Deeper",
  description: "Mull it over. Paste any URL or ask anything, dive deep with AI, highlight key ideas, export your notes.",
  keywords: ["mull", "think deeper", "ai reader", "reading tool", "ai assistant", "note taking", "understanding"],
  authors: [{ name: "starksama", url: "https://github.com/starksama" }],
  openGraph: {
    title: "Mull — Think Deeper",
    description: "Mull it over. Paste any URL or ask anything, dive deep with AI, highlight key ideas, export your notes.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mull — Think Deeper",
    description: "Mull it over. Paste any URL or ask anything, dive deep with AI, highlight key ideas, export your notes.",
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
