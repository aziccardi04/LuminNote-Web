import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GradientOrbs from "@/components/GradientOrbs";
import SiteFooter from "@/components/SiteFooter";
import { Analytics } from "@vercel/analytics/next";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "LuminNote — AI-Powered Notes for the Modern Student",
  description: "Transform how you learn with AI-powered notes, intelligent flashcards, and research tools. Built for students who want to study smarter, not harder.",
  keywords: ["AI notes", "flashcards", "study tools", "students", "note taking", "AI powered", "spaced repetition", "smart learning"],
  authors: [{ name: "LuminNote" }],
  creator: "LuminNote",
  publisher: "LuminNote",
  openGraph: {
    title: "LuminNote — AI-Powered Notes for the Modern Student",
    description: "Transform how you learn with AI-powered notes, intelligent flashcards, and research tools.",
    url: "https://luminnote.co.uk",
    siteName: "LuminNote",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LuminNote — AI-Powered Notes for the Modern Student",
    description: "Transform how you learn with AI-powered notes, intelligent flashcards, and research tools.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>
        {/* Subtle noise texture overlay */}
        <div className="noise-overlay" aria-hidden="true" />
        <div className="min-h-screen flex flex-col">
          <GradientOrbs />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <Analytics />
        </div>
      </body>
    </html>
  );
}
