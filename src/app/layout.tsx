import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "LuminNote — AI Notes for Students",
  description: "AI-powered notes, flashcards, and study tools built for students. The smartest way to take notes with LuminNote.",
  keywords: ["AI notes", "flashcards", "study tools", "students", "note taking", "AI powered"],
  authors: [{ name: "LuminNote" }],
  creator: "LuminNote",
  publisher: "LuminNote",
  openGraph: {
    title: "LuminNote — AI Notes for Students",
    description: "AI-powered notes, flashcards, and study tools built for students.",
    url: "https://luminnote.co.uk",
    siteName: "LuminNote",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LuminNote — AI Notes for Students",
    description: "AI-powered notes, flashcards, and study tools built for students.",
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
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
