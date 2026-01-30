import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
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
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
